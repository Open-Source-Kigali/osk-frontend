import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const reviewsUrl = new URL("../src/admin/reviews.ts", import.meta.url);
const httpUrl = new URL("../src/api/http.ts", import.meta.url);
const pagePath = new URL("../src/pages/admin/AdminReviewsPage.tsx", import.meta.url);
const testimonialsPath = new URL("../src/pages/Home/components/Testimonials.tsx", import.meta.url);

const {
  allowedDecisions,
  applyDeletion,
  applyModeration,
  beginPending,
  confirmedDeletion,
  controlsLocked,
  deleteReview,
  initialReviewList,
  loadReview,
  loadReviewList,
  moderateReview,
  prepareModeration,
  publicSubmission,
  readAdminReview,
  readPublicReviewList,
  reviewsListPath,
} = await import(reviewsUrl);
const { ApiRequestError, createApiClient } = await import(httpUrl);

const pending = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Amina",
  profileUrl: "https://cdn.example/amina.png",
  profilePublicId: "reviews/amina",
  role: "Software Developer",
  message: "OSK gave me a clear path into open source.",
  status: "PENDING",
  reviewedAt: null,
  reviewedBy: null,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

const publicReview = {
  id: pending.id,
  name: pending.name,
  profileUrl: pending.profileUrl,
  profilePublicId: pending.profilePublicId,
  role: pending.role,
  message: pending.message,
  createdAt: pending.createdAt,
  updatedAt: pending.updatedAt,
};

function approvedCopy(status = "APPROVED") {
  return {
    ...pending,
    status,
    reviewedAt: "2026-10-03T00:00:00.000Z",
    reviewedBy: { id: "admin-1", name: "Igor" },
  };
}

test("review queues load for each status and accept an empty queue", async () => {
  assert.deepEqual(initialReviewList().filter, "PENDING");
  assert.equal(reviewsListPath("APPROVED"), "/admin/reviews?status=APPROVED");

  for (const status of ["PENDING", "APPROVED", "REJECTED"]) {
    const loaded = await loadReviewList(async (filter) => {
      assert.equal(filter, status);
      return status === "PENDING" ? [pending] : [];
    }, status);
    assert.equal(loaded.status, "ready");
    assert.equal(loaded.filter, status);
    assert.equal(loaded.reviews.length, status === "PENDING" ? 1 : 0);
  }

  const ready = await loadReviewList(async () => [pending], "PENDING");
  assert.equal(ready.reviews[0].name, "Amina");
  assert.equal(ready.reviews[0].reviewedByName, null);
  assert.equal("profilePublicId" in ready.reviews[0], false);
  assert.equal("reviewedBy" in ready.reviews[0], false);
});

test("malformed review payloads and server errors do not invent a queue", async () => {
  const envelope = await loadReviewList(async () => ({ reviews: [pending] }), "PENDING");
  assert.equal(envelope.status, "invalid");

  const broken = await loadReviewList(async () => [{ ...pending, status: "PUBLISHED" }], "PENDING");
  assert.equal(broken.status, "invalid");

  const failed = await loadReviewList(async () => {
    throw new ApiRequestError("Not Found", 404);
  }, "REJECTED");
  assert.equal(failed.status, "error");
  assert.equal(failed.message, "Not Found");
  assert.equal(failed.filter, "REJECTED");
});

test("review details keep the moderator name and omit internal ids", async () => {
  const detail = await loadReview(async (id) => {
    assert.equal(id, pending.id);
    return approvedCopy();
  }, pending.id);
  assert.equal(detail.status, "ready");
  assert.equal(detail.review.reviewedByName, "Igor");
  assert.equal(detail.review.status, "APPROVED");
  assert.equal("profilePublicId" in detail.review, false);
});

