import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { AlertCircle } from "lucide-react";
import { getSession, login } from "@/api/client";
import {
  loginNotice,
  performLogin,
  resolveAdminDestination,
  resolveLoginEntry,
  type LoginFieldErrors,
} from "@/admin/access";
import { useNoIndex } from "@/admin/useNoIndex";
import { Button } from "@/components/UI";
import Loader from "@/components/UI/Loader";

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10"
  }`;

const AdminLoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const next = new URLSearchParams(location.search).get("next");
  const destination = resolveAdminDestination(next);
  const notice = loginNotice(location.state);

  const [entry, setEntry] = useState<"checking" | "form" | "redirect">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useNoIndex("Admin sign in | Open Source Kigali");

  useEffect(() => {
    let active = true;
    void resolveLoginEntry(getSession).then((result) => {
      if (active) setEntry(result);
    });
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setMessage(null);
    const result = await performLogin(
      { email, password, next },
      async (submittedEmail, submittedPassword) => {
        setPending(true);
        return login(submittedEmail, submittedPassword);
      },
    );
    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setMessage(result.message);
      setPending(false);
      return;
    }
    navigate(result.destination, { replace: true });
  }

  if (entry === "checking") {
    return (
      <div className="min-h-screen bg-gray-50" role="status" aria-live="polite">
        <Loader fullPage text="Checking your session..." />
      </div>
    );
  }

  if (entry === "redirect") {
    return <Navigate to={destination} replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary-colour">
          Open Source Kigali
        </p>
        <h1 className="mt-2 text-2xl font-bold text-text-heading">Admin sign in</h1>
        <p className="mt-2 text-sm leading-6 text-text-supporting">
          Use your administrator email and password. This area is separate from the public site.
        </p>

        {notice ? (
          <p
            role="status"
            className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
          >
            {notice}
          </p>
        ) : null}

        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit} noValidate data-testid="admin-login">
          {message ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{message}</span>
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-email" className="text-sm font-bold text-gray-700">
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              disabled={pending}
              aria-invalid={fieldErrors.email ? true : undefined}
              className={inputClass(Boolean(fieldErrors.email))}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((current) => ({ ...current, email: undefined }));
                setMessage(null);
              }}
            />
            {fieldErrors.email ? (
              <p className="flex items-center gap-1 text-sm font-medium text-red-500">
                <AlertCircle size={11} aria-hidden="true" /> {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className="text-sm font-bold text-gray-700">
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              disabled={pending}
              aria-invalid={fieldErrors.password ? true : undefined}
              className={inputClass(Boolean(fieldErrors.password))}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors((current) => ({ ...current, password: undefined }));
                setMessage(null);
              }}
            />
            {fieldErrors.password ? (
              <p className="flex items-center gap-1 text-sm font-medium text-red-500">
                <AlertCircle size={11} aria-hidden="true" /> {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <Button type="submit" fullWidth loading={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-text-supporting">
          <Link to="/" className="font-semibold text-primary-colour hover:underline">
            Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
};

export default AdminLoginPage;
