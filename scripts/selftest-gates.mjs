#!/usr/bin/env node
/**
 * @file scripts/selftest-gates.mjs
 * @description The gates' own gate — every checker must bite.
 *
 * `npm test` proves the code; nothing proved the checkers. A rule that stops
 * firing fails silently: the gate returns green, an agent trusts it, and the
 * screen it blessed is the one nobody measured. So each gate is run twice
 * against a throwaway project:
 *
 *   positive control — a clean fixture. A sane project must not be reported,
 *                      or every later run is noise an agent learns to skip.
 *   negative control — the same fixture with one known defect. The gate must
 *                      exit 1 and name the exact code on the exact line (the
 *                      gate's own `file:line`, not the line the fixture meant).
 *
 * The inventory is part of the contract: `GATES` and `GATE_ORDER` must name the
 * same gates, and every one of them needs a fixture here. A dependency the gate
 * needs but this machine lacks (TypeScript, npm) is a SKIP with its reason,
 * printed — never a silent pass. `surface` is fixture'd with a minimal package
 * of its own, because it judges the installed package's declaration, not the
 * app's sources.
 *
 * Run with:
 *
 *   npm run selftest
 *   node scripts/selftest-gates.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GATES, GATE_ORDER, runGates } from "../bin/commands/verify.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-selftest-"));

const results = [];
const fail = (gate, phase, why) => results.push({ gate, phase, status: "fail", why });
const pass = (gate, phase, why) => results.push({ gate, phase, status: "ok", why });
const skip = (gate, phase, why) => results.push({ gate, phase, status: "skip", why });

/**
 * Write `text` to `<root>/<rel>`, creating the folders it needs.
 *
 * @param {string} root
 * @param {string} rel
 * @param {string} text
 * @returns {string} the absolute path
 */
const write = (root, rel, text) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, "utf8");
  return file;
};

/**
 * The line a fixture says the finding must land on.
 *
 * The marker is part of the fixture, not a number repeated in this file: edit
 * the fixture and the expectation moves with it, or the fixture stops having an
 * expectation at all and this throws.
 *
 * @param {string} text
 * @returns {number} 1-based
 */
const expectedLine = (text) => {
  const index = text.split("\n").findIndex((line) => line.includes("// expect"));
  if (index < 0) throw new Error("the fixture has no `// expect` marker");
  return index + 1;
};

/**
 * A position a finding must match: a file and the marked line.
 *
 * `line: null` means the gate does not report a line for this code (the surface
 * gate reports the file, not the prop's line); `file: null` means the gate's
 * finding is not about one file (a test suite's exit code).
 */
const at = (file, text) => ({ file, line: expectedLine(text) });

/* ----------------------------------------------------------------- app root */

const appRoot = path.join(tmp, "app");
write(
  appRoot,
  "package.json",
  `${JSON.stringify({ name: "selftest-app", private: true, type: "module" }, null, 2)}\n`,
);
write(
  appRoot,
  "jsconfig.json",
  `${JSON.stringify(
    {
      compilerOptions: {
        allowJs: true,
        checkJs: true,
        noEmit: true,
        module: "esnext",
        moduleResolution: "bundler",
        target: "es2022",
        lib: ["es2022", "dom"],
        skipLibCheck: true,
        types: [],
      },
      include: ["src"],
    },
    null,
    2,
  )}\n`,
);

write(
  appRoot,
  "src/main.js",
  `import { Container, Text } from "flet-box";

export const Screen = () =>
  Container({
    padding: 16,
    child: Text({ text: "Selftest fixture" }),
  });
`,
);
write(appRoot, "src/healthy.js", "/** @type {number} */\nexport const answer = 42;\n");

// The fixture is judged against the checkout, not against a stale copy that
// happens to sit in this repository's node_modules — otherwise the gate that
// just changed is not the one under test.
fs.mkdirSync(path.join(appRoot, "node_modules"), { recursive: true });
fs.symlinkSync(repoRoot, path.join(appRoot, "node_modules", "flet-box"), "dir");

