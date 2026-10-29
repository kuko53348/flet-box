/**
 * `flet-box unpack` — take a widget apart and show what is provably true about it.
 *
 * `check-api --props` answers "does this prop exist?". This answers the other
 * questions, the ones that cost a dev an afternoon: where the prop is handled,
 * what it is an alias of, whether the widget really reads it, what its default
 * is, and where the three API surfaces disagree.
 *
 * Every line is derived from the installed package at run time — the barrel,
 * `translateProps.js`, `src/index.d.ts` and the widget's own source file — so
 * the output cannot drift from the code the way a hand-written reference can.
 *
 *   flet-box unpack Button                 every prop it can receive, and which of
 *                                          them actually do something
 *   flet-box unpack Button --diff          declared vs documented vs implemented,
 *                                          the disagreements only
 *   flet-box unpack Button --example       a paste-ready call built from props the
 *                                          widget provably reads
 *   flet-box unpack Button --json          the same contract as data
 *   flet-box unpack --all                  every widget → .fletbox/api/api.json
 *   flet-box unpack --all --diff           which widgets disagree with themselves
 *   flet-box unpack --all --md             and the readable form → api.md
 *   flet-box unpack --json                 whole tree on stdout, for the app's AI agent
 */
import fs from "node:fs";
import path from "node:path";
import { c, banner, section } from "../utils/colors.js";
import { neutralise } from "../utils/neutralise.js";
import { membersOf, propsInterfaceFor, resolveInterfaceProps } from "../utils/dtsProps.js";
import { STRUCTURAL_PROPS, loadApi, nearest } from "./checkApi.js";
import { deprecationFor } from "../../src/widget-factory/deprecations.js";

/**
 * Index of the character closing the bracket opened at `open`, or -1.
 *
 * @param {string} text Neutralised source, so every bracket here is syntax.
 * @param {number} open
 * @returns {number}
 */
const matchPair = (text, open) => {
  const close = { "{": "}", "[": "]", "(": ")" }[text[open]];
  if (!close) return -1;
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === text[open]) depth++;
    else if (text[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

/**
 * Every name a file defines, mapped to its file.
 *
 * A widget is usually `src/widgets/Name.js`, but navigations and tools live
 * elsewhere, so the barrel's own layout is read instead of guessed.
 *
 * @param {string} packageDir Installed package root.
 * @returns {Map<string, string>} name → absolute file
 */
export const definitionIndex = (packageDir) => {
  const index = new Map();
  const reexports = [];
  const src = path.join(packageDir, "src");
  if (!fs.existsSync(src)) return index;
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.m?js$/.test(entry.name)) files.push(full);
    }
  };
  walk(src);
  for (const file of files) {
    const code = neutralise(fs.readFileSync(file, "utf8"), { keepStrings: true });
    for (const m of code.matchAll(
      /\bexport\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g,
    )) {
      if (!index.has(m[1])) index.set(m[1], file);
    }
    // `export { Real as Alias }` is only a pointer: it must never win over the
    // file that actually defines the name, or every widget maps to the barrel.
    for (const m of code.matchAll(/\bexport\s*\{([^}]*)\}/g)) {
      for (const token of m[1].split(",")) {
        const aliased = /^\s*([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)\s*$/.exec(token);
        const plain = /^\s*([A-Za-z_$][\w$]*)\s*$/.exec(token);
        const name = aliased ? aliased[2] : plain ? plain[1] : null;
        if (name) reexports.push([name, file]);
      }
    }
  }
  for (const [name, file] of reexports) if (!index.has(name)) index.set(name, file);
  return index;
};

/**
 * Which props a widget source actually reads.
 *
 * Two forms matter: a destructuring pattern whose initialiser is `props` (with
 * its default values) and plain `props.name` access. Keys reaching the factory
 * through a `...rest` spread are reported separately, because then every engine
 * prop is live without being named.
 *
 * @param {string} file
 * @returns {{ read: Map<string, string|null>, spread: boolean, child: boolean, children: boolean }}
 */
const readProps = (file) => {
  const raw = fs.readFileSync(file, "utf8");
  const code = neutralise(raw);
  const read = new Map();
  let spread = false;

  /** Top-level member spans of a pattern, using the blanked text for structure. */
  const memberSpans = (from, to) => {
    const spans = [];
    let depth = 0;
    let start = from;
    for (let i = from; i < to; i++) {
      const ch = code[i];
      if (ch === "{" || ch === "[" || ch === "(") depth++;
      else if (ch === "}" || ch === "]" || ch === ")") depth--;
      else if (ch === "," && depth === 0) {
        spans.push([start, i]);
        start = i + 1;
      }
    }
    if (to > start) spans.push([start, to]);
    return spans;
  };

  const trim = (s, e) => {
    while (s < e && /\s/.test(code[s])) s++;
    while (e > s && /\s/.test(code[e - 1])) e--;
    return [s, e];
  };

  /** Index of the first `=` at depth 0, or -1. */
  const assignment = (s, e) => {
    let depth = 0;
    for (let i = s; i < e; i++) {
      const ch = code[i];
      if (ch === "{" || ch === "[" || ch === "(") depth++;
      else if (ch === "}" || ch === "]" || ch === ")") depth--;
      else if (ch === "=" && depth === 0) return i;
    }
    return -1;
  };

  const collect = (from, to) => {
    for (const [a, b] of memberSpans(from, to)) {
      const [s, e] = trim(a, b);
      if (s >= e) continue;
      if (code.startsWith("...", s)) {
        spread = true;
        continue;
      }
      const eq = assignment(s, e);
      const nameEnd = eq < 0 ? e : eq;
      // A rename (`marginTop: propMarginTop`) or a nested pattern (`margin: { top }`)
      // keys on the left of the colon; the identifier itself comes from the raw
      // file, because only there are the string defaults still readable.
      const keyEnd = (() => {
        let depth = 0;
        for (let i = s; i < nameEnd; i++) {
          const ch = code[i];
          if (ch === "{" || ch === "[" || ch === "(") depth++;
          else if (ch === "}" || ch === "]" || ch === ")") depth--;
          else if (ch === ":" && depth === 0) return i;
        }
        return -1;
      })();
      const key = raw.slice(s, keyEnd < 0 ? nameEnd : keyEnd).trim();
      if (/^[A-Za-z_$][\w$]*$/.test(key)) {
        const def = eq < 0 ? null : raw.slice(...trim(eq + 1, e)).replace(/\s+/g, " ");
        // A helper in the same file may destructure the prop without its
        // default; keep the occurrence that actually carries one.
        if (!read.has(key) || (read.get(key) === null && def !== null)) read.set(key, def);
      }
      if (keyEnd >= 0) {
        const inner = trim(keyEnd + 1, nameEnd)[0];
        if (code[inner] === "{" || code[inner] === "[") {
          const close = matchPair(code, inner);
          if (close > 0) collect(inner + 1, close);
        }
      }
    }
  };

  let i = 0;
  while (i < code.length) {
    const open = code.indexOf("{", i);
    if (open < 0) break;
    const close = matchPair(code, open);
    if (close < 0) break;
    if (/^\s*=\s*props\b/.test(code.slice(close + 1, close + 24))) {
      // Offsets are preserved, so every slice above can mix the blanked text
      // (structure) with the raw one (values).
      collect(open + 1, close);
      i = close + 1;
      continue;
    }
    // Not a destructuring of `props`: step inside it rather than over it, so a
    // function body does not hide the patterns declared within it.
    i = open + 1;
  }
  for (const m of code.matchAll(/\bprops\.([A-Za-z_$][\w$]*)/g)) {
    if (!read.has(m[1])) read.set(m[1], null);
  }
  return {
    read,
    spread,
    child: /\bchild\b/.test(code),
    children: /\bchildren\b/.test(code),
    // Every identifier the file mentions. A prop can be read somewhere other
    // than the destructuring — `ThemeProvider` takes `theme` as a direct
    // parameter, `Inspector` reads `widget` inside the view it delegates to —
    // and a prop the file never mentions at all is the only honest "dead".
    identifiers: new Set(code.match(/\b[A-Za-z_$][\w$]*\b/g) || []),
  };
};

