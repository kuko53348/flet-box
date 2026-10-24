// bin/utils/skills.js
//
// The `skills/` folder at the package root is the ONLY source for the agent
// skills. Claude Code and Qoder load `.claude/skills/<name>/SKILL.md` and
// `.qoder/skills/<name>/SKILL.md` by frontmatter description, so `flet-box create`
// copies each file into both roots byte-for-byte. Keeping the text in a real
// markdown file (instead of a 450-line array of strings in templates.js) means an
// editor, a diff and `scripts/check-skills.mjs` can all read the same bytes the
// agent will.
//
// Node core only: `bin/` may not import a devDependency at module scope.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Absolute path of the folder that holds every shipped skill. */
export const skillRoot = () => path.join(packageDir, "skills");

/** Kebab-case folder names, sorted, skipping anything without a SKILL.md. */
export const skillNames = () => {
  let entries = [];
  try {
    entries = fs.readdirSync(skillRoot(), { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(skillRoot(), name, "SKILL.md")))
    .sort();
};

/**
 * The full skill text, frontmatter included.
 * @throws when the skill does not exist — a missing skill is a build error, not
 * a silent skip, or an app ships with half the contract and no one notices.
 */
export const readSkill = (name) =>
  fs.readFileSync(path.join(skillRoot(), name, "SKILL.md"), "utf8");

/** The `key: value` lines between the two `---` fences. */
export const readFrontmatter = (name) => {
  const text = readSkill(name);
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!match) throw new Error(`skill "${name}" has no frontmatter block`);
  const fields = {};
  for (const line of match[1].split("\n")) {
    const pair = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (pair) fields[pair[1]] = pair[2];
  }
  return fields;
};

/** One short sentence for a Cursor rule or an index: the description field. */
export const skillDescription = (name) => readFrontmatter(name).description || name;