test("approval and rejection follow the allowed transitions", async () => {
  assert.deepEqual(allowedDecisions("PENDING"), ["APPROVED", "REJECTED"]);
  assert.deepEqual(allowedDecisions("APPROVED"), ["REJECTED"]);
  assert.deepEqual(allowedDecisions("REJECTED"), ["APPROVED"]);

  const calls = [];
  const client = {
    async setStatus(id, status) {
      calls.push({ id, status });
      return approvedCopy(status);
    },
  };
  const review = readAdminReview(pending);
  const approved = await moderateReview(client, review, "APPROVED");
  assert.equal(approved.ok, true);
  assert.equal(approved.review.status, "APPROVED");
  assert.deepEqual(calls[0], { id: pending.id, status: "APPROVED" });

  const rejected = await moderateReview(client, approved.review, "REJECTED");
  assert.equal(rejected.ok, true);
  assert.equal(rejected.review.status, "REJECTED");

  const restored = await moderateReview(client, rejected.review, "APPROVED");
  assert.equal(restored.ok, true);
  assert.equal(calls.length, 3);
});

test("disallowed transitions are not sent and do not change the queue", async () => {
  const review = readAdminReview(pending);
  const list = await loadReviewList(async () => [pending], "PENDING");
  let calls = 0;
  const client = {
    async setStatus() {
      calls += 1;
      return pending;
    },
  };

  for (const next of ["PENDING", "ARCHIVED"]) {
    const result = await moderateReview(client, review, next);
    assert.equal(result.ok, false);
    assert.equal(result.kind, "validation");
    assert.match(result.message, /Cannot change review status from PENDING/);
  }
  assert.equal(prepareModeration("APPROVED", "APPROVED").ok, false);
  assert.equal(prepareModeration("APPROVED", "PENDING").ok, false);
  assert.equal(prepareModeration("REJECTED", "REJECTED").ok, false);
  assert.equal(calls, 0);
  assert.equal(applyModeration(list, review, "PENDING").reviews[0].status, "PENDING");

  const conflict = await moderateReview(
    {
      async setStatus() {
        throw new ApiRequestError("Cannot change review status from APPROVED to APPROVED", 409);
      },
    },
    readAdminReview(approvedCopy()),
    "REJECTED",
  );
  assert.equal(conflict.ok, false);
  assert.match(conflict.message, /APPROVED to APPROVED/);
});

test("delete confirmation, cancellation, success, and failure", async () => {
  assert.equal(confirmedDeletion(null, true), null);
  assert.equal(confirmedDeletion(pending, false), null);

  let deleted = 0;
  const id = confirmedDeletion(pending, true);
  const result = await deleteReview(
    {
      async deleteReview(reviewId) {
        deleted += 1;
        assert.equal(reviewId, id);
        return null;
      },
    },
    id,
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(deleted, 1);

  const list = { status: "ready", filter: "PENDING", reviews: [readAdminReview(pending)] };
  assert.deepEqual(applyDeletion(list, pending.id).reviews, []);
  assert.equal(applyDeletion({ status: "error", filter: "PENDING", message: "Not Found" }, pending.id).status, "error");

  const failed = await deleteReview(
    {
      async deleteReview() {
        throw new ApiRequestError("Review not found", 404);
      },
    },
    pending.id,
  );
  assert.equal(failed.ok, false);
  assert.equal(failed.message, "Review not found");
});

test("session expiry and forbidden writes do not count as saved", async () => {
  const expired = await moderateReview(
    {
      async setStatus() {
        throw new ApiRequestError("Authentication required", 401);
      },
    },
    readAdminReview(pending),
    "APPROVED",
  );
  assert.equal(expired.ok, false);
  assert.equal(expired.kind, "unauthorized");
  assert.equal(expired.message, "Your admin session is no longer active.");

  const forbidden = await deleteReview(
    {
      async deleteReview() {
        throw new ApiRequestError("Origin is not allowed", 403);
      },
    },
    pending.id,
  );
  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.kind, "forbidden");
  assert.match(forbidden.message, /Origin is not allowed/);
});

