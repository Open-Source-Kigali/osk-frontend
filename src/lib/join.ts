export const JOIN_PATH = "/join";

export const CODING_LEVELS = [
  { value: "beginner", label: "Beginner (No experience / just starting)" },
  { value: "intermediate", label: "Intermediate (Some projects or experience)" },
  { value: "advanced", label: "Advanced (Professional developer)" },
] as const;

export type CodingLevel = (typeof CODING_LEVELS)[number]["value"];

export type JoinValues = {
  name: string;
  email: string;
  orgName: string;
  codingLevel: string;
  githubUsername: string;
  joinReason: string;
  agree: boolean;
};

export type JoinErrors = Partial<Record<keyof JoinValues, string>>;

export type JoinPayload = {
  name: string;
  email: string;
  githubUsername: string;
  orgName: string;
  joinReason: string;
  codingLevel: CodingLevel;
};

export type JoinResult =
  | { ok: true }
  | { ok: false; message: string; errors: JoinErrors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMPTY_JOIN: JoinValues = {
  name: "",
  email: "",
  orgName: "",
  codingLevel: "",
  githubUsername: "",
  joinReason: "",
  agree: false,
};

export function validateJoin(values: JoinValues): JoinErrors {
  const errors: JoinErrors = {};

  if (!values.name.trim()) errors.name = "Full name is required";

  if (!values.email.trim()) errors.email = "Email address is required";
  else if (!EMAIL.test(values.email.trim())) errors.email = "Enter a valid email address";

  if (!values.orgName.trim()) errors.orgName = "University or institution is required";

  if (!CODING_LEVELS.some((level) => level.value === values.codingLevel)) {
    errors.codingLevel = "Level of experience is required";
  }

  const username = values.githubUsername.trim();
  if (!username) errors.githubUsername = "GitHub username is required";
  else if (/\s/.test(username)) errors.githubUsername = "GitHub username cannot contain spaces";

  if (!values.joinReason.trim()) errors.joinReason = "Tell us why you want to join";
  if (!values.agree) errors.agree = "You need to agree before joining";

  return errors;
}

export function joinPayload(values: JoinValues): JoinPayload {
  const level = CODING_LEVELS.find((item) => item.value === values.codingLevel);
  if (!level) throw new Error("Level of experience is required");

  return {
    name: values.name.trim(),
    email: values.email.trim(),
    githubUsername: values.githubUsername.trim(),
    orgName: values.orgName.trim(),
    joinReason: values.joinReason.trim(),
    codingLevel: level.value,
  };
}

export async function submitJoin(
  post: (path: string, body: JoinPayload) => Promise<unknown>,
  values: JoinValues,
): Promise<JoinResult> {
  const errors = validateJoin(values);
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Check the highlighted fields.", errors };
  }

  try {
    await post("/members", joinPayload(values));
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return { ok: false, message, errors: {} };
  }
}
