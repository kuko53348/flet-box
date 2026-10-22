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

/** The 8-based rhythm the app contract ships, plus the two display steps. */
export const SPACING_SCALE = new Set([0, 4, 8, 12, 16, 18, 24, 32, 40, 48, 64, 96]);
export const RADIUS_SCALE = new Set([0, 4, 8, 12, 16, 999]);
export const TYPE_SCALE = new Set([12, 14, 16, 18, 24, 32, 40, 48]);

/** Fitts: a finger needs this much target — the same number the app contract ships. */
export const TAP_MINIMUM = 40;

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

const INFO_CODES = new Set([
  "SMALL_PRESET",
  "CROWDED_FORM",
  "LIST_WITHOUT_STATE",
  "MULTIPLE_PRIMARY_ACTIONS",
]);

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
 * Find every `Widget({ … })` call, nested ones included.
 *
 * @param {string} code comment-free source
 * @returns {Array<{name: string, open: number, close: number}>}
 */
export const findCalls = (code) => {
  const calls = [];
  const ident = /[A-Za-z_$][\w$]*[ \t]*\([ \t]*\{/g;
  let match;
  while ((match = ident.exec(code))) {
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
 * Numeric literals written in a value, skipping the ones inside strings.
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

const fillOf = (props, tokens) => {
  for (const key of ["bgColor", "backgroundColor"]) {
    const resolved = resolveColor(props.get(key)?.value ?? "", tokens);
    if (resolved) return resolved;
  }
  return null;
};

/**
 * Contrast between a text color and the fill it is written on, measured with the
 * package's own `color()` — WCAG 2.1 relative luminance, not an opinion.
 *
 * The fill is the call's own `bgColor`, else the nearest enclosing call that paints
 * one (so a label inside a brand header is judged on the brand), else neither — in
 * which case the two surfaces a screen paints are both tested and only a warning
 * is raised, because the real background is a layout fact this pass cannot see.
 *
 * @param {string} widget
 * @param {Map<string, {value: string}>} props
 * @param {string | null} scopeFill fill inherited from the enclosing calls
 * @param {object} ctx
 * @param {number} line
 * @returns {object | null}
 */
const checkContrast = (widget, props, scopeFill, ctx, line) => {
  if (!ctx.contrast) return null;
  const fgEntry = props.get("color") || props.get("textColor");
  if (!fgEntry) return null;
  if ((props.get("disabled")?.value ?? "").trim() === "true") return null;

  const fg = resolveColor(fgEntry.value, ctx.tokens);
  if (!fg) return null;

  const graphic = ICON_WIDGETS.includes(widget);
  const ownFill = fillOf(props, ctx.tokens);
  const bg = ownFill ?? scopeFill;
  const minimum = graphic
    ? CONTRAST_LARGE
    : isLargeText(props)
      ? CONTRAST_LARGE
      : CONTRAST_BODY;

  const measure = (value) => ctx.contrast(fg, value);

  if (bg) {
    const ratio = measure(bg);
    if (ratio + 1e-9 >= minimum) return null;
    if (ratio < CONTRAST_LARGE) {
      return finding(
        ctx,
        line,
        graphic ? "LOW_CONTRAST_UI" : "LOW_CONTRAST",
        `${widget} ${fg} on ${bg} measures ${ratio.toFixed(2)}:1 — ${graphic ? "a meaningful graphic needs" : "text needs"} ${minimum}:1.`,
        graphic
          ? "An icon that carries information is UI, not decoration: 3:1. Darken it (`colors.gray700`) or put it on a fill that carries it."
          : "Below 3:1 no size makes it readable. Use `colors.text` on this fill, or move the text to `background`/`surface`.",
      );
    }
    return finding(
      ctx,
      line,
      "LOW_CONTRAST_SOFT",
      `${widget} text ${fg} on ${bg} measures ${ratio.toFixed(2)}:1 (AA body text is ${minimum}:1).`,
      "Legal only as large text: 24px, or 18px bold. Small body text on this fill needs a darker token.",
    );
  }

  // No fill visible in this call or any enclosing one: warn against the surfaces.
  const onBackground = measure(ctx.tokens.background);
  const onSurface = measure(ctx.tokens.surface);
  if (onBackground >= minimum && onSurface >= minimum) return null;
  return finding(
    ctx,
    line,
    graphic ? "LOW_CONTRAST_UI" : "LOW_CONTRAST_ON_SURFACE",
    `${widget} ${fg} measures ${onBackground.toFixed(2)}:1 on \`background\` and ${onSurface.toFixed(2)}:1 on \`surface\` (needs ${minimum}:1).`,
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

  /**
   * The fill this call inherits: its own `bgColor`, else the nearest enclosing
   * call that paints one. Text on a brand header is judged on the brand.
   */
  const inheritedFill = (call) => {
    for (const other of enclosing(call)) {
      const fill = fillOf(other.props, ctx.tokens);
      if (fill) return fill;
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

  const namedByTooltip = (call) =>
    enclosing(call).some((other) => other.name === "Tooltip" && other.props.has("text"));

  const isFilled = (call) =>
    call.name === "Button" &&
    !/['"`](outlined|text)['"`]/.test(call.props.get("variant")?.value ?? "");

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
      const numbers = numbersIn(entry.value);

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
          if (SPACING_SCALE.has(Math.abs(n.number))) continue;
          push(
            valueLine,
            "OFF_SCALE_SPACING",
            `${call.name}.${key} = ${n.number} is not on the spacing scale.`,
            "Use 4 · 8 · 12 · 16 · 18 · 24 · 32 · 40 · 48 · 64 · 96. The scale is what makes two screens look like one app.",
          );
        }
        // A CSS shorthand still has to obey the scale: `padding: '12px 20px'` is
        // the same mistake with a unit glued on.
        if (!numbers.length) {
          for (const match of entry.value.matchAll(/\d+(?:\.\d+)?px/g)) {
            const value = Number(match[0].slice(0, -2));
            if (SPACING_SCALE.has(value)) continue;
            push(
              valueLine,
              "OFF_SCALE_SPACING",
              `${call.name}.${key} = '${match[0]}' is not on the spacing scale.`,
              "Use 4 · 8 · 12 · 16 · 18 · 24 · 32 · 40 · 48 · 64 · 96, or the plain number the factory prefers.",
            );
          }
        }
      } else if (kind === "radius") {
        for (const n of numbers) {
          if (RADIUS_SCALE.has(Math.abs(n.number))) continue;
          push(
            valueLine,
            "OFF_SCALE_RADIUS",
            `${call.name}.${key} = ${n.number} is not a scale radius.`,
            "Use 4 · 8 · 12 · 16 · 999 (a pill). A radius between them is a shape no other card in this app has.",
          );
        }
      } else if (kind === "type" && (key === "fontSize" || call.name === "Text")) {
        for (const n of numbers) {
          if (TYPE_SCALE.has(Math.abs(n.number))) continue;
          push(
            valueLine,
            "OFF_SCALE_TYPE",
            `${call.name}.${key} = ${n.number} is not a scale type size.`,
            "12 caption · 14 body-small · 16 body · 18 subtitle · 24 title · 32 headline · 40/48 display. One size per element, one weight per role.",
          );
        }
      }

      if (tappable && (key === "height" || key === "minHeight")) {
        for (const n of numbers) {
          if (n.number <= 0 || n.number >= TAP_MINIMUM) continue;
          push(
            valueLine,
            "SMALL_TAP_TARGET",
            `${call.name} is pressable but only ${n.number}px tall.`,
            `Fitts: a finger needs ${TAP_MINIMUM}x${TAP_MINIMUM}. Get there with \`height\`, not with padding.`,
          );
        }
      }

      if (tappable && ICON_WIDGETS.includes(call.name) && key === "size") {
        for (const n of numbers) {
          if (n.number >= TAP_MINIMUM || props.has("height")) continue;
          push(
            valueLine,
            "SMALL_TAP_TARGET",
            `${call.name} is pressable at size ${n.number}, so its whole target is ${n.number}px.`,
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
      !namedByTooltip(call)
    ) {
      push(
        line,
        "ICON_ONLY_CONTROL",
        `${call.name} is pressable and carries no name.`,
        "Wrap it in `Tooltip({ text, child })` or put a `Text` beside it. A glyph with no words is a guess, and a screen reader says nothing at all.",
      );
    }
    if (
      call.name === "Button" &&
      ["icon", "iconLeft", "iconRight"].some((key) => props.has(key)) &&
      !props.has("text") &&
      !labeledBySibling(call) &&
      !namedByTooltip(call)
    ) {
      push(
        line,
        "ICON_ONLY_CONTROL",
        "Button shows an icon and no label.",
        "Give it `text`, or wrap it in `Tooltip({ text, child })`. Every person reads an unnamed glyph slightly differently.",
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
            "Red is the convention that makes a person pause: `bgColor: colors.danger` on a filled button, `color: colors.danger` on a text one. A delete in the brand color reads as the safe choice.",
          );
        }
      }
    }

    const contrast = checkContrast(call.name, props, inheritedFill(call), ctx, line);
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

  // Rule 04 — one screen, one primary action. Emphasis is a budget, not a style.
  const primaries = calls.filter(isFilled);
  if (primaries.length > 1) {
    push(
      1,
      "MULTIPLE_PRIMARY_ACTIONS",
      `${primaries.length} filled buttons in this file (lines ${primaries
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

  const ctx = {
    currentFile: "",
    propKinds: propKindsFromRegistry(api),
    tokens,
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
      JSON.stringify({ package: api.pkg.version, scanned: files.length, findings }, null, 2),
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
      print(
        section(
          "•",
          `${code} — ${list.length} finding(s)`,
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
