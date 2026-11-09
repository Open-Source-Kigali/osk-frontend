import { ApiRequestError } from "../api/http.ts";

/**
 * Public testimonials come from GET /reviews, which returns approved stories only.
 * POST /reviews creates a pending story. The receipt is not a public list item.
 */

export const STORY_PENDING_MESSAGE =
  "Your story was submitted for review. It will appear here after it is approved.";

const NAME_MAX = 200;
const MESSAGE_MAX = 2000;
const MODERATION_KEYS = ["status", "reviewedAt", "reviewedBy", "reviewedById"] as const;

export type ReviewContentValues = {
  name: string;
  role: string;
  message: string;
};

export type ReviewContentErrors = Partial<
  Record<"name" | "role" | "message" | "file", string>
>;

export type PublicStory = {
  id: string;
  name: string;
  profileUrl: string;
  role: string;
  message: string;
};

export type PublicStoryState =
  | { status: "loading" }
  | { status: "ready"; stories: PublicStory[] }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

export type StorySubmitResult =
  | { ok: true }
  | {
      ok: false;
      kind: "validation" | "error";
      message: string;
      fieldErrors: ReviewContentErrors;
    };

export function initialPublicStories(): PublicStoryState {
  return { status: "loading" };
}

export function validateReviewContent(
  values: ReviewContentValues,
  options: { requireFile: boolean; hasFile: boolean; imageError: string | null },
): ReviewContentErrors {
  const errors: ReviewContentErrors = {};
  const name = values.name.trim();
  const role = values.role.trim();
  const message = values.message.trim();

  if (!name) errors.name = "Name is required";
  else if (name.length > NAME_MAX) errors.name = "Name must be at most 200 characters";

  if (!role) errors.role = "Role is required";
  else if (role.length > NAME_MAX) errors.role = "Role must be at most 200 characters";

  if (!message) errors.message = "Message is required";
  else if (message.length > MESSAGE_MAX) errors.message = "Message must be at most 2000 characters";

  if (options.imageError) errors.file = options.imageError;
  else if (options.requireFile && !options.hasFile) errors.file = "Profile image file is required";

  return errors;
}

export function reviewContentForm(values: ReviewContentValues, file: File | null): FormData {
  const form = new FormData();
  form.append("name", values.name.trim());
  form.append("role", values.role.trim());
  form.append("message", values.message.trim());
  if (file) form.append("file", file);
  return form;
}

export function readPublicStories(data: unknown): PublicStory[] | null {
  if (!Array.isArray(data)) return null;
  const stories: PublicStory[] = [];
  for (const item of data) {
    if (!isRecord(item)) return null;
    if (MODERATION_KEYS.some((key) => Object.prototype.hasOwnProperty.call(item, key))) continue;
    const story = readPublicStory(item);
    if (!story) return null;
    stories.push(story);
  }
  return stories;
}

export async function loadPublicStories(
  getStories: () => Promise<unknown>,
): Promise<Exclude<PublicStoryState, { status: "loading" }>> {
  try {
    const stories = readPublicStories(await getStories());
    if (!stories) {
      return { status: "invalid", message: "The stories response was not a list of stories." };
    }
    return { status: "ready", stories };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error && error.message.trim() ? error.message : "The stories could not be loaded.",
    };
  }
}

export async function submitPublicStory(
  postForm: (form: FormData) => Promise<unknown>,
  values: ReviewContentValues,
  file: File | null,
  imageError: string | null,
): Promise<StorySubmitResult> {
  const fieldErrors = validateReviewContent(values, {
    requireFile: true,
    hasFile: file !== null,
    imageError,
  });
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, kind: "validation", message: "Check the highlighted fields.", fieldErrors };
  }

  try {
    const receipt = await postForm(reviewContentForm(values, file));
    if (!isPendingReceipt(receipt)) {
      return {
        ok: false,
        kind: "error",
        message: "The server response did not confirm a pending submission.",
        fieldErrors: {},
      };
    }
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof ApiRequestError && error.message.trim()
        ? error.message
        : error instanceof Error && error.message.trim()
          ? error.message
          : "The story could not be submitted.";
    return { ok: false, kind: "error", message, fieldErrors: {} };
  }
}

function isPendingReceipt(data: unknown): boolean {
  if (!isRecord(data) || data.status !== "PENDING") return false;
  return isNonEmptyString(data.id) && isNonEmptyString(data.name) && isNonEmptyString(data.message);
}

function readPublicStory(data: Record<string, unknown>): PublicStory | null {
  if (!isNonEmptyString(data.id) || !isNonEmptyString(data.name) || !isNonEmptyString(data.profileUrl)) return null;
  if (!isNonEmptyString(data.role) || !isNonEmptyString(data.message)) return null;
  if ("profilePublicId" in data && data.profilePublicId !== undefined && typeof data.profilePublicId !== "string") {
    return null;
  }
  return {
    id: data.id,
    name: data.name,
    profileUrl: data.profileUrl,
    role: data.role,
    message: data.message,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
