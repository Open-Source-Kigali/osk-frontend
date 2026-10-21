import {
  ORG_CATEGORIES,
  PARTNERSHIP_TIERS,
} from "../constants/partnersForm.ts";
import type { PartnerFormState } from "../types/partnersForm.types.ts";

function selectedValue(
  value: string,
  options: readonly { value: string }[],
  label: string,
): string {
  const match = options.find((option) => option.value === value);
  if (!match) {
    throw new Error(`Select a valid ${label}.`);
  }
  return match.value;
}

/**
 * Multipart body for public POST /partner-applications.
 * Field names match the backend schema. Moderation status is not a client field.
 */
export function buildPartnerApplicationFormData(
  values: PartnerFormState,
): FormData {
  const form = new FormData();

  form.append("organisationName", values.orgName.trim());
  form.append(
    "organisationType",
    selectedValue(values.orgCategory, ORG_CATEGORIES, "organisation type"),
  );
  form.append("website", values.website.trim());
  form.append("organisationSize", values.orgSize.trim());
  form.append("country", values.country.trim());
  form.append("description", values.description.trim());
  form.append(
    "partnershipTier",
    selectedValue(values.tier, PARTNERSHIP_TIERS, "partnership tier"),
  );
  form.append("organisationOffer", values.whatWeOffer.trim());

  const projectIdea = values.projectIdea.trim();
  if (projectIdea) {
    form.append("projectIdea", projectIdea);
  }

  form.append("fullName", values.contactName.trim());
  form.append("jobTitle", values.contactRole.trim());
  form.append("workEmail", values.contactEmail.trim());
  form.append("agreedToTerms", values.agreeToTerms ? "true" : "false");

  if (values.logoFile) {
    form.append("file", values.logoFile);
  }

  return form;
}
