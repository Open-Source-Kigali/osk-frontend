import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { matchRoutes } from "react-router";
import ts from "typescript";

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

function readSource(path) {
  return ts.createSourceFile(
    path,
    readFileSync(new URL(`../${path}`, import.meta.url), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function findNodes(root, predicate) {
  const nodes = [];
  function visit(node) {
    if (predicate(node)) nodes.push(node);
    ts.forEachChild(node, visit);
  }
  visit(root);
  return nodes;
}

// Read the actual router declaration without importing browser-only app code.
const app = readSource("src/App.tsx");
const [routerCall] = findNodes(
  app,
  (node) => ts.isCallExpression(node) && node.expression.getText(app) === "createBrowserRouter",
);
assert.ok(routerCall, "App must declare its routes with createBrowserRouter");

function readRoutes(array) {
  assert.ok(array && ts.isArrayLiteralExpression(array), "Expected a literal route array");
  return array.elements.map((node) => {
    assert.ok(ts.isObjectLiteralExpression(node), "Expected a route object");
    const route = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = property.name.getText(app);
      if (key === "path") {
        assert.ok(ts.isStringLiteral(property.initializer), "Expected a literal route path");
        route.path = property.initializer.text;
      } else if (key === "index") {
        assert.equal(property.initializer.kind, ts.SyntaxKind.TrueKeyword);
        route.index = true;
      } else if (key === "children") {
        route.children = readRoutes(property.initializer);
      }
    }
    return route;
  });
}

const routes = readRoutes(routerCall.arguments[0]);

function destinations(root) {
  return findNodes(root, (node) => {
    if (ts.isPropertyAssignment(node)) {
      return ["path", "to", "href"].includes(node.name.getText())
        && ts.isStringLiteral(node.initializer);
    }
    return ts.isJsxAttribute(node)
      && ["to", "href"].includes(node.name.getText())
      && node.initializer
      && ts.isStringLiteral(node.initializer);
  }).map((node) => ({ value: node.initializer.text, node }));
}

function assertInternalDestinations(links) {
  const internalLinks = links.filter(({ value }) => value.startsWith("/") && !value.startsWith("//"));
  assert.ok(internalLinks.length > 0, "Expected internal navigation links");
  for (const { value, node } of internalLinks) {
    const source = node.getSourceFile();
    const { line } = source.getLineAndCharacterOfPosition(node.getStart());
    // Queries and fragments do not change which page route handles a link.
    const { pathname } = new URL(value, "https://oskigali.org");
    assert.ok(
      matchRoutes(routes, pathname),
      `${source.fileName}:${line + 1}: ${value} does not match an application route`,
    );
  }
}

test("header navigation destinations match registered application routes", () => {
  const navigation = readSource("src/constants/navigation.ts");
  const [navLinks] = findNodes(
    navigation,
    (node) => ts.isVariableDeclaration(node) && node.name.getText(navigation) === "NAV_LINKS",
  );
  assert.ok(navLinks?.initializer, "Expected the header's NAV_LINKS configuration");
  assertInternalDestinations(destinations(navLinks.initializer));
});

test("header logo and desktop/mobile link destinations match registered application routes", () => {
  assertInternalDestinations(destinations(readSource("src/components/MainNavigation.tsx")));
});

test("footer destinations match registered application routes", () => {
  // Footer owns its linkGroups; the unused FOOTER_LINKS constant is not rendered.
  assertInternalDestinations(destinations(readSource("src/components/Footer.tsx")));
});