/**
 * Props that compile to the same DOM target, so they are aliases by definition.
 *
 * @param {object} api
 * @returns {Map<string, string[]>} prop → the other names for the same thing
 */
const aliasGroups = (api) => {
  const byTarget = new Map();
  for (const def of api.ALL_PROPS) {
    const key = `${def.type}:${def.domProp}`;
    if (!byTarget.has(key)) byTarget.set(key, []);
    byTarget.get(key).push(def.prop);
  }
  const groups = new Map();
  for (const list of byTarget.values()) {
    for (const name of list) {
      groups.set(name, list.filter((other) => other !== name));
    }
  }
  return groups;
};

/**
 * Prop names the widget's own doc page promises (`## Props` table only).
 *
 * `### Common props` is left out: those arrive through `CommonProps`, which the
 * interface chain already resolves, so counting them twice would only invent
 * differences.
 *
 * @param {string|null} mdFile
 * @returns {string[]}
 */
const docPropNames = (mdFile) => {
  if (!mdFile || !fs.existsSync(mdFile)) return [];
  const lines = fs.readFileSync(mdFile, "utf8").split("\n");
  const names = [];
  let inside = false;
  for (const line of lines) {
    if (/^##\s+props\s*$/i.test(line.trim())) {
      inside = true;
      continue;
    }
    if (inside && /^#{1,2}\s/.test(line)) break;
    if (!inside || !line.trim().startsWith("|")) continue;
    const first = line.split("|")[1];
    const name = /^\s*`([A-Za-z_$][\w$]*)`/.exec(first || "");
    if (name) names.push(name[1]);
  }
  return names;
};

/**
 * How this export is called and what it hands back, read from its signature.
 *
 * Most widgets take a props object and return an element to mount. Overlays
 * return a controller you drive with methods, so `const view = Modal({ … })` on
 * its own shows nothing. A few take positional arguments at all, and a snippet
 * that wrapped them in `{ … }` would silently do nothing.
 *
 * @param {object} api
 * @param {string} name
 * @returns {{ params: object[], positional: boolean, type: string|null, element: boolean|null, members: string[] }}
 */
const describeCall = (api, name) => {
  const sig = api.signatures?.get(name);
  if (!sig) return { params: [], positional: false, type: null, element: null, members: [] };
  const type = sig.returns;
  let members = membersOf(type);
  // `DrawerInstance` is declared elsewhere: read its interface instead.
  if (!members.length && /^[A-Za-z_$][\w$]*$/.test(type)) {
    const iface = api.interfaces.get(type);
    if (iface)
      members = [...iface.props].map(([key, info]) =>
        /=>/.test(info.type) || /^\(/.test(info.type) ? `${key}()` : key,
      );
  }
  const first = sig.params[0];
  // Only a scalar first argument means the call really is positional. SnackBar
  // takes `options: SnackBarOptions`, which is still one object literal.
  const takesProps = Boolean(first) && (/(?:Props|Options|Config|Settings)\b/.test(first.type) || first.type.startsWith("{"));
  return {
    params: sig.params,
    positional: sig.params.length > 0 && !takesProps,
    type,
    element: /^Widget\b|^HTMLElement\b/.test(type),
    members,
  };
};

const INLINE = "(inline)";

/**
 * Which declaration types this export's props, if any.
 *
 * Most widgets use `<Name>Props`, a few reuse `<Name>Options`, and `App` and
 * `ThemeProvider` are typed by an object written straight into the signature.
 * Anything else is a singleton API (Storage, Session) or a helper, not a widget.
 *
 * @param {object} api
 * @param {string} name
 * @returns {string|null} interface name, `INLINE`, or null
 */
export const propsSource = (api, name) => {
  const iface = propsInterfaceFor(api.interfaces, name);
  if (iface) return iface;
  const first = api.signatures?.get(name)?.params?.[0];
  return first && first.type.startsWith("{") ? INLINE : null;
};

/**
 * Build the full contract of one widget.
 *
 * @param {object} api
 * @param {string} name
 * @param {Map<string, string>} definitions
 * @returns {object|null} null when the package has no such export
 */
export const unpackWidget = (api, name, definitions) => {
  const typedBy = propsSource(api, name);
  const ifaceName = typedBy && typedBy !== INLINE ? typedBy : `${name}Props`;
  const file = definitions.get(name);
  if (!api.exports.includes(name)) return null;
  const inline =
    typedBy === INLINE ? objectFields(api.signatures.get(name).params[0].type.slice(1, -1)) : null;
  const declared =
    typedBy === INLINE
      ? new Map(inline.map((f) => [f.prop, { type: f.type, optional: f.optional, declaredBy: INLINE }]))
      : api.interfaces.has(ifaceName)
        ? resolveInterfaceProps(api.interfaces, ifaceName)
        : new Map();
  const own =
    typedBy === INLINE
      ? new Map(inline.map((f) => [f.prop, f]))
      : api.interfaces.has(ifaceName)
        ? api.interfaces.get(ifaceName).props
        : new Map();
  const aliases = aliasGroups(api);
  const source = file
    ? readProps(file)
    : { read: new Map(), spread: false, child: false, children: false, identifiers: new Set() };

  const props = [];
  const names = new Set([...declared.keys(), ...source.read.keys()]);
  for (const prop of [...names].sort()) {
    const info = declared.get(prop);
    const def = api.PROP_MAP[prop];
    const entry = {
      prop,
      declared: Boolean(info),
      own: own.has(prop),
      type: info ? info.type : null,
      optional: info ? info.optional : null,
      declaredBy: info ? info.declaredBy : null,
      engine: def
        ? { domProp: def.domProp, kind: def.type, unit: def.unit || null, reactive: Boolean(def.reactive) }
        : null,
      aliasOf: aliases.get(prop) || [],
      read: source.read.has(prop),
      default: source.read.get(prop) ?? null,
      structural: STRUCTURAL_PROPS.has(prop),
    };
    // Every JSON consumer gets a value it can paste, not just the prop name.
    entry.sample = exampleValue(entry, api);
    props.push(entry);
  }

  // Dead means nobody mentions it: a prop can be read outside the
  // destructuring — as a direct parameter, or inside a view the widget
  // delegates to — and a name the file never mentions is the honest case.
  const dead = props.filter(
    (c_) =>
      c_.declared &&
      !c_.engine &&
      !c_.read &&
      !c_.structural &&
      !source.identifiers.has(c_.prop),
  );
  const invented = props.filter(
    (c_) => !c_.declared && !c_.engine && c_.read && !c_.structural,
  );
  const hidden = props.filter((c_) => c_.engine && !c_.declared && !c_.structural);

  const docFile = fs.existsSync(path.join(api.dir, "docs", "widget", `${name}.md`))
    ? path.join(api.dir, "docs", "widget", `${name}.md`)
    : null;
  const documented = docPropNames(docFile);
  const docOnly = documented.filter(
    (prop) => !api.PROP_MAP[prop] && !declared.has(prop) && !source.read.has(prop) && !STRUCTURAL_PROPS.has(prop),
  );
  // Only this widget's own interface: inherited props are documented once, in
  // the Common props table, and `read || own` keeps utilities out of the list.
  const codeOnly = props
    .filter((p) => !p.structural && (p.read || p.own) && !documented.includes(p.prop))
    .map((p) => p.prop);

  return {
    name,
    exported: true,
    interface: typedBy === INLINE ? INLINE : api.interfaces.has(ifaceName) ? ifaceName : null,
    call: describeCall(api, name),
    sourceFile: file || null,
    docFile,
    documented,
    readsCount: [...source.read.keys()].filter((key) => !STRUCTURAL_PROPS.has(key)).length,
    props,
    events: props.filter((c_) => c_.engine && c_.engine.kind === "event"),
    spreadsRest: source.spread,
    accepts: {
      child: source.read.has("child") || declared.has("child") || source.child,
      children: source.read.has("children") || declared.has("children") || source.children,
    },
    gaps: { dead, invented, hidden, docOnly, codeOnly },
  };
};

/* ------------------------------------------------------------------ print */

const cell = (text, color, width_) => c(color, String(text).padEnd(width_));

/**
 * One line about how the widget is called.
 *
 * @param {object} data
 * @returns {string}
 */
const describeCallLine = (data) => {
  const r = data.call || {};
  if (!r.params?.length) return c("gray", "not declared in index.d.ts");
  const shape = r.params.map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.type}`).join(", ");
  if (!r.positional)
    return `${c("brightGreen", "a props object")} ${c("gray", `({ … }) — typed by ${r.params[0].type}`)}`;
  return `${c("red", "positional arguments, NOT a props object")} ${c("gray", `(${shape})`)}`;
};

/**
 * One line about what the widget hands back.
 *
 * @param {object} data
 * @returns {string}
 */
const describeReturnLine = (data) => {
  const r = data.call || {};
  if (!r.type) return c("gray", "not declared in index.d.ts");
  // What you can call beats the raw type: an inline return object is hundreds of
  // characters, its member list is the part that matters.
  const detail = r.members.length
    ? c("brightMagenta", `· ${r.members.slice(0, 9).join(" · ")}${r.members.length > 9 ? ` +${r.members.length - 9}` : ""}`)
    : c("gray", `(${r.type})`);
  if (r.element) return `${c("brightGreen", "an element you mount")} ${detail}`;
  return `${c("yellow", "a controller — nothing shows until you call it")} ${detail}`;
};

/**
 * @param {object} data unpackWidget() output
 * @param {object} api
 * @returns {string[]}
 */
const renderWidget = (data, api) => {
  const out = [];
  const label = (text) => c("gray", text.padEnd(7));
  const styleProps = data.props.filter((p) => !p.engine || p.engine.kind !== "event");
  out.push(
    section("📦", `${data.name} — ${data.props.length} props known to this widget`),
  );
  out.push(`   ${label("source")} ${data.sourceFile ? path.relative(api.dir, data.sourceFile) : c("yellow", "not found in the package")}`);
  out.push(`   ${label("types")} ${data.interface ? (data.interface === INLINE ? c("gray", "props typed inline in its declaration") : data.interface) : c("yellow", "no <Name>Props in index.d.ts")}`);
  out.push(`   ${label("docs")} ${data.docFile ? path.relative(api.dir, data.docFile) : c("yellow", "no docs/widget page")}`);
  out.push(`   ${label("call")} ${describeCallLine(data)}`);
  out.push(`   ${label("returns")} ${describeReturnLine(data)}`);
  out.push(
    `   ${label("shape")}  ${data.accepts.child ? c("brightGreen", "child ✓") : c("gray", "child ✗")}  ` +
      `${data.accepts.children ? c("brightGreen", "children ✓") : c("gray", "children ✗")}  ` +
      c("gray", `· reads ${data.readsCount} props by name`),
  );
  out.push(
    `   ${label("reaches")} ${data.spreadsRest
      ? c("gray", `the engine: every prop not named here is still passed through the ${c("brightWhite", "...rest")} spread`)
      : c("brightYellow", `the engine: only the props named here — an unlisted prop is dropped`)}`,
  );

  out.push(section("🧱", `Props (${styleProps.length})`, "#a855f7"));
  out.push(
    `    ${c("gray", "prop".padEnd(18))}${c("gray", "declared type".padEnd(36))}${c("gray", "engine target".padEnd(20))}aliases · defaults · provenance`,
  );
  for (const p of styleProps) {
    const flags = [];
    if (p.read) flags.push(c("brightGreen", "read"));
    if (p.engine?.reactive) flags.push(c("brightCyan", "reactive"));
    if (p.aliasOf.length)
      flags.push(
        c("brightYellow", `≡ ${p.aliasOf.slice(0, 3).join(", ")}${p.aliasOf.length > 3 ? ` +${p.aliasOf.length - 3}` : ""}`),
      );
    if (p.default !== null) flags.push(c("brightGreen", `= ${p.default}`));
    if (!p.declared) flags.push(c("red", "not in index.d.ts"));
    else if (!p.own) flags.push(c("gray", "inherited"));
    if (!p.engine && p.read && !p.structural) flags.push(c("magenta", "read by the widget"));
    const route = p.structural
      ? c("gray", "structural")
      : p.engine
        ? c("green", `${p.engine.domProp}${p.engine.unit && p.engine.unit !== "none" ? `:${p.engine.unit}` : ""}`)
        : c("gray", "—");
    const type = (p.type || "any").length > 34 ? `${p.type.slice(0, 31)}…` : p.type || c("red", "no declared type");
    out.push(
      `    ${cell(p.prop + (p.declared && p.optional ? "?" : ""), "brightWhite", 18)}${cell(type, "cyan", 36)}${cell(route, "", 20)}${flags.join(" ")}`,
    );
  }

  if (data.events.length) {
    out.push(section("🎯", `Events (${data.events.length})`, "#f59e0b"));
    for (const p of data.events) {
      const alias = p.aliasOf.filter((a) => a !== p.prop).slice(0, 2).join(", ");
      out.push(
        `    ${cell(p.prop, "brightWhite", 17)}` +
          `${cell(p.engine.domProp, "green", 18)}` +
          (p.declared ? c("cyan", (p.type || "").slice(0, 40)) : c("red", "not declared")),
      );
      if (alias) out.push(`    ${" ".repeat(17)}${c("brightYellow", `≡ ${alias}`)}`);
    }
  }

  const { dead, invented, hidden, docOnly, codeOnly } = data.gaps;
  if (dead.length || invented.length || hidden.length || docOnly.length || codeOnly.length) {
    out.push(section("⚠️", "Surface gaps", "#ef4444"));
    for (const p of dead)
      out.push(
        `    ${c("red", "DEAD")}         ${p.prop}: declared in ${p.declaredBy || "index.d.ts"}, routed by nothing and read by nothing — it has no effect`,
      );
    for (const p of invented)
      out.push(
        `    ${c("brightYellow", "INVENTED")}  ${p.prop}: the widget reads it, but no interface declares it and no engine entry routes it`,
      );
    for (const p of hidden)
      out.push(
        `    ${c("yellow", "UNDOCUMENTED")} ${p.prop}: the engine handles it for this widget but ${data.interface || "the interface"} does not declare it`,
      );
    for (const prop of docOnly)
      out.push(
        `    ${c("brightRed", "DOC-ONLY")}   ${prop}: documented in ${data.docFile ? path.basename(data.docFile) : "the doc page"} and in nothing else — writing it does nothing`,
      );
    for (const prop of codeOnly)
      out.push(
        `    ${c("brightMagenta", "CODE-ONLY")}  ${prop}: the widget handles it, but its doc page never mentions it`,
      );
  } else {
    out.push(`\n   ${c("brightGreen", "✓")} ${c("gray", `types, engine, docs and implementation agree — nothing dead or invented`)}`);
  }
  out.push(
    `\n   ${c("gray", `props table: flet-box check-api --props ${data.name} · offline gate: flet-box check-api`)}`,
  );
  return out;
};

/**
 * The doc-vs-code disagreements alone, for a quick "is this page lying?".
 *
 * @param {object} data
 * @returns {string[]}
 */
const renderDiff = (data) => {
  const { dead, invented, hidden, docOnly, codeOnly } = data.gaps;
  const rows = [
    ["DEAD", dead.map((p) => p.prop), "in index.d.ts, handled by nothing — wire it in the widget or drop it from the declaration"],
    ["INVENTED", invented.map((p) => p.prop), `read by the widget, absent from every type — declare it in ${data.interface || `${data.name}Props`}`],
    ["UNDOCUMENTED", hidden.map((p) => p.prop), "the engine routes it, the interface hides it"],
    ["DOC-ONLY", docOnly, "the doc page promises it, the code has never heard of it"],
    ["CODE-ONLY", codeOnly, "the code accepts it, the doc page omits it"],
  ];
  const out = [
    section("🔬", `${data.name} — declared vs real`, "#f59e0b"),
    `   ${c("gray", "types")} ${data.interface || "—"}   ${c("gray", "code")} ${data.sourceFile ? path.relative(".", data.sourceFile) : "—"}   ${c("gray", "docs")} ${data.docFile ? path.relative(".", data.docFile) : "—"}`,
  ];
  for (const [name, list, meaning] of rows) {
    if (!list.length) continue;
    out.push(`   ${c("brightRed", name.padEnd(14))} ${list.join(", ")}`);
    out.push(`   ${" ".repeat(14)} ${c("gray", meaning)}`);
  }
  if (out.length === 2)
    out.push(`   ${c("brightGreen", "✓")} ${c("gray", "every surface agrees: nothing to reconcile")}`);
  return out;
};

/**
 * Split the body of an inline object type (`icon: string; label?: string`) into
 * `{ prop, type }` pairs. Semicolons inside `<…>` or `{…}` do not end a field.
 *
 * @param {string} body
 * @returns {Array<{ prop: string, type: string }>}
 */
const objectFields = (body) => {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of body) {
    if (ch === "{" || ch === "[" || ch === "(" || ch === "<") depth++;
    else if (ch === "}" || ch === "]" || ch === ")" || ch === ">") depth--;
    if (ch === ";" && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts
    .map((part) => /^\s*([A-Za-z_$][\w$]*)\s*(\??)\s*:\s*([\s\S]+)$/.exec(part.trim()))
    .filter(Boolean)
    .map((m) => ({ prop: m[1], optional: m[2] === "?", type: m[3].trim() }));
};

/**
 * Split at a separator that sits outside every bracket: `number[] | Array<{ a:
 * number }>` is two members, `Record<string, any>` keeps its comma whole.
 *
 * @param {string} raw
 * @param {string} separator
 * @returns {string[]}
 */
const splitTop = (raw, separator) => {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of raw) {
    if (ch === "{" || ch === "[" || ch === "(" || ch === "<") depth++;
    else if (ch === "}" || ch === "]" || ch === ")" || ch === ">") depth--;
    if (ch === separator && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
};

/**
 * @param {string} raw
 * @returns {string[]}
 */
const unionMembers = (raw) => splitTop(raw, "|");

/**
 * The element type of a list, or null when the type is not a list.
 *
 * Arrays are written three different ways in `index.d.ts` (`T[]`, `Array<T>`, and
 * unions of both), and the richest member is the one worth printing: a candle
 * series explains `Chart` better than `[1, 2, 3]` does.
 *
 * @param {string} raw
 * @param {object} api
 * @returns {string|null}
 */
const arrayElement = (raw, api) => {
  const elements = [];
  for (const member of unionMembers(raw)) {
    const tuple = /^\[([\s\S]*)\]$/.exec(member);
    if (tuple) {
      elements.push(...splitTop(tuple[1], ","));
      continue;
    }
    const angled = /^\s*Array\s*<([\s\S]*)>\s*$/i.exec(member);
    if (angled) {
      elements.push(angled[1].trim());
      continue;
    }
    const boxed = /^([\s\S]*?)\[\]\s*$/.exec(member);
    if (boxed && boxed[1].trim()) elements.push(boxed[1].trim());
  }
  if (!elements.length) return null;
  return (
    elements.find((e) => /\{/.test(e)) ||
    elements.find((e) => /^[A-Za-z_$][\w$]*$/.test(e) && api?.interfaces.has(e)) ||
    elements[0]
  );
};

/**
 * One object literal built from the fields that make this shape work.
 *
 * @param {Array<{ prop: string, type: string, optional?: boolean }>} fields
 * @param {object} api
 * @returns {string|null}
 */
const sampleObject = (fields, api) => {
  const picked = fields
    .filter((f) => !/=>/.test(f.type))
    .sort((a, b) => Number(b.optional === false) - Number(a.optional === false))
    .slice(0, 4);
  if (!picked.length) return null;
  return `{ ${picked.map((f) => `${f.prop}: ${exampleValue(f, api)}`).join(", ")} }`;
};

/**
 * The type a declaration really means, after the two shorthands `index.d.ts`
 * uses: `ContainerProps['alignItems']` is that field's own type, and
 * `Partial<TextProps>` is TextProps with every field optional.
 *
 * @param {string} raw
 * @param {object} api
 * @param {number} [depth]
 * @returns {string}
 */
const resolveType = (raw, api, depth = 0) => {
  const trimmed = (raw || "").trim();
  if (!trimmed || depth > 4) return trimmed;
  const indexed = /^([A-Za-z_$][\w$]*)\s*\[\s*['"]([^'"]+)['"]\s*\]$/.exec(trimmed);
  if (indexed) {
    const field = api?.interfaces.get(indexed[1])?.props.get(indexed[2]);
    return field ? resolveType(field.type, api, depth + 1) : trimmed;
  }
  const wrapped = /^(?:Partial|Required|Omit|Pick)\s*<\s*([A-Za-z_$][\w$]*)/i.exec(trimmed);
  if (wrapped) return resolveType(wrapped[1], api, depth + 1);
  return trimmed;
};

/**
 * An object literal that satisfies this type, or null when it describes a
 * primitive. Reads the four ways `index.d.ts` writes a shape — inline `{ a: 1 }`,
 * a named interface, `Record<key, value>` and a union of those — and keeps the
 * richest member it can build, so `(string | DataTableColumn)[]` prints a column
 * instead of a string.
 *
 * @param {string} type
 * @param {object} api
 * @returns {string|null}
 */
const objectSampleFor = (type, api) => {
  const trimmed = resolveType(type, api);
  const members = unionMembers(/^\(([\s\S]*)\)$/.test(trimmed) ? trimmed.slice(1, -1) : trimmed);
  for (const member of members) {
    const braces = /\{([\s\S]*)\}/.exec(member);
    if (braces) {
      const built = sampleObject(objectFields(braces[1]), api);
      if (built) return built;
      continue;
    }
    const record = /^Record\s*<([\s\S]*)>$/i.exec(member);
    if (record) {
      const value = splitTop(record[1], ",").at(-1);
      const primitive = { string: '"value"', number: "1", boolean: "true" }[value];
      return `{ id: ${primitive || objectSampleFor(value, api) || "1"} }`;
    }
    const named = api?.interfaces.get(member);
    if (named) {
      const built = sampleObject(
        [...named.props].map(([key, info]) => ({ prop: key, ...info })),
        api,
      );
      if (built) return built;
    }
  }
  return null;
};

/**
 * A value that actually type-checks for this prop, taken from its declared type.
 *
 * The type decides the kind of value, the prop name decides which sample of that
 * kind to show: `value` is `true` on Switch and `"Hello"` on Input because the
 * interface says so, not because the example guessed.
 *
 * @param {object} p
 * @param {object} api
 * @returns {string}
 */
const exampleValue = (p, api) => {
  const raw = resolveType(p.type || "", api);
  const type = raw.toLowerCase();
  if (p.structural)
    return p.prop === "children" ? `[Text({ text: "one" }), Text({ text: "two" })]` : `Text({ text: "hello" })`;
  // Lists are tested before callbacks, because an array of objects can contain
  // `=>` inside it: `Array<{ onPress?: () => void }>` is a list, not a handler.
  const element = arrayElement(raw, api);
  if (element !== null) {
    if (/widget/i.test(element)) return `[Text({ text: "a" }), Text({ text: "b" })]`;
    const one = objectSampleFor(element, api);
    if (one) return `[${one}]`;
    const first = unionMembers(element)[0] || element;
    if (/^string$/i.test(first) || /^'/.test(first)) return '["one", "two"]';
    if (/^number$/i.test(first)) return "[1, 2, 3]";
    if (/^boolean$/i.test(first)) return "[true, false]";
    return "[{ id: 1 }, { id: 2 }]";
  }
  // A renderer prop returns a Widget, so the example must return one too.
  if (/=>\s*(Widget|JSX|ReactNode)/.test(raw)) return '() => Text({ text: "…" })';
  if (p.engine?.kind === "event" || /=>/.test(type)) return "() => {}";
  if (/boolean/.test(type)) return "true";
  const literal = /'([^']+)'/.exec(raw);
  if (literal) return `"${literal[1]}"`;
  if (/color/i.test(raw)) return "colors.primary";
  if (/widget/i.test(raw)) return 'Text({ text: "a" })';
  // A shape the interface already describes is worth spelling out: `options:
  // SnackBarOptions` and `headers: Record<string, string>` are objects, not
  // strings.
  const shape = objectSampleFor(raw, api);
  if (shape) return shape;
  if (/^(Padding|Margin|Size|Spacing)$/i.test(raw) || /number|rem/.test(type)) return "16";
  const samples = {
    text: '"Hello"',
    label: '"Hello"',
    title: '"Hello"',
    caption: '"Hello"',
    value: '"Hello"',
    placeholder: '"Type here…"',
    name: '"name"',
    icon: '"home"',
    effect: '"opacity"',
    from: "1",
    to: "0",
    src: '"/assets/image.png"',
    href: '"/"',
    url: '"/"',
    alt: '"a short description"',
  };
  if (samples[p.prop] !== undefined) return samples[p.prop];
  // `options: SnackBarOptions` is an object the interface already describes.
  if (/^[A-Za-z_$][\w$]*$/.test(raw)) {
    const iface = api?.interfaces.get(raw);
    if (iface) {
      const one = sampleObject(
        [...iface.props].map(([key, info]) => ({ prop: key, ...info })),
        api,
      );
      if (one) return one;
    }
  }
  if (/^any$|^unknown$/i.test(raw)) return "1";
  if (/string|symbol/i.test(raw)) return `"${p.prop}"`;
  return `"${p.prop}"`;
};

const RANK = ["text", "label", "title", "placeholder", "value", "data", "items", "options", "rows", "src", "name"];
/**
 * Props a pasted example never needs to demonstrate: identity and style plumbing,
 * and the two sizes. A number sampled blind collapses the widget it is pasted
 * into — `Switch({ width: 16 })` is 16 units wide over a 24-unit knob — so the
 * canonical call lets each widget's own default size it.
 */
const SKIP = new Set(["ref", "key", "id", "className", "style", "width", "height"]);

/**
 * The order an example should demonstrate props in: what it says, what it does,
 * how it looks. Props outside these groups come last.
 */
const GROUPS = [RANK, ["padding", "margin", "gap", "bgColor", "color", "borderRadius"]];

/** Within the callback group a renderer says more than a hook, a hook more than an option. */
const callbackRank = (name) => (name.startsWith("render") ? 0 : name.startsWith("on") ? 1 : 2);

/**
 * Build a paste-ready call using only props this widget provably handles.
 *
 * @param {object} data
 * @param {object} api
 * @returns {string[]}
 */
const buildExample = (data, api) => {
  const dead = new Set(data.gaps.dead.map((p) => p.prop));
  const required = (p) => p.optional === false;
  // A required prop belongs in the example even when nothing reads it: the types
  // demand it, so a snippet without it would not compile. The gap is called out
  // underneath instead of being hidden.
  const forced = data.props.filter((p) => required(p) && !p.structural && (dead.has(p.prop) || (!p.read && !p.engine)));
  const usable = data.props.filter(
    (p) =>
      !p.structural &&
      (required(p) || ((p.read || p.engine) && !dead.has(p.prop))) &&
      // The example is the call an app pastes, so it carries the current spelling
      // only: `{ onPress, onToggle }` in one call teaches the retired name.
      !deprecationFor(data.name, p.prop) &&
      !SKIP.has(p.prop),
  );
  const groupOf = (p) => {
    if (RANK.includes(p.prop)) return 0;
    if (p.engine?.kind === "event" || /=>/.test((p.type || "").toLowerCase())) return 1;
    if (GROUPS[1].includes(p.prop)) return 2;
    return 3;
  };
  // Inside a group, the order the array declares is the order of interest:
  // `data` before `name`, `width` before `borderRadius`, a renderer before a hook.
  const within = (p) => {
    const g = groupOf(p);
    if (g === 0) return RANK.indexOf(p.prop);
    if (g === 1) return callbackRank(p.prop);
    if (g === 2) return GROUPS[1].indexOf(p.prop);
    return 9;
  };
  const score = (p) =>
    // A required prop is never optional in the example either: an interface
    // without it does not build, so it leads no matter which group it is in.
    (p.optional === false ? -100000 : 0) +
    groupOf(p) * 1000 +
    within(p) * 10 +
    (p.own ? 0 : 5) +
    // When two declared names reach one target the camelCase one wins: `onclick`
    // is a deliberate alias, but the example is what gets pasted, and the name
    // every page of the docs uses is `onClick`.
    (p.prop === p.prop.toLowerCase() ? 1 : 0);
  // One prop per engine target: `text`, `label`, `title` and `caption` all write
  // textContent, so an example carrying two of them is noise, not a demo.
  const seen = new Set();
  const samples = new Set();
  const picked = [];
  let callbacks = 0;
  for (const p of [...usable].sort(
    (a, b) => score(a) - score(b) || a.prop.localeCompare(b.prop),
  )) {
    const key = p.engine ? `${p.engine.kind}:${p.engine.domProp}` : `own:${p.prop}`;
    const required = p.optional === false;
    // Aliases share one engine target, so only the first of them is shown — but a
    // required prop is never dropped, even when a sibling writes the same target.
    if (seen.has(key) && !required) continue;
    // Two callbacks already tell the story; the rest of the example is layout.
    if (!required && groupOf(p) === 1 && callbacks >= 2) continue;
    // `text` and `value` on Text are both real props, but a snippet that writes
    // the same word twice teaches nothing, so only the first one is shown.
    const value = exampleValue(p, api);
    if (!required && value.startsWith('"') && samples.has(value)) continue;
    if (groupOf(p) === 1) callbacks++;
    seen.add(key);
    samples.add(value);
    picked.push(p);
    if (!required && picked.length >= 5) break;
  }
  // `child` and `children` are structural, so they never reach the loop above —
  // but a widget whose interface marks them required is broken without them.
  for (const p of data.props) {
    if (p.structural && p.optional === false && !seen.has(`own:${p.prop}`)) {
      seen.add(`own:${p.prop}`);
      picked.push(p);
    }
  }
  // A widget that already received its content prop (`text`, `data`, `label`)
  // does not also want a `child`: the example would contradict itself.
  const wantsChild =
    data.accepts.child &&
    !picked.some((p) => RANK.includes(p.prop) || p.engine?.kind === "text" || p.prop === "child");
  if (wantsChild) picked.push({ prop: "child", structural: true });

  const usesColors = picked.some((p) => exampleValue(p, api).includes("colors."));
  const usesText = picked.some((p) => exampleValue(p, api).includes("Text(") || wantsChild);
  const imports = [...new Set([data.name, ...(usesColors ? ["colors"] : []), ...(usesText ? ["Text"] : [])])];
  const out = [section("📋", `Paste-ready — ${data.name}`, "#22d3ee")];
  out.push(`   ${c("magenta", "import")} { ${imports.join(", ")} } ${c("magenta", "from")} ${c("green", "'flet-box'")};`);
  out.push("");

  if (data.call?.positional) {
    // Wrapping these in `{ … }` is the quietest bug an app can have: the call
    // builds, the widget reads `undefined`, nothing renders. So the example
    // passes arguments the way the declaration says.
    const args = data.call.params
      .filter((p) => !p.optional)
      .map((p) => exampleValue({ prop: p.name, type: p.type }, api));
    out.push(`   ${c("magenta", "const")} view = ${c("brightCyan", data.name)}(${c("green", args.join(", "))});`);
    out.push("");
    out.push(
      `   ${c("red", `⚠ ${data.name} takes positional arguments (${data.call.params.map((p) => p.name).join(", ")}) — a props object here is silently ignored`)}`,
    );
    out.push(
      `   ${c("gray", `see \`flet-box unpack ${data.name}\` for the props its interface declares`)}`,
    );
    return out;
  }

  out.push(`   ${c("magenta", "const")} view = ${c("brightCyan", `${data.name}`)}({`);
  const width = Math.min(28, Math.max(...picked.map((p) => p.prop.length)) + 1);
  for (const p of picked) {
    const value = exampleValue(p, api);
    out.push(`       ${cell(p.prop, "brightWhite", width)}: ${/^\(\) =>/.test(value) ? c("brightBlue", value) : c("green", value)},`);
  }
  out.push(`   });`);
  out.push("");
  if (forced.length)
    out.push(
      `   ${c("red", `⚠ ${forced.map((p) => p.prop).join(", ")} — required by index.d.ts, read by nothing: the widget ignores them`)}`,
    );
  if (data.call?.members.length)
    out.push(
      `   ${c("yellow", data.call.element ? "view also answers:" : "view is a controller, nothing shows until:")} ${c(
        "brightMagenta",
        ` ${data.call.members.slice(0, 9).join(" · ")}`,
      )}`,
    );
  out.push(
    `   ${c("gray", `${picked.length} of ${data.props.length} accepted props · each one reaches the DOM or is read by the widget · see \`flet-box unpack ${data.name}\` for the rest`)}`,
  );
  return out;
};

/**
 * Human-readable form of a whole API surface dump.
 *
 * @param {object[]} all
 * @param {object} api
 * @returns {string}
 */
const renderMarkdown = (all, api) => {
  const out = [
    "# FletBox API — unpacked",
    "",
    `Generated by \`flet-box unpack --all --md\` from \`flet-box@${api.pkg.version}\`. Do not edit.`,
    "",
    `Widgets: ${all.length}`,
    "",
  ];
  for (const data of all) {
    out.push(`## ${data.name}`, "");
    if (data.docFile) out.push(`Docs: \`docs/widget/${data.name}.md\` · Source: \`src/${path.relative(api.dir, data.sourceFile || "").replace(/\\/g, "/")}\``);
    out.push("", "| prop | type | engine target | aliases | notes |", "| --- | --- | --- | --- | --- |");
    for (const p of data.props) {
      const notes = [
        p.declared ? "" : "not declared",
        p.default !== null ? `default \`${p.default}\`` : "",
        p.structural ? "structural" : "",
        data.gaps.dead.includes(p) ? "DEAD" : "",
      ]
        .filter(Boolean)
        .join(", ");
      out.push(
        `| \`${p.prop}\` | \`${(p.type || "any").replace(/\|/g, "\\|")}\` | \`${p.engine ? p.engine.domProp : "—"}\` | ${p.aliasOf.map((a) => `\`${a}\``).join(" ")} | ${notes} |`,
      );
    }
    out.push("");
  }
  return out.join("\n");
};

/* ------------------------------------------------------------------ entry */

/**
 * @param {string[]} argv
 * @param {{ print?: Function }} [io]
 * @returns {Promise<{ exitCode: number }>}
 */
export const unpack = async (argv = [], io = {}) => {
  const print = io.print || ((line) => console.log(line));
  const root = (() => {
    const i = argv.indexOf("--root");
    return i >= 0 && argv[i + 1] ? path.resolve(argv[i + 1]) : process.cwd();
  })();

  let api;
  try {
    api = await loadApi(root);
  } catch (error) {
    print(c("red", `✗ ${error.message}`));
    return { exitCode: 1 };
  }
  const definitions = definitionIndex(api.dir);
  const widgets = api.exports
    .filter((name) => /^[A-Z]/.test(name) && propsSource(api, name))
    .sort();
  const utilities = api.exports.filter((name) => !/^[A-Z]/.test(name)).sort();

  // A generated app commits this file, so nothing in it may be this machine's
  // absolute path, and `events` is dropped: it is `props` filtered by
  // `engine.kind === "event"`, and repeating every event prop doubled the size
  // of the dump for nothing.
  const portable = (data) => {
    const rel = (p) => (p ? path.relative(api.dir, p).split(path.sep).join("/") : null);
    const { events, sourceFile, docFile, ...rest } = data;
    return {
      ...rest,
      sourceFile: rel(sourceFile),
      docFile: rel(docFile),
      documented: [...new Set(data.documented)],
    };
  };

  const surface = () => ({
    package: "flet-box",
    version: api.pkg.version,
    generatedBy: "flet-box unpack",
    engineProps: api.ALL_PROPS.length,
    widgets: Object.fromEntries(
      widgets.map((name) => [name, portable(unpackWidget(api, name, definitions))]),
    ),
    utilities,
  });

  const name = argv.find((a) => !a.startsWith("--"));

  if (argv.includes("--all")) {
    const all = widgets.map((n) => unpackWidget(api, n, definitions)).filter(Boolean);
    if (argv.includes("--json")) {
      print(JSON.stringify(surface(), null, 2));
      return { exitCode: 0 };
    }
    const dir = path.join(root, ".fletbox", "api");
    fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, "api.json");
    fs.writeFileSync(target, JSON.stringify(surface(), null, 2), "utf8");
    print(banner("📦 FletBox unpack", `${all.length} widgets · flet-box@${api.pkg.version}`));
    print(
      `   ${c("brightGreen", target)} ${c("gray", "— the whole verified surface, for the AI agent inside this app")}`,
    );
    if (argv.includes("--md")) {
      const md = path.join(dir, "api.md");
      fs.writeFileSync(md, renderMarkdown(all, api), "utf8");
      print(`   ${c("brightGreen", md)} ${c("gray", "— the same data, readable")}`);
    }
    if (argv.includes("--diff")) {
      const withGaps = all.filter(
        (d) =>
          d.gaps.dead.length + d.gaps.invented.length + d.gaps.hidden.length +
            d.gaps.docOnly.length + d.gaps.codeOnly.length >
            0,
      );
      print(section("🔬", `${withGaps.length}/${all.length} widgets disagree with themselves`, "#f59e0b"));
      for (const d of withGaps) {
        const parts = [
          d.gaps.dead.length && c("red", `dead: ${d.gaps.dead.map((p) => p.prop).join(" ")}`),
          d.gaps.docOnly.length && c("brightRed", `doc-only: ${d.gaps.docOnly.join(" ")}`),
          d.gaps.codeOnly.length && c("brightMagenta", `code-only: ${d.gaps.codeOnly.join(" ")}`),
          d.gaps.hidden.length && c("yellow", `not in .d.ts: ${d.gaps.hidden.map((p) => p.prop).join(" ")}`),
          d.gaps.invented.length && c("brightYellow", `invented: ${d.gaps.invented.map((p) => p.prop).join(" ")}`),
        ].filter(Boolean);
        print(`   ${cell(d.name, "brightWhite", 18)}${parts.join(c("gray", " · "))}`);
      }
    } else {
      const gaps = all.reduce(
        (n, d) =>
          n + d.props.filter((p) => p.declared && !p.engine && !p.read && !p.structural).length,
        0,
      );
      print(
        `   ${c("gray", `${all.reduce((n, d) => n + d.props.length, 0)} prop contracts · ${gaps} declared-but-dead · use \`flet-box unpack --all --diff\` to list them`)}`,
      );
    }
    return { exitCode: 0 };
  }

  if (!name) {
    if (argv.includes("--json")) {
      print(JSON.stringify(surface(), null, 2));
      return { exitCode: 0 };
    }
    print(c("red", "Usage: flet-box unpack <Widget> [--diff | --example | --json] | --all [--diff | --md]"));
    print(c("gray", `  ${widgets.length} widgets available — flet-box check-api --list`));
    return { exitCode: 1 };
  }

  const exact = widgets.includes(name) ? name : null;
  const target = exact || widgets.find((w) => w.toLowerCase() === name.toLowerCase());
  if (!target) {
    const guess = nearest(name, widgets);
    print(banner("📦 FletBox unpack", `flet-box@${api.pkg.version}`));
    print(`   ${c("red", `✗ "${name}" is not a FletBox widget`)}`);
    if (api.exports.includes(name))
      print(`   ${c("gray", `it is exported, but index.d.ts never types a props object for it — a singleton API, not a widget`)}`);
    print(
      guess
        ? `   ${c("gray", "did you mean")} ${c("brightCyan", guess)}?`
        : `   ${c("gray", "list them all with: flet-box check-api --list")}`,
    );
    return { exitCode: 1 };
  }

  const data = unpackWidget(api, target, definitions);
  if (argv.includes("--json")) {
    print(JSON.stringify(portable(data), null, 2));
    return { exitCode: 0 };
  }
  print(banner("📦 FletBox unpack", `${target} · flet-box@${api.pkg.version}`));
  if (argv.includes("--diff")) {
    for (const line of renderDiff(data)) print(line);
    return { exitCode: 0 };
  }
  if (argv.includes("--example")) {
    for (const line of buildExample(data, api)) print(line);
    return { exitCode: 0 };
  }
  for (const line of renderWidget(data, api)) print(line);
  return { exitCode: 0 };
};

export default unpack;
