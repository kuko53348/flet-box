// scripts/check-module-exports.mjs
// Contract for the reader that answers "does this module really export that
// name?" — the check behind MISSING_EXPORT and BROKEN_IMPORT.
//
// The bug this guards: the identifier class was ASCII, so a module exporting
// `fijarTamaño` was read as exporting `fijarTama`. Every import of the real
// name came back MISSING_EXPORT — a false positive that pushed an app into
// renaming its exports, and that the metrics log then reported as a recurring
// failure of the app, not of the gate.
//
// Both directions are asserted: the false positive stays gone (a Unicode export
// imported by its own name, and through a `as` re-export), AND a name that is
// genuinely missing is still reported — or the guard would pass by disabling
// the check.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkApi } from "../bin/commands/checkApi.js";

const ACCENTS = `export const fijarTamaño = (n) => n;
export function españolizar(texto) {
  return texto;
}
`;

const BARREL = `export { fijarTamaño as tamañoFijo } from "./accents.js";
`;

// Every one of these is a real export: none of them may be reported.
const USE = `import { fijarTamaño, españolizar } from "./accents.js";
import { tamañoFijo } from "./barrel.js";
export const total = tamañoFijo(fijarTamaño(españolizar("3")));
`;

// Control: this name exists nowhere, so it must still be reported.
const BROKEN = `import { noExiste } from "./accents.js";
export const x = noExiste;
`;

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-exports-"));
fs.mkdirSync(path.join(dir, "src"), { recursive: true });
fs.writeFileSync(path.join(dir, "src", "accents.js"), ACCENTS, "utf8");
fs.writeFileSync(path.join(dir, "src", "barrel.js"), BARREL, "utf8");
fs.writeFileSync(path.join(dir, "src", "use.js"), USE, "utf8");
fs.writeFileSync(path.join(dir, "src", "broken.js"), BROKEN, "utf8");

let failed = 0;
const say = (ok, label) => {
  if (!ok) failed += 1;
  console.log(`${ok ? "OK  " : "FAIL"} ${label}`);
};

try {
  const lines = [];
  await checkApi(["--root", dir, "--json"], { print: (line) => lines.push(line) });
  const { findings } = JSON.parse(lines.join("\n"));
  const inFile = (name) => findings.filter((finding) => path.basename(finding.file) === name);

  say(
    inFile("use.js").length === 0,
    `an accented export imported by name is found (${inFile("use.js").length} finding(s) in use.js)`,
  );
  say(
    inFile("barrel.js").length === 0,
    `a re-export aliased to an accented name is found (${inFile("barrel.js").length} finding(s) in barrel.js)`,
  );

  const broken = inFile("broken.js");
  say(broken.length === 1, `a missing name is still reported (${broken.length} finding(s) in broken.js)`);
  say(broken[0]?.code === "MISSING_EXPORT", `the finding is MISSING_EXPORT (${broken[0]?.code})`);
  say(
    /\bnoExiste\b/.test(broken[0]?.message || ""),
    "the finding names the name that is missing",
  );
} catch (error) {
  say(false, `the scan ran: ${error.message}`);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

if (failed) {
  console.error(`\n${failed} check(s) failed in the module-export contract.`);
  process.exit(1);
}
console.log("\ncheck-module-exports: a Unicode export is read whole, and a missing name still bites.");
