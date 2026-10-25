/**
 * @file bin/commands/checkUi.js
 * @description `flet-box check-ui` — the clean-UI gate for a generated app.
 *
 * It reads the app's own `src/` and reports the design mistakes a static pass can
 * prove: a hand-typed color literal instead of a token, a size that is not on the
 * 8-based scale, a tap target below the Fitts floor, a form field with no label,
 * and text whose contrast against the fill it sits on is below WCAG AA. Every prop
 * name it uses comes from the installed package's own prop registry, so the
 * checker cannot invent an API while judging someone else's.
 *
 * What it deliberately does not judge: taste, hierarchy, and whether the screen
 * solves the user's problem. Those need a real person, and the skill file that
 * ships with the app says so instead of pretending otherwise.
 *
 *   flet-box check-ui                    scan ./src
 *   flet-box check-ui --root <dir>       scan another project
 *   flet-box check-ui --tokens           print the measured token contrast table
 *   flet-box check-ui --strict           contrast warnings fail too
 *   flet-box check-ui --json             machine-readable findings
 */

import fs from "fs";
import path from "path";
import { pathToFileURL } from "node:url";
import { loadApi, collectSources } from "./checkApi.js";
import { resolveInterfaceProps } from "../utils/dtsProps.js";
import { c, banner, section } from "../utils/colors.js";

/**
 * The 8-based rhythm, the radii and the Fitts floor. These are not this file's
 * opinion: they are the framework's own `src/tools/scale.js`, the same table the
 * widget defaults are drawn from. A gate that keeps its own copy drifts, and the
 * app then gets told to be clean by numbers the widgets it uses do not follow.
 */
export { SPACING_SCALE, RADIUS_SCALE, TYPE_SCALE, TAP_MINIMUM } from "../../src/tools/scale.js";
import { SPACING_SCALE, RADIUS_SCALE, TYPE_SCALE, TAP_MINIMUM } from "../../src/tools/scale.js";

/** WCAG 2.1: 4.5:1 for body text, 3:1 for large text and for non-text UI. */
export const CONTRAST_BODY = 4.5;
export const CONTRAST_LARGE = 3;
/** At or above this text size WCAG moves to the 3:1 threshold. */
export const LARGE_TEXT_SIZE = 24;

/** A run of text this long is a paragraph, and a paragraph never centers. */
export const BODY_TEXT_CHARS = 60;

/** The widest a block of body copy may run before the eye loses the next line. */
export const MEASURE_CHARS = 75;

const PRESS_KEYS = ["onPress", "onClick", "onclick", "onTap"];
const COLOR_FALLBACK_KEYS = new Set(["color", "textColor", "bgColor", "backgroundColor"]);
const FIELD_WIDGETS = ["Input", "Dropdown", "Slider", "Checkbox", "Radio", "Switch"];
const TOGGLE_WIDGETS = ["Switch", "Checkbox", "Radio"];
const LIST_WIDGETS = ["ListView", "GridView", "DataTable"];
const STATE_WIDGETS = ["Skeleton", "ProgressBar", "SnackBar", "AlertDialog", "Modal"];
const ICON_WIDGETS = ["Icon", "IconButton"];
const TEXT_KEYS = ["text", "value", "label", "message", "title"];

/**
 * Copy that says nothing about what pressing the button does. "Cancel" is absent
 * on purpose: on a destructive dialog it is the one correct word.
 */
const GENERIC_LABELS = new Set(["ok", "yes", "submit", "confirm", "continue", "click here", "go"]);

/** The verbs that destroy something, and so get the danger color and the second thought. */
const DESTRUCTIVE_LABELS = /\b(delete|remove|erase|discard|unsubscribe|cancel account|wipe)\b/i;
const CANCEL_LABELS = /^(cancel|back|keep|no,? thanks|not now|go back)$/i;

/** Keys whose value is children/data, not a value a scale can judge. */
const SKIP_VALUE_KEYS = new Set([
  "children",
  "child",
  "content",
  "items",
  "actions",
  "columns",
  "rows",
  "data",
  "builder",
  "widgetName",
  "style",
]);

export const ERROR_CODES = new Set([
  "RAW_COLOR",
  "OFF_SCALE_SPACING",
  "OFF_SCALE_RADIUS",
  "OFF_SCALE_TYPE",
  "SMALL_TAP_TARGET",
  "LOW_CONTRAST",
  "UNLABELED_FIELD",
  "UNLABELED_TOGGLE",
  "DESTRUCTIVE_COLOR",
  "UNREADABLE",
]);

export const WARN_CODES = new Set([
  "LOW_CONTRAST_SOFT",
  "LOW_CONTRAST_UI",
  "LOW_CONTRAST_ON_SURFACE",
  "HAND_MIXED_COLOR",
  "DEAD_ELEVATION",
  "IMAGE_NO_ALT",
  "ICON_ONLY_CONTROL",
  "CENTERED_BODY_TEXT",
  "GENERIC_ACTION_LABEL",
  "CONFIRM_ORDER",
  "UNCONSTRAINED_FORM_WIDTH",
]);

export const INFO_CODES = new Set([
  "SMALL_PRESET",
  "CROWDED_FORM",
  "LIST_WITHOUT_STATE",
  "MULTIPLE_PRIMARY_ACTIONS",
]);

/**
 * Which design rule each code proves, and the number the finding prints.
 *
 * The gate is the machine half of a contract whose human half is
 * `skills/fletbox-design/SKILL.md`: 25 numbered rules, read by the agent that
 * builds the screen. A finding that says `OFF_SCALE_SPACING` tells the reader the
 * value is wrong; a finding that says `OFF_SCALE_SPACING — rule 07` tells them to
 * open rule 07 and learn *why*, which is the only way the next screen is right
 * without being told twice. `scripts/check-skills.mjs` fails if a code is missing
 * here, if a number here is not a heading in the skill, or if the skill does not
 * name that code inside the rule it is filed under — so this table and that file
 * cannot drift apart.
 */
export const CODE_RULE = {
  RAW_COLOR: "03",
  OFF_SCALE_SPACING: "07",
  OFF_SCALE_RADIUS: "03",
  OFF_SCALE_TYPE: "08",
  SMALL_TAP_TARGET: "03",
  LOW_CONTRAST: "11",
  UNLABELED_FIELD: "13",
  UNLABELED_TOGGLE: "11",
  DESTRUCTIVE_COLOR: "14",
  UNREADABLE: "00",
  LOW_CONTRAST_SOFT: "11",
  LOW_CONTRAST_UI: "11",
  LOW_CONTRAST_ON_SURFACE: "11",
  HAND_MIXED_COLOR: "03",
  DEAD_ELEVATION: "10",
  IMAGE_NO_ALT: "11",
  ICON_ONLY_CONTROL: "11",
  CENTERED_BODY_TEXT: "08",
  GENERIC_ACTION_LABEL: "14",
  CONFIRM_ORDER: "14",
  UNCONSTRAINED_FORM_WIDTH: "13",
  SMALL_PRESET: "03",
  CROWDED_FORM: "06",
  LIST_WITHOUT_STATE: "12",
  MULTIPLE_PRIMARY_ACTIONS: "04",
};

/**
 * The legal home for a hex value is the app's own token file. Anything else in
 * `src/` that types a color by hand is the drift this rule exists to catch.
 *
 * @param {string} file
 * @returns {boolean}
 */
export const isTokenFile = (file) =>
  /^(themes?|colors|palette)\.m?js$/.test(path.basename(file));