/* ------------------------------------------------------------- surface root */

const surfaceRoot = path.join(tmp, "surface");
const surfacePkg = path.join(tmp, "surface-pkg");

const surfaceDts = (extra = "") => `declare module 'flet-box' {
  export interface DemoProps {
    text?: string;${extra}
  }
  export function Demo(props?: DemoProps): FletWidget;
}
`;
const surfaceWidget = (read = "text") => `export const Demo = (props = {}) => {
  const { ${read} } = props;
  return { ${read} };
};
`;

const writeSurfacePackage = ({ dts = surfaceDts(), widget = surfaceWidget() } = {}) => {
  write(
    surfacePkg,
    "package.json",
    `${JSON.stringify(
      { name: "flet-box", version: "0.0.0", type: "module", main: "src/index.js", types: "src/index.d.ts" },
      null,
      2,
    )}\n`,
  );
  write(surfacePkg, "src/index.js", 'export { Demo } from "./widgets/Demo.js";\n');
  write(surfacePkg, "src/index.d.ts", dts);
  write(
    surfacePkg,
    "src/widget-factory/translateProps.js",
    "export const PROP_MAP = {};\nexport const ALL_PROPS = [];\n",
  );
  write(surfacePkg, "src/widgets/Demo.js", widget);
};
writeSurfacePackage();
fs.mkdirSync(surfaceRoot, { recursive: true });
fs.mkdirSync(path.join(surfaceRoot, "node_modules"), { recursive: true });
fs.symlinkSync(surfacePkg, path.join(surfaceRoot, "node_modules", "flet-box"), "dir");

/* ---------------------------------------------------------------- fixtures */

/**
 * One fixture per gate: the files that carry the defect, and where the gate
 * must report it. `files` is a function because the tests fixture edits the
 * manifest the pristine control reads.
 */
const fixtures = [
  {
    gate: "syntax",
    files: () => ({
      "src/broken.js": "export const broken = (1 + 2; // expect\n",
    }),
    expect: { code: "SYNTAX_ERROR" },
    where: (files) => [at("src/broken.js", files["src/broken.js"])],
  },
  {
    gate: "api",
    files: () => ({
      "src/invented.js":
        'import { Text } from "flet-box";\n\n' +
        'export const Invented = () => Text({ text: "Hi", textt: "typo" }); // expect\n',
    }),
    expect: { code: "UNKNOWN_PROP" },
    where: (files) => [at("src/invented.js", files["src/invented.js"])],
  },
  {
    gate: "types",
    files: () => ({
      "src/type-error.js": [
        "// The annotation is the contract; the value below breaks it.",
        "/** @type {number} */",
        'export const wrong = "not a number"; // expect',
        "",
      ].join("\n"),
    }),
    expect: { code: "TYPE_ERROR" },
    where: (files) => [at("src/type-error.js", files["src/type-error.js"])],
  },
  {
    gate: "lint",
    files: () => ({
      // The trailing spaces are the defect; the line still parses, so no other
      // gate can notice it. The marker sits on the next line so the defect
      // stays at the line's own end.
      "src/trailing.js": "export const answer = 42;  \n// expect\n",
    }),
    expect: { code: "TRAILING_WS" },
    where: () => [{ file: "src/trailing.js", line: 1 }],
  },
  {
    gate: "format",
    files: () => ({
      // The formatter would repair this spacing, so only the format gate may
      // report it: parse, api and lint all read it as legal.
      "src/unformatted.js": "export const answer=42; // expect\n",
    }),
    expect: { code: "FORMAT_NEEDED" },
    where: (files) => [at("src/unformatted.js", files["src/unformatted.js"])],
  },
  {
    gate: "ui",
    files: () => ({
      "src/off-scale.js": [
        'import { Container, Text } from "flet-box";',
        "",
        "export const OffScale = () =>",
        "  Container({",
        "    padding: 13, // expect",
        '    child: Text({ text: "off the scale" }),',
        "  });",
        "",
      ].join("\n"),
    }),
    expect: { code: "OFF_SCALE_SPACING" },
    where: (files) => [at("src/off-scale.js", files["src/off-scale.js"])],
  },
  {
    gate: "structure",
    files: () => ({
      "stray.js": "export const stray = true; // expect\n",
    }),
    expect: { code: "SOURCE_OUTSIDE_ROOT" },
    where: (files) => [at("stray.js", files["stray.js"])],
  },
  {
    gate: "surface",
    root: () => surfaceRoot,
    files: () => ({
      // Declared in the interface, read nowhere → DEAD_PROP.
      // Read by the widget, declared nowhere → INVENTED_PROP.
      "node_modules/flet-box/src/index.d.ts": surfaceDts("\n    ghost?: string;"),
      "node_modules/flet-box/src/widgets/Demo.js": surfaceWidget("text, secret"),
    }),
    // The first matching code is the assertion; both are listed so a regression
    // in either direction is named.
    expect: { codes: ["INVENTED_PROP", "DEAD_PROP"] },
    // The gate names the package file as it walked it, which is the installed
    // path — the same one a consumer sees in `node_modules/`.
    where: () => [{ file: "node_modules/flet-box/src/widgets/Demo.js", line: null }],
  },
  {
    gate: "tests",
    files: (root) => {
      const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
      manifest.scripts = { test: 'node -e "process.exit(1)"' };
      return { "package.json": `${JSON.stringify(manifest, null, 2)}\n` };
    },
    expect: { code: "TEST_SUITE_FAILED" },
    where: () => [{ file: null, line: null }],
  },
];

