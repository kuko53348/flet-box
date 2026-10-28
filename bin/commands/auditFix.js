/**
 * `flet-box audit-fix` — write what `check-api` only reports.
 *
 * Three repairs, all anchored to spans the gate already knows how to find:
 *
 *   imports    a relative path that does not resolve, a name the target module
 *              never exports, a default import from a module without a default,
 *              and identifiers used with no import at all (a flet-box export, or
 *              a Node builtin used as `path.join(…)`).
 *   props      a key inside `Widget({ … })` that neither the widget's declared
 *              props, the structural props, nor the engine registry knows —
 *              `chilldren` → `children`, `postion` → `position`.
 *   migrations a key inside `Widget({ … })` that the widget still honours but no
 *              longer recommends — `Radio({ onSelect })` → `Radio({ onPress })`.
 *
 * A rewrite only happens when the intended name is unambiguous: one candidate,
 * edit distance small enough that no real name could collide with it. Anything
 * else is printed as untouched. Guessing a prop is worse than leaving it dead —
 * a wrong key that happens to be valid changes the UI silently, and the gate
 * would no longer complain about it.
 */
import fs from "node:fs";
import path from "node:path";
import { c, banner, section } from "../utils/colors.js";
import { neutralise } from "../utils/neutralise.js";
import { resolveLocalModule, readModuleExports } from "../utils/moduleExports.js";
import { resolveInterfaceProps } from "../utils/dtsProps.js";
import { deprecationFor } from "../../src/widget-factory/deprecations.js";
import {
  STRUCTURAL_PROPS,
  collectSources,
  distance,
  loadApi,
  nearest,
} from "./checkApi.js";

const BUILTINS = [
  "assert",
  "buffer",
  "child_process",
  "crypto",
  "dns",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "net",
  "os",
  "path",
  "process",
  "querystring",
  "readline",
  "stream",
  "url",
  "util",
  "zlib",
];

const IMPORT_RE = /import\s+([\s\S]*?)\s*from\s*['"]([^'"]+)['"]/g;
const RE_EXPORT_RE = /export\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Index of the `)` closing the `(` at `open`, or -1.
 *
 * Safe on a neutralised body: string and comment characters are blanked, so
 * every parenthesis here is real syntax.
 *
 * @param {string} text
 * @param {number} open
 * @returns {number}
 */