/**
 * The light palette an app declares in its own token file. That is what the
 * screen actually paints with, so it is what a contrast rule must measure — the
 * package palette is only the default the app did not override. An app may name
 * its themes (`lightColors`, `darkColors`) instead of shadowing `colors`, so the
 * literal is chosen by name: the light theme is the one a bare `colors.text`
 * resolves to on a light page.
 *
 * @param {string} file a token file
 * @returns {Record<string, string>} the hex literals it declares
 */
export const appPalette = (file) => {
  const src = fs.readFileSync(file, "utf8");
  const literals = [];
  for (const start of src.matchAll(
    /(?:export\s+)?(?:let|const|var)\s+([A-Za-z0-9_]+)\s*=\s*\{/g,
  )) {
    const from = start.index + start[0].length - 1;
    let depth = 0;
    for (let i = from; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") {
        depth--;
        if (depth === 0) {
          literals.push({ name: start[1], body: src.slice(from, i + 1) });
          break;
        }
      }
    }
  }
  // The palette a bare `colors.text` resolves to is the one a contrast rule must
  // measure. Apps name their themes (`lightColors`, `darkColors`) rather than
  // shadowing `colors`, so the choice is by name, not by declaration order.
  const rank = (name) =>
    /^colors$/i.test(name)
      ? 0
      : /light|day|default/i.test(name)
        ? 1
        : /dark|night/i.test(name)
          ? 3
          : 2;
  const chosen = literals
    .filter((entry) => entry.body.includes("#"))
    .sort((a, b) => rank(a.name) - rank(b.name))[0];
  if (!chosen) return {};
  const found = {};
  for (const match of chosen.body.matchAll(
    /([A-Za-z0-9_]+)\s*:\s*(['"])#([0-9a-fA-F]{3,8})\2/g,
  )) {
    found[match[1]] = `#${match[3]}`;
  }
  return found;
};

const isQuote = (ch) => ch === '"' || ch === "'" || ch === "`";

/**
 * Index just past a string or template literal that starts at `start`.
 *
 * @param {string} src
 * @param {number} start index of the opening quote
 * @returns {number}
 */
const skipString = (src, start) => {
  const quote = src[start];
  let i = start + 1;
  while (i < src.length) {
    if (src[i] === "\\") i += 2;
    else if (src[i] === quote) return i + 1;
    else i++;
  }
  return i;
};

/**
 * Blank out comments while keeping every character offset, so a `// padding: 13`
 * note never becomes a finding and line numbers still match the real file.
 *
 * @param {string} src
 * @returns {string}
 */
export const blankComments = (src) => {
  const out = src.split("");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "/" && src[i + 1] === "/") {
      let j = i;
      while (j < src.length && src[j] !== "\n") out[j++] = " ";
      i = j - 1;
    } else if (ch === "/" && src[i + 1] === "*") {
      let j = i;
      while (j < src.length && !(src[j] === "*" && src[j + 1] === "/")) {
        if (src[j] !== "\n") out[j] = " ";
        j++;
      }
      if (j < src.length) out[j] = " ";
      if (j + 1 < src.length) out[j + 1] = " ";
      i = j + 1;
    } else if (isQuote(ch)) {
      i = skipString(src, i) - 1;
    }
  }
  return out.join("");
};

/**
 * The byte ranges that are string or template text. A widget call written inside
 * one is documentation, not a call the screen makes: every example file ships the
 * same call twice on purpose — once built, once as the `code:` line the reader
 * copies — and reporting both prints one finding per pixel and half the list.
 *
 * @param {string} code comment-free source
 * @returns {Array<[number, number]>}
 */
const stringSpans = (code) => {
  const spans = [];
  for (let i = 0; i < code.length; i++) {
    if (!isQuote(code[i])) continue;
    const end = skipString(code, i);
    spans.push([i, end]);
    i = end - 1;
  }
  return spans;
};

/**
 * Find every `Widget({ … })` call, nested ones included.
 *
 * @param {string} code comment-free source
 * @returns {Array<{name: string, open: number, close: number}>}
 */
