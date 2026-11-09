import { ApiRequestError } from "../api/http.ts";
import {
  reviewContentForm,
  validateReviewContent,
  type ReviewContentErrors,
  type ReviewContentValues,
} from "../lib/stories.ts";

/**
 * Admin moderation uses the session.
 * GET /admin/reviews?status= defaults to PENDING on the server; this client always sends a status.
 * POST /admin/reviews creates a pending review. It is not public until approval.
 * PATCH /admin/reviews/:id/status accepts only APPROVED or REJECTED.
 * Allowed transitions: PENDING -> APPROVED|REJECTED, APPROVED -> REJECTED, REJECTED -> APPROVED.
 * Repeating the current status, or returning a review to PENDING, is rejected.
 * PUT /reviews/:id edits content and must not change status.
 * DELETE /reviews/:id removes a review.
 *
 * Public GET /reviews returns approved reviews and omits moderation fields.
 * Public POST /reviews accepts name, role, message, and file. It rejects client status fields.
 */

export const REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const MODERATION_DECISIONS = ["APPROVED", "REJECTED"] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type ModerationDecision = (typeof MODERATION_DECISIONS)[number];

export const SESSION_EXPIRED_MESSAGE = "Your admin session is no longer active.";
export const REVIEW_UNCHANGED_MESSAGE = "The review was not changed.";

const MODERATION_KEYS = ["status", "reviewedAt", "reviewedBy", "reviewedById"] as const;

