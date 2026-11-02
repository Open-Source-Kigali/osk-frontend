import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import AdminImagePreview, { adminFileInputClass } from "./AdminImagePreview";
import { apiGet, sessionForm, sessionSend } from "@/api";
import {
  beginPending,
  confirmedDeletion,
  controlsLocked,
  deletePartner,
  EMPTY_PARTNER_FORM,
  formFromPartner,
  initialPartnerList,
  loadPartnerList,
  PARTNER_UNCHANGED_MESSAGE,
  partnerResourcePath,
  savePartner,
  SESSION_EXPIRED_MESSAGE,
  type AdminPartner,
  type PartnerFieldErrors,
  type PartnerFormValues,
  type PartnerListState,
  type PendingAction,
} from "@/admin/partners";
import { Button } from "@/components/UI";
import Loader from "@/components/UI/Loader";
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_HELP_TEXT,
  validateImageFile,
} from "@/lib/imageUpload";

const partnersClient = {
  listPartners: () => apiGet<unknown>("/partners"),
  createPartner: (form: FormData) => sessionForm<unknown>("/partners", "POST", form),
  updatePartner: (id: string, form: FormData) =>
    sessionForm<unknown>(partnerResourcePath(id), "PUT", form),
  deletePartner: (id: string) => sessionSend<unknown>(partnerResourcePath(id), "DELETE"),
};

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus-visible:ring-2 ${
    hasError
      ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
      : "border-gray-200 focus-visible:border-[#2b7fff] focus-visible:ring-[#2b7fff]/10"
  }`;

const AdminPartnersPage = () => {
  const [list, setList] = useState<PartnerListState>(initialPartnerList);
  const [editor, setEditor] = useState<
    null | { intent: "create" } | { intent: "edit"; partner: AdminPartner }
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPartner | null>(null);
  const [action, setAction] = useState<PendingAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const locked = controlsLocked(action);

  async function reload(keepVisible = false) {
    if (!keepVisible) setList(initialPartnerList());
    setList(await loadPartnerList(partnersClient.listPartners));
  }

  useEffect(() => {
    let active = true;
    void loadPartnerList(partnersClient.listPartners).then((next) => {
      if (active) setList(next);
    });
    return () => {
      active = false;
    };
  }, []);

  function openCreate() {
    if (locked) return;
    setNotice(null);
    setActionError(null);
    setEditor({ intent: "create" });
  }

  function openEdit(partner: AdminPartner) {
    if (locked) return;
    setNotice(null);
    setActionError(null);
    setEditor({ intent: "edit", partner });
  }

  async function onSave(values: PartnerFormValues, file: File | null) {
    if (!editor) return;
    const next = beginPending(action, "save");
    if (!next) return;
    setAction(next);
    setActionError(null);
    try {
      const imageError = file ? await imageProblem(file) : null;
      const result = await savePartner(
        partnersClient,
        editor.intent === "create" ? { intent: "create" } : { intent: "edit", id: editor.partner.id },
        values,
        file,
        imageError,
      );
      if (!result.ok) {
        const message =
          result.kind === "forbidden" && result.message
            ? `${result.message} ${PARTNER_UNCHANGED_MESSAGE}`
            : result.message;
        setActionError(message);
        return { fieldErrors: result.fieldErrors, message };
      }
      setNotice(editor.intent === "create" ? "Partner created." : "Partner updated.");
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
      const result = await deletePartner(partnersClient, id);
      if (!result.ok) {
        setActionError(
          result.kind === "forbidden" ? `${result.message} ${PARTNER_UNCHANGED_MESSAGE}` : result.message,
        );
        return;
      }
      setNotice("Partner deleted.");
      setDeleteTarget(null);
      if (editor?.intent === "edit" && editor.partner.id === id) setEditor(null);
      await reload(true);
    } finally {
      setAction(null);
    }
  }

  return (
    <section className="flex flex-col gap-6" data-testid="admin-partners">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading sm:text-3xl">Partners</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-supporting sm:text-base">
            Create, update, and delete partners. The public site reads the same partner list.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={locked}>
          New partner
        </Button>
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
        <PartnerEditor
          intent={editor.intent}
          partner={editor.intent === "edit" ? editor.partner : null}
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
          <Loader text="Loading partners..." />
        </div>
      ) : null}

      {list.status === "ready" && list.partners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-text-supporting">
          No partners yet. Create the first one.
        </div>
      ) : null}

      {list.status === "ready" && list.partners.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4">
          {list.partners.map((partner) => (
            <li key={partner.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <img src={partner.logoUrl} alt="" className="h-16 w-full rounded-xl object-contain sm:w-28" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-text-heading">{partner.name}</h2>
                  <p className="mt-1 text-sm text-text-supporting">{partner.email}</p>
                  <p className="mt-1 break-all text-sm text-text-body">{partner.websiteUrl}</p>
                  <p className="mt-2 text-sm text-text-body">{partner.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" disabled={locked} onClick={() => openEdit(partner)}>
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
                      setDeleteTarget(partner);
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

      <DeletePartnerDialog
        partner={deleteTarget}
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

function PartnerEditor({
  intent,
  partner,
  locked,
  serverMessage,
  onCancel,
  onDismiss,
  onSave,
}: {
  intent: "create" | "edit";
  partner: AdminPartner | null;
  locked: boolean;
  serverMessage: string | null;
  onCancel: () => void;
  onDismiss: () => void;
  onSave: (
    values: PartnerFormValues,
    file: File | null,
  ) => Promise<{ fieldErrors: PartnerFieldErrors; message: string | null } | null | undefined>;
}) {
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<PartnerFormValues>(partner ? formFromPartner(partner) : EMPTY_PARTNER_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PartnerFieldErrors>({});

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function update<K extends keyof PartnerFormValues>(key: K, value: PartnerFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    onDismiss();
  }

  async function onSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (locked) return;
    const result = await onSave(values, file);
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
        {intent === "create" ? "New partner" : `Edit ${partner?.name ?? "partner"}`}
      </h2>
      {intent === "edit" ? (
        <p className="mt-2 text-sm leading-6 text-text-supporting">
          Name, website, description, email, and partnership reason cannot be cleared. Enter a replacement to change them. Leave the logo empty to keep the current logo.
        </p>
      ) : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" error={fieldErrors.name} required className="sm:col-span-2">
          <input
            ref={nameRef}
            id="partner-name"
            className={inputClass(Boolean(fieldErrors.name))}
            value={values.name}
            autoComplete="organization"
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? "partner-name-error" : undefined}
            onChange={(event) => update("name", event.target.value)}
            disabled={locked}
          />
        </Field>
        <Field label="Website" name="websiteUrl" error={fieldErrors.websiteUrl} required>
          <input
            id="partner-websiteUrl"
            type="url"
            inputMode="url"
            className={inputClass(Boolean(fieldErrors.websiteUrl))}
            value={values.websiteUrl}
            autoComplete="url"
            aria-invalid={fieldErrors.websiteUrl ? true : undefined}
            aria-describedby={fieldErrors.websiteUrl ? "partner-websiteUrl-error" : undefined}
            onChange={(event) => update("websiteUrl", event.target.value)}
            disabled={locked}
          />
        </Field>
        <Field label="Email" name="email" error={fieldErrors.email} required>
          <input
            id="partner-email"
            type="email"
            inputMode="email"
            className={inputClass(Boolean(fieldErrors.email))}
            value={values.email}
            autoComplete="email"
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "partner-email-error" : undefined}
            onChange={(event) => update("email", event.target.value)}
            disabled={locked}
          />
        </Field>
        <Field label="Description" name="description" error={fieldErrors.description} required className="sm:col-span-2">
          <textarea
            id="partner-description"
            rows={3}
            className={inputClass(Boolean(fieldErrors.description))}
            value={values.description}
            aria-invalid={fieldErrors.description ? true : undefined}
            aria-describedby={fieldErrors.description ? "partner-description-error" : undefined}
            onChange={(event) => update("description", event.target.value)}
            disabled={locked}
          />
        </Field>
        <Field
          label="Partnership reason"
          name="partnershipReason"
          error={fieldErrors.partnershipReason}
          required
          className="sm:col-span-2"
        >
          <textarea
            id="partner-partnershipReason"
            rows={3}
            className={inputClass(Boolean(fieldErrors.partnershipReason))}
            value={values.partnershipReason}
            aria-invalid={fieldErrors.partnershipReason ? true : undefined}
            aria-describedby={fieldErrors.partnershipReason ? "partner-partnershipReason-error" : undefined}
            onChange={(event) => update("partnershipReason", event.target.value)}
            disabled={locked}
          />
        </Field>
        <Field
          label={intent === "create" ? "Logo" : "Replace logo"}
          name="file"
          error={fieldErrors.file}
          required={intent === "create"}
          hint={IMAGE_UPLOAD_HELP_TEXT}
          className="sm:col-span-2"
        >
          <AdminImagePreview file={file} currentUrl={partner?.logoUrl} fit="contain" />
          <input
            id="partner-file"
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            className={adminFileInputClass}
            aria-invalid={fieldErrors.file ? true : undefined}
            aria-describedby={fieldErrors.file ? "partner-file-error" : "partner-file-hint"}
            onChange={(event) => {
              onDismiss();
              setFile(event.target.files?.[0] ?? null);
              setFieldErrors((current) => ({ ...current, file: undefined }));
            }}
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
          {locked ? "Saving..." : intent === "create" ? "Create partner" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={`partner-${name}`} className="text-sm font-bold text-gray-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`partner-${name}-hint`} className="text-xs text-text-supporting">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`partner-${name}-error`} className="flex items-center gap-1 text-sm font-medium text-red-500">
          <AlertCircle size={11} aria-hidden="true" /> {error}
        </p>
      ) : null}
    </div>
  );
}

function DeletePartnerDialog({
  partner,
  locked,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  partner: AdminPartner | null;
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
    if (partner && !dialog.open) dialog.showModal();
    if (!partner && dialog.open) dialog.close();
  }, [partner]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={partner ? titleId : undefined}
      className="fixed top-1/2 left-1/2 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 backdrop:bg-black/40"
      onCancel={(dialogEvent) => {
        if (locked) dialogEvent.preventDefault();
      }}
      onClose={onCancel}
    >
      {partner ? (
        <>
          <h2 id={titleId} className="text-xl font-bold text-text-heading">
            Delete {partner.name}?
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-supporting">
            This removes {partner.name} from the partner list.
          </p>
          {errorMessage ? (
            <p role="alert" className="mt-4 text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={locked} autoFocus>
              Keep partner
            </Button>
            <Button type="button" variant="dark" onClick={onConfirm} disabled={locked} loading={locked}>
              {locked ? "Deleting..." : `Delete ${partner.name}`}
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

async function imageProblem(file: File): Promise<string | null> {
  const result = await validateImageFile(file);
  return result.ok ? null : result.message;
}

export default AdminPartnersPage;
