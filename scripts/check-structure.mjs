// scripts/check-structure.mjs
// Contract for the structural gate (`bin/commands/checkStructure.js`): every
// rule it claims to prove is proven here twice — once by breaking it, once by
// obeying it. Run with:
//
//   node scripts/check-structure.mjs
//
// A detector that always reports is as useless as one that never does, so each
// rule below must stay quiet on the shape it is supposed to accept. The last
// case is the one that matters most: the framework itself is the rendering
// engine, so it writes the DOM by hand on purpose and the gate must not
// report the engine as if it were app code.
//
// The fixture is a temp directory with no `node_modules`: the package lookup
// falls back to this checkout, so the files under test are app code and the
// files of the checkout are not.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { scanStructure } from "../bin/commands/checkStructure.js";

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-structure-"));
const failures = [];

/**
 * Write a file inside the fixture and remove every other module, so each case
 * sees exactly the shape it is about.
 *
 * @param {Record<string, string>} files path relative to the fixture → source
 * @returns {Promise<object[]>} findings
 */
const scan = async (files) => {
  fs.rmSync(scratch, { recursive: true, force: true });
  for (const [name, source] of Object.entries(files)) {
    const full = path.join(scratch, name);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, source, "utf8");
  }
  return scanStructure(scratch);
};

/**
 * @param {string} name
 * @param {() => void | Promise<void>} fn
 */
const check = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  FAIL ${name} — ${error.message}`);
  }
};

/**
 * @param {object[]} findings
 * @param {string} code
 * @returns {object|undefined}
 */
const hit = (findings, code) => findings.find((item) => item.code === code);

// 1 — a cycle between two modules of the app.

await check("CIRCULAR_IMPORT fires on a cycle", async () => {
  const findings = await scan({
    "src/a.js": 'import { b } from "./b.js";\nexport const a = () => b;\n',
    "src/b.js": 'import { a } from "./a.js";\nexport const b = () => a;\n',
  });
  const found = hit(findings, "CIRCULAR_IMPORT");
  assert.ok(found, `no cycle reported — got ${[...new Set(findings.map((f) => f.code))].join(", ") || "nothing"}`);
  assert.equal(found.severity, "error");
  assert.ok(found.line >= 1, "the cycle has no line to point at");
  assert.match(found.message, /a\.js.*b\.js/s, "the message does not name the cycle");
});

await check("CIRCULAR_IMPORT accepts a one-way import", async () => {
  const findings = await scan({
    "src/a.js": 'import { b } from "./b.js";\nexport const a = () => b;\n',
    "src/b.js": "export const b = () => 1;\n",
  });
  assert.equal(hit(findings, "CIRCULAR_IMPORT"), undefined, "a one-way import was reported as a cycle");
});

// 2 — a module outside the folders the project is built from.

await check("SOURCE_OUTSIDE_ROOT fires on a module outside src/", async () => {
  const findings = await scan({
    "src/app.js": "export const app = 1;\n",
    "lib/helper.js": "export const helper = 1;\n",
  });
  const found = hit(findings, "SOURCE_OUTSIDE_ROOT");
  assert.ok(found, "a module outside src/ was accepted");
  assert.equal(found.severity, "error");
  assert.match(found.message, /lib\/helper\.js/, "the message does not name the file");
});

await check("SOURCE_OUTSIDE_ROOT accepts a module inside src/", async () => {
  const findings = await scan({
    "src/app.js": "export const app = 1;\n",
    "src/lib/helper.js": "export const helper = 1;\n",
  });
  assert.equal(hit(findings, "SOURCE_OUTSIDE_ROOT"), undefined, "a module inside src/ was reported");
});

await check("SOURCE_OUTSIDE_ROOT accepts the entry files at the root", async () => {
  const findings = await scan({
    "src/app.js": "export const app = 1;\n",
    "service-worker.js": "self.addEventListener('install', () => {});\n",
  });
  assert.equal(hit(findings, "SOURCE_OUTSIDE_ROOT"), undefined, "the service worker was reported");
});

// 3 — markup written by hand in app code.

await check("HAND_WRITTEN_DOM fires on innerHTML", async () => {
  const findings = await scan({
    "src/app.js": 'const el = document.getElementById("root");\nel.innerHTML = "<b>hi</b>";\n',
  });
  const found = hit(findings, "HAND_WRITTEN_DOM");
  assert.ok(found, "innerHTML in app code was accepted");
  assert.equal(found.severity, "error");
  assert.ok(found.line >= 1, "the finding has no line to point at");
});

await check("HAND_WRITTEN_DOM accepts a widget-built screen", async () => {
  const findings = await scan({
    "src/app.js": 'import { Text } from "flet-box";\nexport const screen = () => Text({ text: "hi" });\n',
  });
  assert.equal(hit(findings, "HAND_WRITTEN_DOM"), undefined, "a widget-built screen was reported");
});

await check("HAND_WRITTEN_DOM stays quiet about a word in a string", async () => {
  const findings = await scan({
    "src/app.js": 'export const help = "set innerHTML and the screen breaks";\n',
  });
  assert.equal(hit(findings, "HAND_WRITTEN_DOM"), undefined, "a string that mentions innerHTML was reported");
});

await check("HAND_WRITTEN_DOM stays quiet about a word in a comment", async () => {
  const findings = await scan({
    "src/app.js": "// never write innerHTML here\nexport const app = 1;\n",
  });
  assert.equal(hit(findings, "HAND_WRITTEN_DOM"), undefined, "a comment that mentions innerHTML was reported");
});

// 4 — the engine is not app code.

await check("HAND_WRITTEN_DOM does not report the framework itself", async () => {
  const findings = await scanStructure(path.resolve(import.meta.dirname, ".."));
  const found = hit(findings, "HAND_WRITTEN_DOM");
  assert.equal(
    found,
    undefined,
    `the engine was reported as app code — ${found ? found.file : ""}`,
  );
  assert.equal(hit(findings, "CIRCULAR_IMPORT"), undefined, "the framework has a cycle");
  assert.equal(hit(findings, "SOURCE_OUTSIDE_ROOT"), undefined, "the framework has a module outside its folders");
});

fs.rmSync(scratch, { recursive: true, force: true });

console.log(
  failures.length
    ? `\n❌ ${failures.length} structure contract failure(s): ${failures.join(", ")}\n`
    : "\n✅ Every structural rule bites, and the clean project passes.\n",
);
process.exit(failures.length ? 1 : 0);
