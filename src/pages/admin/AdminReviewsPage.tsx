import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import { sessionGet, sessionSend } from "@/api";
import {
  REVIEW_STATUSES,
  REVIEW_UNCHANGED_MESSAGE,
  adminReviewPath,
  adminReviewStatusPath,
  allowedDecisions,
  applyDeletion,
  applyModeration,
  beginPending,
  confirmedDeletion,
  controlsLocked,
  deleteReview,
  initialReviewList,
  loadReview,
  loadReviewList,
  moderateReview,
  reviewResourcePath,
  reviewsListPath,
  SESSION_EXPIRED_MESSAGE,
  type AdminReview,
  type ModerationDecision,
  type PendingAction,
  type ReviewDetailState,
  type ReviewListState,
  type ReviewStatus,
} from "@/admin/reviews";
import { Button } from "@/components/UI";
import Loader from "@/components/UI/Loader";

const reviewsClient = {
  listReviews: (status: ReviewStatus) => sessionGet<unknown>(reviewsListPath(status)),
  getReview: (id: string) => sessionGet<unknown>(adminReviewPath(id)),
  setStatus: (id: string, status: ModerationDecision) =>
    sessionSend<unknown>(adminReviewStatusPath(id), "PATCH", { status }),
  deleteReview: (id: string) => sessionSend<unknown>(reviewResourcePath(id), "DELETE"),
};

const STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const AdminReviewsPage = () => {
  const [filter, setFilter] = useState<ReviewStatus>("PENDING");
  const [list, setList] = useState<ReviewListState>(initialReviewList("PENDING"));
  const [detail, setDetail] = useState<ReviewDetailState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const [action, setAction] = useState<PendingAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestId = useRef(0);
  const locked = controlsLocked(action);

  useEffect(() => {
    let active = true;
    void loadReviewList(reviewsClient.listReviews, filter).then((next) => {
      if (active) setList(next);
    });
    return () => {
      active = false;
    };
  }, [filter]);

  function showFilter(next: ReviewStatus) {
    if (locked || next === filter) return;
    setNotice(null);
    setActionError(null);
    setDetail(null);
    setList(initialReviewList(next));
    setFilter(next);
  }

  async function refresh(currentFilter: ReviewStatus) {
    const next = await loadReviewList(reviewsClient.listReviews, currentFilter);
    if (next.status === "ready") {
      setList(next);
      return;
    }
    setActionError(`The list could not be refreshed. ${next.message}`);
  }

  async function openReview(id: string) {
    if (locked) return;
    const token = ++requestId.current;
    setNotice(null);
    setActionError(null);
    setDetail({ status: "loading", id });
    const next = await loadReview(reviewsClient.getReview, id);
    if (requestId.current === token) setDetail(next);
  }

  async function onModerate(review: AdminReview, nextStatus: ModerationDecision) {
    const next = beginPending(action, "moderate");
    if (!next) return;
    setAction(next);
    setActionError(null);
    try {
      const result = await moderateReview(reviewsClient, review, nextStatus);
      if (!result.ok) {
        setActionError(
          result.kind === "forbidden" ? `${result.message} ${REVIEW_UNCHANGED_MESSAGE}` : result.message,
        );
        return;
      }
      setNotice(result.review.status === "APPROVED" ? "Review approved." : "Review rejected.");
      setList((current) => applyModeration(current, result.review, filter));
      setDetail((current) =>
        current?.status === "ready" && current.review.id === result.review.id
          ? { status: "ready", review: result.review }
          : current,
      );
      await refresh(filter);
    } finally {
      setAction(null);
    }
  }

  async function onConfirmDelete() {
    const id = confirmedDeletion(deleteTarget, true);
    if (!id) return;
    const next = beginPending(action, "delete");
    if (!next) return;
    setAction(next);
    setActionError(null);
    try {
      const result = await deleteReview(reviewsClient, id);
      if (!result.ok) {
        setActionError(
          result.kind === "forbidden" ? `${result.message} ${REVIEW_UNCHANGED_MESSAGE}` : result.message,
        );
        return;
      }
      setNotice("Review deleted.");
      setDeleteTarget(null);
      setList((current) => applyDeletion(current, id));
      setDetail((current) => (detailShows(current, id) ? null : current));
      await refresh(filter);
    } finally {
      setAction(null);
    }
  }

  return (
    <section className="flex flex-col gap-6" data-testid="admin-reviews">
      <div>
        <h1 className="text-2xl font-bold text-text-heading sm:text-3xl">Reviews</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-supporting sm:text-base">
          Pending reviews can be approved or rejected. An approved review can be rejected, and a rejected review can be approved. A review cannot return to pending.
        </p>
      </div>

      <div role="group" aria-label="Review status" className="flex flex-wrap gap-2">
        {REVIEW_STATUSES.map((status) => (
          <Button
            key={status}
            type="button"
            variant={filter === status ? "dark" : "secondary"}
            size="sm"
            aria-pressed={filter === status}
            disabled={locked}
            onClick={() => showFilter(status)}
          >
            {STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      {notice ? (
        <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {notice}
        </p>
      ) : null}

      {actionError && !deleteTarget && detail?.status !== "ready" ? (
        <StatusMessage message={actionError} unauthorized={actionError === SESSION_EXPIRED_MESSAGE} />
      ) : null}

      {list.status === "unauthorized" ? <StatusMessage message={list.message} unauthorized /> : null}
      {list.status === "error" || list.status === "invalid" ? (
        <StatusMessage message={list.message} unauthorized={false} />
      ) : null}

      {list.status === "loading" ? (
        <div role="status" aria-live="polite">
          <Loader text={`Loading ${STATUS_LABELS[list.filter].toLowerCase()} reviews...`} />
        </div>
      ) : null}

      {list.status === "ready" && list.reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-text-supporting">
          No {STATUS_LABELS[list.filter].toLowerCase()} reviews.
        </div>
      ) : null}

      {list.status === "ready" && list.reviews.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4">
          {list.reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <img src={review.profileUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-text-heading">{review.name}</h2>
                  <p className="mt-1 text-sm text-text-supporting">{review.role}</p>
                  <p className={`mt-2 text-sm font-bold ${statusClass(review.status)}`}>{STATUS_LABELS[review.status]}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-text-body">{review.message}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" disabled={locked} onClick={() => void openReview(review.id)}>
                    View
                  </Button>
                  {allowedDecisions(review.status).map((decision) => (
                    <Button
                      key={decision}
                      type="button"
                      size="sm"
                      variant={decision === "APPROVED" ? "primary" : "dark"}
                      disabled={locked}
                      onClick={() => void onModerate(review, decision)}
                    >
                      {decision === "APPROVED" ? "Approve" : "Reject"}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={locked}
                    onClick={() => {
                      if (locked) return;
                      setNotice(null);
                      setActionError(null);
                      setDeleteTarget(review);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <ReviewDetail
        detail={detail}
        locked={locked}
        pending={action === "moderate"}
        serverMessage={actionError}
        onModerate={onModerate}
        onDismiss={() => setActionError(null)}
      />

      <DeleteReviewDialog
        review={deleteTarget}
        locked={action === "delete"}
        errorMessage={deleteTarget ? actionError : null}
        onCancel={() => {
          if (action === "delete") return;
          setDeleteTarget(null);
        }}
        onConfirm={() => void onConfirmDelete()}
      />
    </section>
  );
};

function ReviewDetail({
  detail,
  locked,
  pending,
  serverMessage,
  onModerate,
  onDismiss,
}: {
  detail: ReviewDetailState | null;
  locked: boolean;
  pending: boolean;
  serverMessage: string | null;
  onModerate: (review: AdminReview, nextStatus: ModerationDecision) => Promise<void>;
  onDismiss: () => void;
}) {
  if (!detail) return null;
  if (detail.status === "loading") {
    return (
      <div role="status" aria-live="polite">
        <Loader text="Loading review..." />
      </div>
    );
  }
  if (detail.status !== "ready") {
    return <StatusMessage message={detail.message} unauthorized={detail.status === "unauthorized"} />;
  }

  const review = detail.review;
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="review-detail-title">
      <h2 id="review-detail-title" className="text-lg font-bold text-text-heading">
        {review.name}
      </h2>
      <img src={review.profileUrl} alt="" className="mt-4 h-20 w-20 rounded-full object-cover" />
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <DetailItem label="Role" value={review.role} />
        <DetailItem label="Status" value={STATUS_LABELS[review.status]} />
        <DetailItem label="Submitted" value={formatWhen(review.createdAt)} />
        <DetailItem label="Updated" value={formatWhen(review.updatedAt)} />
        <DetailItem label="Reviewed" value={review.reviewedAt ? formatWhen(review.reviewedAt) : "Not reviewed yet"} />
        <DetailItem label="Reviewed by" value={review.reviewedByName ?? "Not reviewed yet"} />
        <DetailItem label="Message" value={review.message} className="sm:col-span-2" />
      </dl>
      <div className="mt-6 flex flex-wrap gap-2">
        {allowedDecisions(review.status).map((decision) => (
          <Button
            key={decision}
            type="button"
            variant={decision === "APPROVED" ? "primary" : "dark"}
            disabled={locked}
            loading={pending}
            onClick={() => {
              onDismiss();
              void onModerate(review, decision);
            }}
          >
            {pending ? "Saving..." : decision === "APPROVED" ? "Approve" : "Reject"}
          </Button>
        ))}
      </div>
      {serverMessage ? (
        <p className="mt-4 text-sm font-medium text-red-600" role="alert">
          {serverMessage}{" "}
          {serverMessage === SESSION_EXPIRED_MESSAGE ? (
            <Link to="/admin/login" className="underline">
              Sign in again
            </Link>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}

function DetailItem({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-bold uppercase tracking-wide text-text-supporting">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-text-body">{value}</dd>
    </div>
  );
}

function DeleteReviewDialog({
  review,
  locked,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  review: AdminReview | null;
  locked: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (review && !dialog.open) dialog.showModal();
    if (!review && dialog.open) dialog.close();
  }, [review]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={review ? titleId : undefined}
      className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-gray-200 p-6 backdrop:bg-black/40"
      onCancel={(dialogEvent) => {
        if (locked) dialogEvent.preventDefault();
      }}
      onClose={onCancel}
    >
      {review ? (
        <>
          <h2 id={titleId} className="text-xl font-bold text-text-heading">
            Delete the review from {review.name}?
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-supporting">
            This removes the review from {review.name}, {review.role}.
          </p>
          {errorMessage ? (
            <p role="alert" className="mt-4 text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={locked} autoFocus>
              Keep review
            </Button>
            <Button type="button" variant="dark" onClick={onConfirm} disabled={locked} loading={locked}>
              {locked ? "Deleting..." : `Delete ${review.name}`}
            </Button>
          </div>
        </>
      ) : null}
    </dialog>
  );
}

function StatusMessage({ message, unauthorized }: { message: string; unauthorized: boolean }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
      <p>
        <AlertCircle className="mr-2 inline size-4" aria-hidden="true" />
        {message}{" "}
        {unauthorized ? (
          <Link to="/admin/login" className="underline">
            Sign in again
          </Link>
        ) : null}
      </p>
    </div>
  );
}

function statusClass(status: ReviewStatus): string {
  if (status === "APPROVED") return "text-green-800";
  if (status === "REJECTED") return "text-red-800";
  return "text-amber-800";
}

function detailShows(detail: ReviewDetailState | null, id: string): boolean {
  if (!detail) return false;
  if (detail.status === "ready") return detail.review.id === id;
  return detail.id === id;
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default AdminReviewsPage;
