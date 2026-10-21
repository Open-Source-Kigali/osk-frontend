import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const apiSource = await readFile(new URL("../src/lib/api.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(apiSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
// Supply Vite's environment when loading the real API module in Node's test runner.
const moduleSource = `import.meta.env = { VITE_API_BASE_URL: "https://api.example.test" };\n${outputText}`;
const { safetyFetchApi, get, post, postForm } = await import(
  `data:text/javascript;base64,${Buffer.from(moduleSource).toString("base64")}`
);

function mockResponse(t, body, status = 200, contentType = "application/json") {
  return t.mock.method(globalThis, "fetch", async () => new Response(body, {
    status,
    headers: { "Content-Type": contentType },
  }));
}

test("200 success returns the envelope data and forwards request options", async (t) => {
  const data = { id: 1, name: "Example" };
  const fetchMock = mockResponse(t, JSON.stringify({ success: true, data }));
  const options = { headers: { Accept: "application/json" } };

  assert.deepEqual(await safetyFetchApi("/items/1", options), data);
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.deepEqual(fetchMock.mock.calls[0].arguments, ["/items/1", options]);
});

test("200 success also accepts JSON without an envelope", async (t) => {
  const data = [{ id: 1 }];
  mockResponse(t, JSON.stringify(data));

  assert.deepEqual(await safetyFetchApi("/items"), data);
});

test("200 with an unsuccessful envelope rejects with the server message", async (t) => {
  mockResponse(t, JSON.stringify({ success: false, message: "Operation denied" }));

  await assert.rejects(safetyFetchApi("/items"), {
    name: "Error",
    message: "Operation denied",
  });
});

test("200 with an unsuccessful envelope and no message uses the fallback", async (t) => {
  mockResponse(t, JSON.stringify({ success: false }));

  await assert.rejects(safetyFetchApi("/items"), {
    message: "Operation failed. Please try again.",
  });
});

test("400 JSON error rejects with the server message", async (t) => {
  mockResponse(t, JSON.stringify({ message: "Invalid email address" }), 400);

  await assert.rejects(safetyFetchApi("/items"), {
    name: "Error",
    message: "Invalid email address",
  });
});

for (const [label, body] of [
  ["missing", {}],
  ["non-string", { message: { detail: "Invalid input" } }],
  ["too long", { message: "x".repeat(150) }],
]) {
  test(`400 JSON error uses the HTTP fallback when the message is ${label}`, async (t) => {
    mockResponse(t, JSON.stringify(body), 400);

    await assert.rejects(safetyFetchApi("/items"), {
      message: "Request failed (HTTP 400). Please try again.",
    });
  });
}

test("500 HTML error rejects with a readable invalid-response message", async (t) => {
  mockResponse(t, "<!doctype html><h1>Internal Server Error</h1>", 500, "text/html");

  await assert.rejects(safetyFetchApi("/items"), {
    name: "Error",
    message: "Received an invalid response from the server. Please try again.",
  });
});

for (const [label, body] of [["empty", ""], ["whitespace-only", " \n\t "]]) {
  test(`200 with an ${label} response rejects with the empty-response message`, async (t) => {
    mockResponse(t, body);

    await assert.rejects(safetyFetchApi("/items"), {
      message: "Received an empty response from the server",
    });
  });
}

test("204 empty response resolves to undefined", async (t) => {
  mockResponse(t, null, 204);

  assert.equal(await safetyFetchApi("/items"), undefined);
});

test("network rejection becomes a readable connection error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("Failed to fetch");
  });

  await assert.rejects(safetyFetchApi("/items"), {
    name: "Error",
    message: "Network Error. Please check your connection and try again.",
  });
});

test("other fetch rejections preserve the original error", async (t) => {
  const error = new TypeError("A different fetch failure");
  t.mock.method(globalThis, "fetch", async () => {
    throw error;
  });

  await assert.rejects(safetyFetchApi("/items"), (actual) => actual === error);
});

test("get uses the API base URL", async (t) => {
  const fetchMock = mockResponse(t, JSON.stringify({ id: 1 }));

  assert.deepEqual(await get("/items/1"), { id: 1 });
  assert.deepEqual(fetchMock.mock.calls[0].arguments, [
    "https://api.example.test/items/1",
    undefined,
  ]);
});

test("post sends a JSON body and content type", async (t) => {
  const data = { name: "Example" };
  const fetchMock = mockResponse(t, JSON.stringify({ success: true, data }));

  assert.deepEqual(await post("/items", data), data);
  assert.deepEqual(fetchMock.mock.calls[0].arguments, [
    "https://api.example.test/items",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  ]);
});

test("postForm sends FormData without setting a content type", async (t) => {
  const form = new FormData();
  form.append("name", "Example");
  const fetchMock = mockResponse(t, null, 204);

  assert.equal(await postForm("/items", form), undefined);
  assert.deepEqual(fetchMock.mock.calls[0].arguments, [
    "https://api.example.test/items",
    { method: "POST", body: form },
  ]);
});