// Naming a literal must not hide it from the design gate. Keep each code on
// its own marked use, so a report on the declaration cannot satisfy the guard.
for (const [declaration, widget, prop, code] of [
  ['const PAD = 13;', 'Container', 'padding: PAD', 'OFF_SCALE_SPACING'],
  ['const RADIO = 22;', 'Container', 'borderRadius: RADIO', 'OFF_SCALE_RADIUS'],
  ['const TIPO = 15;', 'Text', 'text: "Hi", size: TIPO', 'OFF_SCALE_TYPE'],
  ['const MARCA = "#4f46e5";', 'Container', 'bgColor: MARCA', 'RAW_COLOR'],
]) {
  fixtures.push({
    gate: 'ui',
    files: () => ({
      'src/named-literal.js': `import { ${widget} } from "flet-box";\n${declaration}\nexport const view = () => ${widget}({ ${prop} }); // expect\n`,
    }),
    expect: { code },
    where: (files) => [at('src/named-literal.js', files['src/named-literal.js'])],
  });
}

// A second structural code the gate owns, proven on the same fixture root: a
// cycle needs two modules, so it gets its own entry instead of sharing `stray.js`.
fixtures.push({
  gate: "structure",
  files: () => ({
    "src/cycle-a.js": 'import { b } from "./cycle-b.js"; // expect\n\nexport const a = () => b();\n',
    "src/cycle-b.js": 'import { a } from "./cycle-a.js"; // expect\n\nexport const b = () => a();\n',
  }),
  expect: { code: "CIRCULAR_IMPORT" },
  // Either endpoint can be named: the walk starts at whichever file the
  // directory lists first. Both imports sit on the same marked line 1.
  where: (files) => [
    at("src/cycle-a.js", files["src/cycle-a.js"]),
    at("src/cycle-b.js", files["src/cycle-b.js"]),
  ],
});

fixtures.push({
  gate: "structure",
  files: () => ({
    "src/handmade.js": [
      "export const paint = (el) => {",
      '  el.innerHTML = "<b>x</b>"; // expect',
      "};",
      "",
    ].join("\n"),
  }),
  expect: { code: "HAND_WRITTEN_DOM" },
  where: (files) => [at("src/handmade.js", files["src/handmade.js"])],
});