test("pending actions block another moderation or delete", () => {
  assert.equal(controlsLocked(null), false);
  assert.equal(controlsLocked("moderate"), true);
  assert.equal(beginPending("moderate", "delete"), null);
  assert.equal(beginPending(null, "delete"), "delete");
});

test("moderation uses the session client once", async () => {
  const calls = [];
  const fetchImpl = async (input, init) => {
    calls.push({ url: String(input), init });
    if (String(input).endsWith("/auth/csrf")) {
      return json({ success: true, message: "ok", data: { csrfToken: "token-1" } });
    }
    if (String(input).endsWith(`/admin/reviews/${pending.id}/status`) && init.method === "PATCH") {
      return json({ success: true, message: "approved", data: approvedCopy() });
    }
    throw new Error(`${init.method} ${String(input)}`);
  };
  const client = createApiClient({ baseUrl: "https://api.example.test/api", fetch: fetchImpl });
  const result = await moderateReview(
    {
      setStatus: (id, status) => client.sessionSend(`/admin/reviews/${id}/status`, "PATCH", { status }),
    },
    readAdminReview(pending),
    "APPROVED",
  );
  assert.equal(result.ok, true);
  const patch = calls.find((call) => call.init.method === "PATCH");
  assert.equal(patch.init.credentials, "include");
  assert.equal(new Headers(patch.init.headers).get("x-csrf-token"), "token-1");
  assert.equal(new Headers(patch.init.headers).get("content-type"), "application/json");
  assert.equal(new Headers(patch.init.headers).get("x-api-key"), null);
  assert.deepEqual(JSON.parse(patch.init.body), { status: "APPROVED" });
  assert.equal(calls.filter((call) => call.init.method === "PATCH").length, 1);
});

test("public submissions cannot set moderation fields and public lists omit unapproved reviews", async () => {
  const submitted = publicSubmission({ name: "Amina", role: "Developer", message: "Hello", file: "logo.png" });
  assert.equal(submitted.ok, true);
  const blocked = publicSubmission({ name: "Amina", status: "APPROVED", reviewedAt: "now", reviewedById: "admin-1" });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.message, "Moderation status cannot be set by the client");

  const listed = readPublicReviewList([publicReview, { ...publicReview, id: "pending-2", status: "PENDING" }, { ...approvedCopy(), id: "rejected-3", status: "REJECTED" }]);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].name, "Amina");
  assert.equal("status" in listed[0], false);
  assert.equal("profilePublicId" in listed[0], false);

  const testimonials = await readFile(testimonialsPath, "utf8");
  assert.match(testimonials, /TESTIMONIALS/);
  assert.doesNotMatch(testimonials, /\/reviews|sessionSend|status/);
});

test("the reviews page uses the moderation endpoints and keeps failed actions from changing the list", async () => {
  const source = await readFile(pagePath, "utf8");
  assert.match(source, /sessionGet<unknown>\(reviewsListPath\(status\)\)/);
  assert.match(source, /sessionGet<unknown>\(adminReviewPath\(id\)\)/);
  assert.match(source, /sessionSend<unknown>\(adminReviewStatusPath\(id\), "PATCH", \{ status \}\)/);
  assert.match(source, /sessionSend<unknown>\(reviewResourcePath\(id\), "DELETE"\)/);
  assert.match(source, /allowedDecisions/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /disabled=\{locked\}/);
  assert.match(source, /Keep review/);
  assert.match(source, /confirmedDeletion\(deleteTarget, true\)/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|x-api-key|profilePublicId|reviewedById/);
  const moderateFn = source.slice(source.indexOf("async function onModerate"), source.indexOf("async function onConfirmDelete"));
  assert.ok(moderateFn.indexOf("if (!result.ok)") < moderateFn.indexOf("applyModeration"));
  const deleteFn = source.slice(source.indexOf("async function onConfirmDelete"));
  assert.ok(deleteFn.indexOf("if (!result.ok)") < deleteFn.indexOf("applyDeletion"));
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
