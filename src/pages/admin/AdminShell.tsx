import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { RxHamburgerMenu } from "react-icons/rx";
import { X } from "lucide-react";
import { getSession, logout } from "@/api/client";
import AdminLogo from "@/assets/Logo/OSK-admin-logo.svg";
import AdminLogoWhite from "@/assets/Logo/OSK-admin-logo-white.svg";
import {
  ADMIN_NAV,
  checkAdminSession,
  describeAdminScreen,
  endAdminSession,
  initialAdminGate,
  type AdminGate,
} from "@/admin/access";
import { useNoIndex } from "@/admin/useNoIndex";
import { Button } from "@/components/UI";
import Loader from "@/components/UI/Loader";
import type { AuthMe } from "@/types";

// The admin bar is white, so the dark wordmark shows. The white lockup is the dark-bar pair.
const adminHeaderLogos = {
  light: AdminLogo,
  dark: AdminLogoWhite,
} as const;

function adminHeaderLogo(onLightBackground: boolean) {
  return onLightBackground ? AdminLogo : AdminLogoWhite;
}

const AdminShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const requestId = useRef(0);
  const [gate, setGate] = useState<AdminGate>(initialAdminGate);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useNoIndex("Admin | Open Source Kigali");

  useEffect(() => {
    const id = ++requestId.current;
    void checkAdminSession(getSession).then((next) => {
      if (requestId.current === id) setGate(next);
    });
  }, []);

  function retry() {
    const id = ++requestId.current;
    setLogoutError(null);
    setGate(initialAdminGate());
    void checkAdminSession(getSession).then((next) => {
      if (requestId.current === id) setGate(next);
    });
  }

  async function onLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError(null);
    const result = await endAdminSession(logout);
    setLoggingOut(false);
    if (result.ok || result.sessionEnded) {
      const notice = result.ok ? null : result.message;
      navigate("/admin/login", {
        replace: true,
        state: notice ? { notice } : null,
      });
      return;
    }
    setLogoutError(result.message);
  }

  const screen = describeAdminScreen(gate, `${location.pathname}${location.search}`);

  if (screen.kind === "loading") {
    return (
      <div className="min-h-screen bg-gray-50" role="status" aria-live="polite">
        <Loader fullPage text="Checking your session..." />
      </div>
    );
  }

  if (screen.kind === "redirect") {
    return <Navigate to={screen.to} replace />;
  }

  if (screen.kind === "unavailable") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center sm:p-8">
          <h1 className="text-2xl font-bold text-text-heading">Session check failed</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-text-heading" role="alert">
            {screen.message}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-supporting">
            Admin pages stay closed until a session is confirmed.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button type="button" onClick={retry}>
              Try again
            </Button>
            <NavLink
              to="/admin/login"
              className="text-sm font-semibold text-primary-colour hover:underline"
            >
              Go to sign in
            </NavLink>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AdminFrame
      session={screen.session}
      loggingOut={loggingOut}
      logoutError={logoutError}
      onLogout={onLogout}
    >
      <Outlet />
    </AdminFrame>
  );
};

function AdminFrame({
  session,
  loggingOut,
  logoutError,
  onLogout,
  children,
}: {
  session: AuthMe;
  loggingOut: boolean;
  logoutError: string | null;
  onLogout: () => void;
  children: ReactNode;
}) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-text-body" data-testid="admin-shell">
      <header className="fixed top-0 z-20 w-full">
        <nav
          className="flex items-center justify-between bg-white px-4 py-4 text-gray-900 shadow-xl sm:px-8 lg:px-20"
          aria-label="Admin sections"
        >
          <Link to="/admin" className="flex items-center">
            <img
              src={adminHeaderLogos.light}
              alt="Open Source Kigali Admin"
              className="h-12 w-auto object-contain sm:h-14 md:h-16"
            />
          </Link>

          <div className="hidden items-center gap-6 text-sm xl:flex">
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? "font-semibold text-primary-colour underline decoration-2 underline-offset-4"
                    : "font-medium text-gray-900 transition-colors duration-200 hover:text-primary-colour"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-4 xl:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
            <SignOutButton loggingOut={loggingOut} onLogout={onLogout} />
          </div>

          <button
            type="button"
            className="z-50 p-1 xl:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileOpen ? <X className="h-6 w-6 text-gray-900" /> : <RxHamburgerMenu className="h-6 w-6 text-gray-900" />}
          </button>
        </nav>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-10 flex flex-col items-center space-y-6 overflow-y-auto bg-white px-6 pt-28 pb-10 text-lg xl:hidden">
          <div className="text-center">
            <p className="font-semibold text-gray-900">{session.user.name}</p>
            <p className="text-sm text-gray-500">{session.user.email}</p>
          </div>
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-primary-colour underline decoration-2 underline-offset-4"
                  : "text-black transition-colors duration-200 hover:text-primary-colour"
              }
            >
              {item.label}
            </NavLink>
          ))}
          <SignOutButton loggingOut={loggingOut} onLogout={onLogout} />
        </div>
      ) : null}

      <div className="pt-24 md:pt-28">
        {logoutError ? (
          <p
            role="alert"
            className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:mx-6"
          >
            {logoutError}
          </p>
        ) : null}
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

function SignOutButton({
  loggingOut,
  onLogout,
}: {
  loggingOut: boolean;
  onLogout: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loggingOut}
      className="inline-flex h-12 items-center justify-center rounded-full bg-primary-colour px-6 text-sm font-semibold whitespace-nowrap text-white transition hover:scale-[1.05] hover:bg-brand-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
    >
      {loggingOut ? "Signing out..." : "Sign out"}
    </button>
  );
}

export default AdminShell;
