// scripts/check-lint.mjs
// Contract for `flet-box lint` (the lint gate).
//
// The bug these guard: four mechanical style defects are invisible to every
// other gate — the parser accepts a trailing space, `check-ui` never reads
// indentation, and no gate ends a file with a newline. A lint rule that stops
// firing fails silently: the verify report says "Lint rules: 0 findings" and
// an agent trusts it, so each rule is proven twice — a fixture with the defect
// must be reported on the exact line, an identical fixture without it must be
// reported as clean. A rule that passes by never firing is also a failure.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { lintText, scanLint, checkLint } from "../bin/commands/checkLint.js";

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-lint-"));

let failures = 0;
const check = (label, fn) => {
  try {
    fn();
    console.log(`✅ ${label}`);
  } catch (error) {
    failures += 1;
    console.log(`❌ ${label}\n     ${error.message}`);
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const write = (rel, body) => {
  const target = path.join(scratch, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, body, "utf8");
  return target;
};

/* ------------------------------------------------------------ pure rules */

const clean = "const x = 1;\n";
check("a clean file reports nothing", () => {
  assert(lintText(clean).length === 0, `findings: ${JSON.stringify(lintText(clean))}`);
});
check("an empty file reports nothing", () => {
  assert(lintText("").length === 0, `findings: ${JSON.stringify(lintText(""))}`);
});
check("a file that is only a final newline reports nothing", () => {
  assert(lintText("\n").length === 0, `findings: ${JSON.stringify(lintText("\n"))}`);
});

const RULES = [
  [
    "TRAILING_WS",
    "const x = 1;  \n",
    1,
  ],
  [
    "TAB_INDENT",
    "\tconst x = 1;\n",
    1,
  ],
  [
    "CRLF",
    "const x = 1;\r\n",
    1,
  ],
  [
    "NO_FINAL_NL",
    "const x = 1;",
    1,
  ],
];
for (const [code, text, line] of RULES) {
  check(`${code} bites on its own line`, () => {
    const findings = lintText(text);
    assert(
      findings.length === 1 && findings[0].code === code && findings[0].line === line,
      `findings: ${JSON.stringify(findings)}`,
    );
    assert(findings[0].suggestion && findings[0].suggestion.length > 0, "no suggestion");
  });
}

// Removing the defect must remove the finding: a rule that fires on the
// clean form too is noise an agent learns to skip.
for (const [code, text] of RULES) {
  const fixed = text.replace(/ +\r?\n/g, "\n").replace(/\t/g, "  ").replace(/\r/g, "").replace(/;$/, ";\n");
  check(`${code} stays silent once the defect is gone`, () => {
    const findings = lintText(fixed);
    assert(!findings.some((f) => f.code === code), `findings: ${JSON.stringify(findings)}`);
  });
}

check("CRLF does not double-report as trailing whitespace", () => {
  const findings = lintText("const x = 1; \r\n");
  assert(
    !findings.some((f) => f.code === "TRAILING_WS"),
    `findings: ${JSON.stringify(findings)}`,
  );
});

check("trailing whitespace inside a template literal is content", () => {
  // A generated screen shipped as a template literal keeps its own spaces:
  // stripping one would change the screen it generates. The same file must
  // still flag the line's own trailing whitespace.
  const content = "const tpl = `\n  DrawerItem({ \n    icon: 'palette',\n  }).`;\n";
  assert(lintText(content).length === 0, `findings: ${JSON.stringify(lintText(content))}`);
  const own = "const x = 1;  \n";
  assert(lintText(own).some((f) => f.code === "TRAILING_WS"), "own trailing whitespace silent");
});

/* --------------------------------------------------------- the scan, CLI */

const dirtyDir = path.join(scratch, "dirty");
write("dirty/src/ok.js", "export const ok = 1;\n");
write("dirty/src/dirty.js", "export const dirty = 1;  \n");

const scanFindings = await scanLint(dirtyDir);
check("scanLint names the file, the line and the code", () => {
  assert(scanFindings.length === 1, `findings: ${JSON.stringify(scanFindings)}`);
  assert(scanFindings[0].code === "TRAILING_WS", scanFindings[0].code);
  assert(scanFindings[0].line === 1, `line: ${scanFindings[0].line}`);
  assert(path.basename(scanFindings[0].file) === "dirty.js", scanFindings[0].file);
});

const cleanDir = path.join(scratch, "clean");
write("clean/src/ok.js", "export const ok = 1;\n");
{
  const { exitCode } = await checkLint(["--root", cleanDir], { print: () => {} });
  check("a clean project exits 0", () => assert(exitCode === 0, `exitCode: ${exitCode}`));
}
{
  const { exitCode } = await checkLint(["--root", dirtyDir], { print: () => {} });
  check("a dirty project exits 1", () => assert(exitCode === 1, `exitCode: ${exitCode}`));
}
{
  const lines = [];
  await checkLint(["--root", dirtyDir, "--json"], { print: (line) => lines.push(line) });
  check("--json reports the finding as data", () => {
    const data = JSON.parse(lines.join("\n"));
    assert(data.length === 1 && data[0].code === "TRAILING_WS", JSON.stringify(data));
    assert(data[0].file === "src/dirty.js", data[0].file);
  });
}

fs.rmSync(scratch, { recursive: true, force: true });

if (failures) {
  console.log(`\ncheck-lint: ${failures} failed`);
  process.exit(1);
}
console.log("\ncheck-lint: every lint rule bites, and stays silent when obeyed");