/* -------------------------------------------------------------- the runner */

/**
 * Apply a fixture and return the undo that puts the tree back.
 *
 * @param {string} root
 * @param {Record<string, string>} files
 * @returns {() => void}
 */
const apply = (root, files) => {
  const undo = [];
  for (const [rel, text] of Object.entries(files)) {
    const file = path.join(root, rel);
    const existed = fs.existsSync(file);
    const before = existed ? fs.readFileSync(file, "utf8") : null;
    write(root, rel, text);
    undo.push(() => {
      if (existed) fs.writeFileSync(file, before, "utf8");
      else fs.rmSync(file, { force: true });
    });
  }
  return () => undo.reverse().forEach((fn) => fn());
};

/**
 * Run one gate and return its step.
 *
 * @param {string} root
 * @param {string} gate
 * @returns {Promise<object>}
 */
const one = async(root, gate) => {
  const report = await runGates(root, [gate]);
  return report.steps[0];
};

/**
 * Whether a finding sits in one of the expected positions.
 *
 * @param {object} finding
 * @param {string} root
 * @param {Array<{file: string|null, line: number|null}>} where
 * @returns {boolean}
 */
const sits = (finding, root, where) =>
  where.some((spot) => {
    if (spot.file === null) return true;
    if (!finding.file) return false;
    const rel = path.relative(root, finding.file).split(path.sep).join("/");
    if (rel !== spot.file) return false;
    return spot.line === null || finding.line === spot.line;
  });

/**
 * Describe what a gate reported, for a failure message an author can act on.
 *
 * @param {object} step
 * @param {string} root
 * @returns {string}
 */
const summary = (step, root) => {
  if (!step.findings.length) return "reported nothing";
  return step.findings
    .map((finding) => {
      const where = finding.file
        ? `${path.relative(root, finding.file).split(path.sep).join("/")}:${finding.line || "?"}`
        : "no file";
      return `${finding.code} at ${where}`;
    })
    .join(", ");
};

/* ------------------------------------------------------------ positive run */

const appGates = GATE_ORDER.filter((gate) => gate !== "surface");
const clean = await runGates(appRoot, appGates);
const cleanByGate = new Map(clean.steps.map((step) => [step.name, step]));
const cleanSurface = await one(surfaceRoot, "surface");

for (const gate of GATE_ORDER) {
  const step = gate === "surface" ? cleanSurface : cleanByGate.get(gate);
  const errors = step.findings.filter((finding) => finding.severity === "error");
  if (step.exitCode || errors.length) {
    fail(
      gate,
      "positive",
      `the clean fixture was reported: ${summary(
        { ...step, findings: errors },
        gate === "surface" ? surfaceRoot : appRoot,
      )}`,
    );
  } else if (step.skipped) {
    // A gate that cannot run here has no positive control either; the reason
    // is carried into the negative run, where it becomes a visible SKIP.
    pass(gate, "positive", `clean · skipped (${step.skipped})`);
  } else {
    // Warnings are printed, not failed: they are a reading, and the gate is
    // expected to stay quiet on this fixture — a number here is a signal that
    // the default it measures drifted, not that the fixture is wrong.
    const quiet = step.findings.length ? ` (${step.findings.length} finding(s) — expected none)` : "";
    pass(gate, "positive", `clean fixture${quiet}`);
  }
}

/* ------------------------------------------------------------ negative run */

// `verify` nests its suites by exporting this flag to the child. The tests
// fixture must be a real run, not the nested shortcut, even when this script
// itself executes inside `verify --only tests`.
const nested = process.env.FLETBOX_VERIFY_NESTED;
delete process.env.FLETBOX_VERIFY_NESTED;

