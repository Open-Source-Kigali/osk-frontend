import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const eventsUrl = new URL("../src/admin/events.ts", import.meta.url);
const httpUrl = new URL("../src/api/http.ts", import.meta.url);
const pagePath = new URL("../src/pages/admin/AdminEventsPage.tsx", import.meta.url);

const {
  EMPTY_EVENT_FORM,
  beginPending,
  buildEventFormData,
  confirmedDeletion,
  controlsLocked,
  deleteEvent,
  eventResourcePath,
  formFromEvent,
  initialEventList,
  loadEventList,
  readEventList,
  saveEvent,
  validateEventForm,
} = await import(eventsUrl);
const { ApiRequestError, createApiClient } = await import(httpUrl);

const saved = {
  id: "event-1",
  title: "Community meetup",
  tagline: "Build together",
  imageUrl: "https://cdn.example/cover.png",
  description: "An evening of contributions.",
  category: "Meetup",
  mode: "in-person",
  featured: false,
  capacity: 40,
  registered: 12,
  date: "2026-11-01T16:00:00.000Z",
  endDate: "2026-11-01T18:00:00.000Z",
  timeLabel: "6:00 PM – 8:00 PM",
  location: "Kigali",
  speakers: ["Ada", "Grace"],
  registerUrl: "https://events.example/meetup",
};

function values(overrides = {}) {
  return {
    ...EMPTY_EVENT_FORM,
    title: "Community meetup",
    description: "An evening of contributions.",
    category: "Meetup",
    mode: "in-person",
    featured: true,
    capacity: "40",
    registered: "12",
    date: "2026-11-01T18:00",
    endDate: "2026-11-01T20:00",
    timeLabel: "6:00 PM – 8:00 PM",
    location: "Kigali",
    speakers: "Ada, Grace",
    registerUrl: "https://events.example/meetup",
    tagline: "Build together",
    ...overrides,
  };
}

function file() {
  return new File([Uint8Array.from([1, 2, 3])], "cover.png", { type: "image/png" });
}

test("events load, render a populated list, and accept an empty list", async () => {
  assert.equal(initialEventList().status, "loading");

  const populated = await loadEventList(async () => [saved]);
  assert.equal(populated.status, "ready");
  assert.equal(populated.events[0].title, "Community meetup");
  assert.equal(populated.events[0].registered, 12);

  const empty = await loadEventList(async () => []);
  assert.deepEqual(empty, { status: "ready", events: [] });
});

test("incomplete event payloads are rejected", async () => {
  assert.equal(readEventList({ events: [saved] }), null);
  assert.equal(readEventList([{ ...saved, title: "" }]), null);
  assert.equal(readEventList([{ ...saved, featured: "yes" }]), null);
  const result = await loadEventList(async () => [{ ...saved, date: "soon" }]);
  assert.equal(result.status, "invalid");
  assert.equal(result.message, "The events response was not a list of events.");
});

test("a list failure does not invent events", async () => {
  const result = await loadEventList(async () => {
    throw new Error("Service unavailable");
  });
  assert.deepEqual(result, { status: "error", message: "Service unavailable" });
});

test("create sends the contract fields and keeps the saved event", async () => {
  const calls = [];
  const cover = file();
  const result = await saveEvent(
    {
      async createEvent(form) {
        calls.push(form);
        return saved;
      },
      async updateEvent() {
        throw new Error("update should not run");
      },
    },
    { intent: "create" },
    values(),
    cover,
    null,
  );

  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  const form = calls[0];
  assert.equal(form.get("title"), "Community meetup");
  assert.equal(form.get("description"), "An evening of contributions.");
  assert.equal(form.get("category"), "Meetup");
  assert.equal(form.get("location"), "Kigali");
  assert.equal(form.get("mode"), "in-person");
  assert.equal(form.get("featured"), "true");
  assert.equal(form.get("capacity"), "40");
  assert.equal(form.get("registered"), "12");
  assert.equal(form.get("speakers"), '["Ada","Grace"]');
  assert.equal(form.get("file"), cover);
  assert.equal(Number.isNaN(new Date(form.get("date")).getTime()), false);
  assert.equal(form.get("tagline"), "Build together");
});

test("create validation and server errors do not report success", async () => {
  let calls = 0;
  const missing = await saveEvent(
    {
      async createEvent() {
        calls += 1;
        return saved;
      },
      async updateEvent() {
        return saved;
      },
    },
    { intent: "create" },
    values({ title: "  ", date: "" }),
    null,
    null,
  );
  assert.equal(calls, 0);
  assert.equal(missing.ok, false);
  assert.equal(missing.kind, "validation");
  assert.equal(missing.fieldErrors.title, "Title is required");
  assert.equal(missing.fieldErrors.date, "Date is required");
  assert.equal(missing.fieldErrors.file, "Image file is required");

  const rejected = await saveEvent(
    {
      async createEvent() {
        throw new ApiRequestError("title: Title is required; registered cannot exceed capacity", 400);
      },
      async updateEvent() {
        return saved;
      },
    },
    { intent: "create" },
    values(),
    file(),
    null,
  );
  assert.equal(rejected.ok, false);
  assert.equal(rejected.kind, "error");
  assert.equal(rejected.fieldErrors.title, "Title is required");
  assert.equal(rejected.fieldErrors.registered, "registered cannot exceed capacity");
});

