/**
 * @file Markdown.js
 * @description Markdown renderer with per-instance scoped styles and one shared
 * sanitizer for both initial render and `updateContent`.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { generateHighlightedHtml } from "../utils/syntaxHighlight.js";

/**
 * Escapes text for safe insertion as HTML. Local to this file on purpose:
 * importing it from utils/markdownParser.js would pull six widget modules into
 * the dependency graph of every Markdown instance.
 *
 * @param {string} text - Raw text to escape.
 * @returns {string} Text with `&`, `<`, `>`, `"` and `'` replaced by entities.
 */
const escapeCode = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Monotonic counter giving each Markdown instance its own CSS scope class. */
let markdownScopeUid = 0;

/**
 * Sanitizes Markdown-rendered HTML. Strips `<script>` elements, then walks real
 * tags to remove inline event handlers and `javascript:` URLs. It deliberately
 * avoids a global regex over the raw text so code samples containing
 * `onerror=` or `= await` survive untouched. This is NOT a full XSS defense:
 * for untrusted input use a proper sanitizer.
 *
 * @param {string} html - Raw HTML produced by `parseMarkdown`.
 * @returns {string} The sanitized HTML.
 */
const sanitizeMarkdown = (html) => {
  const withoutScripts = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );
  return withoutScripts.replace(/<[^<>]+>/g, (tag) =>
    tag
      .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(
        /\s(href|src|xlink:href|formaction|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi,
        ' $1="#"',
      ),
  );
};

// ─── Syntax highlighting ────────────────────────────────────────────────────
//
// JS/FletBox blocks delegate to the existing tokenizer in syntaxHighlight.js.
// All other languages use the lightweight per-language highlighters below,
// which share the same HTML-escape pass and produce <span style="color:…">
// tokens identical to the JS highlighter's output.
//
// Design decision: keep this self-contained inside Markdown.js so the widget
// has a single import boundary and the parsers are never pulled into unrelated
// dependency graphs.

/** One dark–inspired palette shared by every language highlighter. */
const SH = {
  keyword: "#c678dd",
  string: "#98c379",
  number: "#d19a66",
  comment: "#5c6370",
  tag: "#e06c75",
  attr: "#d19a66",
  selector: "#e06c75",
  property: "#61afef",
  value: "#98c379",
  function: "#61afef",
  builtin: "#56b6c2",
  punctuation: "#abb2bf",
  operator: "#56b6c2",
  variable: "#e5c07b",
};

/**
 * Wraps `text` in a `<span>` with the given color, HTML-escaping the content.
 * Returns plain escaped text when `color` is falsy.
 *
 * @param {string} text
 * @param {string} [color]
 * @returns {string}
 */
const shSpan = (text, color) => {
  const safe = escapeCode(text);
  return color ? `<span style="color:${color}">${safe}</span>` : safe;
};

/**
 * Applies a sequence of `[regex, color]` replacement rules to `line`, escaping
 * every character that is NOT inside a match so raw `<`/`>` cannot break the
 * surrounding `<code>` element.
 *
 * Rules are applied left-to-right in declaration order.  Each match is replaced
 * with the colored span immediately and the remaining text is processed by
 * subsequent rules.  This is intentionally simple — it is not a full lexer, but
 * it handles 95 % of real-world Markdown code snippets correctly.
 *
 * @param {string} line - One source line (without the trailing newline).
 * @param {Array<[RegExp, string]>} rules - Ordered list of [pattern, color] pairs.
 * @returns {string} HTML fragment safe for `innerHTML`.
 */