for (const fixture of fixtures) {
  const root = fixture.root ? fixture.root() : appRoot;
  const files = fixture.files(root);
  const codes = fixture.expect.codes ?? [fixture.expect.code];
  const undo = apply(root, files);
  let step;
  try {
    step = await one(root, fixture.gate);
  } finally {
    undo();
  }

  if (step.skipped) {
    skip(fixture.gate, "negative", step.skipped);
    continue;
  }
  if (!step.exitCode) {
    fail(fixture.gate, "negative", `a ${codes.join("/")} fixture was reported clean`);
    continue;
  }
  const where = fixture.where(files);
  const found = step.findings.filter((finding) => codes.includes(finding.code) && sits(finding, root, where));
  const missing = codes.filter((code) => !found.some((finding) => finding.code === code));
  if (missing.length) {
    fail(
      fixture.gate,
      "negative",
      `expected ${missing.join(", ")} at ${where
        .map((spot) => (spot.file === null ? "(the suite)" : `${spot.file}:${spot.line ?? "any"}`))
        .join(" or ")} — ${summary(step, root)}`,
    );
    continue;
  }
  if (!found.some((finding) => finding.severity === "error")) {
    fail(fixture.gate, "negative", `${codes.join("/")} was reported only as a warning — it cannot fail a run`);
    continue;
  }
  const named = found
    .map(
      (finding) =>
        `${finding.code}${
          finding.file === null
            ? ""
            : ` at ${path.relative(root, finding.file).split(path.sep).join("/")}${
                finding.line ? `:${finding.line}` : ""
              }`
        }`,
    )
    .join(", ");
  pass(fixture.gate, "negative", named);
}

if (nested !== undefined) process.env.FLETBOX_VERIFY_NESTED = nested;

/* ------------------------------------------------------------- inventory */

const known = new Set(GATE_ORDER);
const registered = Object.keys(GATES);
const covered = new Set(fixtures.map((fixture) => fixture.gate));
for (const gate of registered) {
  if (!known.has(gate)) {
    fail(gate, "inventory", "in GATES but not GATE_ORDER — verify would never run it");
  }
  if (!covered.has(gate)) fail(gate, "inventory", "no fixture — a new gate would enter the report unproven");
}
for (const gate of GATE_ORDER) {
  if (!registered.includes(gate)) fail(gate, "inventory", "GATE_ORDER names a gate GATES does not have");
}
for (const gate of covered) {
  if (!registered.includes(gate)) fail(gate, "inventory", "the fixture names a gate GATES does not have");
}

/* ------------------------------------------------------------------ report */

// One line per gate, in report order, with every run it carried. A gate with
// more than one fixture (structure) shows each; a failure names its reason.
console.log("\n🔎 FletBox selftest — the gates' own gate\n");
for (const gate of GATE_ORDER) {
  const own = results.filter((item) => item.gate === gate);
  if (!own.length) {
    console.log(`  ??   ${gate.padEnd(10)} no result — the fixture did not run`);
    continue;
  }
  for (const item of own) {
    const mark = item.status === "ok" ? "ok  " : item.status === "skip" ? "skip" : "FAIL";
    console.log(`  ${mark} ${gate.padEnd(10)} ${item.why}`);
  }
}

const failed = results.filter((item) => item.status === "fail").length;
const skipped = results.filter((item) => item.status === "skip").length;
const exercised = new Set(
  results.filter((item) => item.phase === "negative" && item.status === "ok").map((item) => item.gate),
).size;
const lines = [
  "",
  `  coverage: ${exercised}/${GATE_ORDER.length} gates exercised, ${skipped} skip, ${fixtures.length} fixture(s)`,
];

fs.rmSync(tmp, { recursive: true, force: true });

if (failed) {
  console.log(
    lines.join("\n") +
      `\n\n❌ ${failed} selftest failure(s) — a gate that does not bite is a gate an agent will trust.\n`,
  );
  process.exit(1);
}

console.log(
  lines.join("\n") +
    "\n\n✅ Every gate reports the defect that is there, on the line it is on.\n",
);
