import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import { sessionGet, sessionSend } from "@/api";
import {
  APPLICATION_STATUSES,
  APPLICATION_UNCHANGED_MESSAGE,
  applicationResourcePath,
  applicationStatusPath,
  applyDeletion,
  applyStatusUpdate,
  beginPending,
  confirmedDeletion,
  controlsLocked,
  deleteApplication,
  initialApplicationList,
  loadApplication,
  loadApplicationList,
  saveApplicationStatus,
  SESSION_EXPIRED_MESSAGE,
  type AdminApplication,
  type ApplicationDetailState,
  type ApplicationListState,
  type ApplicationStatus,
  type PendingAction,
} from "@/admin/applications";
import { Button } from "@/components/UI";
import Loader from "@/components/UI/Loader";

const applicationsClient = {
  listApplications: () => sessionGet<unknown>("/partner-applications"),
  getApplication: (id: string) => sessionGet<unknown>(applicationResourcePath(id)),
  updateStatus: (id: string, status: ApplicationStatus) =>
    sessionSend<unknown>(applicationStatusPath(id), "PATCH", { status }),
  deleteApplication: (id: string) => sessionSend<unknown>(applicationResourcePath(id), "DELETE"),
};

const AdminApplicationsPage = () => {
  const [list, setList] = useState<ApplicationListState>(initialApplicationList);
  const [detail, setDetail] = useState<ApplicationDetailState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminApplication | null>(null);
  const [action, setAction] = useState<PendingAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestId = useRef(0);
  const locked = controlsLocked(action);

  useEffect(() => {
    let active = true;
    void loadApplicationList(applicationsClient.listApplications).then((next) => {
      if (active) setList(next);
    });
    return () => {
      active = false;
    };
  }, []);

  async function openApplication(id: string) {
    if (locked) return;
    const token = ++requestId.current;
    setNotice(null);
    setActionError(null);
    setDetail({ status: "loading", id });
    const next = await loadApplication(applicationsClient.getApplication, id);
    if (requestId.current === token) setDetail(next);
  }

  async function onSaveStatus(application: AdminApplication, nextStatus: string) {
    const next = beginPending(action, "status");
    if (!next) return;
    setAction(next);
    setActionError(null);
    try {
      const result = await saveApplicationStatus(applicationsClient, application, nextStatus);
      if (!result.ok) {
        setActionError(
          result.kind === "forbidden" ? `${result.message} ${APPLICATION_UNCHANGED_MESSAGE}` : result.message,
        );
        return;
      }
      setNotice(`Status updated to ${result.application.status}.`);
      setList((current) => applyStatusUpdate(current, result.application));
      setDetail({ status: "ready", application: result.application });
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
      const result = await deleteApplication(applicationsClient, id);
      if (!result.ok) {
        setActionError(
          result.kind === "forbidden" ? `${result.message} ${APPLICATION_UNCHANGED_MESSAGE}` : result.message,
        );
        return;
      }
      setNotice("Application deleted.");
      setDeleteTarget(null);
      setList((current) => applyDeletion(current, id));
      setDetail((current) => (detailShows(current, id) ? null : current));
    } finally {
      setAction(null);
    }
  }

  return (
    <section className="flex flex-col gap-6" data-testid="admin-applications">
      <div>
        <h1 className="text-2xl font-bold text-text-heading sm:text-3xl">Partner applications</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-supporting sm:text-base">
          Review submitted applications. Status can be set to Pending, Contacted, Approved, or Rejected from any current status.
        </p>
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
          <Loader text="Loading applications..." />
        </div>
      ) : null}

      {list.status === "ready" && list.applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-text-supporting">
          No applications yet.
        </div>
      ) : null}

      {list.status === "ready" && list.applications.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4">
          {list.applications.map((application) => (
            <li key={application.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <img
                  src={application.organisationLogoUrl}
                  alt=""
                  className="h-16 w-full rounded-xl object-contain sm:w-28"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-text-heading">{application.organisationName}</h2>
                  <p className="mt-1 text-sm text-text-supporting">
                    {application.fullName} · {application.workEmail}
                  </p>
                  <p className="mt-1 text-sm text-text-body">
                    {application.status} · {application.partnershipTier} · {application.country}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" disabled={locked} onClick={() => void openApplication(application.id)}>
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="dark"
                    size="sm"
                    disabled={locked}
                    onClick={() => {
                      if (locked) return;
                      setNotice(null);
                      setActionError(null);
                      setDeleteTarget(application);
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

      <ApplicationDetail
        detail={detail}
        locked={locked}
        serverMessage={actionError}
        statusPending={action === "status"}
        onSaveStatus={onSaveStatus}
        onDismiss={() => setActionError(null)}
      />

      <DeleteApplicationDialog
        application={deleteTarget}
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

function ApplicationDetail({
  detail,
  locked,
  statusPending,
  serverMessage,
  onSaveStatus,
  onDismiss,
}: {
  detail: ApplicationDetailState | null;
  locked: boolean;
  statusPending: boolean;
  serverMessage: string | null;
  onSaveStatus: (application: AdminApplication, nextStatus: string) => Promise<void>;
  onDismiss: () => void;
}) {
  if (!detail) return null;
  if (detail.status === "loading") {
    return (
      <div role="status" aria-live="polite">
        <Loader text="Loading application..." />
      </div>
    );
  }
  if (detail.status !== "ready") {
    return <StatusMessage message={detail.message} unauthorized={detail.status === "unauthorized"} />;
  }

  const application = detail.application;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="application-detail-title">
      <h2 id="application-detail-title" className="text-lg font-bold text-text-heading">
        {application.organisationName}
      </h2>
      <img src={application.organisationLogoUrl} alt={`${application.organisationName} logo`} className="mt-4 h-20 w-auto rounded-xl object-contain" />
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <DetailItem label="Applicant" value={`${application.fullName}, ${application.jobTitle}`} />
        <DetailItem label="Work email" value={application.workEmail} />
        <DetailItem label="Organisation type" value={application.organisationType} />
        <DetailItem label="Organisation size" value={application.organisationSize} />
        <DetailItem label="Country" value={application.country} />
        <DetailItem label="Website" value={application.website} />
        <DetailItem label="Partnership tier" value={application.partnershipTier} />
        <DetailItem label="Current status" value={application.status} />
        <DetailItem label="Submitted" value={formatWhen(application.createdAt)} />
        <DetailItem label="Updated" value={formatWhen(application.updatedAt)} />
        <DetailItem label="Description" value={application.description} className="sm:col-span-2" />
        <DetailItem label="Organisation offer" value={application.organisationOffer} className="sm:col-span-2" />
        {application.projectIdea ? (
          <DetailItem label="Project idea" value={application.projectIdea} className="sm:col-span-2" />
        ) : null}
        <DetailItem label="Terms" value={application.agreedToTerms ? "Agreed" : "Not agreed"} />
      </dl>
      <StatusForm
        key={`${application.id}:${application.status}`}
        application={application}
        locked={locked}
        statusPending={statusPending}
        serverMessage={serverMessage}
        onSaveStatus={onSaveStatus}
        onDismiss={onDismiss}
      />
    </article>
  );
}

function StatusForm({
  application,
  locked,
  statusPending,
  serverMessage,
  onSaveStatus,
  onDismiss,
}: {
  application: AdminApplication;
  locked: boolean;
  statusPending: boolean;
  serverMessage: string | null;
  onSaveStatus: (application: AdminApplication, nextStatus: string) => Promise<void>;
  onDismiss: () => void;
}) {
  const [nextStatus, setNextStatus] = useState<string>(application.status);
  const unchanged = nextStatus === application.status;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    await onSaveStatus(application, nextStatus);
  }

  return (
    <form className="mt-6" onSubmit={(event) => void onSubmit(event)} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="application-status" className="text-sm font-bold text-gray-700">
            Status
          </label>
          <select
            id="application-status"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus-visible:border-[#2b7fff] focus-visible:ring-2 focus-visible:ring-[#2b7fff]/10"
            value={nextStatus}
            disabled={locked}
            onChange={(event) => {
              onDismiss();
              setNextStatus(event.target.value);
            }}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={locked || unchanged} loading={statusPending}>
          {statusPending ? "Saving..." : "Update status"}
        </Button>
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
    </form>
  );
}

function DetailItem({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-bold uppercase tracking-wide text-text-supporting">{label}</dt>
      <dd className="mt-1 break-words text-sm text-text-body">{value}</dd>
    </div>
  );
}

function DeleteApplicationDialog({
  application,
  locked,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  application: AdminApplication | null;
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
    if (application && !dialog.open) dialog.showModal();
    if (!application && dialog.open) dialog.close();
  }, [application]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={application ? titleId : undefined}
      className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-gray-200 p-6 backdrop:bg-black/40"
      onCancel={(dialogEvent) => {
        if (locked) dialogEvent.preventDefault();
      }}
      onClose={onCancel}
    >
      {application ? (
        <>
          <h2 id={titleId} className="text-xl font-bold text-text-heading">
            Delete the {application.organisationName} application?
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-supporting">
            This removes the application from {application.fullName} ({application.workEmail}).
          </p>
          {errorMessage ? (
            <p role="alert" className="mt-4 text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={locked} autoFocus>
              Keep application
            </Button>
            <Button type="button" variant="dark" onClick={onConfirm} disabled={locked} loading={locked}>
              {locked ? "Deleting..." : `Delete ${application.organisationName}`}
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

function detailShows(detail: ApplicationDetailState | null, id: string): boolean {
  if (!detail) return false;
  if (detail.status === "ready") return detail.application.id === id;
  return detail.id === id;
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default AdminApplicationsPage;
