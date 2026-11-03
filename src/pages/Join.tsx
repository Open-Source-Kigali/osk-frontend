import { useState, type FormEvent, type ReactNode } from "react";
import { NavLink } from "react-router";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { post } from "@/lib/api";
import {
  CODING_LEVELS,
  EMPTY_JOIN,
  submitJoin,
  type JoinErrors,
  type JoinValues,
} from "@/lib/join";

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border px-4 py-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10"
  }`;

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-bold text-gray-700">
        {label}
        <span className="ml-0.5 text-red-500">*</span>
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-sm font-medium text-red-500">
          <AlertCircle size={11} aria-hidden="true" /> {error}
        </p>
      ) : null}
    </div>
  );
}

export default function Join() {
  const [values, setValues] = useState<JoinValues>(EMPTY_JOIN);
  const [errors, setErrors] = useState<JoinErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = <K extends keyof JoinValues>(key: K, value: JoinValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);
    const result = await submitJoin((path, body) => post(path, body), values);
    setSubmitting(false);
    if (result.ok) {
      setDone(true);
      return;
    }
    setErrors(result.errors);
    setMessage(result.message);
  };

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f0f6ff] px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f1ff]">
          <CheckCircle2 size={36} className="text-[#2b7fff]" aria-hidden="true" />
        </div>
        <h1 className="mb-3 text-2xl font-black text-gray-900 sm:text-3xl">You are registered</h1>
        <p className="mb-8 max-w-md text-base leading-relaxed text-gray-500">
          Thanks, {values.name.trim()}. Your community registration is saved.
        </p>
        <NavLink
          to="/community"
          className="inline-flex cursor-pointer items-center rounded-full border px-6 py-3 text-sm font-bold text-[#2b7fff]"
          style={{ borderColor: "#c5d9ff" }}
        >
          Visit the community
        </NavLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f6ff]">
      <div className="px-6 pb-10 pt-24 text-center">
        <div
          className="mb-5 inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold text-[#2b7fff]"
          style={{ background: "#e8f1ff", borderColor: "#c5d9ff" }}
        >
          Community registration
        </div>
        <h1 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">Join Open Source Kigali</h1>
        <p className="mx-auto max-w-md text-base leading-relaxed text-gray-500">
          Tell us who you are so we can welcome you into the community. A GitHub username is required.
        </p>
      </div>

      <div className="mx-auto max-w-xl px-4 pb-16">
        <form
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="rounded-3xl border bg-white p-6 sm:p-10"
          style={{ borderColor: "#c5d9ff", boxShadow: "0 1px 24px rgba(43,127,255,0.07)" }}
        >
          {message ? (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" aria-hidden="true" />
              <p className="text-sm font-medium text-red-700">{message}</p>
            </div>
          ) : null}

          <div className="grid gap-5">
            <Field id="join-name" label="Full name" error={errors.name}>
              <input
                id="join-name"
                className={inputClass(Boolean(errors.name))}
                value={values.name}
                autoComplete="name"
                onChange={(event) => update("name", event.target.value)}
              />
            </Field>
            <Field id="join-email" label="Email address" error={errors.email}>
              <input
                id="join-email"
                type="email"
                className={inputClass(Boolean(errors.email))}
                value={values.email}
                autoComplete="email"
                onChange={(event) => update("email", event.target.value)}
              />
            </Field>
            <Field id="join-org" label="University / institution" error={errors.orgName}>
              <input
                id="join-org"
                className={inputClass(Boolean(errors.orgName))}
                value={values.orgName}
                autoComplete="organization"
                onChange={(event) => update("orgName", event.target.value)}
              />
            </Field>
            <Field id="join-level" label="Level of experience" error={errors.codingLevel}>
              <select
                id="join-level"
                className={inputClass(Boolean(errors.codingLevel))}
                value={values.codingLevel}
                onChange={(event) => update("codingLevel", event.target.value)}
              >
                <option value="">Select your level</option>
                {CODING_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="join-github" label="GitHub username" error={errors.githubUsername}>
              <input
                id="join-github"
                className={inputClass(Boolean(errors.githubUsername))}
                value={values.githubUsername}
                autoComplete="username"
                spellCheck={false}
                onChange={(event) => update("githubUsername", event.target.value)}
              />
            </Field>
            <Field id="join-reason" label="Why do you want to join?" error={errors.joinReason}>
              <textarea
                id="join-reason"
                rows={4}
                className={inputClass(Boolean(errors.joinReason))}
                value={values.joinReason}
                onChange={(event) => update("joinReason", event.target.value)}
              />
            </Field>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={values.agree}
                  onChange={(event) => update("agree", event.target.checked)}
                />
                <span>I agree to take part in community activities and respect the community guidelines.</span>
              </label>
              {errors.agree ? (
                <p className="flex items-center gap-1 text-sm font-medium text-red-500">
                  <AlertCircle size={11} aria-hidden="true" /> {errors.agree}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-[#2b7fff] px-6 text-sm font-semibold text-white transition hover:bg-[#1a6fef] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Join the community"}
          </button>
        </form>
      </div>
    </div>
  );
}
