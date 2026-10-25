// scripts/check-api-propscan.mjs
// Contract for the prop scan of `flet-box check-api`: the keys of a widget's
// props object are read at that object's own level, and nothing else.
//
// The bug this guards: the scanner split a props literal on every comma it found
// inside the braces, so a child list — `children: [slot, line]`, the most common
// shape in an app — was read as shorthand props (`Column({ line })`,
// UNKNOWN_PROP, exit 1). A nested array, call or object is not a prop, so those
// commas belong to the inner expression.
//
// Both directions are asserted: the false positive must stay gone AND a real
// invented prop must still be reported, or the guard would pass by disabling the
// check.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkApi } from "../bin/commands/checkApi.js";

const SOURCE = `import { Column, Container, Text, Row, colors } from "flet-box";

const line = Text({ text: "readout", size: 12, color: colors.textSecondary });
const slot = Container({ width: "100%" });

// A child list, a nested call and a nested object: none of these are props.
export const demo = () =>
  Column({
    width: "100%",
    gap: 8,
    children: [
      slot,
      line,
      Row({ wrap: "wrap", gap: 8, children: [line, slot] }),
      Column({ text: "nested", size: 14 }),
    ],
    onPress: () => console.log("a, b"),
  });

// Still a prop scan: an unknown key on the object itself must be reported.
export const broken = () => Column({ widht: 100, allignment: "center" });

// A shorthand key really is a key, so an unknown one stays an error.
export const shorthand = ({ nonsenseKey }) => Column({ nonsenseKey });

// A spread can carry anything, so the literal is not judged at all.
export const spread = (extra) => Column({ width: "100%", ...extra });
`;

const MUST_REPORT = ["widht", "allignment", "nonsenseKey"];
const MUST_NOT_REPORT = ["line", "slot", "wrap", "nested", "extra"];

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-propscan-"));
fs.mkdirSync(path.join(dir, "src"), { recursive: true });
fs.writeFileSync(path.join(dir, "src", "app.js"), SOURCE, "utf8");

let failed = 0;
const say = (ok, label) => {
  if (!ok) failed += 1;
  console.log(`${ok ? "OK  " : "FAIL"} ${label}`);
};

try {
  const lines = [];
  await checkApi(["--root", dir, "--json"], {
    print: (line) => lines.push(line),
  });
  const json = JSON.parse(lines.join("\n"));
  const unknown = json.findings.filter((f) => f.code === "UNKNOWN_PROP");
  // The message is `Widget({ key }) — the factory drops unknown keys…`.
  const keys = unknown
    .map((f) => /\(\{ (\w+) \}\)/.exec(f.message)?.[1])
    .filter(Boolean);

  say(json.scanned === 1, `the fixture is scanned (${json.scanned} file)`);
  for (const key of MUST_REPORT) {
    say(keys.includes(key), `reported as an unknown prop: ${key}`);
  }
  for (const key of MUST_NOT_REPORT) {
    say(!keys.includes(key), `not read as a prop: ${key}`);
  }
  say(
    json.findings.every((f) => f.code !== "MISSING_EXPORT" && f.code !== "BROKEN_IMPORT"),
    "the fixture itself imports nothing broken",
  );
} catch (error) {
  say(false, `the scan ran: ${error.message}`);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

if (failed) {
  console.error(`\n${failed} check(s) failed in the prop-scan contract.`);
  process.exit(1);
}
console.log("\ncheck-api prop scan holds.");
