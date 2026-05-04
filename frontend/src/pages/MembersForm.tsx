import { useState }          from "react";
import { NavLink }           from "react-router";
import { ArrowRight,
         CheckCircle2,
         AlertCircle }       from "lucide-react";
import { post }              from "@/lib/api";
import type {
  CreateMemberPayload,
  ApiMember,
  CodingLevel,
}                            from "@/types";
import EyebrowLabel from "@/components/UI/EyebrowLable";

// ─── Constants ────────────────────────────────────────────────────────────────

const CODING_LEVELS: { value: CodingLevel; label: string; desc: string }[] = [
  {
    value: "beginner",
    label: "Beginner",
    desc:  "I'm just getting started — first PR territory",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    desc:  "I've built things and want real-world practice",
  },
  {
    value: "advanced",
    label: "Advanced / Mentor",
    desc:  "I'm experienced and want to give back",
  },
];

const AFRICAN_COUNTRIES = [
  "Rwanda", "Kenya", "Uganda", "Tanzania", "Ethiopia",
  "Nigeria", "Ghana", "South Africa", "Senegal", "Côte d'Ivoire",
  "Cameroon", "Egypt", "Morocco", "Other",
];

// ─── Form state type ──────────────────────────────────────────────────────────
// This is what lives in the form — friendly for the user.
// It gets mapped to CreateMemberPayload on submit.

interface MemberFormState {
  firstName:   string;
  lastName:    string;
  email:       string;
  country:     string;
  city:        string;
  github:      string;
  motivation:  string;
  codingLevel: CodingLevel | "";
}

const EMPTY: MemberFormState = {
  firstName:   "",
  lastName:    "",
  email:       "",
  country:     "",
  city:        "",
  github:      "",
  motivation:  "",
  codingLevel: "",
};

// ─── Validation ───────────────────────────────────────────────────────────────

type Errors = Partial<Record<keyof MemberFormState, string>>;

function validate(values: MemberFormState): Errors {
  const e: Errors = {};

  if (!values.firstName.trim())    e.firstName   = "First name is required";
  if (!values.lastName.trim())     e.lastName    = "Last name is required";

  if (!values.email.trim())        e.email       = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(values.email))
                                   e.email       = "Enter a valid email address";

  if (!values.country)             e.country     = "Please select your country";
  if (!values.city.trim())         e.city        = "City is required";

  if (!values.github.trim())       e.github      = "GitHub username is required";

  if (!values.motivation.trim())   e.motivation  = "Please tell us why you want to join";
  else if (values.motivation.trim().length < 30)
                                   e.motivation  = "Please write at least 30 characters";

  if (!values.codingLevel)         e.codingLevel = "Please select your coding level";

  return e;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Maps our form state to exactly what POST /members expects
function buildPayload(values: MemberFormState): CreateMemberPayload {
  return {
    name:           `${values.firstName.trim()} ${values.lastName.trim()}`,
    email:          values.email.trim(),
    githubUsername: values.github.trim(),
    orgName:        values.city.trim(),
    joinReason:     values.motivation.trim(),
    codingLevel:    values.codingLevel as CodingLevel,
  };
}

// ─── Small reusable field components ─────────────────────────────────────────

