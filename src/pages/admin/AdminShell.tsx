import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { getSession, logout } from "@/api/client";
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
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-text-body" data-testid="admin-shell">
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-colour">
              Open Source Kigali
            </p>
            <p className="text-lg font-bold text-text-heading">Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-text-heading">{session.user.name}</p>
              <p className="text-xs text-text-supporting">{session.user.email}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={loggingOut}
              onClick={onLogout}
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 sm:px-6" aria-label="Admin sections">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary-colour text-white"
                    : "text-text-body hover:bg-brand-50 hover:text-text-heading"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
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
  );
}

export default AdminShell;