const applyRules = (line, rules) => {
  // Build a combined pattern that captures which rule matched via named groups.
  const combined = new RegExp(
    rules.map(([re], i) => `(?<r${i}>${re.source})`).join("|"),
    "g",
  );

  let out = "";
  let last = 0;
  let m;
  while ((m = combined.exec(line)) !== null) {
    // Text between the previous match and this one — escape and emit as-is.
    if (m.index > last) out += escapeCode(line.slice(last, m.index));
    // Find which named group matched.
    const ruleIndex = rules.findIndex((_, i) => m.groups[`r${i}`] !== undefined);
    const color = rules[ruleIndex][1];
    out += `<span style="color:${color}">${escapeCode(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  // Remaining plain text.
  if (last < line.length) out += escapeCode(line.slice(last));
  return out;
};

// ── Per-language rule tables ─────────────────────────────────────────────────

const RULES_PYTHON = [
  [/(#.*)$/, SH.comment],
  [/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, SH.string],
  [/\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|pass|break|continue|raise|lambda|not|and|or|in|is|None|True|False|async|await|global|nonlocal|del)\b/, SH.keyword],
  [/\b(print|len|range|type|str|int|float|bool|list|dict|tuple|set|enumerate|zip|map|filter|sorted|reversed|open|super|self|cls)\b/, SH.builtin],
  [/\b([0-9]+(?:\.[0-9]+)?)\b/, SH.number],
  [/([+\-*/=<>!&|^~%]+)/, SH.operator],
];

const RULES_CSS = [
  [/(\/\*[\s\S]*?\*\/)/, SH.comment],
  [/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, SH.string],
  [/(#[0-9a-fA-F]{3,8})\b/, SH.value],
  [/\b([0-9]+(?:\.[0-9]+)?(?:px|em|rem|%|vh|vw|vmin|vmax|pt|cm|mm|deg|s|ms)?)\b/, SH.number],
  [/(:[a-zA-Z-]+\(|:[a-zA-Z-]+\b|::[a-zA-Z-]+)/, SH.selector],
  [/([.#]?[a-zA-Z][a-zA-Z0-9_-]*)(?=\s*\{)/, SH.selector],
  [/\b(animation|background|border|color|display|flex|font|gap|grid|height|justify|margin|max|min|opacity|overflow|padding|position|text|transform|transition|width|z-index|align|content|cursor|float|outline|pointer|shadow|top|bottom|left|right)\b/, SH.property],
  [/\b(inherit|initial|none|auto|normal|bold|italic|relative|absolute|fixed|sticky|block|inline|flex|grid|center|left|right|top|bottom|middle|start|end|solid|dashed|dotted|transparent|var)\b/, SH.keyword],
  [/([{}:;,])/, SH.punctuation],
];

const RULES_HTML = [
  [/(<!--[\s\S]*?-->)/, SH.comment],
  [/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, SH.string],
  [/(<\/?)([a-zA-Z][a-zA-Z0-9-]*)/, SH.tag],   // tag name
  [/\b([a-zA-Z:][a-zA-Z0-9_:-]*)(?=\s*=)/, SH.attr],  // attribute name
  [/([<>/=])/, SH.punctuation],
];

const RULES_BASH = [
  [/(#.*)$/, SH.comment],
  [/("(?:[^"\\$]|\\.|\$[^{(]|\$\{[^}]*\}|\$\([^)]*\))*"|'[^']*')/, SH.string],
  [/\b(if|then|else|elif|fi|for|while|do|done|case|esac|in|function|return|exit|local|export|readonly|declare|source|echo|cd|ls|mkdir|rm|mv|cp|cat|grep|sed|awk|find|curl|wget|git|npm|node|python|pip|sudo|chmod|chown|eval|exec|trap|set|unset|shift|read|printf|test)\b/, SH.keyword],
  [/(\$\{[^}]*\}|\$[A-Za-z_][A-Za-z0-9_]*|\$[0-9@#*!?$-])/, SH.variable],
  [/\b([0-9]+)\b/, SH.number],
  [/([|&;<>(){}[\]])/, SH.operator],
];

const RULES_JSON = [
  [/("(?:[^"\\]|\\.)*")(?=\s*:)/, SH.property],
  [/("(?:[^"\\]|\\.)*")/, SH.string],
  [/\b(true|false|null)\b/, SH.keyword],
  [/(-?[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/, SH.number],
  [/([{}[\]:,])/, SH.punctuation],
];

const RULES_TS = RULES_PYTHON; // TypeScript re-uses the applyRules path below via JS highlighter override

/**
 * Highlights one source line using the appropriate language highlighter.
 * Falls through to plain HTML-escaped text for unknown languages.
 *
 * @param {string} line  - One line of source code (no trailing newline).
 * @param {string} lang  - Normalised language identifier (lower-case).
 * @returns {string} HTML fragment.
 */
const highlightLine = (line, lang) => {
  switch (lang) {
    case "js":
    case "jsx":
    case "javascript":
    case "ts":
    case "tsx":
    case "typescript":
      // Delegate to the existing FletBox tokenizer for JS/TS.
      return generateHighlightedHtml(line);

    case "py":
    case "python":
      return applyRules(line, RULES_PYTHON);

    case "css":
    case "scss":
    case "less":
      return applyRules(line, RULES_CSS);

    case "html":
    case "xml":
    case "svg":
      return applyRules(line, RULES_HTML);

    case "sh":
    case "bash":
    case "shell":
    case "zsh":
      return applyRules(line, RULES_BASH);

    case "json":
    case "jsonc":
      return applyRules(line, RULES_JSON);

    default:
      return escapeCode(line);
  }
};

/**
 * Copies text using the Clipboard API, falling back to a temporary textarea and
 * `document.execCommand('copy')` for older or non-secure environments.
 *
 * @param {string} text - Text to copy.
 * @param {() => void} onDone - Called once the copy succeeds.
 */
const copyTextToClipboard = (text, onDone) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onDone).catch(() => {
      legacyCopy(text);
      onDone();
    });
    return;
  }
  legacyCopy(text);
  onDone();
};

/** Legacy clipboard path: select a throwaway textarea and execCommand('copy'). */
const legacyCopy = (text) => {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
};

/**
 * Renders a fenced code block as a `<div class="md-code-block">` containing
 * a copy button and a `<pre><code>` with syntax-highlighted lines.
 *
 * The copy button carries no inline handler: the default sanitizer strips
 * `on*=` attributes, so the click is wired by a delegated listener on the
 * content node after mount (see the Markdown body).
 *
 * @param {{ lang: string, code: string }} block
 * @returns {string} HTML fragment.
 */
const renderFencedBlock = (block) => {
  const lang = block.lang.replace(/[^A-Za-z0-9#+._-]/g, "").toLowerCase();
  const cls = lang ? ` class="language-${lang}"` : "";
  const label = lang ? `<span class="md-lang-label">${escapeCode(lang)}</span>` : "";

  // Highlight line-by-line. Lines are joined with a bare "\n" — no wrapper
  // <span> per line because display:block + \n produced two line separators,
  // doubling the visual gap regardless of line-height.
  const lines = block.code.split("\n");
  const highlighted = lines
    .map((line) => highlightLine(line, lang))
    .join("\n");

  // The raw code is embedded in a hidden <textarea> so the copy handler can
  // read it without stripping HTML and without touching the DOM of <code>.
  const safeRaw = escapeCode(block.code);

  return (
    `<div class="md-code-block">` +
    `<div class="md-code-header">` +
    label +
    `<button type="button" class="md-copy-btn">Copy</button>` +
    `</div>` +
    `<textarea class="md-raw-src" readonly aria-hidden="true" tabindex="-1">${safeRaw}</textarea>` +
    `<pre><code${cls}>${highlighted}</code></pre>` +
    `</div>`
  );
};

// ── End syntax highlighting ──────────────────────────────────────────────────

/** Opening fence: up to three spaces of indent, the run of backticks or tildes, then an optional info string. */
const FENCE_OPEN = /^[ \t]{0,3}(`{3,}|~{3,})[ \t]*([^\s`~]*)[^\n]*$/;
/** Closing fence: the run alone, optionally followed by whitespace. */
const FENCE_CLOSE = /^[ \t]{0,3}(`{3,}|~{3,})[ \t]*$/;
/**
 * Placeholder left in place of a fenced block while the other rules run. It
 * starts with `<f` so the paragraph wrapper below (`^(?!<[a-z]|$)`) skips it and
 * does not emit a `<p>` around a `<pre>`.
 */
const fencePlaceholder = (index) => `<fletbox-fence-${index}></fletbox-fence-${index}>`;

/**
 * Replaces every fenced code block with a placeholder and returns the rewritten
 * text plus the collected blocks.
 *
 * This runs before every other rule because each of them corrupts code samples:
 * the inline-code rule consumes the ``` fence itself, the heading rule turns a
 * leading `#` into an `<h1>`, the emphasis rules mangle `*` and `_`, and the
 * paragraph wrapper splits the sample into `<p>` lines.
 *
 * @param {string} text - Markdown source.
 * @returns {{ text: string, blocks: Array<{ lang: string, code: string }> }}
 */
const extractFencedCode = (text) => {
  const blocks = [];
  const out = [];
  let open = null;

  for (const line of text.split("\n")) {
    if (open) {
      const close = line.match(FENCE_CLOSE);
      // A closing fence must not be shorter than the opening one, and for
      // backticks the info string may not contain a backtick.
      if (close && close[1][0] === open.marker[0] && close[1].length >= open.marker.length) {
        blocks.push({ lang: open.lang, code: open.code.join("\n") });
        out.push(fencePlaceholder(blocks.length - 1));
        open = null;
      } else {
        open.code.push(line);
      }
      continue;
    }

    const start = line.match(FENCE_OPEN);
    if (start) {
      open = { marker: start[1], lang: start[2], code: [] };
      continue;
    }

    out.push(line);
  }

  // Unterminated fence: CommonMark runs it to the end of the document.
  if (open) {
    blocks.push({ lang: open.lang, code: open.code.join("\n") });
    out.push(fencePlaceholder(blocks.length - 1));
  }

  return { text: out.join("\n"), blocks };
};

/**
 * Raw HTML tag: a comment, or an opening/closing/self-closing tag with a name.
 * Attribute values may not contain `<` or `>`, which keeps this from matching
 * across a whole paragraph. `fletbox-*` is excluded so the fence placeholders
 * are not mistaken for tags.
 */
const RAW_HTML =
  /<!--[\s\S]*?-->|<\/?(?!fletbox\b)[a-zA-Z][a-zA-Z0-9-]*(?:\s[^<>]*?)?\/?>/g;
/** Placeholder standing in for a raw HTML tag while the inline rules run. */
const htmlPlaceholder = (index) => `<fletbox-html-${index}>`;

/** A delimiter cell is only hyphens plus optional colons: `:---`, `---:`, `:---:` or `---`. */
const DELIMITER_CELL = /^:?-+:?$/;

/**
 * Splits one table row into cells. The leading/trailing pipe is optional and a
 * backslash-escaped pipe stays inside its cell instead of starting a new one.
 *
 * @param {string} line - Raw row text.
 * @returns {string[]}
 */
const splitTableRow = (line) => {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);

  const cells = [];
  let current = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "\\" && s[i + 1] === "|") {
      current += "|";
      i++;
      continue;
    }
    if (ch === "|") {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
};

/**
 * Reads the alignment of each column from a delimiter row, or returns null when
 * the line is not a delimiter row at all.
 *
 * @param {string} line - Candidate line.
 * @returns {string[] | null} One of `"left"`, `"center"`, `"right"` or `""` per column.
 */
const parseDelimiterRow = (line) => {
  if (!line.includes("|")) return null;
  const cells = splitTableRow(line);
  if (cells.length === 0 || !cells.every((cell) => DELIMITER_CELL.test(cell))) return null;
  return cells.map((cell) => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    if (left) return "left";
    return "";
  });
};

