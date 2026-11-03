import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Plus, Quote } from "lucide-react";
import { apiGet, postForm } from "@/api";
import EyebrowLabel from "@/components/UI/EyebrowLabel";
import { ScrollAnimatedItem } from "@/components/UI/ScrollAnimatedItem";
import { useAutoPlay } from "@/hooks";
import { validateImageFile } from "@/lib/imageUpload";
import {
  STORY_PENDING_MESSAGE,
  initialPublicStories,
  loadPublicStories,
  submitPublicStory,
  type PublicStory,
  type PublicStoryState,
  type ReviewContentErrors,
  type ReviewContentValues,
} from "@/lib/stories";
import AdminImagePreview, { adminFileInputClass } from "@/pages/admin/AdminImagePreview";

const emptyStory: ReviewContentValues = { name: "", role: "", message: "" };

const Testimonials = () => {
  const [list, setList] = useState<PublicStoryState>(initialPublicStories);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const requestId = useRef(0);

  async function refresh() {
    const token = ++requestId.current;
    const next = await loadPublicStories(() => apiGet<unknown>("/reviews"));
    if (requestId.current === token) setList(next);
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    function onFocus() {
      void refresh();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <section className="bg-white px-4 py-20 md:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col items-center gap-6 text-center">
          <div>
            <EyebrowLabel text="Community Voices" align="center" />
            <h2 className="text-xl font-black text-gray-900 sm:text-2xl md:text-3xl">
              What Our Contributors Say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg">
              Real stories from real people who&apos;ve grown through Open Source Kigali.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setNotice(null);
              setFormOpen(true);
            }}
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#2b7fff] px-6 text-sm font-semibold text-white transition hover:bg-[#1a6fef]"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Share your story
          </button>
        </div>

        {notice ? (
          <p role="status" className="mx-auto mb-8 max-w-2xl rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            {notice}
          </p>
        ) : null}

        {list.status === "loading" ? (
          <p role="status" className="text-center text-sm text-gray-500">
            Loading stories...
          </p>
        ) : null}

        {list.status === "error" || list.status === "invalid" ? (
          <div role="alert" className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-center">
            <p className="text-sm font-medium text-red-800">{list.message}</p>
            <button
              type="button"
              onClick={() => {
                setList(initialPublicStories());
                void refresh();
              }}
              className="mt-4 text-sm font-semibold text-[#2b7fff] underline"
            >
              Try again
            </button>
          </div>
        ) : null}

        {list.status === "ready" && list.stories.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No stories yet.</p>
        ) : null}

        {list.status === "ready" && list.stories.length > 0 ? (
          <StoryCarousel stories={list.stories} />
        ) : null}
      </div>

      <StoryDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmitted={() => {
          setFormOpen(false);
          setNotice(STORY_PENDING_MESSAGE);
          void refresh();
        }}
      />
    </section>
  );
};

