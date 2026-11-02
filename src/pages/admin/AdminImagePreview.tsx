import { useEffect, useRef } from "react";

export const adminFileInputClass = "admin-file-input block w-full text-sm text-gray-700";

type AdminImagePreviewProps = {
  file: File | null;
  currentUrl?: string | null;
  fit?: "cover" | "contain";
};

export default function AdminImagePreview({
  file,
  currentUrl,
  fit = "cover",
}: AdminImagePreviewProps) {
  const previewUrl = useFilePreviewUrl(file);
  const src = previewUrl ?? currentUrl ?? null;
  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      className={`mb-3 h-36 w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 ${
        fit === "contain" ? "object-contain" : "object-cover"
      }`}
    />
  );
}

function useFilePreviewUrl(file: File | null): string | null {
  const store = useRef<{ file: File | null; url: string | null }>({ file: null, url: null });

  if (store.current.file !== file) {
    if (store.current.url) URL.revokeObjectURL(store.current.url);
    store.current = { file, url: file ? URL.createObjectURL(file) : null };
  }

  useEffect(() => {
    const owned = store;
    return () => {
      if (owned.current.url) URL.revokeObjectURL(owned.current.url);
    };
  }, []);

  return store.current.url;
}