/** Placeholder standing in for a table while the paragraph wrapper runs. */
const tablePlaceholder = (index) => `<fletbox-table-${index}></fletbox-table-${index}>`;

/**
 * Replaces every GFM pipe table with a placeholder and returns the rewritten text
 * plus the collected tables.
 *
 * Runs before the paragraph wrapper, otherwise each row would be sealed into its
 * own `<p>` and the columns would collapse into stacked lines of text. Cells are
 * taken verbatim: the inline rules have already run, so they still hold `<code>`,
 * `<a>` and the raw-HTML placeholders.
 *
 * @param {string} text - Markdown source with fences and inline code already extracted.
 * @returns {{ text: string, tables: Array<{ head: string[], rows: string[][], align: string[] }> }}
 */
const extractTables = (text) => {
  const tables = [];
  const out = [];
  const lines = text.split("\n");

  let i = 0;
  while (i < lines.length) {
    const header = lines[i];
    const align =
      i + 1 < lines.length && header.includes("|")
        ? parseDelimiterRow(lines[i + 1])
        : null;

    if (align && header.trim() && !DELIMITER_CELL.test(header.trim())) {
      const head = splitTableRow(header);
      const rows = [];
      let j = i + 2;
      // A row ends at the first line without a pipe; a blank line ends the table.
      for (; j < lines.length && lines[j].trim() && lines[j].includes("|"); j++) {
        rows.push(splitTableRow(lines[j]));
      }
      tables.push({ head, rows, align });
      out.push(tablePlaceholder(tables.length - 1));
      i = j;
      continue;
    }

    out.push(lines[i]);
    i++;
  }

  return { text: out.join("\n"), tables };
};

