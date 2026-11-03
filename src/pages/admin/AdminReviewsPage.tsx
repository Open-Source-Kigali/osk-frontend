import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import { sessionForm, sessionGet, sessionSend } from "@/api";
import {
  REVIEW_STATUSES,
  REVIEW_UNCHANGED_MESSAGE,
  adminReviewCreatePath,
  adminReviewPath,
  adminReviewStatusPath,
  allowedDecisions,
  applyCreatedReview,
  applyDeletion,
  applyModeration,
  beginPending,
  confirmedDeletion,
  controlsLocked,
  createAdminReview,
  deleteReview,
  initialReviewList,
  loadReview,
  loadReviewList,
  moderateReview,
  reviewResourcePath,
  reviewsListPath,
  saveReviewContent,
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
import { validateImageFile } from "@/lib/imageUpload";
import type { ReviewContentErrors, ReviewContentValues } from "@/lib/stories";
import AdminImagePreview, { adminFileInputClass } from "./AdminImagePreview";

const reviewsClient = {
  listReviews: (status: ReviewStatus) => sessionGet<unknown>(reviewsListPath(status)),
  getReview: (id: string) => sessionGet<unknown>(adminReviewPath(id)),
  createReview: (form: FormData) => sessionForm<unknown>(adminReviewCreatePath(), "POST", form),
  updateReview: (id: string, form: FormData) => sessionForm<unknown>(reviewResourcePath(id), "PUT", form),
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
  const [creating, setCreating] = useState(false);
  const [editor, setEditor] = useState<AdminReview | null>(null);
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

  async function onCreate(values: ReviewContentValues, file: File | null) {
    const next = beginPending(action, "create");
    if (!next) return {};
    setAction(next);
    setActionError(null);
    try {
      const imageError = file ? await imageErrorFor(file) : null;
      const result = await createAdminReview(reviewsClient, values, file, imageError);
      if (!result.ok) {
        setActionError(result.kind === "forbidden" ? `${result.message} ${REVIEW_UNCHANGED_MESSAGE}` : result.message);
        return result.fieldErrors;
      }
      setNotice("Review submitted for approval.");
      setCreating(false);
      setFilter("PENDING");
      setList((current) =>
        applyCreatedReview(
          current.status === "ready" && current.filter === "PENDING"
            ? current
            : { status: "ready", filter: "PENDING", reviews: [] },
          result.review,
        ),
      );
      await refresh("PENDING");
      return {};
    } finally {
      setAction(null);
    }
  }

  async function onSave(values: ReviewContentValues, file: File | null) {
    if (!editor) return {};
    const next = beginPending(action, "save");
    if (!next) return {};
    setAction(next);
    setActionError(null);
    try {
      const imageError = file ? await imageErrorFor(file) : null;
      const result = await saveReviewContent(reviewsClient, editor, values, file, imageError);
      if (!result.ok) {
        setActionError(result.kind === "forbidden" ? `${result.message} ${REVIEW_UNCHANGED_MESSAGE}` : result.message);
        return result.fieldErrors;
      }
      setNotice("Review updated.");
      setEditor(null);
      setList((current) => applyModeration(current, result.review, filter));
      setDetail({ status: "ready", review: result.review });
      await refresh(filter);
      return {};
    } finally {
      setAction(null);
    }
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading sm:text-3xl">Reviews</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-supporting sm:text-base">
            New reviews stay pending until they are approved. An approved review can be rejected, and a rejected review can be approved. A review cannot return to pending.
          </p>
        </div>
        <Button
          type="button"
          disabled={locked}
          onClick={() => {
            if (locked) return;
            setNotice(null);
            setActionError(null);
            setEditor(null);
            setCreating(true);
          }}
        >
          New review
        </Button>
      </div>

      {creating ? (
        <ReviewContentForm
          title="New review"
          submitLabel="Submit for approval"
          pendingLabel="Submitting..."
          locked={action === "create"}
          requireFile
          serverMessage={actionError}
          onCancel={() => {
            if (action === "create") return;
            setCreating(false);
            setActionError(null);
          }}
          onSubmit={onCreate}
        />
      ) : null}

      {editor ? (
        <ReviewContentForm
          key={editor.id}
          title={`Edit ${editor.name}`}
          submitLabel="Save review"
          pendingLabel="Saving..."
          locked={action === "save"}
          requireFile={false}
          initialValues={{ name: editor.name, role: editor.role, message: editor.message }}
          currentImageUrl={editor.profileUrl}
          serverMessage={actionError}
          onCancel={() => {
            if (action === "save") return;
            setEditor(null);
            setActionError(null);
          }}
          onSubmit={onSave}
        />
      ) : null}

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
            <li key={review.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex gap-4 p-5">
                <img src={review.profileUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="text-lg font-bold text-text-heading">{review.name}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadge(review.status)}`}>
                      {STATUS_LABELS[review.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-supporting">{review.role}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-body">{review.message}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-gray-100 bg-[#f7f8fa] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="primary" size="sm" disabled={locked} onClick={() => void openReview(review.id)}>
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={locked}
                    onClick={() => {
                      if (locked) return;
                      setNotice(null);
                      setActionError(null);
                      setCreating(false);
                      setEditor(review);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
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
        onEdit={(review) => {
          setNotice(null);
          setActionError(null);
          setCreating(false);
          setEditor(review);
        }}
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
  onEdit,
  onDismiss,
}: {
  detail: ReviewDetailState | null;
  locked: boolean;
  pending: boolean;
  serverMessage: string | null;
  onModerate: (review: AdminReview, nextStatus: ModerationDecision) => Promise<void>;
  onEdit: (review: AdminReview) => void;
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
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 pb-0 sm:p-6 sm:pb-0" aria-labelledby="review-detail-title">
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
      <div className="-mx-5 mt-6 flex flex-col gap-3 border-t border-gray-100 bg-[#f7f8fa] px-5 py-3 sm:-mx-6 sm:flex-row sm:items-center sm:justify-end sm:px-6">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={locked}
          onClick={() => {
            onDismiss();
            onEdit(review);
          }}
        >
          Edit
        </Button>
        {allowedDecisions(review.status).map((decision) => (
          <Button
            key={decision}
            type="button"
            size="sm"
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
    </article>
  );
}

function ReviewContentForm({
  title,
  submitLabel,
  pendingLabel,
  locked,
  requireFile,
  initialValues = { name: "", role: "", message: "" },
  currentImageUrl = null,
  serverMessage,
  onCancel,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  pendingLabel: string;
  locked: boolean;
  requireFile: boolean;
  initialValues?: ReviewContentValues;
  currentImageUrl?: string | null;
  serverMessage: string | null;
  onCancel: () => void;
  onSubmit: (values: ReviewContentValues, file: File | null) => Promise<ReviewContentErrors>;
}) {
  const [values, setValues] = useState<ReviewContentValues>(initialValues);
  const [file, setFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ReviewContentErrors>({});

  function update(field: keyof ReviewContentValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <form
      className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (locked) return;
        void onSubmit(values, file).then((errors) => setFieldErrors(errors));
      }}
    >
      <h2 className="text-lg font-bold text-text-heading">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-text-supporting">
        {requireFile
          ? "This review stays pending until you approve it."
          : "Saving changes keeps the current approval status."}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ContentField label="Name" error={fieldErrors.name} className="sm:col-span-2">
          <input
            id="review-name"
            value={values.name}
            aria-invalid={fieldErrors.name ? true : undefined}
            className={inputClass(Boolean(fieldErrors.name))}
            onChange={(event) => update("name", event.target.value)}
          />
        </ContentField>
        <ContentField label="Role" error={fieldErrors.role}>
          <input
            id="review-role"
            value={values.role}
            aria-invalid={fieldErrors.role ? true : undefined}
            className={inputClass(Boolean(fieldErrors.role))}
            onChange={(event) => update("role", event.target.value)}
          />
        </ContentField>
        <ContentField label="Message" error={fieldErrors.message} className="sm:col-span-2">
          <textarea
            id="review-message"
            rows={5}
            value={values.message}
            aria-invalid={fieldErrors.message ? true : undefined}
            className={inputClass(Boolean(fieldErrors.message))}
            onChange={(event) => update("message", event.target.value)}
          />
        </ContentField>
        <ContentField label={requireFile ? "Profile photo" : "Replace profile photo"} error={fieldErrors.file} className="sm:col-span-2">
          <AdminImagePreview file={file} currentUrl={currentImageUrl} />
          <input
            id="review-file"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            className={adminFileInputClass}
            aria-invalid={fieldErrors.file ? true : undefined}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setFieldErrors((current) => ({ ...current, file: undefined }));
            }}
          />
        </ContentField>
      </div>
      {serverMessage ? (
        <p role="alert" className="mt-4 text-sm font-medium text-red-600">
          {serverMessage}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={locked}>
          Cancel
        </Button>
        <Button type="submit" disabled={locked} loading={locked}>
          {locked ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function ContentField({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block text-sm font-bold text-gray-700 ${className ?? ""}`}>
      {label}
      {children}
      {error ? <span className="mt-1 block text-sm font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function inputClass(invalid: boolean): string {
  return `mt-2 w-full rounded-xl border px-3 py-2 text-sm ${invalid ? "border-red-400" : "border-gray-200"}`;
}

async function imageErrorFor(file: File): Promise<string | null> {
  const result = await validateImageFile(file);
  return result.ok ? null : result.message;
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
      className="fixed top-1/2 left-1/2 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 backdrop:bg-black/40"
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

function statusBadge(status: ReviewStatus): string {
  if (status === "APPROVED") return "bg-green-50 text-green-800";
  if (status === "REJECTED") return "bg-red-50 text-red-800";
  return "bg-amber-50 text-amber-800";
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