export type AdminReview = {
  id: string;
  name: string;
  profileUrl: string;
  role: string;
  message: string;
  status: ReviewStatus;
  reviewedAt: string | null;
  reviewedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicReview = {
  id: string;
  name: string;
  profileUrl: string;
  role: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewListState =
  | { status: "loading"; filter: ReviewStatus }
  | { status: "ready"; filter: ReviewStatus; reviews: AdminReview[] }
  | { status: "invalid"; filter: ReviewStatus; message: string }
  | { status: "error"; filter: ReviewStatus; message: string }
  | { status: "unauthorized"; filter: ReviewStatus; message: string };

export type ReviewDetailState =
  | { status: "loading"; id: string }
  | { status: "ready"; review: AdminReview }
  | { status: "invalid"; id: string; message: string }
  | { status: "error"; id: string; message: string }
  | { status: "unauthorized"; id: string; message: string };

export type PendingAction = "moderate" | "delete" | "create" | "save";

export type ReviewWriteResult =
  | { ok: true; review: AdminReview }
  | {
      ok: false;
      kind: "validation" | "unauthorized" | "forbidden" | "error";
      message: string;
      fieldErrors: ReviewContentErrors;
    };

export type ModerateResult =
  | { ok: true; review: AdminReview }
  | { ok: false; kind: "validation" | "unauthorized" | "forbidden" | "error"; message: string };

export type DeleteResult =
  | { ok: true }
  | { ok: false; kind: "unauthorized" | "forbidden" | "error"; message: string };

export function initialReviewList(filter: ReviewStatus = "PENDING"): ReviewListState {
  return { status: "loading", filter };
}

export function controlsLocked(action: PendingAction | null): boolean {
  return action !== null;
}

export function beginPending(current: PendingAction | null, next: PendingAction): PendingAction | null {
  if (current) return null;
  return next;
}

export function adminReviewCreatePath(): string {
  return "/admin/reviews";
}

export function reviewsListPath(status: ReviewStatus): string {
  return `/admin/reviews?status=${status}`;
}

export function adminReviewPath(id: string): string {
  return `/admin/reviews/${encodeURIComponent(id)}`;
}

export function adminReviewStatusPath(id: string): string {
  return `${adminReviewPath(id)}/status`;
}

export function reviewResourcePath(id: string): string {
  return `/reviews/${encodeURIComponent(id)}`;
}

export function allowedDecisions(status: ReviewStatus): ModerationDecision[] {
  if (status === "PENDING") return ["APPROVED", "REJECTED"];
  if (status === "APPROVED") return ["REJECTED"];
  return ["APPROVED"];
}

export function prepareModeration(
  current: ReviewStatus,
  next: string,
): { ok: true; status: ModerationDecision } | { ok: false; message: string } {
  if (!isModerationDecision(next) || !allowedDecisions(current).includes(next)) {
    return { ok: false, message: `Cannot change review status from ${current} to ${next}.` };
  }
  return { ok: true, status: next };
}

export function readAdminReview(data: unknown): AdminReview | null {
  if (!isRecord(data)) return null;
  if (!isNonEmptyString(data.id) || !isNonEmptyString(data.name) || !isNonEmptyString(data.profileUrl)) return null;
  if (!isNonEmptyString(data.role) || !isNonEmptyString(data.message)) return null;
  if (!isReviewStatus(data.status) || !isNonEmptyString(data.createdAt) || !isNonEmptyString(data.updatedAt)) return null;
  const reviewedAt = optionalText(data.reviewedAt);
  const reviewedByName = moderatorName(data.reviewedBy);
  if (reviewedAt === false || reviewedByName === false) return null;
  if ("profilePublicId" in data && data.profilePublicId !== undefined && typeof data.profilePublicId !== "string") return null;

  return {
    id: data.id,
    name: data.name,
    profileUrl: data.profileUrl,
    role: data.role,
    message: data.message,
    status: data.status,
    reviewedAt,
    reviewedByName,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function readAdminReviewList(data: unknown): AdminReview[] | null {
  if (!Array.isArray(data)) return null;
  const reviews: AdminReview[] = [];
  for (const item of data) {
    const review = readAdminReview(item);
    if (!review) return null;
    reviews.push(review);
  }
  return reviews;
}

export function readPublicReviewList(data: unknown): PublicReview[] | null {
  if (!Array.isArray(data)) return null;
  const reviews: PublicReview[] = [];
  for (const item of data) {
    if (!isRecord(item)) return null;
    if (MODERATION_KEYS.some((key) => Object.prototype.hasOwnProperty.call(item, key))) continue;
    const review = readPublicReview(item);
    if (!review) return null;
    reviews.push(review);
  }
  return reviews;
}

export function publicSubmission(body: Record<string, unknown>): { ok: true } | { ok: false; message: string } {
  if (MODERATION_KEYS.some((key) => Object.prototype.hasOwnProperty.call(body, key))) {
    return { ok: false, message: "Moderation status cannot be set by the client" };
  }
  return { ok: true };
}

export async function loadReviewList(
  listReviews: (status: ReviewStatus) => Promise<unknown>,
  filter: ReviewStatus,
): Promise<Exclude<ReviewListState, { status: "loading" }>> {
  try {
    const reviews = readAdminReviewList(await listReviews(filter));
    if (!reviews) {
      return { status: "invalid", filter, message: "The reviews response was not a list of reviews." };
    }
    return { status: "ready", filter, reviews };
  } catch (error) {
    return listFailure(filter, error);
  }
}

export async function loadReview(
  getReview: (id: string) => Promise<unknown>,
  id: string,
): Promise<Exclude<ReviewDetailState, { status: "loading" }>> {
  try {
    const review = readAdminReview(await getReview(id));
    if (!review) return { status: "invalid", id, message: "The review response was not a review." };
    return { status: "ready", review };
  } catch (error) {
    const failure = listFailure("PENDING", error);
    if (failure.status === "unauthorized") return { status: "unauthorized", id, message: failure.message };
    return { status: "error", id, message: failure.message };
  }
}

export async function moderateReview(
  client: { setStatus: (id: string, status: ModerationDecision) => Promise<unknown> },
  review: AdminReview,
  nextStatus: string,
): Promise<ModerateResult> {
  const prepared = prepareModeration(review.status, nextStatus);
  if (!prepared.ok) return { ok: false, kind: "validation", message: prepared.message };

  try {
    const updated = readAdminReview(await client.setStatus(review.id, prepared.status));
    if (!updated) {
      return { ok: false, kind: "error", message: "The server response did not include the updated review." };
    }
    return { ok: true, review: updated };
  } catch (error) {
    return { ok: false, ...mutationFailure(error) };
  }
}

export function confirmedDeletion(target: { id: string } | null, confirmed: boolean): string | null {
  if (!confirmed || !target?.id.trim()) return null;
  return target.id;
}

export async function deleteReview(
  client: { deleteReview: (id: string) => Promise<unknown> },
  id: string,
): Promise<DeleteResult> {
  if (!id.trim()) return { ok: false, kind: "error", message: "Choose a review to delete." };
  try {
    await client.deleteReview(id);
    return { ok: true };
  } catch (error) {
    return { ok: false, ...mutationFailure(error) };
  }
}

export function applyModeration(
  list: ReviewListState,
  review: AdminReview,
  filter: ReviewStatus,
): ReviewListState {
  if (list.status !== "ready") return list;
  return {
    status: "ready",
    filter,
    reviews: list.reviews.flatMap((item) => {
      if (item.id !== review.id) return [item];
      return review.status === filter ? [review] : [];
    }),
  };
}

export async function createAdminReview(
  client: { createReview: (form: FormData) => Promise<unknown> },
  values: ReviewContentValues,
  file: File | null,
  imageError: string | null,
): Promise<ReviewWriteResult> {
  const fieldErrors = validateReviewContent(values, {
    requireFile: true,
    hasFile: file !== null,
    imageError,
  });
  if (hasFieldErrors(fieldErrors)) {
    return { ok: false, kind: "validation", message: "Check the highlighted fields.", fieldErrors };
  }

  try {
    const review = readAdminReview(await client.createReview(reviewContentForm(values, file)));
    if (!review || review.status !== "PENDING") {
      return {
        ok: false,
        kind: "error",
        message: "A new review must stay pending until it is approved.",
        fieldErrors: {},
      };
    }
    return { ok: true, review };
  } catch (error) {
    return { ok: false, ...mutationFailure(error), fieldErrors: {} };
  }
}

export async function saveReviewContent(
  client: { updateReview: (id: string, form: FormData) => Promise<unknown> },
  review: AdminReview,
  values: ReviewContentValues,
  file: File | null,
  imageError: string | null,
): Promise<ReviewWriteResult> {
  const fieldErrors = validateReviewContent(values, {
    requireFile: false,
    hasFile: file !== null,
    imageError,
  });
  if (hasFieldErrors(fieldErrors)) {
    return { ok: false, kind: "validation", message: "Check the highlighted fields.", fieldErrors };
  }

  try {
    const updated = readAdminReview(await client.updateReview(review.id, reviewContentForm(values, file)));
    if (!updated) {
      return { ok: false, kind: "error", message: "The server response did not include the updated review.", fieldErrors: {} };
    }
    if (updated.status !== review.status) {
      return { ok: false, kind: "error", message: "Editing a review must not change its status.", fieldErrors: {} };
    }
    return { ok: true, review: updated };
  } catch (error) {
    return { ok: false, ...mutationFailure(error), fieldErrors: {} };
  }
}

export function applyCreatedReview(list: ReviewListState, review: AdminReview): ReviewListState {
  if (list.status !== "ready" || list.filter !== review.status) return list;
  if (list.reviews.some((item) => item.id === review.id)) return list;
  return { status: "ready", filter: list.filter, reviews: [review, ...list.reviews] };
}

export function applyDeletion(list: ReviewListState, id: string): ReviewListState {
  if (list.status !== "ready") return list;
  return { status: "ready", filter: list.filter, reviews: list.reviews.filter((item) => item.id !== id) };
}

function readPublicReview(data: Record<string, unknown>): PublicReview | null {
  if (!isNonEmptyString(data.id) || !isNonEmptyString(data.name) || !isNonEmptyString(data.profileUrl)) return null;
  if (!isNonEmptyString(data.role) || !isNonEmptyString(data.message)) return null;
  if (!isNonEmptyString(data.createdAt) || !isNonEmptyString(data.updatedAt)) return null;
  if ("profilePublicId" in data && data.profilePublicId !== undefined && typeof data.profilePublicId !== "string") return null;
  return {
    id: data.id,
    name: data.name,
    profileUrl: data.profileUrl,
    role: data.role,
    message: data.message,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function listFailure(
  filter: ReviewStatus,
  error: unknown,
): Exclude<ReviewListState, { status: "loading" | "ready" }> {
  if (error instanceof ApiRequestError && error.status === 401) {
    return { status: "unauthorized", filter, message: SESSION_EXPIRED_MESSAGE };
  }
  return {
    status: "error",
    filter,
    message: error instanceof Error && error.message.trim() ? error.message : "The request failed.",
  };
}

function mutationFailure(error: unknown): { kind: "unauthorized" | "forbidden" | "error"; message: string } {
  if (error instanceof ApiRequestError && error.status === 401) {
    return { kind: "unauthorized", message: SESSION_EXPIRED_MESSAGE };
  }
  const message = error instanceof Error && error.message.trim() ? error.message : "The request failed.";
  if (error instanceof ApiRequestError && error.status === 403) return { kind: "forbidden", message };
  return { kind: "error", message };
}

function moderatorName(value: unknown): string | null | false {
  if (value === null) return null;
  if (!isRecord(value) || !isNonEmptyString(value.name) || !isNonEmptyString(value.id)) return false;
  return value.name;
}

function optionalText(value: unknown): string | null | false {
  if (value === null) return null;
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasFieldErrors(errors: ReviewContentErrors): boolean {
  return Object.values(errors).some((error) => Boolean(error));
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return REVIEW_STATUSES.some((status) => status === value);
}

function isModerationDecision(value: unknown): value is ModerationDecision {
  return MODERATION_DECISIONS.some((status) => status === value);
}