const FieldWrapper = ({
  label,
  required,
  error,
  children,
}: {
  label:    string;
  required?:boolean;
  error?:   string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-base font-bold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm text-gray-900 outline-none transition-all
   placeholder:text-gray-400
   ${hasError
     ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
     : "border-gray-200 focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10"
   }`;

// ─── Page ─────────────────────────────────────────────────────────────────────

const MembersForm = () => {
  const [values,     setValues]     = useState<MemberFormState>(EMPTY);
  const [errors,     setErrors]     = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [createdMember, setCreatedMember] = useState<ApiMember | null>(null);

  // ── Field change ───────────────────────────────────────────────────────────

  const set = (field: keyof MemberFormState, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as the user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Client-side validation first — don't hit the server if we already know it's wrong
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to the top of the form so the user sees the errors
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    try {
      // Build the exact payload the backend expects
      const payload = buildPayload(values);

      // POST /members — returns ApiMember on success, throws on failure
      const member = await post<ApiMember>("/members", payload);

      // Store the response so we can show the member's name in the success screen
      setCreatedMember(member);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      // err.message is the server's own message from the envelope
      setApiError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      window.scrollTo({ top: 200, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────

  if (submitted && createdMember) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "#f0f6ff" }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "#e8f1ff" }}
        >
          <CheckCircle2 size={36} style={{ color: "#2b7fff" }} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
          Welcome to OSK, {values.firstName}!
        </h1>

        <p className="text-gray-500 text-base max-w-sm leading-relaxed mb-2">
          Your application has been received. We'll reach out to{" "}
          <strong className="text-gray-700">{createdMember.email}</strong> within{" "}
          <strong className="text-gray-700">48 hours</strong>.
        </p>

        <p className="text-gray-400 text-sm mb-8">
          Member ID: <span className="font-mono">{createdMember.id}</span>
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <NavLink
            to="/community"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-black"
            style={{ background: "#2b7fff" }}
          >
            Explore the community <ArrowRight size={14} />
          </NavLink>
          <NavLink
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-bold"
            style={{ borderColor: "#c5d9ff", color: "#2b7fff" }}
          >
            Browse open projects
          </NavLink>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: "#f0f6ff" }}>

      {/* Header */}
      <div className="pt-24 pb-10 px-6 text-center">
        <EyebrowLabel text="Join Open Source Kigali" align="center" className="mt-8"/>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          Become a contributor.
        </h1>
        <p className="text-gray-500 text-base max-w-sm mx-auto leading-relaxed">
          No experience needed. Fill in the form and we'll onboard you within 48 hours.
        </p>
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto px-4 pb-16">
        <div
          className="bg-white rounded-3xl p-6 sm:p-10 border"
          style={{ borderColor: "#c5d9ff", boxShadow: "0 1px 24px rgba(43,127,255,0.07)" }}
        >

          {/* API error banner — shown when the server rejects the request */}
          {apiError && (
            <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Submission failed</p>
                <p className="text-xs text-red-600 mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-5">

              {/* ── Personal info ── */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#5b9fff" }}>
                  Personal info
                </p>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FieldWrapper label="First name" required error={errors.firstName}>
                      <input
                        className={inputClass(!!errors.firstName)}
                        value={values.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                        placeholder="Amina"
                      />
                    </FieldWrapper>
                    <FieldWrapper label="Last name" required error={errors.lastName}>
                      <input
                        className={inputClass(!!errors.lastName)}
                        value={values.lastName}
                        onChange={(e) => set("lastName", e.target.value)}
                        placeholder="Uwase"
                      />
                    </FieldWrapper>
                  </div>

                  <FieldWrapper label="Email address" required error={errors.email}>
                    <input
                      type="email"
                      className={inputClass(!!errors.email)}
                      value={values.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="amina@example.com"
                    />
                  </FieldWrapper>

                  <div className="grid grid-cols-2 gap-4">
                    <FieldWrapper label="Country" required error={errors.country}>
                      <select
                        className={inputClass(!!errors.country) + " cursor-pointer"}
                        value={values.country}
                        onChange={(e) => set("country", e.target.value)}
                      >
                        <option value="">Select country</option>
                        {AFRICAN_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </FieldWrapper>
                    <FieldWrapper label="City" required error={errors.city}>
                      <input
                        className={inputClass(!!errors.city)}
                        value={values.city}
                        onChange={(e) => set("city", e.target.value)}
                        placeholder="Kigali"
                      />
                    </FieldWrapper>
                  </div>
                </div>
              </div>

              {/* ── GitHub ── */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#5b9fff" }}>
                  GitHub
                </p>
                <FieldWrapper label="GitHub username" required error={errors.github}>
                  <div
                    className={`flex items-center rounded-xl border overflow-hidden transition-all ${
                      errors.github
                        ? "border-red-300 focus-within:ring-2 focus-within:ring-red-100"
                        : "border-gray-200 focus-within:border-primary-colour focus-within:ring-2 focus-within:ring-primary-colour"
                    }`}
                  >
                    <span className="px-3 py-3 text-xs text-gray-400 font-mono bg-gray-50 border-r border-gray-200 shrink-0">
                      github.com/
                    </span>
                    <input
                      className="flex-1 px-3 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 bg-white"
                      value={values.github}
                      onChange={(e) => set("github", e.target.value)}
                      placeholder="your-username"
                    />
                  </div>
                </FieldWrapper>
              </div>

              {/* ── Experience ── */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#5b9fff" }}>
                  Experience level
                </p>
                <FieldWrapper label="Where are you right now?" required error={errors.codingLevel}>
                  <div className="flex flex-col gap-2.5">
                    {CODING_LEVELS.map((level) => {
                      const selected = values.codingLevel === level.value;
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => set("codingLevel", level.value)}
                          className="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all"
                          style={{
                            borderColor: selected ? "#2b7fff" : "#e5e7eb",
                            background:  selected ? "#f0f6ff" : "#fff",
                          }}
                        >
                          {/* Radio indicator */}
                          <div
                            className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center"
                            style={{ borderColor: selected ? "#2b7fff" : "#d1d5db" }}
                          >
                            {selected && (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: "#2b7fff" }}
                              />
                            )}
                          </div>
                          <div>
                            <p
                              className="text-sm font-bold"
                              style={{ color: selected ? "#2b7fff" : "#111827" }}
                            >
                              {level.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{level.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </FieldWrapper>
              </div>

              {/* ── Motivation ── */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#5b9fff" }}>
                  Why OSK?
                </p>
                <FieldWrapper
                  label="Why do you want to join?"
                  required
                  error={errors.motivation}
                >
                  <textarea
                    className={inputClass(!!errors.motivation) + " resize-none leading-relaxed"}
                    rows={4}
                    maxLength={500}
                    value={values.motivation}
                    onChange={(e) => set("motivation", e.target.value)}
                    placeholder="Tell us what brought you here and what you're hoping to build or learn..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span />
                    <span className="text-xs text-gray-400">
                      {values.motivation.length} / 500
                    </span>
                  </div>
                </FieldWrapper>
              </div>

            </div>

            {/* ── Submit button ── */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-base font-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "#2b7fff" }}
                onMouseEnter={(e) =>
                  !submitting && (e.currentTarget.style.background = "#1a6fef")
                }
                onMouseLeave={(e) =>
                  !submitting && (e.currentTarget.style.background = "#2b7fff")
                }
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting your application…
                  </>
                ) : (
                  <>
                    Submit application <ArrowRight size={15} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                We'll reach out within 48 hours. No spam, ever.
              </p>
            </div>

          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already a member?{" "}
          <NavLink to="/community" className="font-semibold" style={{ color: "#2b7fff" }}>
            Go to community →
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default MembersForm;