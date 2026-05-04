import { useState } from "react";
import { NavLink } from "react-router";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { postForm } from "@/lib/api";
import type { ApiPartner } from "@/types";
import type { PartnerFormState } from "@/types";

import {
  ORG_CATEGORIES,
  ORG_SIZES,
  PARTNERSHIP_TIERS,
  AFRICAN_COUNTRIES,
} from "@/constants";




const EMPTY: PartnerFormState = {
  orgName: "",
  orgCategory: "",
  orgSize: "",
  country: "",
  website: "",
  description: "",
  tier: "",
  whatWeOffer: "",
  projectIdea: "",
  contactName: "",
  contactRole: "",
  contactEmail: "",
  agreeToTerms: false,
  logoFile: null,
};

// ─── Validation ───────────────────────────────────────────────────────────────

type Errors = Partial<Record<keyof PartnerFormState, string>>;

function validate(values: PartnerFormState): Errors {
  const e: Errors = {};

  if (!values.orgName.trim()) e.orgName = "Organisation name is required";
  if (!values.logoFile) e.logoFile = "Please upload your organisation's logo";
  if (!values.orgCategory) e.orgCategory = "Please select a category";
  if (!values.orgSize) e.orgSize = "Please select organisation size";
  if (!values.country) e.country = "Please select your country";

  if (!values.website.trim()) e.website = "Website is required";
  else if (!/^https?:\/\//.test(values.website))
    e.website = "Enter a full URL starting with https://";

  if (!values.description.trim()) e.description = "Please describe your organisation";
  else if (values.description.trim().length < 20)
    e.description = "Please write at least 20 characters";

  if (!values.tier) e.tier = "Please select a partnership tier";

  if (!values.whatWeOffer.trim()) e.whatWeOffer = "Please describe what you can offer";
  else if (values.whatWeOffer.trim().length < 30)
    e.whatWeOffer = "Please write at least 30 characters";

  if (!values.contactName.trim()) e.contactName = "Contact name is required";
  if (!values.contactRole.trim()) e.contactRole = "Job title is required";

  if (!values.contactEmail.trim()) e.contactEmail = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(values.contactEmail))
    e.contactEmail = "Enter a valid email address";

  if (!values.agreeToTerms) e.agreeToTerms = "You must confirm to proceed";

  return e;
}

// ─── Payload builder ──────────────────────────────────────────────────────────
// The API expects multipart/form-data because it includes a binary file.
// We build a FormData object — field names must match the API exactly.
// "partershipReason" is the real field name in the API (one 'n') — intentional typo.

function buildFormData(values: PartnerFormState): FormData {
  const form = new FormData();

  form.append("name", values.orgName.trim());
  form.append("websiteUrl", values.website.trim());
  form.append("description", values.description.trim());
  form.append("email", values.contactEmail.trim());

  const reason = [
    `Tier interest: ${values.tier}`,
    `What we offer: ${values.whatWeOffer.trim()}`,
    values.projectIdea.trim()
      ? `Project idea: ${values.projectIdea.trim()}`
      : null,
    `Contact: ${values.contactName.trim()} (${values.contactRole.trim()})`,
    `Org size: ${values.orgSize}`,
    `Country: ${values.country}`,
    `Category: ${values.orgCategory}`,
  ]
    .filter(Boolean)
    .join("\n");

  form.append("partershipReason", reason);

  // API field name is "file"
  if (values.logoFile) {
    form.append("file", values.logoFile);
  }

  return form;
}

// ─── Small reusable field wrapper ─────────────────────────────────────────────

