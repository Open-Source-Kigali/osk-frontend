import { postForm } from "./client";
import { buildPartnerApplicationFormData } from "./partner-application-form";
import type { ApiPartnerApplication } from "../types/api.types";
import type { PartnerFormState } from "../types/partnersForm.types";

export async function submitPartnerApplication(
  values: PartnerFormState,
): Promise<ApiPartnerApplication> {
  return postForm<ApiPartnerApplication>(
    "/partner-applications",
    buildPartnerApplicationFormData(values),
  );
}
