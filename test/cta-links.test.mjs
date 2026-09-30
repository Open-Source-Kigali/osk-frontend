import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const sourceRoot = fileURLToPath(new URL("../src", import.meta.url));
const emptyLinkPattern = /\b(?:to|href)\s*=\s*["']\s*["']/;

async function getTsxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getTsxFiles(fullPath)));
    } else if (entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

test("links do not use empty to or href values", async () => {
  const files = await getTsxFiles(sourceRoot);
  const offenders = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");

    if (emptyLinkPattern.test(source)) {
      offenders.push(path.relative(sourceRoot, file));
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Found empty to or href values in: ${offenders.join(", ")}`
  );
});