const FieldWrapper = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-base font-bold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-sm text-red-500 font-medium">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-4 rounded-xl border text-sm text-gray-900 outline-none transition-all
   placeholder:text-gray-400
   ${hasError
    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
    : "border-gray-200 focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10"
  }`;

const SectionHeading = ({ label }: { label: string }) => (
  <p
    className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b border-gray-100"
    style={{ color: "#5b9fff" }}
  >
    {label}
  </p>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const PartnersForm = () => {
  const [values, setValues] = useState<PartnerFormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdPartner, setCreatedPartner] = useState<ApiPartner | null>(null);

  // ── Field change ───────────────────────────────────────────────────────────
  const set = (field: keyof PartnerFormState, value: string | boolean | File | null) => {
     setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    try {
      // Build FormData — not JSON — because the request includes a file
      const formData = buildFormData(values);

      // POST /partners — returns ApiPartner on success, throws on failure
      const partner = await postForm<ApiPartner>("/partners", formData);

      setCreatedPartner(partner);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
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

  // ── Success screen 
  if (submitted && createdPartner) {
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
          Proposal received!
        </h1>
        <p className="text-gray-500 text-base max-w-md leading-relaxed mb-2">
          Thank you,{" "}
          <strong className="text-gray-700">{values.contactName}</strong>.
          We'll review{" "}
          <strong className="text-gray-700">{createdPartner.name}</strong>'s
          proposal and get back to{" "}
          <strong className="text-gray-700">{createdPartner.email}</strong>{" "}
          within <strong className="text-gray-700">48 hours</strong>.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Reference ID:{" "}
          <span className="font-mono text-xs">{createdPartner.id}</span>
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <NavLink
            to="/partners"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-black"
            style={{ background: "#2b7fff" }}
          >
            Meet our current partners <ArrowRight size={14} />
          </NavLink>
          <NavLink
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-bold"
            style={{ borderColor: "#c5d9ff", color: "#2b7fff" }}
          >
            Browse active projects
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
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-5 text-xs font-bold"
          style={{ background: "#e8f1ff", borderColor: "#c5d9ff", color: "#2b7fff" }}
        >
          OSK Partner Programme
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          Partner with Open Source Kigali.
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
          Tell us about your organisation. Our partnerships lead will follow up
          within 48 hours — no RFPs, no bureaucracy.
        </p>
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto px-4 pb-16">
        <div
          className="bg-white rounded-3xl p-6 sm:p-10 border"
          style={{
            borderColor: "#c5d9ff",
            boxShadow: "0 1px 24px rgba(43,127,255,0.07)",
          }}
        >

          {/* API error banner */}
          {apiError && (
            <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-bold text-red-700">Submission failed</p>
                <p className="text-sm text-red-600 mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-7">

              {/* ── Organisation info ─────────────────────────────────────── */}
              <div>
                <SectionHeading label="Your organisation" />
                <div className="flex flex-col gap-4">

                  <FieldWrapper label="Organisation name" required error={errors.orgName} >
                    <input
                      className={inputClass(!!errors.orgName)}
                      value={values.orgName}
                      onChange={(e) => set("orgName", e.target.value)}
                      placeholder="University of Rwanda"
                    />
                  </FieldWrapper>

                  {/* Logo upload */}
                  <FieldWrapper
                    label="Organisation logo"
                    required
                    error={errors.logoFile}
                  >
                    <div>
                      {/* Hidden native file input */}
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          set("logoFile", file);
                        }}
                      />

                      {/* Custom styled upload area */}
                      <label
                        htmlFor="logo-upload"
                        className={`
                          flex flex-col items-center justify-center gap-2
                          w-full py-8 px-4 rounded-xl border-2 border-dashed
                          cursor-pointer transition-all
                          ${errors.logoFile
                            ? "border-red-300 bg-red-50"
                            : values.logoFile
                              ? "border-primary-colour bg-[#f0f6ff]"
                              : "border-gray-200 bg-gray-50 hover:border-primary-colour hover:bg-[#f0f6ff]"
                          }
                        `}
                      >
                        {values.logoFile ? (
                          // Preview once a file is selected
                          <>
                            <img
                              src={URL.createObjectURL(values.logoFile)}
                              alt="Logo preview"
                              className="h-14 w-auto object-contain rounded"
                            />
                            <p className="text-xs font-semibold text-primary-colour">
                              {values.logoFile.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              Click to change
                            </p>
                          </>
                        ) : (
                          // Placeholder before a file is chosen
                          <>
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ background: "#e8f1ff" }}
                            >
                              <svg
                                width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="#2b7fff"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              >
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                            </div>
                            <p className="text-sm font-bold text-gray-700">
                              Click to upload your logo
                            </p>
                            <p className="text-xs text-gray-400">
                              PNG, JPG, SVG or WebP
                            </p>
                          </>
                        )}
                      </label>

                      {/* Clear button */}
                      {values.logoFile && (
                        <button
                          type="button"
                          onClick={() => set("logoFile", null)}
                          className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Remove file
                        </button>
                      )}
                    </div>
                  </FieldWrapper>


                  {/* Type of organisation */}
                  <FieldWrapper
                    label="Type of organisation"
                    required
                    error={errors.orgCategory}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ORG_CATEGORIES.map((cat) => {
                        const selected = values.orgCategory === cat.value;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => set("orgCategory", cat.value)}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all hover:cursor-pointer hover:scale-105"
                            style={{
                              borderColor: selected ? "#2b7fff" : "#e5e7eb",
                              background: selected ? "#f0f6ff" : "#fff",
                            }}
                          >
                            <span className="text-xl">{cat.emoji}</span>
                            <span
                              className="text-xs font-bold leading-tight"
                              style={{ color: selected ? "#2b7fff" : "#374151" }}
                            >
                              {cat.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </FieldWrapper>

                  <FieldWrapper label="Website" required error={errors.website}>
                    <input
                      type="url"
                      className={inputClass(!!errors.website)}
                      value={values.website}
                      onChange={(e) => set("website", e.target.value)}
                      placeholder="https://yourorg.rw"
                    />
                  </FieldWrapper>

                  <div className="grid grid-cols-2 gap-6">
                    <FieldWrapper
                      label="Organisation size"
                      required
                      error={errors.orgSize}
                    >
                      <select
                        className={inputClass(!!errors.orgSize) + " cursor-pointer"}
                        value={values.orgSize}
                        onChange={(e) => set("orgSize", e.target.value)}
                      >
                        <option value="">Select size</option>
                        {ORG_SIZES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </FieldWrapper>

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
                  </div>

                  <FieldWrapper
                    label="Brief description of your organisation"
                    required
                    error={errors.description}
                  >
                    <textarea
                      className={inputClass(!!errors.description) + " resize-none leading-relaxed"}
                      rows={3}
                      maxLength={300}
                      value={values.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="What does your organisation do and who does it serve?"
                    />
                    <span className="text-xs text-gray-400 text-right">
                      {values.description.length} / 300
                    </span>
                  </FieldWrapper>

                </div>
              </div>

              {/* ── Partnership details ───────────────────────────────────── */}
              <div>
                <SectionHeading label="The partnership" />
                <div className="flex flex-col gap-4">

                  <FieldWrapper
                    label="Which partnership tier are you considering?"
                    required
                    error={errors.tier}
                  >
                    <div className="flex flex-col gap-2">
                      {PARTNERSHIP_TIERS.map((tier) => {
                        const selected = values.tier === tier.value;
                        return (
                          <button
                            key={tier.value}
                            type="button"
                            onClick={() => set("tier", tier.value)}
                            className="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:cursor-pointer hover:scale-105"
                            style={{
                              borderColor: selected ? "#2b7fff" : "#e5e7eb",
                              background: selected ? "#f0f6ff" : "#fff",
                            }}
                          >
                            <span
                              className="w-3 h-3 rounded-full shrink-0 mt-1"
                              style={{ background: tier.dot }}
                            />
                            <div>
                              <p
                                className="text-sm font-bold"
                                style={{ color: selected ? "#2b7fff" : "#111827" }}
                              >
                                {tier.label}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                                {tier.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </FieldWrapper>

                  <FieldWrapper
                    label="What can your organisation offer?"
                    required
                    error={errors.whatWeOffer}
                  >
                    <textarea
                      className={inputClass(!!errors.whatWeOffer) + " resize-none leading-relaxed"}
                      rows={4}
                      maxLength={600}
                      value={values.whatWeOffer}
                      onChange={(e) => set("whatWeOffer", e.target.value)}
                      placeholder="e.g. Venue space for events, mentors from our engineering team, stipends for contributors, hiring from the OSK talent pool..."
                    />
                    <span className="text-xs text-gray-400 text-right">
                      {values.whatWeOffer.length} / 600
                    </span>
                  </FieldWrapper>

                  <FieldWrapper
                    label="Do you have a specific project idea? (optional)"
                    error={errors.projectIdea}
                  >
                    <textarea
                      className={inputClass(!!errors.projectIdea) + " resize-none leading-relaxed"}
                      rows={3}
                      maxLength={400}
                      value={values.projectIdea}
                      onChange={(e) => set("projectIdea", e.target.value)}
                      placeholder="If you'd like OSK to help build something specific, describe it here..."
                    />
                  </FieldWrapper>

                </div>
              </div>

              {/* ── Contact person ────────────────────────────────────────── */}
              <div>
                <SectionHeading label="Contact person" />
                <div className="flex flex-col gap-4">

                  <div className="grid grid-cols-2 gap-4">
                    <FieldWrapper
                      label="Full name"
                      required
                      error={errors.contactName}
                    >
                      <input
                        className={inputClass(!!errors.contactName)}
                        value={values.contactName}
                        onChange={(e) => set("contactName", e.target.value)}
                        placeholder="Jean-Claude Nkurunziza"
                      />
                    </FieldWrapper>
                    <FieldWrapper
                      label="Job title"
                      required
                      error={errors.contactRole}
                    >
                      <input
                        className={inputClass(!!errors.contactRole)}
                        value={values.contactRole}
                        onChange={(e) => set("contactRole", e.target.value)}
                        placeholder="Head of Partnerships"
                      />
                    </FieldWrapper>
                  </div>

                  <FieldWrapper
                    label="Work email"
                    required
                    error={errors.contactEmail}
                  >
                    <input
                      type="email"
                      className={inputClass(!!errors.contactEmail)}
                      value={values.contactEmail}
                      onChange={(e) => set("contactEmail", e.target.value)}
                      placeholder="jean-claude@yourorg.rw"
                    />
                  </FieldWrapper>

                </div>
              </div>

              {/* ── What happens next + agreement ─────────────────────────── */}
              <div
                className="rounded-2xl p-5 border"
                style={{ background: "#f0f6ff", borderColor: "#c5d9ff" }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#5b9fff" }}
                >
                  What happens next
                </p>
                <div className="space-y-2 mb-5">
                  {[
                    "Our Partnerships Lead reviews your proposal within 24 hours",
                    "We schedule a 30-minute intro call to align on scope",
                    "We draft a simple one-page MOU together",
                    "We start shipping",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-sm text-gray-600"
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5"
                        style={{ background: "#2b7fff" }}
                      >
                        {i + 1}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>

                {/* Checkbox agreement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    onClick={() => set("agreeToTerms", !values.agreeToTerms)}
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                    style={{
                      background: values.agreeToTerms ? "#2b7fff" : "white",
                      borderColor: errors.agreeToTerms
                        ? "#ef4444"
                        : values.agreeToTerms
                          ? "#2b7fff"
                          : "#d1d5db",
                    }}
                  >
                    {values.agreeToTerms && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I confirm I'm authorised to represent{" "}
                    <strong className="text-gray-800">
                      {values.orgName || "my organisation"}
                    </strong>{" "}
                    and agree that OSK may contact me to discuss this proposal.
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="flex items-center gap-1 text-xs text-red-500 font-medium mt-2 ml-8">
                    <AlertCircle size={11} /> {errors.agreeToTerms}
                  </p>
                )}
              </div>

            </div>

            {/* ── Submit button ─────────────────────────────────────────── */}
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
                    Submitting your proposal…
                  </>
                ) : (
                  <>
                    Submit proposal <ArrowRight size={15} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                We respond to all enquiries within 48 hours.
              </p>
            </div>

          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          Have questions first?{" "}
          <NavLink
            to="/contact"
            className="font-semibold"
            style={{ color: "#2b7fff" }}
          >
            Contact us →
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default PartnersForm;