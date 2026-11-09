import { useEffect, useState } from "react";

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
  const [stored, setStored] = useState<{ file: File | null; url: string | null }>({
    file: null,
    url: null,
  });

  let url = stored.url;
  if (stored.file !== file) {
    if (stored.url) URL.revokeObjectURL(stored.url);
    url = file ? URL.createObjectURL(file) : null;
    setStored({ file, url });
  }

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}