const closeParen = (text, open) => {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

/**
 * Index of the character closing the one at `open`, or -1.
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
 * Split a destructuring pattern on its top-level commas only.
 *
 * @param {string} text
 * @returns {string[]}
 */
const splitTopLevel = (text) => {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "{" || ch === "[" || ch === "(") depth++;
    else if (ch === "}" || ch === "]" || ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts;
};

/**
 * @param {string} text Neutralised source.
 * @returns {Set<string>} every name the file binds itself.
 */
const collectBindings = (text) => {
  const names = new Set();
  const add = (raw) => {
    for (const token of splitTopLevel(raw)) {
      const head = token.trim();
      if (!head || head.startsWith("...")) continue;
      const t = head.split("=")[0].trim(); // `margin = 16` still binds margin
      const aliased = /\bas\s+([A-Za-z_$][\w$]*)$/.exec(t);
      if (aliased) {
        names.add(aliased[1]);
        continue;
      }
      const renamed = /^([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$]*)$/.exec(t);
      if (renamed) {
        names.add(renamed[2]); // `{ marginTop: propMarginTop }` binds the right side
        continue;
      }
      const plain = /^[A-Za-z_$][\w$]*$/.exec(t);
      if (plain) {
        names.add(plain[0]);
        continue;
      }
      const nested = /[[{]([\s\S]*)[\]}]$/.exec(t); // `{ a, b: { c } }` binds c
      if (nested) add(nested[1]);
    }
  };
  for (const m of text.matchAll(IMPORT_RE)) {
    const clause = m[1];
    const braces = /\{([^}]*)\}/.exec(clause);
    if (braces) add(braces[1]);
    const head = clause.replace(/\{[^}]*\}/g, "").replace(/\*[\s\S]*$/, "").trim();
    const def = /^([A-Za-z_$][\w$]*)/.exec(head);
    if (def) names.add(def[1]);
    const star = /\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(clause);
    if (star) names.add(star[1]);
  }
  for (const m of text.matchAll(/export\s*\{([^}]*)\}\s*from/g)) add(m[1]);
  // Patterns are matched by bracket depth, not by regex: a default like
  // `style = {}` ends a `[^}]*` capture early and loses every name after it.
  for (const m of text.matchAll(/\b(?:const|let|var)\s*(?=[\[{A-Za-z_$])/g)) {
    let i = m.index + m[0].length;
    while (i < text.length) {
      const c = text[i];
      if (c === "{" || c === "[") {
        const end = matchPair(text, i);
        if (end < 0) break;
        add(text.slice(i + 1, end));
        i = end + 1;
      } else if (/[A-Za-z_$]/.test(c)) {
        const id = /^[A-Za-z_$][\w$]*/.exec(text.slice(i))[0];
        names.add(id);
        i += id.length;
      } else break;
      const rest = /^\s*=[\s\S]*?,\s*(?=[\[{A-Za-z_$])/.exec(text.slice(i));
      if (!rest) break;
      i += rest[0].length;
    }
  }
  for (const m of text.matchAll(/\b(?:function|class)\s*\*?\s*([A-Za-z_$][\w$]*)/g)) {
    names.add(m[1]);
  }
  for (const m of text.matchAll(/\(([^()]*)\)\s*(?:=>|\{)/g)) add(m[1].replace(/=.*/g, ""));
  for (const m of text.matchAll(/\bcatch\s*\(\s*([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  return names;
};

/**
 * Pick a file to point a broken relative specifier at.
 *
 * @param {string} fromFile
 * @param {string} source
 * @param {string[]} allSources
 * @returns {{ relative: string }|null}
 */
const suggestPath = (fromFile, source, allSources) => {
  const wanted = path.basename(source).replace(/\.m?js$/, "");
  const dir = path.resolve(path.dirname(fromFile), path.dirname(source));
  const inSameDir = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((name) => /\.m?js$/.test(name))
        .map((name) => path.join(dir, name))
    : [];
  const pool = inSameDir.length ? inSameDir : allSources;
  const hit = nearest(wanted, pool.map((file) => path.basename(file).replace(/\.m?js$/, "")));
  if (!hit) return null;
  const target = pool.find((file) => path.basename(file).replace(/\.m?js$/, "") === hit);
  if (!target) return null;
  let relative = path.relative(path.dirname(fromFile), target).replace(/\\/g, "/");
  if (!relative.startsWith(".")) relative = `./${relative}`;
  return { relative: /\.m?js$/.test(relative) ? relative : `${relative}.js` };
};

/**
 * The single near match for a mistyped name, or null when it is not safe to
 * rewrite. Length gates the tolerance so `top` cannot become `tooltip`.
 *
 * @param {string} wanted
 * @param {Iterable<string>} candidates
 * @returns {string|null}
 */
const strictMatch = (wanted, candidates) => {
  const budget = wanted.length >= 9 ? 2 : wanted.length >= 4 ? 1 : 0;
  const lower = wanted.toLowerCase();
  let best = null;
  let bestScore = budget + 1;
  for (const candidate of candidates) {
    if (candidate === wanted) return null;
    const score = distance(lower, candidate.toLowerCase());
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    } else if (score === bestScore) {
      best = null; // ambiguous — two names equally close
    }
  }
  return best;
};

/**
 * Top-level keys of an object literal, with their spans.
 *
 * `entryEnd` is where the whole entry ends — the key *and* its value — which
 * is what a removal has to take, since deleting a key without its value would
 * leave the value behind.
 *
 * @param {string} code comment/string-free source
 * @param {number} open index of `{`
 * @returns {{ keys: Array<{ name: string, start: number, end: number, entryEnd: number }>, opaque: boolean }}
 */
const literalKeySpans = (code, open) => {
  const keys = [];
  let depth = 0;
  let current = "";
  let entryStart = open;
  let opaque = false;
  const flush = () => {
    const text = current.trim();
    const lead = current.indexOf(text.length ? text[0] : "");
    const at = entryStart + (text ? lead : 0);
    current = "";
    if (!text) return;
    const entryEnd = at + text.length;
    if (text.startsWith("...")) {
      opaque = true;
      return;
    }
    const key = /^(?:async\s+)?['"]?([A-Za-z_$][\w$]*)['"]?\s*:/.exec(text);
    if (key) {
      const start = at + text.indexOf(key[1]);
      keys.push({ name: key[1], start, end: start + key[1].length, entryEnd });
    } else if (/^[A-Za-z_$][\w$]*$/.test(text)) {
      keys.push({ name: text, start: at, end: at + text.length, entryEnd });
    }
  };
  for (let i = open; i < code.length; i++) {
    const ch = code[i];
    if (ch === "{") {
      depth++;
      if (depth === 1) {
        entryStart = i + 1;
        continue;
      }
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        flush();
        return { keys, opaque };
      }
    } else if (depth === 1 && ch === ",") {
      flush();
      entryStart = i + 1;
      continue;
    }
    if (depth >= 1) current += ch;
  }
  flush();
  return { keys, opaque };
};

/**
 * @typedef {{ start: number, end: number, text: string, note: string|null, kind: string }} Edit
 */

/**
 * Plan the import rewrites for one file.
 *
 * @param {string} file
 * @param {string} code
 * @param {object} api
 * @param {string[]} allSources
 * @returns {{ edits: Edit[], skipped: string[] }}
 */
const planImports = (file, code, api, allSources) => {
  const edits = [];
  const skipped = [];
  const rel = path.relative(api.root, file);
  const withStrings = neutralise(code, { keepStrings: true });
  const spec = (match, source) => {
    const at = match[0].lastIndexOf(source);
    return { start: match.index + at, end: match.index + at + source.length };
  };
  const clauseSpan = (match, clause) => {
    const at = match[0].indexOf(clause, 6);
    return { start: match.index + at, end: match.index + at + clause.length };
  };

  for (const { re, isImport } of [
    { re: IMPORT_RE, isImport: true },
    { re: RE_EXPORT_RE, isImport: false },
  ]) {
    for (const match of withStrings.matchAll(re)) {
      let source = match[2];
      if (!source.startsWith(".") && !source.startsWith("/")) continue;
      const originalClause = match[1];
      let fixedClause = isImport ? originalClause : `{${originalClause}}`;
      const originalSpanText = fixedClause;
      const notes = [];
      let target = resolveLocalModule(file, source);
      if (!target) {
        const fix = suggestPath(file, source, allSources);
        if (!fix) {
          skipped.push(`${rel}: "${source}" has no near match`);
          continue;
        }
        edits.push({
          ...spec(match, source),
          text: fix.relative,
          note: `${c("brightRed", source)} → ${c("brightGreen", fix.relative)}`,
          kind: "path",
        });
        // The repaired path is checked too: a typo usually breaks both the
        // specifier and the names imported through it.
        target = resolveLocalModule(file, fix.relative);
        if (!target) continue;
        source = fix.relative;
      }

      const surface = readModuleExports(target, api.moduleCache);
      if (surface.opaque) continue;

      if (isImport) {
        const head = fixedClause.replace(/\{[^}]*\}/g, "").replace(/\*[\s\S]*$/, "").trim();
        const def = /^([A-Za-z_$][\w$]*)\s*,?\s*$/.exec(head);
        if (def && !surface.hasDefault) {
          const local = def[1];
          const real = strictMatch(local, surface.named);
          const hint = nearest(local, [...surface.named]);
          if (!real) {
            skipped.push(
              `${rel}: "${source}" has no default export and "${local}" matches none of its names${
                hint ? ` — closest is ${c("brightGreen", hint)}${c("gray", ", but that is a guess")}` : ""
              }`,
            );
          } else {
            fixedClause = real === local ? `{ ${local} }` : `{ ${real} as ${local} }`;
            notes.push(
              `${c("brightRed", `import ${local} from`)} ${c("gray", "→")} ${c("brightGreen", `import { ${real} } from`)} ${c("gray", source)}`,
            );
          }
        }
      }

      const braces = /\{([^}]*)\}/.exec(fixedClause);
      if (braces) {
        for (const part of braces[1].split(",")) {
          const token = part.trim();
          if (!token) continue;
          const aliased = /^(\S+)\s+as\s+(\S+)$/.exec(token);
          const wanted = aliased ? aliased[1] : token;
          if (wanted === "default" || surface.named.has(wanted)) continue;
          const real = strictMatch(wanted, surface.named);
          if (!real) {
            skipped.push(`${rel}: "${wanted}" is not exported by "${source}" — too far from any name`);
            continue;
          }
          fixedClause = fixedClause.replace(
            new RegExp(`(?<![\\w$])${escapeRe(wanted)}(?![\\w$])`),
            real,
          );
          let uses = 0;
          if (!aliased) {
            const span = clauseSpan(match, originalSpanText);
            const useRe = new RegExp(`(?<![\\w$])${escapeRe(wanted)}(?![\\w$])`, "g");
            for (const use of withStrings.matchAll(useRe)) {
              if (use.index >= span.start && use.index < span.end) continue;
              uses++;
              edits.push({
                start: use.index,
                end: use.index + wanted.length,
                text: real,
                note: null,
                kind: "use",
              });
            }
          }
          notes.push(
            `${c("brightRed", wanted)} → ${c("brightGreen", real)}${uses ? ` ${c("gray", `(+${uses} use${uses > 1 ? "s" : ""})`)}` : ""}`,
          );
        }
      }

      if (fixedClause !== (isImport ? originalClause : `{${originalClause}}`)) {
        edits.push({
          ...clauseSpan(match, isImport ? originalClause : `{${originalClause}}`),
          text: fixedClause,
          note: notes.join(` ${c("gray", "·")} `),
          kind: "name",
        });
      }
    }
  }

  // identifiers used with no import at all
  const body = neutralise(code);
  const bound = collectBindings(body);
  const addFlet = [];
  const addBuiltin = [];

  /**
   * Does this file really *use* `name`, or only mention it?
   *
   * Two shapes look like a free call and are not: a method definition
   * (`rgba() { … }`, `filter(cb) { … }`) and a DOM constructor (`new Image()`).
   * Adding an import for either shadows the very thing being used.
   *
   * @param {string} name
   * @param {boolean} memberOnly `true` for builtins, matched as `name.method`
   * @returns {boolean}
   */
  const usedAs = (name, memberOnly) => {
    const re = new RegExp(`(?<![\\w$.])${escapeRe(name)}\\s*(${memberOnly ? "\\." : "[.(]"})`, "g");
    for (const match of body.matchAll(re)) {
      if (/new\s*$/.test(body.slice(0, match.index))) continue;
      if (match[1] === "(") {
        const close = closeParen(body, body.indexOf("(", match.index));
        if (close < 0) continue;
        if (/^[{:=]/.test(body.slice(close + 1, close + 30).trimStart())) continue;
      }
      return true;
    }
    return false;
  };

  for (const name of BUILTINS) {
    if (!bound.has(name) && usedAs(name, true)) addBuiltin.push(name);
  }
  for (const name of api.exports) {
    if (!bound.has(name) && usedAs(name, false)) addFlet.push(name);
  }

  const insertAt = (() => {
    const imports = [...code.matchAll(/^import\s[^\n]*\n/gm)];
    if (!imports.length) return /^#!.*\n/.test(code) ? code.split("\n")[0].length + 1 : 0;
    const last = imports[imports.length - 1];
    return last.index + last[0].length;
  })();

  if (addFlet.length) {
    const fletMatch = /import\s*\{[^}]*\}\s*from\s*['"]flet-box['"]/.exec(withStrings);
    if (fletMatch) {
      const open = fletMatch.index + fletMatch[0].indexOf("{") + 1;
      edits.push({
        start: open,
        end: open,
        text: `${addFlet.join(", ")}, `,
        note: `added ${c("brightGreen", addFlet.join(", "))} ${c("gray", "to the flet-box import")}`,
        kind: "missing",
      });
    } else {
      edits.push({
        start: insertAt,
        end: insertAt,
        text: `import { ${addFlet.join(", ")} } from 'flet-box';\n`,
        note: `added ${c("brightGreen", `import { ${addFlet.join(", ")} } from 'flet-box'`)}`,
        kind: "missing",
      });
    }
  }
  for (const name of addBuiltin) {
    edits.push({
      start: insertAt,
      end: insertAt,
      text: `import ${name} from "node:${name}";\n`,
      note: `added ${c("brightGreen", `import ${name} from "node:${name}"`)}`,
      kind: "missing",
    });
  }

  return { edits, skipped };
};

/**
 * The widgets an app imported from flet-box, as `local name → exported name`.
 *
 * Only capitalised exports are widgets; the rest of the barrel is functions
 * and tools, and a call to one of those never carries a props object.
 *
 * @param {string} withStrings Neutralised source, strings kept.
 * @returns {Map<string, string>}
 */
const fletWidgetImports = (withStrings) => {
  const localToWidget = new Map();
  for (const match of withStrings.matchAll(IMPORT_RE)) {
    if (match[2] !== "flet-box") continue;
    const braces = /\{([^}]*)\}/.exec(match[1]);
    if (!braces) continue;
    for (const part of braces[1].split(",")) {
      const token = part.trim();
      if (!token) continue;
      const aliased = /^(\S+)\s+as\s+(\S+)$/.exec(token);
      const exported = aliased ? aliased[1] : token;
      const local = aliased ? aliased[2] : token;
      if (/^[A-Z]/.test(exported)) localToWidget.set(local, exported);
    }
  }
  return localToWidget;
};

/**
 * The value written after a key of an object literal, or null.
 *
 * @param {string} code Source with the strings kept — a neutralised string
 *   keeps its quotes but loses its content, and the content is the value.
 * @param {{ end: number }} key The key's span.
 * @returns {string|null}
 */
const keyValue = (code, key) => {
  const match = /^\s*:\s*['"]?([^'"\s,}]+)/.exec(code.slice(key.end, key.end + 80));
  return match ? match[1] : null;
};

/**
 * The span that removes one entry of an object literal, comma included.
 *
 * @param {Array<{ start: number, end: number, entryEnd: number }>} keys
 * @param {number} index The entry to remove.
 * @returns {{ start: number, end: number }}
 */
const removalSpan = (keys, index) => {
  const key = keys[index];
  const next = keys[index + 1];
  if (next) return { start: key.start, end: next.start };
  const prev = keys[index - 1];
  if (prev) return { start: prev.entryEnd, end: key.entryEnd };
  return { start: key.start, end: key.entryEnd };
};

/**
 * Plan the prop-key rewrites for one file.
 *
 * @param {string} file
 * @param {string} code
 * @param {object} api
 * @returns {{ edits: Edit[], skipped: string[] }}
 */
const planProps = (file, code, api) => {
  const edits = [];
  const skipped = [];
  const rel = path.relative(api.root, file);
  const withStrings = neutralise(code, { keepStrings: true });
  const body = neutralise(code);

  const localToWidget = fletWidgetImports(withStrings);

  for (const [local, exported] of localToWidget) {
    const iface = `${exported}Props`;
    if (!api.interfaces.has(iface)) continue;
    const declared = resolveInterfaceProps(api.interfaces, iface);
    const known = new Set([...declared.keys(), ...Object.keys(api.PROP_MAP)]);
    const callRe = new RegExp(`\\b${escapeRe(local)}\\s*\\(\\s*\\{`, "g");
    let call;
    while ((call = callRe.exec(body))) {
      const open = call.index + call[0].length - 1;
      const { keys, opaque } = literalKeySpans(body, open);
      if (opaque) continue;
      for (const key of keys) {
        if (known.has(key.name) || STRUCTURAL_PROPS.has(key.name)) continue;
        const real = strictMatch(key.name, known);
        if (!real) {
          skipped.push(`${rel}: ${exported}({ ${key.name} }) — nothing close enough to guess`);
          continue;
        }
        edits.push({
          start: key.start,
          end: key.end,
          text: real,
          note: `${exported}({ ${c("brightRed", key.name)} }) → ${c("brightGreen", real)}`,
          kind: "prop",
        });
      }
    }
  }

  return { edits, skipped };
};

/**
 * Plan the renames an app can make without touching a line by hand.
 *
 * A prop the framework still honours but no longer recommends is not broken
 * code, so `check-api` has nothing to say about it — but every screen that
 * keeps the old name keeps an old spelling forever. The table in
 * `src/widget-factory/deprecations.js` is the list, and it is per widget
 * because the same name means different things in different widgets.
 *
 * The rewrite only happens when it is provably the same call: the widget has to
 * declare the old name, it has to declare the new one, and the call must not
 * already carry the new one (two callbacks for one event is a decision, not a
 * rename).
 *
 * A row with no target (`to: null`) is a prop nobody reads any more: the key
 * is removed, together with the comma that held it.
 *
 * @param {string} file
 * @param {string} code
 * @param {object} api
 * @returns {{ edits: Edit[], skipped: string[] }}
 */
const planMigrations = (file, code, api) => {
  const edits = [];
  const skipped = [];
  const rel = path.relative(api.root, file);
  const withStrings = neutralise(code, { keepStrings: true });
  const body = neutralise(code);

  for (const [local, exported] of fletWidgetImports(withStrings)) {
    const iface = `${exported}Props`;
    if (!api.interfaces.has(iface)) continue;
    const declared = resolveInterfaceProps(api.interfaces, iface);
    const callRe = new RegExp(`\\b${escapeRe(local)}\\s*\\(\\s*\\{`, "g");
    let call;
    while ((call = callRe.exec(body))) {
      const open = call.index + call[0].length - 1;
      const { keys, opaque } = literalKeySpans(body, open);
      if (opaque) continue;
      const byName = new Map(keys.map((entry) => [entry.name, entry]));

      for (const key of keys) {
        const rule = deprecationFor(exported, key.name);
        if (!rule || !rule.to) continue;
        if (!declared.has(rule.from) || !declared.has(rule.to)) {
          skipped.push(`${rel}: ${exported}({ ${key.name} }) — the widget does not declare the pair`);
          continue;
        }
        const inert = (rule.guard || []).find((name) => byName.has(name));
        if (inert) {
          skipped.push(
            `${rel}: ${exported}({ ${key.name} }) — ${inert} is already there, so the old name does nothing`,
          );
          continue;
        }
        let target = rule.to;
        if (rule.alternate) {
          const side = byName.get(rule.alternate.prop);
          if (side && keyValue(withStrings, side) === rule.alternate.value) {
            target = rule.alternate.to;
          }
        }
        if (byName.has(target)) {
          skipped.push(
            `${rel}: ${exported}({ ${key.name} }) — ${target} is already there; two callbacks for one event is your call`,
          );
          continue;
        }
        edits.push({
          start: key.start,
          end: key.end,
          text: target,
          note: `${exported}({ ${c("brightRed", key.name)} }) → ${c("brightGreen", target)}`,
          kind: "migration",
        });
      }

      // The removals run after the renames: a prop that only meant something
      // next to another one goes away with it.
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const rule = deprecationFor(exported, key.name);
        if (!rule || rule.to) continue;
        if (!declared.has(rule.from)) continue;
        edits.push({
          ...removalSpan(keys, index),
          text: "",
          note: `${exported}({ ${c("brightRed", key.name)} }) → ${c("brightGreen", "removed")}`,
          kind: "migration",
        });
      }
    }
  }

  return { edits, skipped };
};

/**
 * Apply planned edits to one file.
 *
 * Edits run back to front so earlier offsets stay valid, and anything that
 * would land inside an already-applied edit is dropped rather than merged.
 *
 * @param {string} code
 * @param {Edit[]} edits
 * @returns {{ text: string, notes: string[] }}
 */
const applyEdits = (code, edits) => {
  const sorted = edits.sort((a, b) => b.start - a.start);
  let out = code;
  let cursor = Infinity;
  const notes = [];
  for (const edit of sorted) {
    if (edit.end > cursor) continue;
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
    cursor = edit.start;
    if (edit.note) notes.push(edit.note);
  }
  return { text: out, notes: notes.reverse() };
};

/**
 * @param {string[]} argv
 * @param {{ print?: Function }} [io]
 * @returns {Promise<{ exitCode: number, changed: string[], untouched: string[] }>}
 */
export const auditFix = async (argv = [], io = {}) => {
  const print = io.print || ((line) => console.log(line));
  const root = (() => {
    const i = argv.indexOf("--root");
    return i >= 0 && argv[i + 1] ? path.resolve(argv[i + 1]) : process.cwd();
  })();
  const onlyFlag = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;
  if (onlyFlag && !["imports", "props", "migrations"].includes(onlyFlag)) {
    print(c("red", `--only expects "imports", "props" or "migrations", got "${onlyFlag}"`));
    return { exitCode: 1, changed: [], untouched: [] };
  }
  const only = {
    imports: !onlyFlag || onlyFlag === "imports",
    props: !onlyFlag || onlyFlag === "props",
    migrations: !onlyFlag || onlyFlag === "migrations",
  };

  let api;
  try {
    api = await loadApi(root);
  } catch (error) {
    print(c("red", `✗ ${error.message}`));
    return { exitCode: 1, changed: [], untouched: [] };
  }
  api.root = root;
  api.moduleCache = new Map();

  const files = collectSources(root);
  const changed = [];
  const untouched = [];
  const passes = [
    only.imports && "imports",
    only.props && "props",
    only.migrations && "migrations",
  ].filter(Boolean);

  print(banner("🔧 FletBox audit fix", `${files.length} file(s) · ${passes.join(" + ")}`));

  for (const file of files) {
    const code = fs.readFileSync(file, "utf8");
    let text = code;
    const notes = [];

    // Imports first, then props on the repaired text: a widget whose import
    // line was missing is only provably a flet-box widget after the fix.
    const runs = [];
    if (only.imports) runs.push(() => planImports(file, text, api, files));
    if (only.props) runs.push(() => planProps(file, text, api));
    if (only.migrations) runs.push(() => planMigrations(file, text, api));
    for (const run of runs) {
      const plan = run();
      untouched.push(...plan.skipped);
      const applied = applyEdits(text, plan.edits);
      text = applied.text;
      notes.push(...applied.notes);
    }
    if (text === code) continue;

    fs.writeFileSync(file, text, "utf8");
    changed.push(path.relative(root, file));
    print(section("📄", path.relative(root, file)));
    for (const note of notes) print(`   ${c("cyan", "·")} ${note}`);
  }

  if (untouched.length) {
    print(section("🔍", "Left for you to decide", "#f59e0b"));
    for (const line of untouched) print(`   ${c("yellow", "!")} ${line}`);
  }

  print(
    changed.length
      ? `\n${c("brightGreen", `${changed.length} file(s) rewritten`)} ${c("gray", "— run npm run verify to confirm, and git diff to review.")}`
      : c("gray", "\nNothing to rewrite — every import resolves and every prop is known."),
  );
  return { exitCode: 0, changed, untouched };
};

export default auditFix;