export const findCalls = (code) => {
  const calls = [];
  const spans = stringSpans(code);
  const inText = (index) => spans.some(([start, end]) => index > start && index < end);
  const ident = /[A-Za-z_$][\w$]*[ \t]*\([ \t]*\{/g;
  let match;
  while ((match = ident.exec(code))) {
    if (inText(match.index)) continue;
    const name = match[0].slice(0, match[0].indexOf("(")).trim();
    if (!/^[A-Z]/.test(name)) continue;
    const open = match.index + match[0].length - 1;
    let depth = 0;
    let close = -1;
    for (let i = open; i < code.length; i++) {
      const ch = code[i];
      if (isQuote(ch)) {
        i = skipString(code, i) - 1;
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    if (close === -1) continue;
    calls.push({ name, open, close });
    ident.lastIndex = open + 1;
  }
  return calls;
};

/**
 * Top-level `key: value` pairs of an object literal, with absolute offsets.
 *
 * @param {string} code comment-free source
 * @param {number} open index of the opening brace
 * @param {number} close index of the matching brace
 * @returns {Array<{key: string, value: string, valueStart: number}>}
 */
export const entriesOf = (code, open, close) => {
  const pieces = [];
  let depth = 0;
  let start = open + 1;
  for (let i = open; i <= close; i++) {
    const ch = code[i];
    if (isQuote(ch)) {
      i = skipString(code, i) - 1;
      continue;
    }
    if (ch === "{" || ch === "[" || ch === "(") {
      depth++;
      continue;
    }
    if (ch === "}" || ch === "]" || ch === ")") {
      depth--;
      if (depth === 0) {
        if (i === close) pieces.push([start, i]);
        continue;
      }
      continue;
    }
    if (depth === 1 && ch === ",") {
      pieces.push([start, i]);
      start = i + 1;
    }
  }

  const entries = [];
  for (const [from, to] of pieces) {
    const piece = code.slice(from, to);
    // Keys are almost always on their own line in a real screen, so the leading
    // and trailing whitespace here has to cross newlines.
    const keyMatch =
      /^[ \t\r\n]*(?:\.\.\.)?[ \t\r\n]*((?:[A-Za-z_$][\w$]*)|(?:['"][^'"]*['"]))[ \t\r\n]*:/.exec(
        piece,
      );
    if (!keyMatch) continue;
    const valueStart = from + keyMatch[0].length;
    entries.push({
      key: keyMatch[1].replace(/^['"]|['"]$/g, ""),
      value: code.slice(valueStart, to),
      valueStart,
    });
  }
  return entries;
};

/**
 * Numeric literals written in a value, skipping the ones inside strings. This is
 * a lexical scan, not an evaluation: use `measuredNumbers` before judging a
 * value against a scale, or `base * 1.5` is read as a 1.5 size.
 *
 * @param {string} value
 * @returns {Array<{number: number, offset: number}>}
 */
export const numbersIn = (value) => {
  const found = [];
  const code = blankComments(value);
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (isQuote(ch)) {
      i = skipString(code, i) - 1;
      continue;
    }
    if (!/[-0-9.]/.test(ch)) continue;
    const m = /^-?\d+(?:\.\d+)?/.exec(code.slice(i));
    if (!m) continue;
    const before = i > 0 ? code[i - 1] : "";
    if (/[\w$.]/.test(before)) continue;
    found.push({ number: Number(m[0]), offset: i });
    i += m[0].length - 1;
  }
  return found;
};

/**
 * Tokenise an arithmetic expression made only of number literals operators and
 * parentheses. Anything else — an identifier, a member access, a call, a
 * ternary, an object or array — returns null, because its value is decided at
 * runtime and a static pass that guessed it would report a number the screen
 * never paints.
 *
 * @param {string} text
 * @returns {Array<{type: string, value?: number}> | null}
 */
const arithmeticTokens = (text) => {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(text[i + 1] ?? ""))) {
      const match = /^\d*\.?\d+(?:[eE][+-]?\d+)?/.exec(text.slice(i));
      tokens.push({ type: "number", value: Number(match[0]) });
      i += match[0].length;
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) return null;
    if ("+-*/%()".includes(ch)) {
      tokens.push({ type: ch });
      i++;
      continue;
    }
    return null;
  }
  return tokens;
};

/**
 * Evaluate a token list by recursive descent. Null means "not provable", which
 * is never the same answer as "off the scale".
 *
 * @param {Array<{type: string, value?: number}>} tokens
 * @returns {number | null}
 */
const foldArithmetic = (tokens) => {
  let i = 0;
  const bad = () => {
    throw new Error("unmeasurable");
  };
  const primary = () => {
    const token = tokens[i++];
    if (!token) bad();
    if (token.type === "number") return token.value;
    if (token.type === "(") {
      const value = expression();
      if (tokens[i++]?.type !== ")") bad();
      return value;
    }
    return bad();
  };
  const unary = () => {
    if (tokens[i]?.type === "-") {
      i++;
      return -unary();
    }
    if (tokens[i]?.type === "+") {
      i++;
      return unary();
    }
    return primary();
  };
  const term = () => {
    let value = unary();
    while (["*", "/", "%"].includes(tokens[i]?.type)) {
      const op = tokens[i++].type;
      const right = unary();
      if (op === "*") value *= right;
      else if (right === 0) bad();
      else value = op === "/" ? value / right : value % right;
    }
    return value;
  };
  const expression = () => {
    let value = term();
    while (["+", "-"].includes(tokens[i]?.type)) {
      const op = tokens[i++].type;
      value = op === "+" ? value + term() : value - term();
    }
    return value;
  };
  try {
    if (!tokens.length) return null;
    const value = expression();
    if (i !== tokens.length || !Number.isFinite(value)) return null;
    return value;
  } catch {
    return null;
  }
};

/**
 * The numbers a prop value provably paints, and whether the pass can say at all.
 *
 * A value is measured when it is a literal (`24`), arithmetic over literals
 * (`8 * 3`), a quoted pixel shorthand (`"12px 20px"`), or any other literal
 * string (a preset name has no numbers and is therefore on no scale to break).
 * It is unmeasured when its value depends on an identifier, a ternary, a call or
 * a member access — `size: base * 1.5`, `sz.h - 8`, `padding: size > 20 ? … : 0`.
 * The distinction is the point: a lexical scan reads the `1.5` inside
 * `base * 1.5` as the size and reports a value the screen never renders.
 *
 * @param {string} value raw prop value
 * @returns {{measured: boolean, numbers: number[]}}
 */
export const measuredNumbers = (value) => {
  const text = value.trim();
  if (!text) return { measured: true, numbers: [] };
  const quote = text[0];
  if (isQuote(quote)) {
    const end = skipString(text, 0);
    if (end !== text.length) return { measured: false, numbers: [] };
    const body = text.slice(1, end - 1);
    if (/\\|\$\{/.test(body)) return { measured: false, numbers: [] };
    if (/\b(?:var|calc|clamp|min|max|rgb|rgba|hsl|hsla)\s*\(|%/.test(body)) {
      return { measured: false, numbers: [] };
    }
    const numbers = [...body.matchAll(/-?\d+(?:\.\d+)?px|\b0\b/g)].map((match) =>
      match[0].endsWith("px") ? Number(match[0].slice(0, -2)) : 0,
    );
    return { measured: true, numbers };
  }
  const tokens = arithmeticTokens(text);
  if (!tokens) return { measured: false, numbers: [] };
  const folded = foldArithmetic(tokens);
  if (folded === null) return { measured: false, numbers: [] };
  return { measured: true, numbers: [folded] };
};

/**
 * `#rgb`/`#rrggbb`/`#rrggbbaa` or a functional color typed as a literal.
 *
 * @param {string} value raw prop value
 * @returns {string | null} the offending text, or null when it is a token
 */
export const colorLiteralIn = (value) => {
  const hex = /(['"])#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\1/.exec(
    value,
  );
  if (hex) return hex[0];
  const fn = /\b(?:rgb|rgba|hsl|hsla)\s*\(/.exec(blankComments(value));
  return fn ? `${fn[0].replace(/\s+$/, "")}…` : null;
};

/**
 * Resolve a value that names a color into something `color()` can read.
 *
 * @param {string} value raw prop value
 * @param {Record<string, string>} tokens the package `colors` object
 * @returns {string | null} a hex string, or null when the value is not provable
 */
export const resolveColor = (value, tokens) => {
  const text = value.trim();
  const token = /^colors\.([A-Za-z0-9_]+)$/.exec(text);
  if (token) return tokens[token[1]] ?? null;
  const literal = /^(['"])#([0-9a-fA-F]{3,8})\1$/.exec(text);
  if (literal) return `#${literal[2]}`;
  return null;
};

const lineOffsets = (src) => {
  const offsets = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === "\n") offsets.push(i + 1);
  return offsets;
};

const lineOf = (offsets, index) => {
  let lo = 0;
  let hi = offsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (offsets[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
};

/**
 * Is this text large enough that WCAG relaxes 4.5:1 to 3:1? 24px, or 18px and
 * bold (the standard's 18pt / 14pt-bold line, in the pixels this scale uses).
 *
 * @param {Map<string, {value: string}>} props
 * @returns {boolean}
 */
const isLargeText = (props) => {
  let size = null;
  for (const key of ["fontSize", "size"]) {
    const numbers = numbersIn(props.get(key)?.value ?? "");
    if (numbers.length === 1) size = numbers[0].number;
  }
  if (size === null) return false;
  if (size >= LARGE_TEXT_SIZE) return true;
  return size >= 18 && /bold|['"]?(600|700)['"]?/.test(props.get("weight")?.value ?? "");
};

/** The props that paint the plate a label sits on, in the order they win. */
const FILL_KEYS = ["bgColor", "backgroundColor", "gradient"];

/** The first colour a gradient string names — the stop the words sit on. */
const gradientStop = (value, tokens) => {
  const token = /colors\.([A-Za-z0-9_]+)/.exec(value);
  if (token) return tokens[token[1]] ?? null;
  const hex = /#([0-9a-fA-F]{3,8})/.exec(value);
  return hex ? `#${hex[1]}` : null;
};

const fillOf = (props, tokens) => {
  for (const key of FILL_KEYS) {
    const entry = props.get(key);
    if (!entry) continue;
    const resolved =
      key === "gradient"
        ? gradientStop(entry.value, tokens)
        : resolveColor(entry.value, tokens);
    if (resolved) return resolved;
  }
  return null;
};

/**
 * Does this call say it paints a plate, whether or not this pass can name the
 * colour? A `backgroundColor` fed by a parameter is a fill the reader sees and
 * the checker cannot resolve, and measuring its text against the page would
 * report a surface that is never painted.
 */
const declaresFill = (props) => FILL_KEYS.some((key) => props.has(key));

/**
 * Widgets whose `color` is an accent, not a sentence: the implementation reads it
 * into a background, a track, a tint or an indicator, so the number that matters
 * is what the words written *on* it measure, not what the colour measures on the
 * page. Measuring it as ink reported `Chip({ label: "info", color: colors.info })`
 * as 3.52:1 text no reader ever sees — the chip's label is `colors.onPrimary`.
 *
 * Each entry cites the line that turns the prop into a fill, and says which token
 * writes on it (`null` = nothing does). The literal is what `resolveColor` gets,
 * so the finding still names a real hex.
 */
const ACCENTS = {
  // Slider.js:171 `backgroundColor: color` — the track and thumb, no words on it.
  Slider: { when: () => true, ink: () => null },
  // ProgressBar.js:39 `backgroundColor: color` — the bar; its label is
  // `colors.textSecondary` painted outside it (:99).
  ProgressBar: { when: () => true, ink: () => null },
  // Tabs.js:111/231 the indicator and the `${color}1A` pill tint; the active label
  // is `colors.text` (:107) unless the slider variant puts it on the thumb itself.
  Tabs: { when: () => true, ink: (props) => (variantOf(props) === "slider" ? "onPrimary" : null) },
  // Pagination.js:88-89 the active page is `bgColor: color` with `colors.onPrimary`.
  Pagination: { when: () => true, ink: () => "onPrimary" },
  // Chip.js:70-78 filled paints the plate and writes `colors.onPrimary` on it;
  // outlined paints nothing and uses `color` *as the label*, so that one stays an
  // ordinary ink measurement and its 3.52:1 blue on a light page is reported.
  Chip: { when: (props) => variantOf(props) !== "outlined", ink: () => "onPrimary" },
};

const variantOf = (props) => (props.get("variant")?.value ?? "").replace(/['"]/g, "").trim();

/**
 * Contrast between a text color and the fill it is written on, measured with the
 * package's own `color()` — WCAG 2.1 relative luminance, not an opinion.
 *
 * The fill is the call's own `bgColor`/`backgroundColor`/`gradient`, else the
 * nearest enclosing call that paints one (so a label inside a brand header is
 * judged on the brand). When nothing paints a plate, the two surfaces a screen
 * uses are both tested, because the real background is a layout fact this pass
 * cannot see.
 *
 * Every number is measured once per theme the package ships. `colors` is the
 * object the module boots with, and a token can clear AA in one theme and fail
 * in the other — `info` is 3.52:1 on the light surface and 6.97:1 on the dark
 * one — so the worst theme is what gets reported, and a token only the boot
 * palette dislikes stops generating findings nobody can reproduce.
 *
 * @param {string} widget
 * @param {Map<string, {value: string}>} props
 * @param {Map<string, {value: string}> | null} scopeProps nearest enclosing call that declares a fill
 * @param {object} ctx
 * @param {number} line
 * @returns {object | null}
 */
const checkContrast = (widget, props, scopeProps, ctx, line) => {
  if (!ctx.contrast) return null;
  let fgEntry = props.get("color") || props.get("textColor");
  if (!fgEntry) return null;
  if ((props.get("disabled")?.value ?? "").trim() === "true") return null;

  // An accent call is measured the other way round: the plate is `color` and the
  // words are the theme's own ink, so `colors.onPrimary` on a pale brand fill is
  // the finding worth printing and the colour on the page is not a sentence.
  let accent = null;
  const accentRule = ACCENTS[widget];
  const accentEntry =
    accentRule && accentRule.when(props) && !declaresFill(props) ? props.get("color") : null;
  if (accentEntry) {
    const inkToken = accentRule.ink(props);
    if (!inkToken) return null;
    accent = accentEntry;
    fgEntry = { value: `colors.${inkToken}` };
  }

  const graphic = ICON_WIDGETS.includes(widget);
  const minimum = graphic
    ? CONTRAST_LARGE
    : isLargeText(props)
      ? CONTRAST_LARGE
      : CONTRAST_BODY;

  const fillProps = declaresFill(props) ? props : scopeProps;
  const themes = ctx.themes ?? [{ name: "default", tokens: ctx.tokens }];

  /** The theme whose answer is hardest to read, plus the numbers to print. */
  let worst = null;
  for (const theme of themes) {
    const fg = resolveColor(fgEntry.value, theme.tokens);
    if (!fg) continue;
    if (accent) {
      const bg = resolveColor(accent.value, theme.tokens);
      if (!bg) continue;
      const ratio = ctx.contrast(fg, bg);
      if (!worst || ratio < worst.ratio) worst = { ratio, fg, bg, theme: theme.name };
      continue;
    }
    if (fillProps) {
      const bg = fillOf(fillProps, theme.tokens);
      if (!bg) continue;
      const ratio = ctx.contrast(fg, bg);
      if (!worst || ratio < worst.ratio) worst = { ratio, fg, bg, theme: theme.name };
      continue;
    }
    const onBackground = ctx.contrast(fg, theme.tokens.background);
    const onSurface = ctx.contrast(fg, theme.tokens.surface);
    const ratio = Math.min(onBackground, onSurface);
    if (!worst || ratio < worst.ratio) {
      worst = { ratio, fg, onBackground, onSurface, theme: theme.name };
    }
  }
  // A fill is declared but no theme can name it (a parameter, a runtime
  // gradient): those words are on that plate, not on the page.
  if (!worst) return null;

  const fg = worst.fg;
  const bg = worst.bg ?? null;
  const inTheme = worst.theme === "default" ? "" : ` in the ${worst.theme} theme`;

  // The plate came from the accent prop, so the advice is about the plate: the
  // widget picks the ink itself and the app never wrote it.
  if (accent) {
    const ratio = worst.ratio;
    if (ratio + 1e-9 >= minimum) return null;
    return finding(
      ctx,
      line,
      ratio < CONTRAST_LARGE ? "LOW_CONTRAST" : "LOW_CONTRAST_SOFT",
      `${widget} writes ${fg} on its \`color\` plate, ${bg}, and it measures ${ratio.toFixed(2)}:1${inTheme} (needs ${minimum}:1).`,
      `The label is not yours to recolor — \`${widget}\` paints the theme's own ink on the accent you passed. Pick an accent that carries it: \`colors.primary\` does, and a signal tone like \`colors.info\` (#3b82f6, 3.68:1) is too light. \`flet-box check-ui --tokens\` prints the number for each.`,
    );
  }

  if (bg) {
    const ratio = worst.ratio;
    if (ratio + 1e-9 >= minimum) return null;
    if (ratio < CONTRAST_LARGE) {
      return finding(
        ctx,
        line,
        graphic ? "LOW_CONTRAST_UI" : "LOW_CONTRAST",
        `${widget} ${fg} on ${bg} measures ${ratio.toFixed(2)}:1${inTheme} — ${graphic ? "a meaningful graphic needs" : "text needs"} ${minimum}:1.`,
        graphic
          ? "An icon that carries information is UI, not decoration: 3:1. Darken it (`colors.gray700`) or put it on a fill that carries it."
          : "Below 3:1 no size makes it readable. Use `colors.text` on this fill, or move the text to `background`/`surface`.",
      );
    }
    return finding(
      ctx,
      line,
      "LOW_CONTRAST_SOFT",
      `${widget} text ${fg} on ${bg} measures ${ratio.toFixed(2)}:1${inTheme} (AA body text is ${minimum}:1).`,
      "Legal only as large text: 24px, or 18px bold. Small body text on this fill needs a darker token.",
    );
  }

  // No fill this pass can name: warn against the surfaces of the worst theme.
  const { onBackground, onSurface } = worst;
  if (onBackground >= minimum && onSurface >= minimum) return null;
  return finding(
    ctx,
    line,
    graphic ? "LOW_CONTRAST_UI" : "LOW_CONTRAST_ON_SURFACE",
    `${widget} ${fg} measures ${onBackground.toFixed(2)}:1 on \`background\` and ${onSurface.toFixed(2)}:1 on \`surface\`${inTheme} (needs ${minimum}:1).`,
    graphic
      ? "A graphic that carries meaning needs 3:1 against the page. If it is decoration next to a label, ignore this one."
      : `Body text needs ${minimum}:1. If this sits on a brand or dark fill, give the call that \`bgColor\` — or the fill is inherited and this is the number to beat.`,
  );
};


const finding = (ctx, line, code, message, detail) => ({
  file: ctx.currentFile,
  line,
  code,
  message,
  detail,
});

/**
 * @param {string} file
 * @param {object} ctx resolved package data
 * @returns {object[]} findings
 */
/**
 * Is the `{` at `brace` a function body? Looks back over the parameter list and
 * asks what closes it: `function`, an arrow, or a method name. Control blocks
 * (`if`, `for`, `switch`, `catch`, `try`, `else`) and object literals — including
 * a widget's own `Widget({ … })` — are not function bodies.
 *
 * @param {string} code
 * @param {number} brace index of `{`
 * @returns {boolean}
 */
const opensFunction = (code, brace) => {
  let i = brace - 1;
  let depth = 0;
  while (i >= 0) {
    const ch = code[i];
    if (ch === ")" || ch === "]") depth++;
    else if (ch === "(" || ch === "[") {
      if (depth === 0) break;
      depth--;
    } else if (depth === 0 && (ch === ";" || ch === "{" || ch === "}" || ch === "\n")) {
      break;
    }
    i--;
  }
  const head = code.slice(i + 1, brace).trim();
  if (/^(?:async\s+)?function\b/.test(head)) return true;
  if (/(?:^|[\s;}])(?:async\s+)?(?:\([^]*?\)|[A-Za-z_$][\w$]*)\s*=>$/.test(head)) return true;
  const method = /^([A-Za-z_$][\w$]*)\s*\([^]*\)$/.exec(head);
  return Boolean(
    method &&
      !["if", "for", "while", "switch", "catch", "with", "do", "else", "try"].includes(
        method[1],
      ),
  );
};

/**
 * The brace range of every function body in a file.
 *
 * @param {string} code
 * @returns {Array<[number, number]>} `[open, close]` pairs
 */
export const functionBodies = (code) => {
  const bodies = [];
  const open = [];
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (isQuote(ch)) {
      i = skipString(code, i) - 1;
      continue;
    }
    if (ch === "{") {
      open.push(i);
      continue;
    }
    if (ch !== "}") continue;
    const start = open.pop();
    if (start !== undefined && opensFunction(code, start)) bodies.push([start, i]);
  }
  return bodies;
};

const checkFile = (file, ctx) => {
  const findings = [];
  const src = fs.readFileSync(file, "utf8");
  const code = blankComments(src);
  const offsets = lineOffsets(src);
  const tokenFile = isTokenFile(file);
  const push = (line, codeName, message, detail) =>
    findings.push(finding(ctx, line, codeName, message, detail));

  let fieldCount = 0;
  let destructiveButtons = 0;
  let sawList = false;
  let sawState = false;

  const calls = findCalls(code).map((call) => {
    const props = new Map();
    for (const entry of entriesOf(code, call.open, call.close)) {
      if (!props.has(entry.key)) props.set(entry.key, entry);
    }
    return { ...call, props };
  });
  const bodies = functionBodies(code);

  /**
   * The nearest enclosing call that says it paints a plate. Its props are handed
   * to the contrast rule, which resolves the colour per theme — the call itself
   * is what matters, since a fill this pass cannot name still means the text is
   * not sitting on the page.
   */
  const inheritedFillProps = (call) => {
    for (const other of enclosing(call)) {
      if (declaresFill(other.props)) return other.props;
    }
    return null;
  };

  /** Every call this one sits inside, nearest first. */
  const enclosing = (call) =>
    calls
      .filter(
        (other) => other !== call && other.open < call.open && other.close > call.close,
      )
      .sort((a, b) => b.open - a.open);

  const parentOf = (call) => enclosing(call)[0] ?? null;

  const childrenOf = (parent) =>
    calls.filter((other) => other !== parent && parentOf(other) === parent);

  const descendantsOf = (parent) =>
    calls.filter(
      (other) => other !== parent && other.open > parent.open && other.close < parent.close,
    );

  /**
   * The words a call displays, when they are a literal in the source. A computed
   * label is not something a copy rule may judge, so it answers null.
   */
  const literalText = (call) => {
    for (const key of TEXT_KEYS) {
      const entry = call.props.get(key);
      if (!entry) continue;
      const match = /^['"`]([\s\S]*)['"`]$/.exec(entry.value.trim());
      return match ? match[1] : null;
    }
    return null;
  };

  /** A `Text` sibling with words in it: the label of a toggle or of an icon button. */
  const labeledBySibling = (call) => {
    const parent = parentOf(call);
    if (!parent) return false;
    return childrenOf(parent).some(
      (other) => other !== call && other.name === "Text" && (literalText(other) ?? "") !== "",
    );
  };

  /**
   * A glyph control that carries its own accessible name is named, even when this
   * pass cannot see the wrapper: an app that builds the control inside a helper
   * and names the *result* at the call site has a `child: iconButton("share")` at
   * the call site, and a lexical scan stops at the helper's own braces. `aria-*` is
   * a routed passthrough (translateProps.js:948), so the name really does reach the
   * DOM — which is the sentence the finding asks for.
   *
   * A `Tooltip` is deliberately not on this list. It points `aria-describedby` at
   * the bubble, and a description is not a name: a screen reader still announces
   * "button" with no word for what it does.
   */
  const namedByAria = (call) =>
    [...call.props.keys()].some((key) => /^aria-(label|labelledby)$/i.test(key));

  const isFilled = (call) => {
    if (call.name !== "Button") return false;
    const variant = call.props.get("variant")?.value.trim();
    if (variant === undefined) return true;
    return /^(['"`])filled\1$/.test(variant);
  };

  /** A width that caps the block: a number or a percentage below full bleed. */
  const capsWidth = (call) => {
    const max = call.props.get("maxWidth");
    if (max) return true;
    const width = call.props.get("width");
    if (!width) return false;
    return !/['"]?100%|['"]?\d{4,}|stretch/.test(width.value);
  };

  for (const call of calls) {
    const props = call.props;
    const line = lineOf(offsets, call.open);
    const tappable = PRESS_KEYS.some((key) => props.has(key));

    if (STATE_WIDGETS.includes(call.name)) sawState = true;
    if (LIST_WIDGETS.includes(call.name)) sawList = true;
    if (FIELD_WIDGETS.includes(call.name)) fieldCount++;

    for (const [key, entry] of props) {
      if (SKIP_VALUE_KEYS.has(key)) continue;
      const kind = ctx.propKinds.get(key);
      const valueLine = lineOf(offsets, entry.valueStart);
      const measured = measuredNumbers(entry.value);
      const numbers = measured.numbers;

      if (kind === "color" || COLOR_FALLBACK_KEYS.has(key)) {
        const literal = colorLiteralIn(entry.value);
        if (literal && !tokenFile) {
          push(
            valueLine,
            "RAW_COLOR",
            `${call.name} sets \`${key}\` to the literal ${literal}.`,
            "Color comes from a token (`colors.text`, `colors.primary`). A typed hex is the first sign a screen drifted from the rest; if a token is missing, add it to src/database/themes.js.",
          );
        } else if (/colors\.[A-Za-z0-9_]+\s*\+\s*['"][0-9a-fA-F]{2}['"]/.test(entry.value)) {
          push(
            valueLine,
            "HAND_MIXED_COLOR",
            `${call.name} builds a color by appending alpha to a token (${entry.value.trim().slice(0, 40)}).`,
            "That is a one-off shade the rest of the app cannot reuse. `colors.primaryBg`, `colors.errorBg` and friends are the tints; add a token if the one you need is missing.",
          );
        }
      }

      if (kind === "spacing") {
        for (const n of numbers) {
          if (SPACING_SCALE.has(Math.abs(n))) continue;
          push(
            valueLine,
            "OFF_SCALE_SPACING",
            `${call.name}.${key} = ${n} is not on the spacing scale.`,
            "Use 4 · 8 · 12 · 16 · 18 · 24 · 32 · 40 · 48 · 64 · 96. The scale is what makes two screens look like one app.",
          );
        }
        // A CSS shorthand still has to obey the scale: `padding: '12px 20px'` is
        // the same mistake with a unit glued on, and `measuredNumbers` already
        // read it — an unmeasurable one (`calc`, `var`, a percentage) reports no
        // numbers instead of the literals it happens to contain.
      } else if (kind === "radius") {
        for (const n of numbers) {
          if (RADIUS_SCALE.has(Math.abs(n))) continue;
          push(
            valueLine,
            "OFF_SCALE_RADIUS",
            `${call.name}.${key} = ${n} is not a scale radius.`,
            "Use 4 · 8 · 12 · 16 · 20 · 24 · 999 (a pill). A radius between them is a shape no other card in this app has.",
          );
        }
      } else if (kind === "type" && (key === "fontSize" || call.name === "Text")) {
        for (const n of numbers) {
          if (TYPE_SCALE.has(Math.abs(n))) continue;
          push(
            valueLine,
            "OFF_SCALE_TYPE",
            `${call.name}.${key} = ${n} is not a scale type size.`,
            "12 caption · 14 body-small · 16 body · 18 subtitle · 24 title · 32 headline · 40/48 display. One size per element, one weight per role.",
          );
        }
      }

      if (tappable && (key === "height" || key === "minHeight")) {
        for (const n of numbers) {
          if (n <= 0 || n >= TAP_MINIMUM) continue;
          push(
            valueLine,
            "SMALL_TAP_TARGET",
            `${call.name} is pressable but only ${n}px tall.`,
            `Fitts: a finger needs ${TAP_MINIMUM}x${TAP_MINIMUM}. Get there with \`height\`, not with padding.`,
          );
        }
      }

      if (tappable && ICON_WIDGETS.includes(call.name) && key === "size") {
        // A glyph's target is its box, not its font size: `size: 16, padding: 12`
        // is 40x40 and legal, while `size: 16` alone is the glyph and nothing else.
        // A padding this pass cannot resolve makes the target unmeasured.
        const padded = props.has("paddingVertical")
          ? measuredNumbers(props.get("paddingVertical").value)
          : props.has("padding")
            ? measuredNumbers(props.get("padding").value)
            : { measured: true, numbers: [0] };
        const vertical = padded.measured ? Math.abs(padded.numbers[0] ?? 0) : null;
        for (const n of numbers) {
          if (vertical === null) break;
          const target = n + vertical * 2;
          if (target >= TAP_MINIMUM || props.has("height") || props.has("minHeight")) break;
          push(
            valueLine,
            "SMALL_TAP_TARGET",
            `${call.name} is pressable at size ${n}${
              vertical ? ` with ${vertical} of padding` : ""
            }, so its whole target is ${target}px.`,
            `Wrap it in the ${TAP_MINIMUM}px box it needs, or use \`Button({ icon, onPress })\` and keep the glyph at 20.`,
          );
        }
      }

      if (
        tappable &&
        key === "size" &&
        /(['"])small\1/.test(entry.value) &&
        !props.has("height") &&
        !props.has("minHeight")
      ) {
        push(
          valueLine,
          "SMALL_PRESET",
          `${call.name} uses the \`small\` preset as a tap target.`,
          "It renders about 30px tall — fine for a secondary control in a dense desktop grid, not for the main action on a phone.",
        );
      }
    }

    // Rule 10 — depth is a scale, and only the widgets that read `elevation` have
    // one. The engine routes the prop straight into `style.boxShadow`, so a number
    // anywhere else is an invalid declaration the browser drops in silence.
    if (
      ctx.elevationReaders?.size &&
      props.has("elevation") &&
      !ctx.elevationReaders.has(call.name) &&
      /^\s*\d+\s*$/.test(props.get("elevation").value)
    ) {
      push(
        line,
        "DEAD_ELEVATION",
        `${call.name} sets a numeric \`elevation\` that nothing reads.`,
        `Only ${[...ctx.elevationReaders]
          .sort()
          .join(", ")} turn a number into a shadow. Everywhere else the value reaches \`style.boxShadow\` as a bare number, CSS drops it, and the box stays flat in silence. Write the depth as a \`shadow\` string.`,
      );
    }

    // Rule 11 — an image either says what it is or says that it is decoration.
    if (
      call.name === "Image" &&
      !props.has("alt") &&
      ctx.declaredProps("Image").has("alt")
    ) {
      push(
        line,
        "IMAGE_NO_ALT",
        "Image has no `alt`.",
        'A picture that carries information names it; a decoration answers `alt: ""`. The empty string is a decision, the missing prop is an oversight.',
      );
    }

    // Rule 11 — a control that is only a glyph is only clean when it is also named.
    if (
      ICON_WIDGETS.includes(call.name) &&
      tappable &&
      !labeledBySibling(call) &&
      !namedByAria(call)
    ) {
      push(
        line,
        "ICON_ONLY_CONTROL",
        `${call.name} is pressable and carries no name.`,
        'A glyph with no words is a guess, and a screen reader says nothing at all. A `Tooltip` is a description (`aria-describedby`), not a name: put a `Text` beside the control or name it with `"aria-label": "Share"`.',
      );
    }
    if (
      call.name === "Button" &&
      ["icon", "iconLeft", "iconRight"].some((key) => props.has(key)) &&
      !props.has("text") &&
      !labeledBySibling(call) &&
      !namedByAria(call)
    ) {
      push(
        line,
        "ICON_ONLY_CONTROL",
        "Button shows an icon and no label.",
        'Give it `text`, or name it with `"aria-label": "Share"`. A tooltip explains the control, it does not name it.',
      );
    }

    // Rule 11 — a switch with an icon and no words is not clean, it is unreadable.
    if (
      TOGGLE_WIDGETS.includes(call.name) &&
      !props.has("label") &&
      !labeledBySibling(call) &&
      ctx.declaredProps(call.name).has("label")
    ) {
      push(
        line,
        "UNLABELED_TOGGLE",
        `${call.name} has no \`label\` and no text beside it.`,
        'Say what it switches: `Switch({ label: "Email me a copy", value, onToggle })`.',
      );
    }

    // Rule 08 — center alignment carries a title, never a run of text.
    if (call.name === "Text") {
      const align = props.get("align") ?? props.get("textAlign");
      const body = literalText(call) ?? "";
      if (align && /center/.test(align.value) && body.length > BODY_TEXT_CHARS) {
        push(
          line,
          "CENTERED_BODY_TEXT",
          `Text centers ${body.length} characters.`,
          `Centered copy is for a short title or a lone action. A paragraph centers its reader: set \`align: "left"\` and hold the line near ${MEASURE_CHARS} characters.`,
        );
      }
    }

    // Rules 13 and 14 — the label of an action is part of the action.
    if (call.name === "Button") {
      const label = (literalText(call) ?? "").trim();
      if (label && GENERIC_LABELS.has(label.toLowerCase())) {
        push(
          line,
          "GENERIC_ACTION_LABEL",
          `Button is labeled "${label}".`,
          'Say what happens instead: "Save changes", "Send invite", "Pay $65". A generic label hides the consequence until after the click.',
        );
      }
      if (label && DESTRUCTIVE_LABELS.test(label)) {
        destructiveButtons++;
        const colorsUsed = ["bgColor", "backgroundColor", "color", "textColor"]
          .map((key) => props.get(key)?.value ?? "")
          .join(" ");
        if (!/danger|error/i.test(colorsUsed)) {
          push(
            line,
            "DESTRUCTIVE_COLOR",
            `Button "${label}" destroys something and is not in the danger color.`,
            "Red is the convention that makes a person pause: `bgColor: colors.danger` on a filled button, `color: colors.dangerStrong` on a text one — `danger` is the signal, `dangerStrong` is the red that clears AA as words in this theme. A delete in the brand color reads as the safe choice.",
          );
        }
      }
    }

    const contrast = checkContrast(call.name, props, inheritedFillProps(call), ctx, line);
    if (contrast) findings.push(contrast);

    if (
      FIELD_WIDGETS.includes(call.name) &&
      !props.has("label") &&
      !props.has("placeholder") &&
      ctx.declaredProps(call.name).has("label")
    ) {
      push(
        line,
        "UNLABELED_FIELD",
        `${call.name} has neither \`label\` nor \`placeholder\`.`,
        "A field the user has to guess at is a field they leave wrong. The label also names it for a screen reader.",
      );
    }
  }

  // Rule 14 — in a row of buttons the safe choice comes first: it is the one a
  // reading eye reaches before the one that destroys something.
  if (destructiveButtons > 0) {
    for (const call of calls) {
      const buttons = childrenOf(call).filter((other) => other.name === "Button");
      if (buttons.length < 2) continue;
      const first = (test) =>
        buttons.findIndex((button) => test((literalText(button) ?? "").trim()));
      const destructive = first((label) => label && DESTRUCTIVE_LABELS.test(label));
      const cancel = first((label) => CANCEL_LABELS.test(label));
      if (destructive < 0 || cancel < 0 || destructive > cancel) continue;
      push(
        lineOf(offsets, buttons[destructive].open),
        "CONFIRM_ORDER",
        `In this row the destructive button (${(literalText(buttons[destructive]) ?? "").trim()}) comes before ${(literalText(buttons[cancel]) ?? "").trim()}.`,
        "Left is where the eye lands first, so put the way out there: Cancel, then the action. The button that cannot be undone is the last thing a finger reaches.",
      );
    }
  }

  // Rule 04 — one view, one primary action. Emphasis is a budget, not a style.
  // The view is the function body a screen renders, not the file: a components
  // module exports several screens, and two buttons in two components are never
  // on the same screen. A `variant` this pass cannot resolve counts as neither,
  // since the button may be outlined at runtime.
  const primaries = calls.filter(isFilled);
  const scopeOf = (call) => {
    let scope = null;
    for (const [start, end] of bodies) {
      if (call.open > start && call.close < end && (scope === null || start > scope)) {
        scope = start;
      }
    }
    if (scope !== null) return `fn:${scope}`;
    const root = enclosing(call).at(-1);
    return root ? `root:${root.open}` : "file";
  };
  const views = new Map();
  for (const call of primaries) {
    const scope = scopeOf(call);
    if (!views.has(scope)) views.set(scope, []);
    views.get(scope).push(call);
  }
  for (const group of views.values()) {
    if (group.length < 2) continue;
    push(
      lineOf(offsets, group[0].open),
      "MULTIPLE_PRIMARY_ACTIONS",
      `${group.length} filled buttons in this view (lines ${group
        .map((call) => lineOf(offsets, call.open))
        .join(", ")}).`,
      "Everything filled is competing with everything else. Keep one filled, make the next `variant: \"outlined\"`, and drop the rest to `variant: \"text\"`.",
    );
  }

  // Rule 13 — a form stretched across a desktop is a form nobody finishes.
  const formBlocks = calls.filter(
    (call) => descendantsOf(call).filter((other) => other.name === "Input").length >= 3,
  );
  for (const block of formBlocks) {
    if (
      formBlocks.some(
        (other) => other !== block && other.open > block.open && other.close < block.close,
      )
    ) {
      continue;
    }
    if ([block, ...enclosing(block)].some(capsWidth)) continue;
    push(
      lineOf(offsets, block.open),
      "UNCONSTRAINED_FORM_WIDTH",
      `${block.name} holds ${descendantsOf(block).filter((other) => other.name === "Input").length} fields and nothing caps its width.`,
      "A field as wide as the window says 'type anything'. Put the form in `Container({ maxWidth: 480 })` and size each field to its data — a CVC box is four characters, not the page.",
    );
  }

  if (fieldCount > 7) {
    push(
      1,
      "CROWDED_FORM",
      `${fieldCount} form fields in one file.`,
      "Chunk the ask: 3 to 7 fields per step, one card per step, and a `Stepper` or a progress line when there is more than one step.",
    );
  }
  if (sawList && !sawState) {
    push(
      1,
      "LIST_WITHOUT_STATE",
      "A list with no loading, empty or failed state in this file.",
      "`Skeleton` while rows are on their way, a plain message when there are none, a `SnackBar` when the load fails — silence reads as a broken app.",
    );
  }

  return findings;
};

/**
 * Classify the installed package's style props into the families these rules use.
 * Registry-driven, so no prop name is invented here.
 *
 * @param {object} api resolved package surface
 * @returns {Map<string, "color" | "spacing" | "radius" | "type">}
 */
export const propKindsFromRegistry = (api) => {
  const kinds = new Map();
  for (const entry of Object.values(api.ALL_PROPS)) {
    if (!entry || entry.type !== "style") continue;
    const dom = String(entry.domProp || "");
    if (/color$/i.test(dom) || dom === "fill" || dom === "stroke") kinds.set(entry.prop, "color");
    else if (/^(padding|margin)/.test(dom) || /Gap$/.test(dom) || dom === "gap")
      kinds.set(entry.prop, "spacing");
    else if (/Radius$/.test(dom)) kinds.set(entry.prop, "radius");
    else if (dom === "fontSize") kinds.set(entry.prop, "type");
  }
  return kinds;
};

/**
 * The measured contrast of every text-ish token against the two surfaces a screen
 * paints. Prints the honest table, including the tokens that only pass for large
 * text — that is the number a designer needs before arguing about one.
 *
 * @param {Record<string, string>} tokens
 * @param {(fg: string, bg: string) => number | null} contrast
 * @returns {string}
 */
export const tokenTable = (tokens, contrast) => {
  if (!contrast) return "";
  const names = [
    "text",
    "textSecondary",
    "textDisabled",
    "primary",
    "secondary",
    "danger",
    "dangerStrong",
    "successStrong",
    "warningStrong",
    "infoStrong",
    "warning",
    "success",
    "border",
    "divider",
  ].filter((name) => name !== "onPrimary");
  const lines = [section("Token contrast", "measured against the palette in use (WCAG 2.1)")];
  for (const name of names) {
    const value = tokens[name];
    if (typeof value !== "string") continue;
    const onBg = contrast(value, tokens.background);
    const onSurface = contrast(value, tokens.surface);
    const verdict =
      onBg >= CONTRAST_BODY
        ? "AA body text"
        : onBg >= CONTRAST_LARGE
          ? "large text / UI only"
          : "below 3:1 — decoration only";
    lines.push(
      `  colors.${name.padEnd(14)} ${value.padEnd(9)} ${onBg.toFixed(2)}:1 on background · ${onSurface.toFixed(2)}:1 on surface   ${verdict}`,
    );
  }
  lines.push(section("On a brand fill", "colors.onPrimary written on each fill"));
  for (const name of [
    "primary",
    "secondary",
    "danger",
    "dangerStrong",
    "successStrong",
    "warningStrong",
    "warning",
    "success",
    "info",
    "infoStrong",
    "gray900",
  ]) {
    const fill = tokens[name];
    if (typeof fill !== "string" || typeof tokens.onPrimary !== "string") continue;
    const ratio = contrast(tokens.onPrimary, fill);
    const verdict =
      ratio >= CONTRAST_BODY
        ? "any size"
        : ratio >= CONTRAST_LARGE
          ? "24px, or 18px bold only"
          : "do not write text here";
    lines.push(
      `  onPrimary on colors.${name.padEnd(10)} ${fill.padEnd(9)} ${ratio.toFixed(2)}:1   ${verdict}`,
    );
  }
  return `${lines.join("\n")}\n`;
};

/**
 * Run the clean-UI gate over a project.
 *
 * @param {string[]} argv
 * @param {{print?: (line: string) => void}} [io]
 * @returns {Promise<{findings: object[], exitCode: number}>}
 */
export const checkUi = async (argv = [], io = {}) => {
  const print = io.print ?? ((line) => console.log(line));
  const rootIndex = argv.indexOf("--root");
  const root = path.resolve(
    rootIndex >= 0 && argv[rootIndex + 1] ? argv[rootIndex + 1] : process.cwd(),
  );
  const asJson = argv.includes("--json");
  const strict = argv.includes("--strict");

  let api;
  try {
    api = await loadApi(root);
  } catch (error) {
    print(c("red", `❌ ${error.message}`));
    return { findings: [], exitCode: 1 };
  }

  const barrel = await import(pathToFileURL(path.join(api.dir, "src", "index.js")).href);
  const packageTokens = barrel.colors ?? {};
  const makeColor = typeof barrel.color === "function" ? barrel.color : null;
  const probe = makeColor ? makeColor("#000000") : null;
  const contrast =
    probe && typeof probe.contrastRatio === "function"
      ? (fg, bg) => {
          const a = makeColor(fg);
          const b = makeColor(bg);
          if (!a || !b || typeof a.luminance !== "function") return CONTRAST_BODY;
          return a.contrastRatio(b);
        }
      : null;

  if (!contrast && !asJson) {
    print(
      c(
        "yellow",
        "⚠️  This flet-box build has no contrastRatio() — the WCAG rules are skipped. Update the package to read them.",
      ),
    );
  }

  const cache = new Map();
  const declaredProps = (widget) => {
    if (!cache.has(widget)) {
      const props = resolveInterfaceProps(api.interfaces, `${widget}Props`);
      cache.set(widget, new Set([...(props?.keys?.() ?? [])]));
    }
    return cache.get(widget);
  };

  /**
   * Which of the installed widgets actually turn a numeric `elevation` into a
   * shadow. The engine routes `elevation` straight into `style.boxShadow`, so
   * anywhere outside this set the number paints nothing. The list is read off the
   * package instead of hardcoded here, because the package changes and this
   * checker must not invent a depth API either.
   *
   * @returns {Set<string>}
   */
  const readElevationReaders = () => {
    const found = new Set();
    const buildsAShadow =
      /SHADOW_LEVELS\s*\[|Shadows\s*\[|shadows\s*\[|\$\{\s*currentElevation\b|\$\{\s*elevation\b/;
    for (const dir of ["widgets", "navigations"]) {
      let names = [];
      try {
        names = fs.readdirSync(path.join(api.dir, "src", dir));
      } catch {
        continue;
      }
      for (const name of names.filter((file) => /\.js$/.test(file))) {
        const source = fs.readFileSync(path.join(api.dir, "src", dir, name), "utf8");
        if (/elevation/.test(source) && buildsAShadow.test(source)) {
          found.add(path.basename(name, ".js"));
        }
      }
    }
    return found;
  };

  const files = collectSources(root).filter(
    (file) => !/^(service-worker|sw[-.].*)\.m?js$/.test(path.basename(file)),
  );

  // The app's own token file wins: a screen paints with what it declares, and the
  // contrast rules have to measure that, not the library default.
  const tokens = files
    .filter(isTokenFile)
    .reduce((all, file) => ({ ...all, ...appPalette(file) }), { ...packageTokens });

  // Which palettes a person actually sees. `colors` is the object the module
  // boots with; `palettes.light` and `palettes.dark` are what `setTheme()`
  // paints, and the two disagree about a token: `primary` is #6165ef at boot,
  // #18181B in the light theme and #FAFAFA in the dark one, so a finding raised
  // only against the boot object cannot be reproduced on any screen. A package
  // with no `palettes` export is measured against the boot object alone.
  const themes = (() => {
    const real = barrel.palettes;
    const named =
      real && typeof real === "object"
        ? Object.entries(real).filter(
          ([, palette]) => palette && typeof palette === "object",
        )
        : [];
    if (!named.length) return [{ name: "default", tokens }];
    return named.map(([name, palette]) => ({ name, tokens: { ...tokens, ...palette } }));
  })();

  const ctx = {
    currentFile: "",
    propKinds: propKindsFromRegistry(api),
    tokens,
    themes,
    contrast,
    declaredProps,
    elevationReaders: readElevationReaders(),
  };
  const findings = files.flatMap((file) => {
    ctx.currentFile = file;
    try {
      return checkFile(file, ctx);
    } catch (error) {
      return [{ file, line: 0, code: "UNREADABLE", message: error.message, detail: "" }];
    }
  });

  if (argv.includes("--tokens")) print(tokenTable(tokens, contrast));

  if (asJson) {
    print(
      JSON.stringify(
        {
          package: api.pkg.version,
          scanned: files.length,
          findings: findings.map((item) => ({ rule: CODE_RULE[item.code] || null, ...item })),
        },
        null,
        2,
      ),
    );
  } else {
    print(
      banner(
        "🎨 FletBox clean-UI check",
        `flet-box@${api.pkg.version} · ${files.length} file(s) scanned`,
      ),
    );
    if (!findings.length) {
      print(`\n${c("green", "✅ On the scale, on the tokens, and readable.")}\n`);
      return { findings, exitCode: 0 };
    }
    const byCode = new Map();
    for (const item of findings) {
      if (!byCode.has(item.code)) byCode.set(item.code, []);
      byCode.get(item.code).push(item);
    }
    for (const [code, list] of byCode) {
      const rule = CODE_RULE[code];
      print(
        section(
          "•",
          `${code}${rule ? ` — rule ${rule}` : ""} — ${list.length} finding(s)`,
          ERROR_CODES.has(code) ? "#f87171" : INFO_CODES.has(code) ? "#94a3b8" : "#fbbf24",
        ),
      );
      for (const item of list) {
        print(`  ${path.relative(root, item.file)}:${item.line}  ${item.message}`);
        if (item.detail) print(`     ${c("gray", item.detail)}`);
      }
    }
  }

  const errors = findings.filter((item) => ERROR_CODES.has(item.code));
  const warns = findings.filter((item) => WARN_CODES.has(item.code));
  const infos = findings.filter(
    (item) => !ERROR_CODES.has(item.code) && !WARN_CODES.has(item.code),
  );
  const failed = errors.length > 0 || (strict && warns.length > 0);
  if (!asJson) {
    print(
      `\n${failed ? c("red", "❌") : c("green", "✅")} ${errors.length} error(s), ${warns.length} warning(s), ${infos.length} to review${
        strict ? " (--strict also fails on contrast warnings)" : ""
      }\n`,
    );
  }
  return { findings, exitCode: failed ? 1 : 0 };
};
