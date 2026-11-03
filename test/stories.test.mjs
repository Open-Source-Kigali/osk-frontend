import assert from "node:assert/strict";
import test from "node:test";

const storiesUrl = new URL("../src/lib/stories.ts", import.meta.url);
const {
  loadPublicStories,
  reviewContentForm,
  submitPublicStory,
  validateReviewContent,
} = await import(storiesUrl);

const approved = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Amina",
  profileUrl: "https://cdn.example/amina.png",
  profilePublicId: "reviews/amina",
  role: "Software Developer",
  message: "OSK gave me a clear path into open source.",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

test("approved stories load and unapproved records are left out of the public list", async () => {
  const loaded = await loadPublicStories(async () => [
    approved,
    { ...approved, id: "pending", status: "PENDING" },
    { ...approved, id: "rejected", status: "REJECTED", reviewedBy: { id: "admin", name: "Igor" } },
  ]);

  assert.equal(loaded.status, "ready");
  assert.equal(loaded.stories.length, 1);
  assert.equal(loaded.stories[0].name, "Amina");
  assert.equal("status" in loaded.stories[0], false);
  assert.equal("profilePublicId" in loaded.stories[0], false);
});

test("a failed story read stays an error instead of a story list", async () => {
  const loaded = await loadPublicStories(async () => {
    throw new Error("Network down");
  });
  assert.equal(loaded.status, "error");
  assert.equal(loaded.message, "Network down");
});

test("a public story submission reports a pending receipt and does not return a public story", async () => {
  const calls = [];
  const result = await submitPublicStory(
    async (form) => {
      calls.push([...form.keys()]);
      return { ...approved, status: "PENDING" };
    },
    { name: "Amina", role: "Developer", message: "Hello" },
    new File(["png"], "photo.png", { type: "image/png" }),
    null,
  );

  assert.equal(result.ok, true);
  assert.equal("story" in result, false);
  assert.deepEqual(calls[0], ["name", "role", "message", "file"]);
  assert.equal(calls[0].includes("status"), false);
});

test("a submission that comes back approved is not treated as a pending receipt", async () => {
  const result = await submitPublicStory(
    async () => ({ ...approved, status: "APPROVED" }),
    { name: "Amina", role: "Developer", message: "Hello" },
    new File(["png"], "photo.png", { type: "image/png" }),
    null,
  );

  assert.equal(result.ok, false);
  assert.equal(result.message, "The server response did not confirm a pending submission.");
});

test("story fields are required before a request is sent", async () => {
  let called = false;
  const result = await submitPublicStory(
    async () => {
      called = true;
      return null;
    },
    { name: "", role: "", message: "" },
    null,
    null,
  );

  assert.equal(called, false);
  assert.equal(result.ok, false);
  assert.equal(result.fieldErrors.name, "Name is required");
  assert.equal(result.fieldErrors.file, "Profile image file is required");
  assert.deepEqual(
    validateReviewContent(
      { name: "Amina", role: "Developer", message: "Hello" },
      { requireFile: false, hasFile: false, imageError: null },
    ),
    {},
  );
  const form = reviewContentForm({ name: " Amina ", role: " Developer ", message: " Hello " }, null);
  assert.equal(form.get("name"), "Amina");
  assert.equal(form.has("status"), false);
});
