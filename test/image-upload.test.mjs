import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { File } from "node:buffer";

const partnersFormPath = fileURLToPath(
  new URL("../src/pages/PartnersForm.tsx", import.meta.url),
);
const imageUploadPath = fileURLToPath(
  new URL("../src/lib/imageUpload.ts", import.meta.url),
);

const {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_HELP_TEXT,
  MAX_IMAGE_UPLOAD_BYTES,
  UNSUPPORTED_IMAGE_TYPE_MESSAGE,
  IMAGE_TOO_LARGE_MESSAGE,
  detectRasterImage,
  validateImageFile,
} = await import(imageUploadPath);

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
const GIF = Buffer.from("GIF89a", "ascii");
const WEBP = Buffer.concat([
  Buffer.from("RIFF", "ascii"),
  Buffer.alloc(4),
  Buffer.from("WEBP", "ascii"),
]);

test("shared image upload contract matches the hardened backend", () => {
  assert.equal(MAX_IMAGE_UPLOAD_BYTES, 5 * 1024 * 1024);
  assert.equal(
    IMAGE_UPLOAD_ACCEPT,
    "image/jpeg,image/jpg,image/png,image/webp,image/gif",
  );
  assert.match(IMAGE_UPLOAD_HELP_TEXT, /JPEG, PNG, GIF or WebP/);
  assert.doesNotMatch(IMAGE_UPLOAD_ACCEPT, /svg/i);
  assert.doesNotMatch(IMAGE_UPLOAD_HELP_TEXT, /svg/i);
});

test("PartnersForm uses the shared accept list and omits SVG", async () => {
  const source = await readFile(partnersFormPath, "utf8");

  assert.match(source, /IMAGE_UPLOAD_ACCEPT/);
  assert.match(source, /IMAGE_UPLOAD_HELP_TEXT/);
  assert.match(source, /validateImageFile/);
  assert.doesNotMatch(source, /image\/svg\+xml/);
  assert.doesNotMatch(source, /PNG, JPG, SVG or WebP/);
});

test("detectRasterImage recognises supported formats", () => {
  assert.equal(detectRasterImage(PNG), "image/png");
  assert.equal(detectRasterImage(JPEG), "image/jpeg");
  assert.equal(detectRasterImage(GIF), "image/gif");
  assert.equal(detectRasterImage(WEBP), "image/webp");
  assert.equal(detectRasterImage(Buffer.from("%PDF-1.4")), null);
  assert.equal(
    detectRasterImage(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>")),
    null,
  );
});

test("validateImageFile accepts a real PNG", async () => {
  const file = new File([PNG], "logo.png", { type: "image/png" });
  const result = await validateImageFile(file);

  assert.deepEqual(result, { ok: true, mimeType: "image/png" });
});

test("validateImageFile rejects a non-image labelled image/png", async () => {
  const file = new File([Buffer.from("%PDF-1.4")], "notes.png", {
    type: "image/png",
  });
  const result = await validateImageFile(file);

  assert.deepEqual(result, {
    ok: false,
    message: UNSUPPORTED_IMAGE_TYPE_MESSAGE,
  });
});

test("validateImageFile rejects SVG and oversized files", async () => {
  const svg = new File(
    [Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'><script/></svg>")],
    "logo.svg",
    { type: "image/svg+xml" },
  );
  const oversized = new File(
    [Buffer.alloc(MAX_IMAGE_UPLOAD_BYTES + 1)],
    "huge.png",
    { type: "image/png" },
  );

  assert.deepEqual(await validateImageFile(svg), {
    ok: false,
    message: UNSUPPORTED_IMAGE_TYPE_MESSAGE,
  });
  assert.deepEqual(await validateImageFile(oversized), {
    ok: false,
    message: IMAGE_TOO_LARGE_MESSAGE,
  });
});