function StoryCarousel({ stories }: { stories: PublicStory[] }) {
  const { current, paused, next, prev, goTo, setPaused } = useAutoPlay({
    length: stories.length,
    interval: 4000,
  });
  const visible = Array.from({ length: Math.min(3, stories.length) }, (_, index) => {
    return stories[(current + index) % stories.length];
  });

  return (
    <>
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {visible.map((story, index) => (
          <ScrollAnimatedItem
            key={`${story.id}-${current}-${index}`}
            delay={index * 0.15}
            className={`flex flex-col gap-4 rounded-2xl bg-gray-50 p-6 sm:p-8 ${
              index === 0 ? "flex" : index === 1 ? "hidden md:flex" : "hidden lg:flex"
            }`}
          >
            <Quote size={28} style={{ color: "#5b9fff" }} />
            <p className="flex-1 text-sm leading-relaxed text-gray-700 sm:text-base">{story.message}</p>
            <div className="mt-2 flex items-center gap-3">
              <img src={story.profileUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
              <div>
                <p className="text-sm font-bold text-gray-900">{story.name}</p>
                <p className="text-xs text-gray-400">{story.role}</p>
              </div>
            </div>
          </ScrollAnimatedItem>
        ))}
      </div>

      {stories.length > 1 ? (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-100"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            {stories.map((story, index) => (
              <button
                key={story.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Story ${index + 1}`}
                className="shrink-0 overflow-hidden rounded-full transition-all duration-300"
                style={
                  index === current
                    ? { width: "24px", height: "10px", background: "#e8f1ff" }
                    : { width: "10px", height: "10px", background: "#d1d5db" }
                }
              >
                {index === current ? (
                  <div
                    key={current}
                    className="h-full rounded-full"
                    style={{
                      background: "#2b7fff",
                      animation: paused ? "none" : "osk-dot-progress 4000ms linear forwards",
                    }}
                  />
                ) : null}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Next"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-100"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      ) : null}

      <style>{`
        @keyframes osk-dot-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </>
  );
}

function StoryDialog({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [values, setValues] = useState<ReviewContentValues>(emptyStory);
  const [file, setFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ReviewContentErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function update(field: keyof ReviewContentValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage(null);
    const imageError = file ? await imageErrorFor(file) : null;
    const result = await submitPublicStory(
      (form) => postForm<unknown>("/reviews", form),
      values,
      file,
      imageError,
    );
    setSubmitting(false);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setMessage(result.message);
      return;
    }
    setValues(emptyStory);
    setFile(null);
    setFieldErrors({});
    onSubmitted();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={open ? titleId : undefined}
      className="fixed top-1/2 left-1/2 w-[min(100%-2rem,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 backdrop:bg-black/40"
      onCancel={(event) => {
        if (submitting) event.preventDefault();
      }}
      onClose={onClose}
    >
      <form onSubmit={(event) => void onSubmit(event)}>
        <h2 id={titleId} className="text-xl font-bold text-gray-900">
          Share your story
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Tell us your name, role, and story, and add a profile photo. It stays private until an admin approves it.
        </p>
        <div className="mt-5 flex flex-col gap-4">
          <StoryField label="Name" error={fieldErrors.name}>
            <input
              id="story-name"
              name="name"
              autoFocus
              value={values.name}
              aria-invalid={fieldErrors.name ? true : undefined}
              className={fieldClass(Boolean(fieldErrors.name))}
              onChange={(event) => update("name", event.target.value)}
            />
          </StoryField>
          <StoryField label="Role" error={fieldErrors.role}>
            <input
              id="story-role"
              name="role"
              value={values.role}
              aria-invalid={fieldErrors.role ? true : undefined}
              className={fieldClass(Boolean(fieldErrors.role))}
              onChange={(event) => update("role", event.target.value)}
            />
          </StoryField>
          <StoryField label="Message" error={fieldErrors.message}>
            <textarea
              id="story-message"
              name="message"
              rows={5}
              value={values.message}
              aria-invalid={fieldErrors.message ? true : undefined}
              className={fieldClass(Boolean(fieldErrors.message))}
              onChange={(event) => update("message", event.target.value)}
            />
          </StoryField>
          <StoryField label="Profile photo" error={fieldErrors.file}>
            <AdminImagePreview file={file} fit="cover" />
            <input
              id="story-file"
              name="file"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className={adminFileInputClass}
              aria-invalid={fieldErrors.file ? true : undefined}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setFieldErrors((current) => ({ ...current, file: undefined }));
              }}
            />
            <p className="mt-2 text-xs text-gray-500">JPEG, PNG, GIF or WebP · max 5 MB</p>
          </StoryField>
        </div>
        {message ? (
          <p role="alert" className="mt-4 text-sm font-medium text-red-600">
            {message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#c5d9ff] px-5 text-sm font-semibold text-[#2b7fff] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#2b7fff] px-5 text-sm font-semibold text-white hover:bg-[#1a6fef] disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit for review"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function StoryField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-bold text-gray-700">
      {label}
      {children}
      {error ? <span className="mt-1 block text-sm font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function fieldClass(invalid: boolean): string {
  return `mt-2 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 ${
    invalid ? "border-red-400" : "border-gray-200"
  }`;
}

async function imageErrorFor(file: File): Promise<string | null> {
  const result = await validateImageFile(file);
  return result.ok ? null : result.message;
}

export default Testimonials;
