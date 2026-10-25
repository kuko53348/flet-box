#!/usr/bin/env node
/**
 * @file check-a11y.mjs
 * @description
 * Keeps the accessibility contract the engine owns from rotting one widget at a
 * time. There is no baseline: every rule here is absolute, and every one of them
 * exists because the framework shipped the bug it now forbids.
 *
 * 1. `applyEffects` used to write `outline: none` onto every widget, and `Input`
 *    wrote it onto the text box. An inline declaration outranks every stylesheet
 *    rule, so the document's own `:focus-visible` ring could not reach them — and
 *    the `filled` variant, which has no border to highlight, had no focus signal
 *    at all. A ring is a *state*, so it lives in a stylesheet and nowhere else.
 * 2. A click handler assigned after the factory returned left a mouse-only
 *    control: `assignProps` only sets `widget.onclick` for a click *prop*, and
 *    `applyEffects` — which is what adds role, Tab stop and Enter/Space — had
 *    already run by then.
 * 3. The three overlays closed on Escape but never held Tab, so a keyboard user
 *    walked out of an open dialog, behind the scrim, into a page they could
 *    neither see nor reach back from.
 * 4. The trap's stop list and the ring's selector were written twice. The moment
 *    one of them grows an element, Tab lands somewhere with no focus indicator.
 *
 * Usage:
 *   node scripts/check-a11y.mjs
 *
 * The one exception is the Dropdown's listbox option, allowlisted below with its
 * reason — and an allowlist entry whose assignment has gone fails the run.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const toRel = (p) => relative(root, p).split("\\").join("/");

/** Strip comments so a documented bug never reads like a live one. */
const withoutComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));

const collectFiles = (dir) => {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full));
    else if (entry.name.endsWith(".js")) out.push(full);
  }
  return out;
};

const srcFiles = collectFiles(join(root, "src")).sort();
const clean = new Map(srcFiles.map((f) => [toRel(f), withoutComments(readFileSync(f, "utf8"))]));

const errors = [];
const fail = (rule, message) => errors.push({ rule, message });

/** First line of `file` matching `re`, as `path:line`. */
const locate = (file, re) => {
  const lines = (clean.get(file) || "").split("\n");
  for (let i = 0; i < lines.length; i++) if (re.test(lines[i])) return `${file}:${i + 1}`;
  return file;
};

const need = (file, re, why, rule) => {
  if (!clean.has(file)) return fail(rule || file, `${why}: ${file} is gone.`);
  if (!re.test(clean.get(file))) return fail(rule || file, `${why} — no match for ${re} in ${file}.`);
  return true;
};

const FOCUS_RING = "src/utils/focusRing.js";
const EFFECTS = "src/widget-factory/effects.js";
const CREATE_WIDGET = "src/widget-factory/createWidget.js";
const TRANSLATE_PROPS = "src/widget-factory/translateProps.js";
const THEMES = "src/utils/themes.js";
const FOCUS_SCOPE = "src/utils/focusScope.js";
const INPUT = "src/widgets/Input.js";

// ---------------------------------------------------------------------------
// 1. Nothing may write an inline outline.
// ---------------------------------------------------------------------------

