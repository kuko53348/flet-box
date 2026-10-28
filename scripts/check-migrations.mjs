// scripts/check-migrations.mjs
//
// Contract for the migration guide — the page that tells an app what changed
// between two FletBox releases.
//
// A rename in this framework lives in four places, and the whole point of this
// file is that they cannot drift apart:
//
//   the types        `src/index.d.ts` marks the old prop `@deprecated`;
//   the table        `src/widget-factory/deprecations.js` says what to write
//                    instead, and which release renamed it;
//   the guide        `docs/guides/migration.md` says it in words, one row per
//                    changed prop, under the version that changed it;
//   the codemod      `flet-box audit-fix --only migrations` writes it for an
//                    app that cannot be edited by hand.
//
// If one of them learns about a rename and the others do not, the app breaks
// on a machine that is not ours. So each rule is proven twice: once by
// breaking it, once by obeying it.
//
// Run with: node scripts/check-migrations.mjs — it is in `npm test`.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEPRECATED_PROPS } from "../src/widget-factory/deprecations.js";
import { emitCheatsheet, loadApi } from "../bin/commands/checkApi.js";
import { unpack } from "../bin/commands/unpack.js";
import { parseInterfaces, propsInterfaceFor, resolveInterfaceProps } from "../bin/utils/dtsProps.js";
import {
  GUIDE_RELATIVE,
  isFrameworkProject,
  missingMigration,
  readGuide,
  rowsFor,
  sections,
} from "../bin/utils/migrationGuide.js";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-migrations-"));

const failures = [];
const check = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  FAIL ${name} — ${error.message}`);
  }
};

// ---------------------------------------------------------------------------
// The types, read for their `@deprecated` markers
// ---------------------------------------------------------------------------

/**
 * Every member of every interface that carries an `@deprecated` marker.
 *
 * The comment blocks are replaced by a sentinel on their own line, so the
 * member that follows a deprecated block is still the next declaration — and
 * the comments are gone before the braces are matched, so a `{` inside a
 * comment cannot move the end of an interface.
 *
 * @param {string} source
 * @returns {Map<string, Set<string>>} interface name → deprecated members
 */
const deprecatedMembers = (source) => {
  const marked = source
    .replace(/\/\*\*([\s\S]*?)\*\//g, (whole, inner) =>
      inner.includes("@deprecated") ? "\n@@DEPRECATED@@\n" : "\n",
    )
    .replace(/\/\/[^\n]*/g, "");
  const result = new Map();
  const header = /(?:export\s+)?(?:declare\s+)?interface\s+([A-Za-z_$][\w$]*)\b([^{]*)\{/g;
  let match;
  while ((match = header.exec(marked))) {
    const open = match.index + match[0].length - 1;
    let depth = 0;
    let close = -1;
    for (let i = open; i < marked.length; i++) {
      if (marked[i] === "{") depth++;
      else if (marked[i] === "}") {
        depth--;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    if (close < 0) continue;
    const names = new Set();
    let pending = false;
    for (const raw of marked.slice(open + 1, close).split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      if (line.includes("@@DEPRECATED@@")) {
        pending = true;
        continue;
      }
      const decl = /^['"]?([A-Za-z_$][\w$]*)['"]?\s*[?:]/.exec(line);
      if (decl) {
        if (pending) names.add(decl[1]);
        pending = false;
      }
    }
    result.set(match[1], names);
    header.lastIndex = close;
  }
  return result;
};

const dts = fs.readFileSync(path.join(repoRoot, "src/index.d.ts"), "utf8");
const deprecated = deprecatedMembers(dts);
const interfaces = parseInterfaces(dts);

/** Every deprecated prop in the types, as `Widget.prop`. */
const deprecatedKeys = new Set();
for (const [iface, names] of deprecated) {
  if (!iface.endsWith("Props")) continue;
  const widget = iface.slice(0, -"Props".length);
  for (const name of names) deprecatedKeys.add(`${widget}.${name}`);
}

/** Every row of the deprecation table, as `Widget.prop`. */
const registryKeys = new Set(DEPRECATED_PROPS.map((row) => `${row.widget}.${row.from}`));

// ---------------------------------------------------------------------------
// 1 — the types and the table agree
// ---------------------------------------------------------------------------

await check("every deprecated prop in the types has a row in the table", () => {
  assert.ok(
    deprecatedKeys.size >= 5,
    `the types only mark ${deprecatedKeys.size} prop(s) deprecated — the parser is wrong`,
  );
  for (const key of deprecatedKeys) {
    assert.ok(
      registryKeys.has(key),
      `the types deprecate \`${key}\`, but the deprecation table has no row for it`,
    );
  }
});

