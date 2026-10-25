#!/usr/bin/env node
/**
 * @file check-shared-helpers.mjs
 * @description
 * One home per shared helper.
 *
 * A framework with 90 widgets tempts every new one to paste the helper it needs:
 * the same HTML escaper, the same keyframe injector, the same four-side
 * resolver. Two copies do not diverge on the day they are written — they diverge
 * on the day one of them is fixed, and the security boundary or the animation
 * nobody tested is the copy that was not.
 *
 * This gate proves the extraction instead of asking for it: each helper below
 * has exactly one definition, in the module named here, and the modules that
 * used to carry a copy must import it. The four rules are independent, so a
 * failure names both the stray copy and the home it belongs in.
 *
 * `@keyframes` is deliberately the narrowest rule: it may appear in
 * `src/utils/styleInjector.js` and nowhere else. Keyframes are global, so an
 * injector per widget is not a style preference — it is a duplicate `<style>`
 * and a dedupe set that cannot see the other one.
 *
 * Usage:
 *   node scripts/check-shared-helpers.mjs
 *   node scripts/check-shared-helpers.mjs --root <dir>   # check another checkout
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootFlag = process.argv.indexOf("--root");
const root = rootFlag >= 0 ? process.argv[rootFlag + 1] : join(scriptDir, "..");
const srcDir = join(root, "src");

if (!existsSync(srcDir)) {
  console.error(`check-shared-helpers: no src/ under ${root}`);
  process.exit(1);
}

/** Every `.js` file under `src/`, as repo-relative POSIX paths. */
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".js") ? [full] : [];
  });

const files = walk(srcDir).map((file) => ({
  path: relative(root, file).split("\\").join("/"),
  text: readFileSync(file, "utf8"),
}));

const byPath = new Map(files.map((file) => [file.path, file]));

const errors = [];
const fail = (rule, message) => errors.push({ rule, message });

/** `file:line` for a match, so the report points at the copy. */
const locate = (file, index) => {
  if (index < 0) return file.path;
  const line = file.text.slice(0, index).split("\n").length;
  return `${file.path}:${line}`;
};

// ---------------------------------------------------------------------------
// 1. One definition per shared helper.
// ---------------------------------------------------------------------------

/**
 * `pattern` finds a *definition*, not a mention: a rule that fired on the word
 * in a comment, an import or a JSDoc line would make the gate impossible to keep
 * green. `@keyframes` therefore has to be followed by a name and an opening
 * brace — the shape of a rule that is actually written, not of prose about one.
 */
const SINGLE_HOME = [
  {
    rule: "keyframes-injection",
    pattern: /@keyframes\s+\S+\s*\{/,
    home: "src/utils/styleInjector.js",
    hint:
      "inject the animation through `injectKeyframes()` from utils/styleInjector.js — a second injector owns a second dedupe set, so the same name is appended twice and neither one knows",
  },
  {
    rule: "keyframes-injection",
    pattern: /(?:^|\s)(?:export\s+)?(?:function|const)\s+injectKeyframes\s*[=(]/m,
    home: "src/utils/styleInjector.js",
    hint:
      "import `injectKeyframes` from utils/styleInjector.js instead of defining it here; the shared set is what keeps one `<style>` per animation name",
  },
  {
    rule: "animation-name",
    pattern: /0x811c9dc5/,
    home: "src/utils/styleInjector.js",
    hint:
      "name a generated animation with `animationName(prefix, frames)` from utils/styleInjector.js — a second stable hash is a second naming scheme, and a name derived differently cannot dedupe against the first",
  },
  {
    rule: "html-escape",
    pattern: /\.replace\(\s*\/&\/g\s*,\s*["']&amp;["']\s*\)/,
    home: "src/utils/htmlEscape.js",
    hint:
      "import `escapeHtml` from utils/htmlEscape.js. The escaper is a security boundary: three copies is three chances for the one that matters to be edited alone",
  },
  {
    rule: "html-escape",
    pattern: /(?:^|\s)(?:export\s+)?(?:function|const)\s+escapeHtml\s*[=(]/m,
    home: "src/utils/htmlEscape.js",
    hint:
      "define the escaper once, in utils/htmlEscape.js; re-export it where the old name has to stay public (`export { escapeHtml }` is a re-export, not a definition, and this rule lets it through)",
  },
  {
    rule: "box-edges",
    pattern: /value\.vertical\s*!==\s*undefined/,
    home: "src/tools/boxEdges.js",
    hint:
      "resolve the four sides through `boxEdges()` from tools/boxEdges.js — `margin()` and `padding()` share the same CSS grammar, and a private copy is how the two drift about priority order or the two-value shorthand",
  },
];

for (const rule of SINGLE_HOME) {
  const hits = files.filter((file) => rule.pattern.test(file.text));
  const strays = hits.filter((file) => file.path !== rule.home);
  if (!byPath.has(rule.home)) {
    fail(rule.rule, `${rule.home} is missing — the shared helper has no home, so every copy below is the only copy.`);
  }
  for (const file of strays) {
    fail(
      rule.rule,
      `${locate(file, file.text.search(rule.pattern))} duplicates what ${rule.home} owns. ${rule.hint}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 2. The modules that used to carry a copy must import the home.
// ---------------------------------------------------------------------------

/**
 * A stray copy is the loud failure; a module that quietly stopped delegating is
 * the quiet one (it would not compile without a local copy, but it can drift
 * back to one). This table is the migration's receipt.
 */
const DELEGATES = [
  { file: "src/utils/visualEffects.js", from: "./styleInjector.js", names: ["injectKeyframes", "animationName"] },
  { file: "src/animations/AnimatedBox.js", from: "../utils/styleInjector.js", names: ["injectKeyframes", "animationName"] },
  { file: "src/tools/margin.js", from: "./boxEdges.js", names: ["boxEdges"] },
  { file: "src/tools/padding.js", from: "./boxEdges.js", names: ["boxEdges"] },
  { file: "src/widgets/Markdown.js", from: "../utils/htmlEscape.js", names: ["escapeHtml"] },
  { file: "src/utils/syntaxHighlight.js", from: "./htmlEscape.js", names: ["escapeHtml"] },
  { file: "src/utils/markdownParser.js", from: "./htmlEscape.js", names: ["escapeHtml"] },
];

for (const { file, from, names } of DELEGATES) {
  const entry = byPath.get(file);
  if (!entry) {
    fail("delegates", `${file} is missing — it is part of the shared-helper contract.`);
    continue;
  }
  for (const name of names) {
    const imported = new RegExp(
      `import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*["']${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    );
    if (!imported.test(entry.text)) {
      fail(
        "delegates",
        `${file} does not import ${name} from ${from}. ${file} used to build that behaviour itself; call the shared module so a fix lands once.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------

const byRule = new Map();
for (const e of errors) byRule.set(e.rule, [...(byRule.get(e.rule) || []), e.message]);

const ruleCount = new Set(SINGLE_HOME.map((rule) => rule.rule)).size + 1;
console.log(`\nFletBox shared-helper contract — ${files.length} files · ${ruleCount} rules`);

if (byRule.size === 0) {
  console.log(
    "\n✔ every shared helper has exactly one home, and the modules that need it call it.\n",
  );
  process.exit(0);
}

for (const [rule, messages] of byRule) {
  console.log(`\n${rule.toUpperCase()} (${messages.length}):`);
  for (const message of messages) console.log(`  · ${message}`);
}
console.log(
  "\n  Two copies do not diverge today; they diverge the day one is fixed.\n" +
    "  Extract the helper into the module that owns the behaviour and import it.\n",
);
process.exit(1);