const OUTLINE_WRITES = [
  [/\.style\.outline[A-Za-z]*/, "writes an inline `outline` on the element"],
  [/setProperty\(\s*["'`]outline/, "writes an inline `outline` through setProperty"],
  [/outline(?:-(?:offset|color|style|width))?\s*:\s*["'`]?\s*none\b/, "turns outline off in a style object"],
];

for (const [file, src] of clean) {
  if (file === FOCUS_RING) continue;
  for (const [re, why] of OUTLINE_WRITES) {
    if (re.test(src)) {
      fail(
        "inline-outline",
        `${locate(file, re)} ${why}. An inline declaration outranks every stylesheet rule, ` +
          `including the engine's :focus-visible ring, so this is how a focused control ends up with no ring at all.`,
      );
    }
  }
}

// The routed-props path is the other way back into the same hole: one `outline`
// prop and any app can re-mute the ring with a value.
if (/(?:prop|domProp):\s*["'`]outline/i.test(clean.get(TRANSLATE_PROPS) || "")) {
  fail(
    "inline-outline",
    `${TRANSLATE_PROPS} routes an "outline" prop. The ring belongs to the engine, not to a prop: ` +
      `routed styles land on the element inline and outrank the stylesheet rule.`,
  );
}

// A field's rim is its validation state; the ring is its focus state. `Input`
// used to write both, which is how a focused error field came to lose one of
// them.
if (/inputWrapper\.style\.boxShadow\s*=/.test(clean.get(INPUT) || "")) {
  fail(
    "inline-outline",
    `${INPUT} paints the field's focus with a box shadow. The border is validation and the ring from ` +
      `${FOCUS_RING} is focus; hand-painting the second is what made the two jobs collide.`,
  );
}

// ---------------------------------------------------------------------------
// 2. The ring rule exists, is zero-specificity, and the factory injects it.
// ---------------------------------------------------------------------------

const RING_RULE = [
  [/:focus-visible/, "the ring is a state, so it has to be a rule"],
  [/var\(--color-focusRing/, "the color is the theme token, not a literal"],
  [/:where\(/, "zero specificity, so one class overrides it and nothing needs !important"],
  [/\[tabindex\]:not\(\[tabindex="-1"\]\)/, "the engine puts custom controls on the Tab path; the ring has to reach them"],
  [/outline-offset/, "a ring glued to the box reads as a border"],
  [/:where\(\[data-fb-field\]\):has\(\s*>\s*input:focus-visible\s*\)/, "a composite field rings as a whole control, not around its text box"],
  [/:where\(\[data-fb-field\]\)\s*>\s*input:focus-visible\s*\{\s*outline:\s*none/, "the inner box is silenced by a rule, which an app can still override"],
];
for (const [re, why] of RING_RULE) need(FOCUS_RING, re, why, "focus-ring-rule");

// Every ring the rule paints has to be offset. One declaration without it — the
// field rule, say, added after the fact — reads as a border on that one control
// and as a ring everywhere else.
{
  const src = clean.get(FOCUS_RING) || "";
  const rings = (src.match(/outline:\s*2px solid var\(--color-focusRing/g) || []).length;
  const offsets = (src.match(/outline-offset:/g) || []).length;
  if (rings !== offsets || rings === 0) {
    fail(
      "focus-ring-rule",
      `${FOCUS_RING} paints ${rings} ring(s) and offsets ${offsets}. A ring glued to the box reads as a border, ` +
        `so each declaration the rule gains needs its outline-offset beside it.`,
    );
  }
}

need(FOCUS_RING, /document\.getElementById\(STYLE_ID\)/, "the tag is injected once per document, so HMR or a second bundle cannot stack rings", "focus-ring-rule");
need(FOCUS_RING, /typeof document === "undefined"/, "the module no-ops outside a browser, so the package stays importable in Node", "focus-ring-rule");

need(CREATE_WIDGET, /from "\.\.\/utils\/focusRing\.js"/, "the factory imports the focus rule", "focus-ring-rule");
need(CREATE_WIDGET, /ensureFocusRing\(\);/, "every widget creation reaches the rule — a ring an app has to remember to inject is not the contract", "focus-ring-rule");

// ---------------------------------------------------------------------------
// 3. Both palettes carry the token, and the rule's fallback is the boot value.
// ---------------------------------------------------------------------------

need(THEMES, /setProperty\(`--color-\$\{key\}`/, "every palette token reaches CSS as --color-<name>, which is how the ring moves with the theme", "focus-ring-token");

const HEX = /^#[0-9a-fA-F]{6}$/;
const checkHex = (rule, where, value) => {
  if (typeof value !== "string" || !HEX.test(value)) {
    fail(rule, `${where} is ${JSON.stringify(value)}. A focus indicator needs one solid color, and the palette is the only place the theme can move it.`);
  }
};

const bootFallback = /--color-focusRing,\s*(#[0-9a-zA-Z]{3,8})/.exec(clean.get(FOCUS_RING) || "");
if (!bootFallback) {
  fail("focus-ring-token", `${FOCUS_RING} has no boot fallback after the comma in var(--color-focusRing, …).`);
}

try {
  const themes = await import(pathToFileURL(join(root, THEMES)).href);
  checkHex("focus-ring-token", "the boot palette (colors.focusRing)", themes.colors?.focusRing);
  for (const name of ["light", "dark"]) {
    checkHex("focus-ring-token", `the ${name} palette (palettes.${name}.focusRing)`, themes.palettes?.[name]?.focusRing);
  }
  if (bootFallback && themes.colors?.focusRing) {
    if (bootFallback[1].toLowerCase() !== themes.colors.focusRing.toLowerCase()) {
      fail(
        "focus-ring-token",
        `the rule falls back to ${bootFallback[1]} but the boot palette says ${themes.colors.focusRing}. ` +
          `That literal is what a page shows before the first setTheme, so it has to be the same color.`,
      );
    }
  }
} catch (err) {
  fail("focus-ring-token", `${THEMES} could not be imported in Node (${err.message}). The ring depends on applyPalette writing the token.`);
}

// ---------------------------------------------------------------------------
// 4. Pressable means reachable: role, Tab stop, Enter and Space, released.
// ---------------------------------------------------------------------------

const EFFECT_RULES = [
  [/makeKeyboardPressable/, "there has to be a keyboard path to a press"],
  [/makeKeyboardPressable\(widget, listeners\)/, "applyEffects has to run it on the element it is handed"],
  [/setAttribute\(\s*["']role["']\s*,\s*["']button["']\s*\)/, "a custom control needs a role, or a screen reader reads a div"],
  [/tabIndex\s*=\s*0/, "a custom control needs to be on the Tab path"],
  [/["']Enter["']/, "Enter presses"],
  [/["']Spacebar["']/, "Space presses, and this is the old spelling some engines still send"],
  [/widget\.onclick\(event\)/, "the key handler fires the same handler a pointer does"],
  [/preventDefault\(\)/, "otherwise Space scrolls the page instead of pressing the control"],
  [/event\.repeat/, "held down, Space is one press, not sixty"],
  [/NATIVELY_REACHABLE\.has\(/, "a native button already does all of this; running the pass again is how tabIndex lands on a disabled control"],
  [/aria-disabled/, "a control the framework disabled must not be a Tab stop"],
  [/hasAttribute\("role"\)/, "an explicit role is a decision the engine must not overwrite"],
  [/hasAttribute\("tabindex"\)/, "tabIndex -1 means 'off the Tab path' and is a decision too"],
  [/listeners\.push\(\s*\{\s*event:\s*["']keydown["']/, "the key handler has to be in the list the next update releases, or every update leaks one"],
];
for (const [re, why] of EFFECT_RULES) need(EFFECTS, re, why, "keyboard-pressable");

// Reachability is not a transform. `makeKeyboardPressable` used to sit inside
// the `disableTransform` branch, so a widget that opted out of the press
// animation — every `Input` wrapper, most rows — opted out of the keyboard too.
if (clean.has(EFFECTS)) {
  const src = clean.get(EFFECTS);
  const pressable = src.indexOf("makeKeyboardPressable(widget, listeners)");
  const branch = src.indexOf("if (!disableTransform)");
  if (pressable === -1 || branch === -1) {
    fail(
      "keyboard-pressable",
      `${EFFECTS} no longer has the shape this guard reads (the makeKeyboardPressable call or the !disableTransform branch). ` +
        `If the press effects moved, keep the keyboard pass outside that branch and fix this line in the same change.`,
    );
  } else if (pressable > branch) {
    fail(
      "keyboard-pressable",
      `${EFFECTS}: makeKeyboardPressable runs after the disableTransform branch, so a widget with no press animation loses its Tab stop and Enter/Space as well.`,
    );
  }
}

// ---------------------------------------------------------------------------
// 5. Every overlay that closes on Escape holds the Tab key.
// ---------------------------------------------------------------------------

const ESCAPE = /\.key\s*===?\s*["']Escape["']/;
const escapeFiles = [...clean.entries()].filter(([, src]) => ESCAPE.test(src)).map(([f]) => f);

if (escapeFiles.length === 0) {
  fail("focus-trap", "no file reads the Escape key any more. If the overlays moved, this guard moves with them — but a modal that ignores Escape is not the fix.");
}

for (const file of escapeFiles) {
  const src = clean.get(file) || "";
  if (!/from ["'][^"']*utils\/focusScope\.js["']/.test(src)) {
    fail(
      "focus-trap",
      `${locate(file, ESCAPE)} closes on Escape and never uses trapFocus: a keyboard user tabs out of an open panel, ` +
        `behind the scrim, into a page they cannot reach back from. Share the one scope instead of writing a second listener.`,
    );
    continue;
  }
  const handles = [...src.matchAll(/(\w+)\s*=\s*trapFocus\(/g)].map((m) => m[1]);
  if (handles.length === 0) {
    fail("focus-trap", `${file} imports trapFocus and never calls it.`);
    continue;
  }
  for (const name of handles) {
    if (!new RegExp(`\\b${name}\\(\\)`).test(src)) {
      fail("focus-trap", `${file}: the release handle ${name} from trapFocus is never called, so the panel keeps the Tab key after it closes and focus never goes back where it came from.`);
    }
  }
}

// ---------------------------------------------------------------------------
// 6. One list of reachable elements: the trap walks it, the ring paints it.
// ---------------------------------------------------------------------------

need(FOCUS_SCOPE, /document\.activeElement/, "focus has to be remembered when the panel opens", "focus-trap");
need(FOCUS_SCOPE, /previous\.focus\(\)/, "and handed back when it closes", "focus-trap");
need(FOCUS_SCOPE, /previous\.isConnected/, "a route change that replaced the page while the panel was open has nothing to go back to", "focus-trap");
need(FOCUS_SCOPE, /released/, "the release is idempotent: close and unmount both call it", "focus-trap");
need(FOCUS_SCOPE, /getClientRects/, "visibility is measured with rects, because offsetParent is null for a fixed panel", "focus-trap");
need(FOCUS_SCOPE, /tabIndex = -1/, "a panel with no control in it still has to take the keyboard", "focus-trap");

const ringList = /:where\(((?:[^()]|\([^()]*\))*)\):focus-visible/.exec(clean.get(FOCUS_RING) || "");
const scopeList = /FOCUSABLE_SELECTOR\s*=\s*\[([\s\S]*?)\]\s*\.join/.exec(clean.get(FOCUS_SCOPE) || "");
if (!ringList || !scopeList) {
  fail(
    "focusable-list",
    `could not read the reachable-element list out of ${FOCUS_RING} or ${FOCUS_SCOPE}. Both are parsed on purpose: ` +
      `if you rewrite either selector, fix this line in the same change rather than dropping the pairing.`,
  );
} else {
  const ring = ringList[1].split(",").map((s) => s.trim()).sort();
  // A single-quoted entry legitimately contains the double quotes of
  // `[tabindex="-1"]`, so the outer quotes decide the boundary, not any quote.
  const scope = [...scopeList[1].matchAll(/'([^']*)'|"([^"]*)"/g)]
    .map((m) => (m[1] ?? m[2]).trim())
    .sort();
  const onlyRing = ring.filter((s) => !scope.includes(s));
  const onlyScope = scope.filter((s) => !ring.includes(s));
  if (onlyRing.length || onlyScope.length) {
    fail(
      "focusable-list",
      `${FOCUS_RING} and ${FOCUS_SCOPE} disagree about what is reachable — the ring paints [${onlyRing.join(", ")}], ` +
        `the trap walks to [${onlyScope.join(", ")}]. A stop you can Tab to with no focus indicator is a keyboard user with no idea where they are.`,
    );
  }
}

// ---------------------------------------------------------------------------
// 7. A handler attached after the factory is still a control.
// ---------------------------------------------------------------------------

const LATE_ONCLICK = /(?:^|[^\w$.])([A-Za-z_$][\w$]*)\.onclick\s*=\s*(?!=)/g;
const CONTROL_DIRS = ["src/widgets", "src/navigations", "src/components"];

/**
 * Elements that are deliberately not Tab stops, with the reason. An entry whose
 * assignment has gone fails the run: an exception nobody needs is a hole
 * somebody will widen.
 */
const ONCLICK_ALLOWLIST = {
  "src/widgets/Dropdown.js": {
    optionItem:
      "a listbox option is not a stop on the Tab path: the selector keeps focus, the arrows move the highlight and " +
      "aria-activedescendant names the row. Making every option a Tab stop walks a keyboard user through the whole list each time it opens.",
  },
};

const lateHits = new Map();
for (const file of CONTROL_DIRS.flatMap((d) => collectFiles(join(root, d))).map(toRel).sort()) {
  const src = clean.get(file) || "";
  const names = new Set();
  for (const m of src.matchAll(LATE_ONCLICK)) {
    if (m[1] === "widget") continue; // the engine's own object, never a widget
    names.add(m[1]);
  }
  if (names.size) lateHits.set(file, [...names]);
  for (const name of names) {
    if (ONCLICK_ALLOWLIST[file]?.[name]) continue;
    if (!new RegExp(`applyEffects\\(\\s*${name}\\s*\\)`).test(src)) {
      fail(
        "late-onclick",
        `${locate(file, new RegExp(`${name.replace(/\$/g, "\\$")}\\.onclick\\s*=`))} assigns a click after the factory returned, ` +
          `and nothing passes ${name} to applyEffects — so it has no role, no Tab stop and no Enter/Space: a mouse-only control. ` +
          `Give the handler as a prop, or call applyEffects so the engine runs its own pass, and name it with aria-label if it is an icon ` +
          `(an unnamed icon is aria-hidden decoration, and a control a reader is told to ignore is worse than either).`,
      );
    }
  }
}

for (const [file, byName] of Object.entries(ONCLICK_ALLOWLIST)) {
  const hits = new Set(lateHits.get(file) || []);
  for (const name of Object.keys(byName)) {
    if (!hits.has(name)) {
      fail("late-onclick", `${file} ${name} is allowlisted as a deliberate non-Tab-stop but no longer assigns onclick. The exception is stale — delete it, along with the reason beside it.`);
    }
  }
}

// ---------------------------------------------------------------------------
// 8. The composite-field marker is the one the ring reads.
// ---------------------------------------------------------------------------

const FIELD_MARKER = "data-fb-field";
if (!clean.has(INPUT) || !clean.get(INPUT).includes(FIELD_MARKER)) {
  fail("field-marker", `${INPUT} no longer marks its wrapper with "${FIELD_MARKER}", so the engine's field rule matches nothing and a focused field rings only its text box.`);
}
if (!clean.get(FOCUS_RING)?.includes(FIELD_MARKER)) {
  fail("field-marker", `${FOCUS_RING} no longer reads "${FIELD_MARKER}". The marker and the rule are one contract: rename it in both files or the ring silently stops painting the field.`);
}

// ---------------------------------------------------------------------------

const byRule = new Map();
for (const e of errors) byRule.set(e.rule, [...(byRule.get(e.rule) || []), e.message]);

console.log(`\nFletBox a11y contract — ${srcFiles.length} archivos · 8 reglas`);

if (byRule.size === 0) {
  console.log(
    `\n✔ el anillo sigue siendo del motor: nada lo apaga en línea, ${escapeFiles.length} overlays sostienen el Tab, ` +
      `y todo lo que se puede pulsar se puede alcanzar con el teclado.\n`,
  );
  process.exit(0);
}

for (const [rule, msgs] of byRule) {
  console.log(`\n${rule.toUpperCase()} (${msgs.length}):`);
  for (const m of msgs) console.log(`  · ${m}`);
}
console.log(
  "\n  A focus ring is a state, so it lives in a stylesheet. A press is a press, so it answers to Enter and Space.\n" +
    "  A panel that takes the keyboard gives it back. See src/utils/focusRing.js and docs/guides/accessibility.md.\n",
);
process.exit(1);
