import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const joinUrl = new URL("../src/lib/join.ts", import.meta.url);
const { submitJoin } = await import(joinUrl);

const valid = {
  name: " Igor Kunčak ",
  email: "igor@example.com",
  orgName: " Open Source Kigali ",
  codingLevel: "intermediate",
  githubUsername: " qnchuck ",
  joinReason: " I want to contribute. ",
  agree: true,
};

test("a community registration posts the member fields and trims them", async () => {
  const calls = [];
  const result = await submitJoin(async (path, body) => {
    calls.push({ path, body });
    return { id: "member-1" };
  }, valid);

  assert.equal(result.ok, true);
  assert.deepEqual(calls, [
    {
      path: "/members",
      body: {
        name: "Igor Kunčak",
        email: "igor@example.com",
        githubUsername: "qnchuck",
        orgName: "Open Source Kigali",
        joinReason: "I want to contribute.",
        codingLevel: "intermediate",
      },
    },
  ]);
});

test("an incomplete registration is not sent", async () => {
  let called = false;
  const result = await submitJoin(async () => {
    called = true;
    return null;
  }, { ...valid, name: " ", agree: false, codingLevel: "expert" });

  assert.equal(called, false);
  assert.equal(result.ok, false);
  assert.equal(result.errors.name, "Full name is required");
  assert.equal(result.errors.agree, "You need to agree before joining");
  assert.equal(result.errors.codingLevel, "Level of experience is required");
});

test("the join page replaces the Google Form and both contribute buttons use it", async () => {
  const page = await readFile(new URL("../src/pages/Join.tsx", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const links = await readFile(new URL("../src/config/links.ts", import.meta.url), "utf8");
  const nav = await readFile(new URL("../src/components/MainNavigation.tsx", import.meta.url), "utf8");

  assert.match(page, /submitJoin/);
  assert.match(page, /post\(path, body\)/);
  assert.doesNotMatch(page, /docs\.google\.com|localStorage|sessionStorage|x-api-key/);
  assert.match(app, /path:\s*"\/join"/);
  assert.match(links, /primaryCTA:\s*"\/join"/);
  assert.doesNotMatch(nav, /docs\.google\.com\/forms/);
  assert.equal([...nav.matchAll(/Contribute to OSK/g)].length, 2);
});
