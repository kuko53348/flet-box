// scripts/check-types.mjs
// Contract for the repository-wide typecheck (`types` gate) and the strict
// JSDoc check over the lint/format code.
//
// Two directions, the way the repo proves every gate: the root `jsconfig.json`
// (the file the `types` gate runs) must produce zero diagnostics against the
// framework itself — a gate that skipped itself would be a skipped check —
// and the new tokenizer/formatter/lint commands must produce zero diagnostics
// with `checkJs: true`, so the JSDoc `@param` types on the new code are a
// contract the compiler verified, not a comment that reads well.
//
// TypeScript is a devDependency and never shipped: like the other optional
// harnesses, this script skips with a notice when it is absent (the editor
// brings its own service).
//
// Usage:
//   node scripts/check-types.mjs
//   FLETBOX_TYPESCRIPT=/path/to/typescript node scripts/check-types.mjs

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const resolveTsc = () => {
  const explicit = process.env.FLETBOX_TYPESCRIPT;
  if (explicit) {
    const candidate = path.join(explicit, "lib", "tsc.js");
    return fs.existsSync(candidate) ? candidate : null;
  }
  try {
    const candidate = path.join(path.dirname(require.resolve("typescript")), "tsc.js");
    return fs.existsSync(candidate) ? candidate : null;
  } catch {
    return null;
  }
};

const tsc = resolveTsc();

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

const runTsc = (args) => {
  try {
    const out = execFileSync(process.execPath, [tsc, ...args], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 32 * 1024 * 1024,
    });
    return { code: 0, text: out };
  } catch (error) {
    return { code: error.status ?? 1, text: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
};

if (!tsc) {
  console.log(
    "⏭  check-types: typescript is not installed — the editor brings its own (run `npm ci` to enable this check)",
  );
  process.exit(0);
}

// The strict half needs a scratch config that names only the new code. It
// lives in a temp directory so this repository's own `jsconfig.json` is the
// one the gate runs — the fixture cannot hide behind a different file.
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-types-"));
const strictConfig = path.join(scratch, "jsconfig.strict.json");
fs.writeFileSync(
  strictConfig,
  JSON.stringify(
    {
      compilerOptions: {
        allowJs: true,
        checkJs: true,
        noEmit: true,
        module: "esnext",
        moduleResolution: "bundler",
        target: "es2022",
        lib: ["es2022", "dom", "dom.iterable"],
        skipLibCheck: true,
        strict: false,
        noImplicitAny: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
        types: ["node"],
        typeRoots: [path.join(repoRoot, "node_modules", "@types")],
      },
      include: [
        path.join(repoRoot, "bin", "utils", "jsTokenize.js"),
        path.join(repoRoot, "bin", "utils", "jsFormat.js"),
        path.join(repoRoot, "bin", "commands", "checkLint.js"),
        path.join(repoRoot, "bin", "commands", "format.js"),
      ],
    },
    null,
    2,
  ),
);

const strict = runTsc(["-p", strictConfig, "--noEmit", "--pretty", "false"]);
check("the lint/format code typechecks with checkJs true (zero diagnostics)", () => {
  if (strict.code !== 0)
    throw new Error(`tsc exited ${strict.code}:\n${strict.text.split("\n").slice(0, 20).join("\n")}`);
  if (strict.text.includes("error")) throw new Error(strict.text.split("\n").slice(0, 20).join("\n"));
});

const root = runTsc(["-p", "jsconfig.json", "--noEmit", "--pretty", "false"]);
check("the root jsconfig typechecks the framework itself (zero diagnostics)", () => {
  if (root.code !== 0)
    throw new Error(`tsc exited ${root.code}:\n${root.text.split("\n").slice(0, 20).join("\n")}`);
  if (root.text.includes("error")) throw new Error(root.text.split("\n").slice(0, 20).join("\n"));
});

fs.rmSync(scratch, { recursive: true, force: true });

if (failures) {
  console.log(`\ncheck-types: ${failures} failed`);
  process.exit(1);
}
console.log("\ncheck-types: the framework and the lint/format code both typecheck clean");
