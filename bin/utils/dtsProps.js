// bin/utils/dtsProps.js
// ============================================================
// MINIMAL `.d.ts` INTERFACE READER FOR THE CLI VALIDATOR
// ============================================================
// A generated app cannot build TypeScript, so the CLI derives the declared API
// straight from the shipped `src/index.d.ts` text. This parser understands the
// subset the file actually uses:
//
//   export interface ButtonProps extends CommonProps {
//     text?: string;
//     items: Array<{ icon: string; label?: string }>;
//   }
//   export interface GridViewProps extends Omit<ListViewProps, 'wrapItems'> {}
//
// It is deliberately forgiving: an unparseable member is skipped instead of
// throwing, because a partial API list still catches invented props, which is
// the whole point of `flet-box check-api`.
// ============================================================

/**
 * Split a brace-matched region into top-level interface members.
 *
 * Semicolons and newlines only end a member when every bracket, brace, paren
 * and type-argument list is closed, so `Array<{ a: number; b: number }>` stays
 * one member instead of two.
 *
 * @param {string} body Text between the interface's outer braces.
 * @returns {string[]} Member sources, comments still attached.
 */
const splitMembers = (body) => {
  const members = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    // `=>` is an arrow, not a closed type-argument list: consuming the `>` here
    // is what made every prop after the first callback type vanish.
    if (ch === "=" && body[i + 1] === ">") {
      current += "=>";
      i++;
      continue;
    }
    if (ch === "{" || ch === "[" || ch === "(" || ch === "<") depth++;
    else if (ch === "}" || ch === "]" || ch === ")" || ch === ">") depth--;
    else if (depth === 0 && (ch === ";" || ch === "\n")) {
      if (current.trim()) members.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) members.push(current.trim());
  return members;
};

/**
 * Parse `extends A, Omit<B, 'x' | 'y'>` into structured parents.
 *
 * @param {string} clause Everything between `extends` and the opening brace.
 * @returns {Array<{ name: string, omit: string[] }>}
 */
export const parseExtendsClause = (clause) => {
  if (!clause) return [];
  // The captured clause still carries the keyword itself; leaving it in would
  // resolve a parent named `extends` and silently drop all inherited props.
  const text = clause.replace(/^\s*extends\s+/i, "");
  const parents = [];
  let depth = 0;
  let current = "";
  const parts = [];
  for (const ch of text) {
    if (ch === "<") depth++;
    else if (ch === ">") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  for (const raw of parts) {
    const text = raw.trim();
    if (!text) continue;
    const omit = /^Omit\s*<\s*([A-Za-z_$][\w$]*)\s*,\s*([^>]*)>/.exec(text);
    if (omit) {
      parents.push({
        name: omit[1],
        omit: [...omit[2].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]),
      });
      continue;
    }
    const plain = /^([A-Za-z_$][\w$]*)/.exec(text);
    if (plain) parents.push({ name: plain[1], omit: [] });
  }
  return parents;
};

/**
 * Read every `interface`/`type X = { ... }` declaration out of a `.d.ts` source.
 *
 * @param {string} source Full file text.
 * @returns {Map<string, { parents: Array<{ name: string, omit: string[] }>, props: Map<string, { type: string, optional: boolean }> }>}
 */
export const parseInterfaces = (source) => {
  const interfaces = new Map();
  // Comments can contain `interface` in prose; strip them first so brace
  // matching never starts on a documentation example.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const header =
    /(export\s+)?(?:declare\s+)?(?:interface\s+([A-Za-z_$][\w$]*)|type\s+([A-Za-z_$][\w$]*)\s*=\s*)([^{]*)\{/g;
  let match;
  while ((match = header.exec(code))) {
    const name = match[2] || match[3];
    if (!name) continue;
    const clause = match[4] || "";
    const open = match.index + match[0].length - 1;
    let depth = 0;
    let close = -1;
    for (let i = open; i < code.length; i++) {
      if (code[i] === "{") depth++;
      else if (code[i] === "}") {
        depth--;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    if (close < 0) continue;
    const props = new Map();
    for (const member of splitMembers(code.slice(open + 1, close))) {
      const field = /^['"]?([A-Za-z_$][\w$]*)['"]?\s*(\?)?\s*:\s*([\s\S]+)$/.exec(
        member.replace(/\s+/g, " ").trim(),
      );
      if (!field) continue;
      props.set(field[1], {
        type: field[3].replace(/;$/, "").trim(),
        optional: field[2] === "?",
      });
    }
    interfaces.set(name, { parents: parseExtendsClause(clause), props });
    header.lastIndex = close;
  }
  return interfaces;
};

/**
 * Flatten an interface with its inheritance chain, honouring `Omit<...>`.
 *
 * @param {Map} interfaces Output of `parseInterfaces`.
 * @param {string} name Interface to resolve.
 * @param {Set<string>} [seen] Guard against a cyclic `extends`.
 * @returns {Map<string, { type: string, optional: boolean, declaredBy: string }>}
 */
export const resolveInterfaceProps = (interfaces, name, seen = new Set()) => {
  const resolved = new Map();
  if (seen.has(name)) return resolved;
  seen.add(name);
  const entry = interfaces.get(name);
  if (!entry) return resolved;
  for (const parent of entry.parents) {
    const inherited = resolveInterfaceProps(interfaces, parent.name, seen);
    for (const [prop, info] of inherited) {
      if (parent.omit.includes(prop)) continue;
      if (!resolved.has(prop)) resolved.set(prop, info);
    }
  }
  for (const [prop, info] of entry.props) {
    resolved.set(prop, { ...info, declaredBy: name });
  }
  return resolved;
};

/**
 * Find the declaration that types a widget's props object.
 *
 * `AppBar` is typed by `AppBarProps`; a few widgets reuse another widget's
 * interface, so the search also accepts the first `<Name>Props` that exists.
 *
 * @param {Map} interfaces
 * @param {string} widgetName Exported widget name.
 * @returns {string | null}
 */
export const propsInterfaceFor = (interfaces, widgetName) => {
  const direct = `${widgetName}Props`;
  if (interfaces.has(direct)) return direct;
  const alt = `${widgetName}Options`;
  if (interfaces.has(alt)) return alt;
  return null;
};
