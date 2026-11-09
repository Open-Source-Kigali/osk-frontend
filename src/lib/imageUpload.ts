/**
 * Client-side image upload rules aligned with osk-backend upload middleware.
 * The backend also checks file headers; this layer rejects obvious mismatches
 * before the request is sent.
 */

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const JPEG_MIME_ALIAS = "image/jpg";

export const IMAGE_UPLOAD_ACCEPT = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
].join(",");

export const IMAGE_UPLOAD_HELP_TEXT = "JPEG, PNG, GIF or WebP · max 5 MB";

export const UNSUPPORTED_IMAGE_TYPE_MESSAGE =
  "Unsupported file type. Allowed types: JPEG, PNG, WebP, and GIF.";

export const IMAGE_TOO_LARGE_MESSAGE = "Image must be 5 MB or smaller.";

const PNG_SIGNATURE = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

type RasterImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export type ImageUploadValidationResult =
  | { ok: true; mimeType: RasterImageMimeType }
  | { ok: false; message: string };

function normalizeMimeType(mimeType: string) {
  return mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
}

function isAllowedImageLabel(mimeType: string) {
  const normalized = normalizeMimeType(mimeType);
  if (normalized === JPEG_MIME_ALIAS) return true;
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(normalized);
}

function bytesMatch(buffer: Uint8Array, offset: number, expected: string) {
  if (buffer.length < offset + expected.length) return false;
  for (let i = 0; i < expected.length; i += 1) {
    if (buffer[offset + i] !== expected.charCodeAt(i)) return false;
  }
  return true;
}

/** Identifies JPEG, PNG, GIF, and WebP from the file header. */
export function detectRasterImage(
  buffer: Uint8Array,
): RasterImageMimeType | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (buffer.length >= PNG_SIGNATURE.length) {
    let isPng = true;
    for (let i = 0; i < PNG_SIGNATURE.length; i += 1) {
      if (buffer[i] !== PNG_SIGNATURE[i]) {
        isPng = false;
        break;
      }
    }
    if (isPng) return "image/png";
  }

  if (bytesMatch(buffer, 0, "GIF87a") || bytesMatch(buffer, 0, "GIF89a")) {
    return "image/gif";
  }

  if (bytesMatch(buffer, 0, "RIFF") && bytesMatch(buffer, 8, "WEBP")) {
    return "image/webp";
  }

  return null;
}

/**
 * Validates size, declared MIME, and file signature against the backend contract.
 * SVG is rejected: the API stores uploads as submitted and does not sanitize SVG.
 */
export async function validateImageFile(
  file: File,
): Promise<ImageUploadValidationResult> {
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return { ok: false, message: IMAGE_TOO_LARGE_MESSAGE };
  }

  if (!isAllowedImageLabel(file.type)) {
    return { ok: false, message: UNSUPPORTED_IMAGE_TYPE_MESSAGE };
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const detected = detectRasterImage(buffer);
  if (!detected) {
    return { ok: false, message: UNSUPPORTED_IMAGE_TYPE_MESSAGE };
  }

  return { ok: true, mimeType: detected };
}
