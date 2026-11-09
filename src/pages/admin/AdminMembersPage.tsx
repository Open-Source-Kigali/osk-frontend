import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import { apiGet, sessionSend } from "@/api";
import {
  beginPending,
  CODING_LEVELS,
  confirmedDeletion,
  controlsLocked,
  deleteMember,
  formFromMember,
  initialMemberList,
  loadMemberList,
  MEMBER_UNCHANGED_MESSAGE,
  memberResourcePath,
  saveMember,
  SESSION_EXPIRED_MESSAGE,
  type AdminMember,
  type MemberFieldErrors,
  type MemberFormValues,
  type MemberListState,
  type MemberUpdatePayload,
  type PendingAction,
} from "@/admin/members";
import { Button } from "@/components/UI";
import Loader from "@/components/UI/Loader";

const membersClient = {
  listMembers: () => apiGet<unknown>("/members"),
  updateMember: (id: string, payload: MemberUpdatePayload) =>
    sessionSend<unknown>(memberResourcePath(id), "PUT", payload),
  deleteMember: (id: string) => sessionSend<unknown>(memberResourcePath(id), "DELETE"),
};

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus-visible:ring-2 ${
    hasError
      ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
      : "border-gray-200 focus-visible:border-[#2b7fff] focus-visible:ring-[#2b7fff]/10"
  }`;

const AdminMembersPage = () => {
  const [list, setList] = useState<MemberListState>(initialMemberList);
  const [editor, setEditor] = useState<AdminMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminMember | null>(null);
  const [action, setAction] = useState<PendingAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const locked = controlsLocked(action);

  async function reload(keepVisible = false) {
    if (!keepVisible) setList(initialMemberList());
    setList(await loadMemberList(membersClient.listMembers));
  }

  useEffect(() => {
    let active = true;
    void loadMemberList(membersClient.listMembers).then((next) => {
      if (active) setList(next);
    });
    return () => {
      active = false;
    };
  }, []);

  function openEdit(member: AdminMember) {
    if (locked) return;
    setNotice(null);
    setActionError(null);
    setEditor(member);
  }

  async function onSave(values: MemberFormValues) {
    if (!editor) return;
    const next = beginPending(action, "save");
    if (!next) return;
    setAction(next);
    setActionError(null);
    try {
      const result = await saveMember(membersClient, editor.id, values);
      if (!result.ok) {
        const message =
          result.kind === "forbidden" && result.message
            ? `${result.message} ${MEMBER_UNCHANGED_MESSAGE}`
            : result.message;
        setActionError(message);
        return { fieldErrors: result.fieldErrors, message };
      }
      setNotice("Member updated.");
      setEditor(null);
      await reload(true);
      return null;
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
      const result = await deleteMember(membersClient, id);
      if (!result.ok) {
        setActionError(
          result.kind === "forbidden" ? `${result.message} ${MEMBER_UNCHANGED_MESSAGE}` : result.message,
        );
        return;
      }
      setNotice("Member deleted.");
      setDeleteTarget(null);
      if (editor?.id === id) setEditor(null);
      await reload(true);
    } finally {
      setAction(null);
    }
  }

  return (
    <section className="flex flex-col gap-6" data-testid="admin-members">
      <div>
        <h1 className="text-2xl font-bold text-text-heading sm:text-3xl">Members</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-supporting sm:text-base">
          Update or remove existing members. This page does not register new ones.
        </p>
      </div>

      {notice ? (
        <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {notice}
        </p>
      ) : null}

      {actionError && !editor && !deleteTarget ? (
        <StatusMessage message={actionError} unauthorized={actionError === SESSION_EXPIRED_MESSAGE} />
      ) : null}

      {list.status === "unauthorized" ? <StatusMessage message={list.message} unauthorized /> : null}
      {list.status === "error" || list.status === "invalid" ? (
        <StatusMessage message={list.message} unauthorized={false} />
      ) : null}

      {editor ? (
        <MemberEditor
          member={editor}
          locked={locked}
          serverMessage={actionError}
          onCancel={() => {
            if (action === "save") return;
            setEditor(null);
            setActionError(null);
          }}
          onDismiss={() => setActionError(null)}
          onSave={onSave}
        />
      ) : null}

      {list.status === "loading" ? (
        <div role="status" aria-live="polite">
          <Loader text="Loading members..." />
        </div>
      ) : null}

      {list.status === "ready" && list.members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-text-supporting">
          No members yet.
        </div>
      ) : null}

      {list.status === "ready" && list.members.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4">
          {list.members.map((member) => (
            <li key={member.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-text-heading">{member.name}</h2>
                  <p className="mt-1 text-sm text-text-supporting">{member.email}</p>
                  <p className="mt-1 text-sm text-text-body">
                    @{member.githubUsername}
                    {" · "}
                    {member.orgName}
                    {" · "}
                    {levelLabel(member.codingLevel)}
                  </p>
                  <p className="mt-2 text-sm text-text-body">{member.joinReason}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" disabled={locked} onClick={() => openEdit(member)}>
                    Edit
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
                      setDeleteTarget(member);
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

      <DeleteMemberDialog
        member={deleteTarget}
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

function MemberEditor({
  member,
  locked,
  serverMessage,
  onCancel,
  onDismiss,
  onSave,
}: {
  member: AdminMember;
  locked: boolean;
  serverMessage: string | null;
  onCancel: () => void;
  onDismiss: () => void;
  onSave: (values: MemberFormValues) => Promise<{ fieldErrors: MemberFieldErrors; message: string | null } | null | undefined>;
}) {
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<MemberFormValues>(formFromMember(member));
  const [fieldErrors, setFieldErrors] = useState<MemberFieldErrors>({});

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function update<K extends keyof MemberFormValues>(key: K, value: MemberFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    onDismiss();
  }

  async function onSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (locked) return;
    const result = await onSave(values);
    if (result) setFieldErrors(result.fieldErrors);
  }

  return (
    <form
      className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="text-lg font-bold text-text-heading">
        Edit {member.name}
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-supporting">
        Name, email, GitHub username, organization, join reason, and coding level cannot be cleared. Enter a replacement to change them.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" error={fieldErrors.name} className="sm:col-span-2">
          <input
            ref={nameRef}
            id="member-name"
            className={inputClass(Boolean(fieldErrors.name))}
            value={values.name}
            autoComplete="name"
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? "member-name-error" : undefined}
            onChange={(event) => update("name", event.target.value)}
            disabled={locked}
          />
        </Field>
        <Field label="Email" name="email" error={fieldErrors.email}>
          <input
            id="member-email"
            type="email"
            inputMode="email"
            className={inputClass(Boolean(fieldErrors.email))}
            value={values.email}
            autoComplete="email"
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "member-email-error" : undefined}
            onChange={(event) => update("email", event.target.value)}
            disabled={locked}
          />
        </Field>
        <Field label="GitHub username" name="githubUsername" error={fieldErrors.githubUsername}>
          <input
            id="member-githubUsername"
            className={inputClass(Boolean(fieldErrors.githubUsername))}
            value={values.githubUsername}
            autoComplete="off"
            aria-invalid={fieldErrors.githubUsername ? true : undefined}
            aria-describedby={fieldErrors.githubUsername ? "member-githubUsername-error" : undefined}
            onChange={(event) => update("githubUsername", event.target.value)}
            disabled={locked}
          />
        </Field>
        <Field label="Organization" name="orgName" error={fieldErrors.orgName}>
          <input
            id="member-orgName"
            className={inputClass(Boolean(fieldErrors.orgName))}
            value={values.orgName}
            autoComplete="organization"
            aria-invalid={fieldErrors.orgName ? true : undefined}
            aria-describedby={fieldErrors.orgName ? "member-orgName-error" : undefined}
            onChange={(event) => update("orgName", event.target.value)}
            disabled={locked}
          />
        </Field>
        <Field label="Coding level" name="codingLevel" error={fieldErrors.codingLevel}>
          <select
            id="member-codingLevel"
            className={inputClass(Boolean(fieldErrors.codingLevel))}
            value={values.codingLevel}
            aria-invalid={fieldErrors.codingLevel ? true : undefined}
            aria-describedby={fieldErrors.codingLevel ? "member-codingLevel-error" : undefined}
            onChange={(event) => update("codingLevel", event.target.value as MemberFormValues["codingLevel"])}
            disabled={locked}
          >
            {CODING_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Join reason" name="joinReason" error={fieldErrors.joinReason} className="sm:col-span-2">
          <textarea
            id="member-joinReason"
            rows={3}
            className={inputClass(Boolean(fieldErrors.joinReason))}
            value={values.joinReason}
            aria-invalid={fieldErrors.joinReason ? true : undefined}
            aria-describedby={fieldErrors.joinReason ? "member-joinReason-error" : undefined}
            onChange={(event) => update("joinReason", event.target.value)}
            disabled={locked}
          />
        </Field>
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
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={locked}>
          Cancel
        </Button>
        <Button type="submit" loading={locked} disabled={locked}>
          {locked ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={`member-${name}`} className="text-sm font-bold text-gray-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`member-${name}-error`} className="flex items-center gap-1 text-sm font-medium text-red-500">
          <AlertCircle size={11} aria-hidden="true" /> {error}
        </p>
      ) : null}
    </div>
  );
}

function DeleteMemberDialog({
  member,
  locked,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  member: AdminMember | null;
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
    if (member && !dialog.open) dialog.showModal();
    if (!member && dialog.open) dialog.close();
  }, [member]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={member ? titleId : undefined}
      className="fixed top-1/2 left-1/2 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 backdrop:bg-black/40"
      onCancel={(dialogEvent) => {
        if (locked) dialogEvent.preventDefault();
      }}
      onClose={onCancel}
    >
      {member ? (
        <>
          <h2 id={titleId} className="text-xl font-bold text-text-heading">
            Delete {member.name}?
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-supporting">
            This removes {member.name} ({member.email}) from the member list.
          </p>
          {errorMessage ? (
            <p role="alert" className="mt-4 text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={locked} autoFocus>
              Keep member
            </Button>
            <Button type="button" variant="dark" onClick={onConfirm} disabled={locked} loading={locked}>
              {locked ? "Deleting..." : `Delete ${member.name}`}
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

function levelLabel(level: AdminMember["codingLevel"]): string {
  return CODING_LEVELS.find((item) => item.value === level)?.label ?? level;
}

export default AdminMembersPage;