test("edit sends a PUT body and can omit a replacement image", async () => {
  const calls = [];
  const result = await saveEvent(
    {
      async createEvent() {
        throw new Error("create should not run");
      },
      async updateEvent(id, form) {
        calls.push({ id, form });
        return { ...saved, title: "Updated meetup" };
      },
    },
    { intent: "edit", id: "event-1" },
    values({ title: "Updated meetup", featured: false, capacity: "", registered: "" }),
    null,
    null,
  );

  assert.equal(result.ok, true);
  assert.equal(result.event.title, "Updated meetup");
  assert.equal(calls[0].id, "event-1");
  assert.equal(calls[0].form.get("featured"), "false");
  assert.equal(calls[0].form.get("capacity"), "");
  assert.equal(calls[0].form.get("file"), null);
});

test("edit failure keeps the failure message", async () => {
  const result = await saveEvent(
    {
      async createEvent() {
        return saved;
      },
      async updateEvent() {
        throw new ApiRequestError("Event not found", 404);
      },
    },
    { intent: "edit", id: "missing" },
    values(),
    null,
    null,
  );
  assert.equal(result.ok, false);
  assert.equal(result.message, "Event not found");
});

test("delete confirmation, cancellation, success, and failure", async () => {
  assert.equal(confirmedDeletion(null, true), null);
  assert.equal(confirmedDeletion({ id: "event-1" }, false), null);

  let deleted = 0;
  const cancelled = confirmedDeletion(saved, false);
  assert.equal(cancelled, null);
  assert.equal(deleted, 0);

  const id = confirmedDeletion(saved, true);
  const result = await deleteEvent(
    {
      async deleteEvent(eventId) {
        deleted += 1;
        assert.equal(eventId, id);
        return null;
      },
    },
    id,
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(deleted, 1);

  const failed = await deleteEvent(
    {
      async deleteEvent() {
        throw new ApiRequestError("Event not found", 404);
      },
    },
    "event-1",
  );
  assert.equal(failed.ok, false);
  assert.equal(failed.message, "Event not found");
});

test("session expiry and forbidden writes do not count as saved", async () => {
  const expired = await saveEvent(
    {
      async createEvent() {
        throw new ApiRequestError("Authentication required", 401);
      },
      async updateEvent() {
        return saved;
      },
    },
    { intent: "create" },
    values(),
    file(),
    null,
  );
  assert.equal(expired.ok, false);
  assert.equal(expired.kind, "unauthorized");
  assert.equal(expired.message, "Your admin session is no longer active.");

  const forbidden = await deleteEvent(
    {
      async deleteEvent() {
        throw new ApiRequestError("Origin is not allowed", 403);
      },
    },
    "event-1",
  );
  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.kind, "forbidden");
  assert.match(forbidden.message, /Origin is not allowed/);
});

test("pending actions block another submit or delete", () => {
  assert.equal(controlsLocked(null), false);
  assert.equal(controlsLocked("save"), true);
  assert.equal(beginPending("save", "delete"), null);
  assert.equal(beginPending(null, "delete"), "delete");
});

test("the multipart write uses the session client once", async () => {
  const calls = [];
  const fetchImpl = async (input, init) => {
    calls.push({ url: String(input), init });
    if (String(input).endsWith("/auth/csrf")) {
      return json({ success: true, message: "ok", data: { csrfToken: "token-1" } });
    }
    if (String(input).endsWith("/events") && init.method === "POST") {
      return json({ success: true, message: "created", data: saved }, 201);
    }
    throw new Error(String(input));
  };
  const client = createApiClient({ baseUrl: "https://api.example.test/api", fetch: fetchImpl });
  const cover = file();
  const result = await saveEvent(
    {
      createEvent: (form) => client.sessionForm("/events", "POST", form),
      updateEvent: (id, form) => client.sessionForm(eventResourcePath(id), "PUT", form),
    },
    { intent: "create" },
    values(),
    cover,
    null,
  );

  assert.equal(result.ok, true);
  const post = calls.find((call) => call.url.endsWith("/events") && call.init.method === "POST");
  assert.equal(post.init.credentials, "include");
  assert.equal(new Headers(post.init.headers).get("x-csrf-token"), "token-1");
  assert.equal(new Headers(post.init.headers).get("content-type"), null);
  assert.equal(new Headers(post.init.headers).get("x-api-key"), null);
  assert.equal(calls.filter((call) => call.init.method === "POST").length, 1);
});

test("local validation matches the event rules", () => {
  const errors = validateEventForm(
    values({
      endDate: "2026-10-01T18:00",
      registered: "50",
      capacity: "40",
      mode: "in-person",
    }),
    { requireImage: false, imageError: null },
  );
  assert.equal(errors.endDate, "End date must be on or after the start date");
  assert.equal(errors.registered, "Registered count cannot exceed capacity");
  const prefilled = formFromEvent(readEventList([saved])[0]);
  assert.equal(prefilled.speakers, "Ada, Grace");
  assert.equal(prefilled.featured, false);
});

test("the events page uses the session helpers and disables pending controls", async () => {
  const source = await readFile(pagePath, "utf8");
  assert.match(source, /apiGet<unknown>\("\/events"\)/);
  assert.match(source, /sessionForm<unknown>\("\/events", "POST", form\)/);
  assert.match(source, /sessionForm<unknown>\(eventResourcePath\(id\), "PUT", form\)/);
  assert.match(source, /sessionSend<unknown>\(eventResourcePath\(id\), "DELETE"\)/);
  assert.match(source, /validateImageFile/);
  assert.match(source, /IMAGE_UPLOAD_ACCEPT/);
  assert.match(source, /disabled=\{locked\}/);
  assert.match(source, /Keep event/);
  assert.match(source, /confirmedDeletion\(deleteTarget, true\)/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|x-api-key/);
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