await check("every row in the table is marked deprecated in the types", () => {
  for (const row of DEPRECATED_PROPS) {
    assert.ok(
      deprecatedKeys.has(`${row.widget}.${row.from}`),
      `the table renames \`${row.widget}.${row.from}\`, but the types do not mark it deprecated`,
    );
  }
});

await check("the table's targets are real props of the widget", () => {
  for (const row of DEPRECATED_PROPS) {
    const iface = propsInterfaceFor(interfaces, row.widget);
    assert.ok(iface, `the types have no props interface for ${row.widget}`);
    const props = resolveInterfaceProps(interfaces, iface);
    assert.ok(
      props.has(row.from),
      `${row.widget} does not declare \`${row.from}\`, so there is nothing to rename`,
    );
    if (!row.to) continue;
    assert.ok(
      props.has(row.to),
      `${row.widget} does not declare \`${row.to}\`, so the rename has no target`,
    );
    if (row.alternate) {
      assert.ok(
        props.has(row.alternate.to),
        `${row.widget} does not declare \`${row.alternate.to}\`, the other side of the rename`,
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 2 — the guide and the table agree
// ---------------------------------------------------------------------------

const guide = readGuide(repoRoot);

await check("the guide exists and has a section for every version in the table", () => {
  assert.ok(guide, `the guide is missing (${GUIDE_RELATIVE})`);
  for (const version of new Set(DEPRECATED_PROPS.map((row) => row.since))) {
    assert.ok(
      sections(guide).has(version),
      `the guide has no "## ${version}" section, but the table renames props in ${version}`,
    );
  }
});

await check("every row in the table is in the guide, under its own version", () => {
  for (const row of DEPRECATED_PROPS) {
    const rows = rowsFor(guide, row.since);
    const found = rows.find((entry) => entry.widget === row.widget && entry.from === row.from);
    assert.ok(
      found,
      `the guide's ${row.since} section does not mention \`${row.widget}.${row.from}\``,
    );
    const expected = row.to ?? "(removed)";
    assert.equal(
      found.to,
      expected,
      `the guide says \`${row.widget}.${row.from}\` → \`${found.to}\`, the table says \`${expected}\``,
    );
  }
});

await check("the guide names nothing the table does not", () => {
  for (const [version, body] of sections(guide)) {
    for (const row of rowsFor(guide, version)) {
      assert.ok(
        registryKeys.has(`${row.widget}.${row.from}`),
        `the guide's ${version} section names \`${row.widget}.${row.from}\`, which the table does not`,
      );
    }
    assert.ok(body.length > 0, `the guide's ${version} section is empty`);
  }
});

await check("the guide is reachable from the book's indexes", () => {
  for (const file of ["docs/README.md", "docs/guides/README.md"]) {
    const text = fs.readFileSync(path.join(repoRoot, file), "utf8");
    assert.ok(
      text.includes("migration.md"),
      `${file} never links the migration guide — a reader cannot find it`,
    );
  }
  const before = fs.readFileSync(path.join(repoRoot, "docs/guides/accessibility.md"), "utf8");
  assert.ok(
    before.includes("migration.md"),
    "the page before the guide does not point at it — the reading path has a hole",
  );
  const after = fs.readFileSync(
    path.join(repoRoot, "docs/guides/minification-and-protection.md"),
    "utf8",
  );
  assert.ok(
    after.includes("migration.md"),
    "the page after the guide does not point at it — the reading path has a hole",
  );
});

// ---------------------------------------------------------------------------
// 3 — the codemod writes what the table says
// ---------------------------------------------------------------------------

/** Run the codemod over a throwaway app and return the rewritten sources. */
const runCodemod = (name, source) => {
  const root = path.join(scratch, name);
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "app.js"), source, "utf8");
  const out = spawnSync(
    "node",
    [path.join(repoRoot, "bin/cli.js"), "audit-fix", "--only", "migrations", "--root", root],
    { encoding: "utf8", cwd: root },
  );
  assert.equal(out.status, 0, `audit-fix failed: ${out.stderr || out.stdout}`);
  return fs.readFileSync(path.join(root, "src", "app.js"), "utf8");
};

await check("the codemod renames what the table says", () => {
  const out = runCodemod(
    "renames",
    `import { Radio, Switch, Checkbox, Accordion, Dropdown, Slider, Tooltip } from "flet-box";

const a = Radio({ onSelect: (v) => v });
const b = Switch({ onToggle: (v) => v });
const c = Checkbox({ onCheck: (v) => v });
const d = Accordion({ onToggle: (v) => v });
const e = Dropdown({ onChange: (v) => v });
const f = Slider({ onChanged: (v) => v });
const g = Tooltip({ text: "x", tooltipDelay: 300 });
export { a, b, c, d, e, f, g };
`,
  );
  assert.ok(out.includes("Radio({ onPress:"), `the Radio call was not renamed:\n${out}`);
  assert.ok(out.includes("Switch({ onPress:"), `the Switch call was not renamed:\n${out}`);
  assert.ok(out.includes("Checkbox({ onPress:"), `the Checkbox call was not renamed:\n${out}`);
  assert.ok(out.includes("Accordion({ onPress:"), `the Accordion call was not renamed:\n${out}`);
  assert.ok(out.includes("Dropdown({ onPress:"), `the Dropdown call was not renamed:\n${out}`);
  assert.ok(out.includes("Slider({ onPress:"), `the Slider call was not renamed:\n${out}`);
  assert.ok(out.includes("delay: 300"), `the Tooltip call was not renamed:\n${out}`);
  assert.ok(!out.includes("onSelect"), "the old name survived the rewrite");
  assert.ok(!out.includes("onToggle"), "the old name survived the rewrite");
  assert.ok(!out.includes("onCheck"), "the old name survived the rewrite");
  assert.ok(!out.includes("onChanged"), "the old name survived the rewrite");
  assert.ok(!out.includes("tooltipDelay"), "the old name survived the rewrite");
});

await check("the codemod follows the side the legacy position named", () => {
  const out = runCodemod(
    "sides",
    `import { Scaffold } from "flet-box";

const right = Scaffold({ navSideBar: nav, navSideBarPosition: "right", navSideBarWidth: 300 });
const left = Scaffold({ navSideBar: nav, navSideBarPosition: "left" });
export { right, left };
`,
  );
  assert.ok(out.includes("rightNavBar: nav"), `the right panel was not named:\n${out}`);
  assert.ok(out.includes("rightNavBarWidth: 300"), `the right width was not renamed:\n${out}`);
  assert.ok(out.includes("leftNavBar: nav"), `the left panel was not named:\n${out}`);
  assert.ok(
    !out.includes("navSideBarPosition"),
    `the prop nothing reads any more survived:\n${out}`,
  );
});

await check("the codemod leaves the new names alone", () => {
  const source = `import { Radio, TreeView } from "flet-box";

const a = Radio({ onPress: (v) => v });
const b = TreeView({ onSelect: (n) => n, onToggle: (id, open) => open });
export { a, b };
`;
  const out = runCodemod("untouched", source);
  assert.equal(out, source, `the codemod rewrote a call that was already right:\n${out}`);
});

// ---------------------------------------------------------------------------
// 4 — the surfaces an app's agent reads carry the current spelling
// ---------------------------------------------------------------------------
//
// The table is only half a migration: an agent that never opens it still learns
// from two files — the cheatsheet it reads first and the example `unpack`
// prints — and a retired name in either of them outlives every guide.

await check("the cheatsheet an app reads marks every renamed prop", async () => {
  const api = await loadApi(repoRoot);
  const text = fs.readFileSync(emitCheatsheet(api, scratch), "utf8");
  for (const row of DEPRECATED_PROPS) {
    const start = text.indexOf(`## ${row.widget} `);
    assert.ok(start >= 0, `the cheatsheet has no section for ${row.widget}`);
    const next = text.indexOf("\n## ", start);
    const section = text.slice(start, next < 0 ? undefined : next);
    // One prop per token, joined by ` · `, so the marker has to sit on the
    // retired prop's own token and not on some other prop of the same widget.
    const marked = new RegExp(
      `(?:^|[ ·])${row.from}\\??:[^·]*\\(deprecated → ${row.to ?? "removed"}\\)`,
    );
    assert.ok(
      marked.test(section),
      `the cheatsheet does not tell an agent that ${row.widget}.${row.from} is retired`,
    );
  }
});

await check("the paste-ready example never teaches a renamed prop", async () => {
  for (const row of DEPRECATED_PROPS) {
    const lines = [];
    const { exitCode } = await unpack([row.widget, "--example", "--root", repoRoot], {
      print: (line) => lines.push(line),
    });
    assert.equal(exitCode, 0, `unpack ${row.widget} --example failed`);
    const text = lines.join("\n").replace(/\x1b\[[0-9;]*m/g, "");
    assert.ok(
      !new RegExp(`\\b${row.from}\\b`).test(text),
      `the example for ${row.widget} still teaches ${row.from}:\n${text}`,
    );
  }
});

// ---------------------------------------------------------------------------
// 5 — a major cannot be published without the guide
// ---------------------------------------------------------------------------

await check("a major with no section is refused", () => {
  const missing = missingMigration("2.0.0", repoRoot);
  assert.ok(missing, "the guard allowed a major the guide does not cover");
  assert.match(missing.reason, /2\.0\.0/, "the guard does not say which version is missing");
});

await check("a major with its section goes through", () => {
  const root = path.join(scratch, "release-ok");
  fs.mkdirSync(path.join(root, "docs", "guides"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "docs", "guides", "migration.md"),
    "# Guide\n\n## 2.0.0\n\n| Widget | From | To | What changed |\n| --- | --- | --- | --- |\n| `Radio` | `onSelect` | `onPress` | renamed |\n",
    "utf8",
  );
  assert.equal(
    missingMigration("2.0.0", root),
    null,
    "the guard refused a major that the guide does cover",
  );
});

await check("the release command stops on a major the guide does not cover", () => {
  const root = path.join(scratch, "release-guard");
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.mkdirSync(path.join(root, "bin"), { recursive: true });
  fs.mkdirSync(path.join(root, "docs", "guides"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "app.js"), "export const app = null;\n", "utf8");
  // The guard only fires in the framework itself, so the fixture has to look
  // like one: a package that ships the `flet-box` binary.
  fs.writeFileSync(path.join(root, "bin", "cli.js"), "// fixture\n", "utf8");
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ name: "flet-box", version: "1.1.2", bin: { "flet-box": "bin/cli.js" } }, null, 2),
    "utf8",
  );
  fs.copyFileSync(path.join(repoRoot, GUIDE_RELATIVE), path.join(root, GUIDE_RELATIVE));
  const git = (args) =>
    spawnSync("git", args, { cwd: root, encoding: "utf8" });
  assert.equal(git(["init", "-q"]).status, 0, "git init failed in the fixture");
  assert.equal(git(["add", "-A"]).status, 0, "git add failed in the fixture");
  const commit = git([
    "-c",
    "user.email=fletbox@example.com",
    "-c",
    "user.name=FletBox",
    "commit",
    "-q",
    "-m",
    "fixture",
  ]);
  assert.equal(commit.status, 0, `git commit failed in the fixture: ${commit.stderr}`);

  const out = spawnSync(
    "node",
    [path.join(repoRoot, "bin/cli.js"), "release", "--major"],
    { cwd: root, encoding: "utf8" },
  );
  assert.notEqual(out.status, 0, "the release command published a major with no guide section");
  assert.match(
    `${out.stdout}${out.stderr}`,
    /migration guide/i,
    "the release command failed for another reason than the guide",
  );
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.version, "1.1.2", "the release bumped the version anyway");
});

await check("the guard belongs to the framework, not to an app", () => {
  assert.ok(isFrameworkProject(repoRoot), "the framework does not look like the framework");
  const app = path.join(scratch, "app");
  fs.mkdirSync(app, { recursive: true });
  fs.writeFileSync(
    path.join(app, "package.json"),
    JSON.stringify({ name: "my-app", version: "1.0.0" }, null, 2),
    "utf8",
  );
  assert.ok(!isFrameworkProject(app), "an app looks like the framework — the guard would fire in it");
});

fs.rmSync(scratch, { recursive: true, force: true });

console.log(
  failures.length
    ? `\n❌ ${failures.length} migration check(s) failed:\n   ${failures.join("\n   ")}`
    : `\n✅ The guide, the types, the table and the codemod all name the same renames.`,
);
process.exit(failures.length ? 1 : 0);
