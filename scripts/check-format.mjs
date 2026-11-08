// scripts/check-format.mjs
// Contract for `flet-box format` (the format engine and the format gate).
//
// The bug these guard: a formatter that re-spaces differently on every run
// (non-idempotent) rewrites the whole repository on every invocation, and a
// formatter whose check mode disagrees with its write mode reports a file
// clean that it then rewrites. Both directions are asserted: formatting a
// file twice gives the same bytes, the gate files exactly the files the
// writer would change, and --write settles the tree so the gate goes green.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { formatCode, isFormatted } from "../bin/utils/jsFormat.js";
import { planFormat, scanFormat, scanFormatNeeded, formatFiles } from "../bin/commands/format.js";

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-format-"));

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

/* ------------------------------------------------------ the formatter */

check("spacing is normalised", () => {
  assert(formatCode("const x=1+2;\n") === "const x = 1 + 2;\n", JSON.stringify(formatCode("const x=1+2;\n")));
});

check("a call keeps its parens glued", () => {
  assert(formatCode("foo( 1 , 2 );\n") === "foo(1, 2);\n", JSON.stringify(formatCode("foo( 1 , 2 );\n")));
});

check("a unary minus glues to its number", () => {
  assert(formatCode("return -1;\n") === "return -1;\n", JSON.stringify(formatCode("return -1;\n")));
  assert(formatCode("const x = a-1;\n") === "const x = a - 1;\n", JSON.stringify(formatCode("const x = a-1;\n")));
});

check("indentation is the author's", () => {
  assert(formatCode("  const x=1;\n") === "  const x = 1;\n", JSON.stringify(formatCode("  const x=1;\n")));
  assert(formatCode("      const x=1;\n") === "      const x = 1;\n", JSON.stringify(formatCode("      const x=1;\n")));
});

check("a string keeps its quotes and content", () => {
  assert(formatCode("const s =  'a  b';\n") === "const s = 'a  b';\n", JSON.stringify(formatCode("const s =  'a  b';\n")));
});

check("CRLF and a missing final newline are normalised", () => {
  assert(formatCode("const x=1;\r\n") === "const x = 1;\n", JSON.stringify(formatCode("const x=1;\r\n")));
  assert(formatCode("const x=1;") === "const x = 1;\n", JSON.stringify(formatCode("const x=1;")));
});

check("isFormatted agrees with formatCode", () => {
  assert(isFormatted("const x = 1;\n"), "clean form is formatted");
  assert(!isFormatted("const x=1;\n"), "dirty form is not formatted");
});

const IDEMPOTENCY_CASES = [
  "import{initRouter}from\"../x.js\";\n",
  "if(x){y;}\n",
  "const t=`outer ${ {k: `inner`} } done`;\nconst u=1;\n",
  "const x=`${v.replace(/'/g, \"a\")}`;\nconst y=1;\n",
  "/* line \"one\" */\nconst a=1; // comment\n",
  "switch(x){case 1: y; break;}\n",
  "for(let i=0;i<n;i++)x(i);\n",
];
for (const src of IDEMPOTENCY_CASES) {
  check(`idempotent: ${JSON.stringify(src.slice(0, 40))}`, () => {
    const once = formatCode(src);
    const twice = formatCode(once);
    assert(once === twice, `once: ${JSON.stringify(once)} twice: ${JSON.stringify(twice)}`);
  });
}

/* -------------------------------------------------------- the command */

const dir = path.join(scratch, "app");
write("app/src/ok.js", "export const ok = 1;\n");
write("app/src/dirty.js", "export const dirty=1;\n");

const plans = scanFormat(dir);
check("scanFormat plans every owned module", () => {
  assert(plans.length === 2, `plans: ${JSON.stringify(plans.map((p) => p.file))}`);
  const ok = plans.find((p) => p.file.endsWith("ok.js"));
  const dirty = plans.find((p) => p.file.endsWith("dirty.js"));
  assert(ok && !ok.needs, "ok.js needs formatting");
  assert(dirty && dirty.needs, "dirty.js does not need formatting");
});

const gateFindings = scanFormatNeeded(dir);
check("the gate files exactly the files the writer would change", () => {
  assert(gateFindings.length === 1, `findings: ${JSON.stringify(gateFindings)}`);
  assert(gateFindings[0].code === "FORMAT_NEEDED", gateFindings[0].code);
  assert(path.basename(gateFindings[0].file) === "dirty.js", gateFindings[0].file);
});

const plan = plans.find((p) => p.file.endsWith("dirty.js"));
check("planFormat reads the original and the formatted form", () => {
  assert(plan.original === "export const dirty=1;\n", JSON.stringify(plan.original));
  assert(plan.formatted === "export const dirty = 1;\n", JSON.stringify(plan.formatted));
});

{
  const dirtyFile = path.join(dir, "src", "dirty.js");
  const { exitCode } = await formatFiles(["--root", dir], { print: () => {} });
  check("format without --write exits 1 and touches nothing", () => {
    assert(exitCode === 1, `exitCode: ${exitCode}`);
    assert(fs.readFileSync(dirtyFile, "utf8") === "export const dirty=1;\n", "file was written");
  });
}

{
  const { exitCode } = await formatFiles(["--root", dir, "--write"], { print: () => {} });
  check("format --write rewrites the file and exits 0", () => {
    assert(exitCode === 0, `exitCode: ${exitCode}`);
    assert(fs.readFileSync(path.join(dir, "src", "dirty.js"), "utf8") === "export const dirty = 1;\n", "file not rewritten");
  });
}

{
  const { exitCode } = await formatFiles(["--root", dir], { print: () => {} });
  check("after --write the format gate is green", () => {
    assert(exitCode === 0, `exitCode: ${exitCode}`);
    assert(scanFormatNeeded(dir).length === 0, "still files a finding");
  });
}

fs.rmSync(scratch, { recursive: true, force: true });

if (failures) {
  console.log(`\ncheck-format: ${failures} failed`);
  process.exit(1);
}
console.log("\ncheck-format: the formatter settles; the gate and the writer agree");