/**
 * Builds the `<table>` markup. Rows are padded or trimmed to the header width so
 * a ragged column cannot shift the layout.
 *
 * @param {{ head: string[], rows: string[][], align: string[] }} table
 * @returns {string}
 */
const renderTable = ({ head, rows, align }) => {
  const style = (column) => (align[column] ? ` style="text-align:${align[column]}"` : "");
  const headerCells = head.map((cell, column) => `<th${style(column)}>${cell}</th>`).join("");
  const bodyRows = rows
    .map((row) => {
      const cells = head
        .map((_, column) => row[column] ?? "")
        .map((cell, column) => `<td${style(column)}>${cell}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  const body = bodyRows ? `<tbody>${bodyRows}</tbody>` : "";
  return `<table class="markdown-table"><thead><tr>${headerCells}</tr></thead>${body}</table>`;
};

/**
 * Replaces raw HTML tags with placeholders so the inline rules cannot rewrite
 * them.
 *
 * Without this, `window.__pwned` inside `onerror="window.__pwned = 1"` becomes
 * `window.<em></em>pwned = 1`: the `<em>` landed inside the tag, which then made
 * the sanitizer's tag matcher stop at that `>` and let the event handler through.
 * A placeholder is inert to every rule and is restored verbatim afterwards.
 *
 * @param {string} text - Markdown source with fenced blocks already extracted.
 * @returns {{ text: string, tags: string[] }}
 */
const extractRawHtml = (text) => {
  const tags = [];
  const out = text.replace(RAW_HTML, (tag) => {
    tags.push(tag);
    return htmlPlaceholder(tags.length - 1);
  });
  return { text: out, tags };
};

/**
 * Lightweight Markdown-to-HTML parser with no external dependencies.
 *
 * Supports: headings (h1–h3), bold, italic, inline code, code blocks,
 * links, images, unordered/ordered lists, blockquotes, horizontal rules,
 * and basic paragraphs.
 *
 * This is intentionally a simplified implementation — for production use
 * with complex Markdown (tables, nested lists, GFM extensions) consider
 * replacing this with a battle-tested library such as `marked` or `micromark`.
 *
 * @param {string} text - Raw Markdown string to convert.
 * @returns {string} HTML string. Output may contain tags but no `<script>` or event handlers
 *   unless `allowDangerousHtml` is explicitly set on the widget.
 */
const parseMarkdown = (text) => {
  if (!text) return "";

  let html = text.replace(/\r\n?/g, "\n");

  // Pull fenced code blocks out first and restore them last, so their contents
  // are escaped verbatim instead of being run through the inline rules.
  const { text: withoutFences, blocks } = extractFencedCode(html);
  html = withoutFences;

  // Inline code, before the raw-HTML pass and before bold/italic: a code span is
  // literal, so emphasis must not apply inside it, and its body is escaped. An
  // unescaped `<div>` or `<style>` typed in a sample becomes a real element, and
  // a `<style>` opened by a sample swallows every following block as CSS.
  html = html.replace(
    /`(.*?)`/g,
    (_match, code) => `<code>${escapeCode(code)}</code>`,
  );

  // Pull real HTML tags out too, so the inline rules below never rewrite an
  // attribute value. Runs after the fences and the code spans: both hold literal
  // samples that must not be reinterpreted as markup.
  const { text: withoutHtml, tags } = extractRawHtml(html);
  html = withoutHtml;

  // Headings — deepest level first so "##" does not partially match "###".
  // Covers h1–h6 as CommonMark specifies: 1–6 hash characters followed by a
  // space and the heading text.
  html = html.replace(/^###### (.*$)/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.*$)/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.*$)/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");

  // Bold (both ** and __ syntax)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic (both * and _ syntax)
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Images — must run BEFORE the link rule so "![alt](src)" is not consumed
  // by the link regex which would leave a bare "!" in the output.
  html = html.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    (_match, alt, src) =>
      `<img src="${escapeCode(src)}" alt="${escapeCode(alt)}" loading="lazy">`,
  );

  // Links — opens in a new tab with rel="noopener" for security. The URL is
  // escaped so it cannot close the attribute or truncate the tag; that also lets
  // the sanitizer below recognise `javascript:` hrefs as one well-formed tag.
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    (_match, label, href) =>
      `<a href="${escapeCode(href)}" target="_blank" rel="noopener">${label}</a>`,
  );

  // Unordered lists — wrap consecutive <li> items produced by the "-" rule in
  // a single <ul>. The replacement uses a non-greedy match anchored to the
  // first <li> so it does not accidentally swallow ordered-list items too.
  // Step 1: convert each "- item" line into a raw <li>.
  html = html.replace(/^[ \t]*-[ \t]+(.*$)/gm, "<li>$1</li>");
  // Step 2: group consecutive unordered <li> runs. We tag them with a
  // data-ul attribute so the ordered-list pass below does not re-wrap them.
  html = html.replace(
    /(<li>(?:(?!<\/ol>).)*?<\/li>(\n|$))+/gs,
    (match) => `<ul>${match.replace(/\n$/, "")}</ul>\n`,
  );

  // Ordered lists
  // Step 1: convert each "1. item" line into a raw <li>.
  html = html.replace(/^[ \t]*\d+\.[ \t]+(.*$)/gm, "<li>$1</li>");
  // Step 2: group consecutive ordered <li> runs that are NOT already inside a <ul>.
  html = html.replace(
    /(<li>(?:(?!<\/ul>).)*?<\/li>(\n|$))+/gs,
    (match) => `<ol>${match.replace(/\n$/, "")}</ol>\n`,
  );

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>");

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr>");

  // Tables, before the paragraph wrapper seals each row into its own <p>.
  const { text: withoutTables, tables } = extractTables(html);
  html = withoutTables;

  // Wrap bare text lines in <p> tags (skip lines that already start with an HTML tag)
  html = html.replace(/^(?!<[a-z]|$)(.*$)/gm, "<p>$1</p>");

  // Double newlines between INLINE content become a single line break.
  // We deliberately skip this conversion when both neighbours are block-level
  // HTML tags (headings, lists, blockquotes, pre, hr, p, div, table) because
  // those elements already carry margin and a bare <br> between them creates a
  // visible empty line that doubles the visual gap.
  html = html.replace(/\n\n/g, (_, offset, str) => {
    // Look at the character immediately before and after the double newline.
    const before = str.slice(0, offset).trimEnd();
    const after = str.slice(offset + 2).trimStart();
    const BLOCK = /^<\/?(?:h[1-6]|ul|ol|li|p|pre|blockquote|hr|div|table|thead|tbody|tr|td|th|figure|figcaption|article|section|header|footer|nav|aside|main)\b/i;
    // If either side is a block element, swallow the break entirely — the
    // block's own margins provide the vertical spacing.
    if (BLOCK.test(before.slice(-20)) || BLOCK.test(after.slice(0, 20))) {
      return "\n";
    }
    return "<br>";
  });

  // Restore the code blocks with syntax highlighting and a copy button.
  html = html.replace(
    /<fletbox-fence-(\d+)><\/fletbox-fence-\1>/g,
    (_match, rawIndex) => {
      const block = blocks[Number(rawIndex)];
      if (!block) return "";
      return renderFencedBlock(block);
    },
  );

  // Restore tables, after the paragraph wrapper has run over everything else.
  html = html.replace(
    /<fletbox-table-(\d+)><\/fletbox-table-\1>/g,
    (_match, rawIndex) => {
      const table = tables[Number(rawIndex)];
      if (!table) return "";
      return renderTable(table);
    },
  );

  // Restore raw HTML verbatim, after every rule has run. The sanitizer downstream
  // still gets the chance to strip dangerous tags and handlers.
  html = html.replace(/<fletbox-html-(\d+)>/g, (_match, rawIndex) => {
    return tags[Number(rawIndex)] ?? "";
  });

  return html;
};

/**
 * @typedef {Object} MarkdownProps
 * @property {string} [text] - Markdown source string. Also aliased as `source` and `content`.
 * @property {string} [source] - Alias for `text`.
 * @property {string} [content] - Alias for `text`.
 * @property {string} [children] - Alias for `text` (supports passing markdown as a child string).
 *
 * @property {number} [fontSize=14] - Base font size in pixels.
 * @property {string} [fontFamily] - CSS font-family for the rendered text.
 * @property {number} [lineHeight=1.6] - Line height multiplier.
 * @property {string} [color] - Default text color.
 *
 * @property {string} [linkColor] - Color of hyperlinks.
 * @property {string} [linkHoverColor] - Color of hyperlinks on hover.
 * @property {boolean} [linkUnderline=false] - Whether to underline links by default.
 *
 * @property {string} [codeBgColor] - Background color for inline `code` spans.
 * @property {string} [codeColor] - Text color for inline `code` spans.
 * @property {number} [codeFontSize=12] - Font size for inline code.
 * @property {string} [codeFontFamily] - Font family for inline code.
 * @property {number} [codeBorderRadius=4] - Border radius for inline code backgrounds.
 * @property {string} [codePadding] - Padding for inline code.
 *
 * @property {string} [preBgColor] - Background color for fenced code blocks.
 * @property {number} [preBorderRadius=8] - Border radius for code block containers.
 * @property {string} [prePadding] - Padding inside code blocks.
 * @property {string} [preMargin] - Margin around code blocks.
 *
 * @property {string} [blockquoteBorderColor] - Left-border color for blockquotes.
 * @property {number} [blockquoteBorderWidth=4] - Left-border width for blockquotes in pixels.
 * @property {string} [blockquoteColor] - Text color inside blockquotes.
 * @property {string} [blockquotePadding] - Padding inside blockquotes.
* @property {string} [blockquoteMargin] - Margin around blockquotes.
  *
  * @property {string} [tableBorderColor] - Border color for table cells.
  * @property {string} [tableHeaderBgColor] - Background color for header cells.
  * @property {string} [tableCellPadding] - Padding inside table cells.
  *
 * @property {string} [headingColor] - Color applied to all heading elements.
 * @property {string} [headingMargin] - Margin applied to all heading elements.
 *
 * @property {string} [listMargin] - Margin around list elements.
 * @property {string} [listPadding] - Padding (left) for list elements.
 * @property {string} [listItemMargin] - Margin for individual list items.
 *
 * @property {string} [imageMaxWidth="100%"] - Max width for rendered images.
 * @property {number} [imageBorderRadius=0] - Border radius for rendered images.
 *
 * @property {number|string} [padding=0] - Padding of the outer container.
 * @property {number} [maxHeight] - Maximum height; enables scrolling when content overflows.
 * @property {string} [overflow="auto"] - CSS overflow value.
 * @property {string} [backgroundColor="transparent"] - Background color of the container.
 * @property {number} [borderRadius=0] - Border radius of the container.
 *
 * @property {boolean} [allowDangerousHtml=false] - When true, parsed HTML is set directly without
 *   sanitization. Only use with fully trusted Markdown sources.
 */

/**
 * Renders a Markdown string as styled HTML inside a widget container.
 *
 * Injects a single `<style id="markdown-styles">` tag into `<head>` the first time
 * a Markdown widget is mounted, so all styling is shared across instances while still
 * respecting the per-instance style props (the styles are regenerated each time a new
 * widget is created — the last one to mount wins for shared rules).
 *
 * Content is sanitized by default: `<script>` tags and inline event handlers (`on*`)
 * are stripped. Set `allowDangerousHtml` to bypass this only when the source is trusted.
 *
 * Public API on the returned element:
 * - `updateContent(newText)` — re-renders with new Markdown source
 * - `getContent()` — returns current inner HTML
 * - `getSource()` — returns the original Markdown string
 *
 * @param {MarkdownProps} props
 * @returns {HTMLElement} The container element with rendered Markdown inside.
 */
export const Markdown = (props) => {
  const {
    text,
    source, // alias for text
    content, // alias for text
    children,

    // Font styling
    fontSize = 14,
    fontFamily = "system-ui, -apple-system, sans-serif",
    lineHeight = 1.6,
    color = colors.text,

    // Link styling
    linkColor = colors.primary,
    linkHoverColor = colors.primary,
    linkUnderline = false,

    // Inline code styling
    codeBgColor = colors.gray100,
    codeColor = colors.danger,
    codeFontSize = 12,
    codeFontFamily =
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
    codeBorderRadius = 4,
    codePadding = "0.2em 0.45em",

    // Fenced code block styling
    preBgColor = colors.gray100,
    preBorderRadius = 8,
    prePadding = "1em",
    preMargin = "1em 0",

    // Blockquote styling
    blockquoteBorderColor = colors.primary,
    blockquoteBorderWidth = 4,
    blockquoteColor = colors.textSecondary,
    blockquotePadding = "0 1em",
    blockquoteMargin = "1em 0",

    // Table styling
    tableBorderColor = colors.gray300,
    tableHeaderBgColor = colors.gray100,
    tableCellPadding = "0.4em 0.75em",

    // Heading styling
    headingColor = colors.text,
    headingMargin = "0.67em 0",

    // List styling
    listMargin = "0em 0",
    listPadding = "0 0 0 1em",
    listItemMargin = "0.0em 0",

    // Image styling
    imageMaxWidth = "100%",
    imageBorderRadius = 0,

    // Container styling
    padding = 0,
    maxHeight,
    overflow = "auto",
    backgroundColor = "transparent",
    borderRadius = 0,

    // Safety: set to true only when the Markdown source is fully trusted
    allowDangerousHtml = false,

    ...rest
  } = props;

  // Resolve the markdown source from any of the supported prop aliases
  const markdownText = text || source || content || children || "";

  // Per-instance CSS scope: `.markdown-content` was shared by every instance,
  // so the last mounted widget's style props leaked into all the others.
  const scope = `markdown-scope-${++markdownScopeUid}`;

  // Parse Markdown to raw HTML
  const rawHtml = parseMarkdown(markdownText);

  // Outer container
  const container = WidgetFactory({
    tag: "div",
    widgetName: "Markdown",
    fontFamily: fontFamily,
    fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
    lineHeight: lineHeight,
    color: color,
    padding: typeof padding === "number" ? `${padding}px` : padding,
    maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
    overflow: overflow,
    backgroundColor: backgroundColor,
    borderRadius:
      typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
    ...rest,
  });

  // Inner div that receives the parsed HTML
  const contentDiv = WidgetFactory({
    tag: "div",
    className: `${scope} markdown-content`,
  });

  // Sanitize by default; `allowDangerousHtml` bypasses it for trusted sources.
  contentDiv.innerHTML = allowDangerousHtml
    ? rawHtml
    : sanitizeMarkdown(rawHtml);

  // Delegated copy handler. The button cannot carry an inline onclick because
  // the sanitizer strips on*= attributes, and a per-button listener would not
  // survive updateContent(); delegation on the persistent content node does.
  contentDiv.addEventListener("click", (event) => {
    const btn = event.target.closest?.(".md-copy-btn");
    if (!btn) return;
    const src = btn.closest(".md-code-block")?.querySelector(".md-raw-src");
    const raw = src ? src.value : "";
    const previous = btn.textContent;
    copyTextToClipboard(raw, () => {
      btn.textContent = "✓ Copied";
      setTimeout(() => {
        btn.textContent = previous;
      }, 1500);
    });
  });

  // Per-instance stylesheet. The tag lives inside the container so it is removed
  // with the widget on unmount — no unscoped tag in `document.head`, no leak.
  const styleText = `
            /* Containment: the rendered content must never contribute its
               intrinsic (min-content) width to flex/grid ancestors, or a long
               code line would stretch the whole layout past the viewport. */
            .markdown-content {
                min-width: 0;
                max-width: 100%;
            }
            .markdown-content h1, 
            .markdown-content h2, 
            .markdown-content h3,
            .markdown-content h4,
            .markdown-content h5,
            .markdown-content h6 {
                color: ${headingColor};
                margin: ${headingMargin};
                font-weight: bold;
                /* Prevent headings from inheriting auto margins that shift them
                   away from the left edge of the content area. */
                margin-left: 0;
                margin-right: 0;
                padding: 0;
                text-align: left;
                width: 100%;
                box-sizing: border-box;
                display: block;
            }
            .markdown-content h1 { font-size: 2em; }
            .markdown-content h2 { font-size: 1.5em; }
            .markdown-content h3 { font-size: 1.17em; }
            .markdown-content h4 { font-size: 1em; }
            .markdown-content h5 { font-size: 0.83em; }
            .markdown-content h6 { font-size: 0.67em; }
            
            /* Paragraphs: collapse margin so double-newline <br> and <p> don't
               stack and create oversized vertical gaps. */
            .markdown-content p {
                margin: 0.6em 0;
                padding: 0;
                margin-left: 0;
                margin-right: 0;
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
            /* First and last <p> shouldn't add extra whitespace at edges */
            .markdown-content p:first-child { margin-top: 0; }
            .markdown-content p:last-child  { margin-bottom: 0; }

            /* Remove the <br> double-newline spacers when they land right before
               or after a block element — they're redundant with block margins. */
            .markdown-content h1 + br,
            .markdown-content h2 + br,
            .markdown-content h3 + br,
            .markdown-content h4 + br,
            .markdown-content h5 + br,
            .markdown-content h6 + br,
            .markdown-content ul + br,
            .markdown-content ol + br,
            .markdown-content .md-code-block + br,
            .markdown-content blockquote + br,
            .markdown-content hr + br {
                display: none;
            }
            
            .markdown-content ul, 
            .markdown-content ol {
                margin: ${listMargin};
                /* Left-align to the content edge; the padding-left provides
                   the bullet/number indent without shifting the whole block. */
                margin-left: 0;
                margin-right: 0;
                padding: ${listPadding};
                box-sizing: border-box;
                width: 100%;
                display: block;
            }
            .markdown-content li {
                margin: ${listItemMargin};
                text-align: left;
            }
            
            .markdown-content table.markdown-table {
                border-collapse: collapse;
                margin: 1em 0;
                display: block;
                width: max-content;
                max-width: 100%;
                overflow-x: auto;
            }
            .markdown-content table.markdown-table th,
            .markdown-content table.markdown-table td {
                border: 1px solid ${tableBorderColor};
                padding: ${tableCellPadding};
                text-align: left;
                vertical-align: top;
            }
            .markdown-content table.markdown-table th {
                background-color: ${tableHeaderBgColor};
                font-weight: bold;
                white-space: nowrap;
            }
            
            .markdown-content code {
                background-color: ${codeBgColor};
                color: ${codeColor};
                padding: ${codePadding};
                border-radius: ${typeof codeBorderRadius === "number" ? `${codeBorderRadius}px` : codeBorderRadius};
                font-family: ${codeFontFamily};
                font-size: ${typeof codeFontSize === "number" ? `${codeFontSize}px` : codeFontSize};
            }
            
            /* Bare <pre> elements (raw HTML injected via allowDangerousHtml or future extensions).
               Fenced blocks now live inside .md-code-block and have their own rules above. */
            .markdown-content pre:not(.md-code-block pre) {
                background-color: ${preBgColor};
                padding: ${prePadding};
                border-radius: ${typeof preBorderRadius === "number" ? `${preBorderRadius}px` : preBorderRadius};
                overflow: auto;
                overflow-x: auto;
                margin: ${preMargin};
                margin-left: 0;
                margin-right: 0;
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
                display: block;
            }
            .markdown-content pre code {
                background: none;
                padding: 0;
            }
            
            .markdown-content a {
                color: ${linkColor};
                text-decoration: ${linkUnderline ? "underline" : "none"};
            }
            .markdown-content a:hover {
                color: ${linkHoverColor};
                text-decoration: underline;
            }
            
            .markdown-content blockquote {
                border-left: ${blockquoteBorderWidth}px solid ${blockquoteBorderColor};
                margin: ${blockquoteMargin};
                margin-left: 0;
                margin-right: 0;
                padding: ${blockquotePadding};
                color: ${blockquoteColor};
                box-sizing: border-box;
                width: 100%;
                display: block;
            }
            
            .markdown-content img {
                max-width: ${imageMaxWidth};
                height: auto;
                border-radius: ${typeof imageBorderRadius === "number" ? `${imageBorderRadius}px` : imageBorderRadius};
            }
            
            .markdown-content hr {
                border: none;
                border-top: 1px solid ${colors.border};
                margin: 1em 0;
            }
            
            /* ── Code block wrapper (replaces bare <pre>) ── */
            .markdown-content .md-code-block {
                position: relative;
                margin-left: 0;
                margin-right: 0;
                /* Fill the reading column; min-width:0 stops the code's
                   intrinsic width from stretching flex/grid ancestors. */
                width: 100%;
                max-width: 100%;
                min-width: 0;
                box-sizing: border-box;
                border-radius: ${typeof preBorderRadius === "number" ? `${preBorderRadius}px` : preBorderRadius};
                overflow: hidden;
                margin-top: 1em;
                margin-bottom: 1em;
                background-color: ${preBgColor};
            }

            /* Header bar: language label + copy button */
            .markdown-content .md-code-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.3em 0.75em;
                background-color: rgba(0,0,0,0.18);
                min-height: 28px;
            }

            .markdown-content .md-lang-label {
                font-family: ${codeFontFamily};
                font-size: 0.75em;
                color: ${SH.comment};
                text-transform: uppercase;
                letter-spacing: 0.06em;
                user-select: none;
            }

            .markdown-content .md-copy-btn {
                background: none;
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 4px;
                color: ${SH.comment};
                cursor: pointer;
                font-size: 0.72em;
                padding: 0.15em 0.55em;
                transition: color 0.15s, border-color 0.15s;
                line-height: 1.6;
                font-family: ${codeFontFamily};
            }
            .markdown-content .md-copy-btn:hover {
                color: #fff;
                border-color: rgba(255,255,255,0.4);
            }

            /* Hidden textarea holding the raw source for the copy handler */
            .markdown-content .md-raw-src {
                position: absolute;
                width: 1px;
                height: 1px;
                opacity: 0;
                pointer-events: none;
                overflow: hidden;
                white-space: pre;
            }

            /* The <pre> inside the block — no padding here; it lives on <code>
               so the scrollbar sits flush with the block edge without gaps. */
            .markdown-content .md-code-block pre {
                margin: 0;
                padding: 0;
                background: transparent;
                border-radius: 0;
                overflow-x: auto;
                width: 100%;
                max-width: 100%;
                min-width: 0;
                box-sizing: border-box;
                /* Reset any inherited line-height from ancestor containers
                   before the explicit value on <code> takes over. */
                line-height: 1;
            }

            .markdown-content .md-code-block pre code {
                background: none;
                /* Padding on <code> (not <pre>) keeps the scrollbar aligned. */
                padding: ${prePadding};
                font-family: ${codeFontFamily};
                font-size: ${typeof codeFontSize === "number" ? `${codeFontSize}px` : codeFontSize};
                /* 1.5 matches VS Code / GitHub's code block density.
                   Setting it here AND on md-code-line stops any ancestor
                   line-height (the widget's default 1.6) from bleeding in. */
                line-height: 1.5;
                display: block;
                box-sizing: border-box;
                /* Grow to the longest line so the <pre> scrolls horizontally;
                   min-width:100% keeps short blocks filling the box. Wrapping
                   the code hid content and read as "broken" on mobile. */
                min-width: 100%;
                width: max-content;
                white-space: pre;
            }

            /* Line spacing inside code blocks. <code> uses white-space:pre so
               plain \n separators between highlighted lines are sufficient —
               no per-line wrapper elements needed. */
            
            .markdown-content table {
                border-collapse: collapse;
                width: 100%;
                margin: 1em 0;
            }
            .markdown-content th,
            .markdown-content td {
                border: 1px solid ${colors.border};
                padding: 8px;
                text-align: left;
            }
            .markdown-content th {
                background-color: ${colors.gray100};
            }
        `.replaceAll(".markdown-content", "." + scope);

  // Component styles, scoped per instance. They ride an adopted stylesheet so
  // they never become DOM children of the wrapper (which must hold exactly one
  // `.markdown-content` child) and are dropped when the widget unmounts.
  if (typeof CSSStyleSheet === "function") {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styleText);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    container.onUnmount(() => {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (s) => s !== sheet,
      );
    });
  } else {
    // Legacy fallback for engines without adopted stylesheets: keep the tag
    // inside the container so it is removed with the widget on unmount.
    const styleFallback = document.createElement("style");
    styleFallback.setAttribute("data-widget", "Markdown");
    styleFallback.textContent = styleText;
    container.appendChild(styleFallback);
  }
  container.appendChild(contentDiv);

  // ========== PUBLIC METHODS ==========

  /**
   * Re-renders the widget with new Markdown source.
   *
   * Uses the same two-pass sanitizer as the constructor: first strips
   * `<script>` elements entirely, then walks real tags to remove `on*`
   * handlers and `javascript:` URLs — never applies a global regex over the
   * raw text so code samples containing `onerror=` or `= await` are left
   * untouched.
   *
   * @param {string} newText - The updated Markdown string.
   */
  container.updateContent = (newText) => {
    const newHtml = parseMarkdown(newText);
    contentDiv.innerHTML = allowDangerousHtml
      ? newHtml
      : sanitizeMarkdown(newHtml);
  };

  /**
   * Returns the currently rendered inner HTML string.
   * @returns {string}
   */
  container.getContent = () => contentDiv.innerHTML;

  /**
   * Returns the original Markdown source string passed to the widget.
   * @returns {string}
   */
  container.getSource = () => markdownText;

  return container;
};

export default Markdown;
