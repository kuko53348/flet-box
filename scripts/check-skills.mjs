// scripts/check-skills.mjs
//
// Contract for the `skills/` folder: the one place this framework keeps what it
// knows about designing and building a FletBox app, and the folder `flet-box create`
// installs into every project — at `skills/`, mirrored byte-for-byte to
// `.claude/skills/` and `.qoder/skills/` (which is where those assistants load a
// skill from), and as a pointer rule per skill in `.cursor/rules/`.
//
// Four ways this can rot, and each has its own check:
//
//  1. a skill that never loads — bad frontmatter, and the loader drops the file in
//     silence, so the agent simply never sees the rules it was written for;
//  2. a skill that teaches an API that does not exist — the failure this framework
//     exists to prevent, arriving from the one direction that was not guarded: the
//     instructions themselves;
//  3. a skill that is not shipped — `files` without `skills/`, so an installed app
//     has no design contract at all;
//  4. a pointer that points at nothing — AGENTS.md and CLAUDE.md both linked a
//     `skills/fletbox-clean-ui/SKILL.md` that had never been written.
//
// Run with: node scripts/check-skills.mjs — it is in `npm test` beside
// check-clean-ui.mjs and costs about a second and a half. It re-packs the tarball
// and re-scaffolds a project because that is the only way to see the files an app
// is actually handed, and `flet-box create` copies them rather than writing them.

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkApi } from "../bin/commands/checkApi.js";
import {
  CODE_RULE,
  ERROR_CODES,
  INFO_CODES,
  WARN_CODES,
} from "../bin/commands/checkUi.js";
import { readFrontmatter, readSkill, skillNames } from "../bin/utils/skills.js";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** The skills a FletBox app ships — one per subject. Adding one means listing it here. */
const EXPECTED = [
  "fletbox-design",
  "fletbox-memory",
  "fletbox-motion",
  "fletbox-rules",
];

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

const names = skillNames();

// ---------------------------------------------------------------------------
// 1 — the folder is the set, and each file loads
// ---------------------------------------------------------------------------

await check("skills/ holds exactly the expected skills", () => {
  assert.deepEqual(names, EXPECTED, `found: ${names.join(", ")}`);
});

await check("every SKILL.md has frontmatter a loader accepts", () => {
  for (const name of names) {
    const text = readSkill(name);
    assert.ok(text.startsWith("---\n"), `${name}: must open with the frontmatter fence`);
    const fields = readFrontmatter(name);
    assert.equal(fields.name, name, `${name}: frontmatter name is "${fields.name}"`);
    assert.ok(fields.description, `${name}: no description — every loader drops it`);
    const length = (fields.description || "").length;
    assert.ok(length >= 60, `${name}: description is ${length} chars, too short to trigger`);
    assert.ok(length <= 1024, `${name}: description is ${length} chars, over the 1024 limit`);
    assert.match(name, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${name}: folder must be kebab-case`);
  }
});

await check("each skill owns one subject and does not re-teach another", () => {
  const spacing = "4 · 8 · 12 · 16 · 18 · 24 · 32";
  assert.ok(
    readSkill("fletbox-design").includes(spacing),
    "the design skill lost the spacing scale",
  );
  for (const name of ["fletbox-rules", "fletbox-motion", "fletbox-memory"]) {
    assert.ok(
      !readSkill(name).includes(spacing),
      `${name}: repeats the spacing scale instead of pointing at the design skill`,
    );
  }
  // One index, in AGENTS.md §0 — a second table inside a skill goes stale first.
  for (const name of names) {
    assert.ok(
      !readSkill(name).includes("| Skill | What it owns |"),
      `${name}: duplicates the AGENTS.md skill index`,
    );
  }
});

// ---------------------------------------------------------------------------
// 2 — nothing a skill teaches may be an invented API
// ---------------------------------------------------------------------------

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-skills-"));

/**
 * The props each widget is declared to take, read from the shipped types with the
 * CLI's own interface reader — the same source `flet-box unpack` uses. Both
 * `parseInterfaces` and `resolveInterfaceProps` answer `Map`s, so the props of an
 * interface are its `keys()`; reading them as arrays is how every widget ends up
 * with none and every claim below passes for the wrong reason.
 */
const dtsSource = fs.readFileSync(path.join(repoRoot, "src/index.d.ts"), "utf8");
const { parseInterfaces, propsInterfaceFor, resolveInterfaceProps } = await import(
  "../bin/utils/dtsProps.js"
);
const interfaces = parseInterfaces(dtsSource);

const exported = new Set(Object.keys(await import("../src/index.js")));
const utilityNames = new Set(
  Object.keys(await import("../src/index.js")).filter((key) => /^[a-z]/.test(key)),
);

const widgetProps = new Map();
for (const widget of exported) {
  if (!/^[A-Z]/.test(widget)) continue;
  const iface = propsInterfaceFor(interfaces, widget);
  const props = new Set(iface ? resolveInterfaceProps(interfaces, iface).keys() : []);
  // Every widget takes a child or children through the factory, whatever its own
  // interface spells out.
  props.add("child");
  props.add("children");
  widgetProps.set(widget, props);
}

await check("the interface reader actually read the interface", () => {
  // If this regresses, every API claim below passes for the wrong reason.
  assert.ok(widgetProps.get("Container").has("maxWidth"), "Container props came back empty");
  assert.ok(widgetProps.get("Button").has("variant"), "Button props came back empty");
  assert.ok(widgetProps.get("ListView").has("itemSize"), "ListView props came back empty");
});

await check("every code block passes the anti-hallucination gate", async () => {
  const sourceRoot = path.join(scratch, "blocks");
  fs.mkdirSync(path.join(sourceRoot, "src"), { recursive: true });
  let count = 0;
  for (const name of names) {
    const blocks = [...readSkill(name).matchAll(/```js\n([\s\S]*?)```/g)];
    blocks.forEach((match, i) => {
      fs.writeFileSync(
        path.join(sourceRoot, "src", `${name}-${i}.js`),
        "// extracted from a skill\n" + match[1] + "\nexport {};\n",
        "utf8",
      );
      count++;
    });
  }
  assert.ok(count >= 5, `only ${count} code blocks in the skills`);
  const { exitCode, findings } = await checkApi(["--root", sourceRoot], { print: () => {} });
  const errors = (findings || []).filter((f) => f.level !== "warn");
  assert.equal(
    exitCode,
    0,
    `check-api rejected the skills:\n   ${errors
      .map((f) => `${f.code} ${f.file || ""} ${f.detail || f.message || ""}`)
      .join("\n   ")}`,
  );
});

await check("every inline `Widget({ prop: … })` names a real widget and prop", () => {
  const callRe = /([A-Z][A-Za-z0-9]*)\(\s*\{([^{}]*)\}/g;
  const keyRe = /(?:^|[,{\s])['"]?([A-Za-z][A-Za-z0-9]*)['"]?\s*:/g;
  for (const name of names) {
    // Claims about the API live in code spans and fenced blocks; prose in backticks
    // is where the short calls are written, so scan both.
    const code = [...readSkill(name).matchAll(/`([^`\n]*\{[^`\n]*)`/g), ...[...readSkill(name).matchAll(/```(?:js|bash)\n([\s\S]*?)```/g)]]
      .map((m) => m[1]);
    for (const chunk of code) {
      for (const match of chunk.matchAll(callRe)) {
        const widget = match[1];
        const props = widgetProps.get(widget);
        assert.ok(props, `${name}: "${widget}" is not an exported widget (in \`${chunk}\`)`);
        assert.ok(exported.has(widget), `${name}: ${widget} is declared but not exported`);
        for (const key of match[2].matchAll(keyRe)) {
          assert.ok(
            props.has(key[1]) || utilityNames.has(key[1]),
            `${name}: ${widget} has no prop \`${key[1]}\``,
          );
        }
      }
    }
  }
});

await check("every `colors.X` token exists in both themes", async () => {
  const { palettes } = await import("../src/utils/themes.js");
  for (const name of names) {
    for (const [, token] of readSkill(name).matchAll(/colors\.([A-Za-z0-9]+)/g)) {
      assert.ok(
        token in palettes.light && token in palettes.dark,
        `${name}: colors.${token} is not a token of both themes`,
      );
    }
  }
});

await check("every helper the skills call is exported", () => {
  for (const name of names) {
    for (const [, fn] of readSkill(name).matchAll(/`([a-z][A-Za-z0-9]{3,})\(/g)) {
      assert.ok(
        utilityNames.has(fn),
        `${name}: \`${fn}()\` is not a function the package exports`,
      );
    }
  }
});

await check("the number of helpers R12 quotes is the number there are", async () => {
  // A count in a skill is a promise: it is how an agent decides whether reading
  // the table is worth it. It went stale twice — the tools barrel grew by 49
  // names and the sentence still said 66 — so it is read off `src/tools/index.js`
  // instead of remembered. The generated app says the same number, so it is
  // checked against the same source: two copies of a figure is how it drifted.
  const tools = await import("../src/tools/index.js");
  const actual = Object.keys(tools).length;
  const { agentsMd } = await import("../bin/utils/templates.js");
  const stated = (re, body, miss) => {
    const m = re.exec(body);
    assert.ok(m, miss);
    return Number(m[1]);
  };
  const places = {
    "skills/fletbox-rules": stated(
      /`flet-box` exports (\d+) helpers/,
      readSkill("fletbox-rules"),
      'R12 no longer opens with "`flet-box` exports N helpers"',
    ),
    "the generated AGENTS.md": stated(
      /exports (\d+) helpers next to the widgets/,
      agentsMd("demo", "basic", "0.0.0"),
      "templates.agentsMd no longer states the helper count",
    ),
  };
  for (const [where, number] of Object.entries(places)) {
    assert.equal(
      number,
      actual,
      `${where} says ${number} helpers, src/tools/index.js exports ${actual}`,
    );
  }
});

await check("the motion skill only claims effects AnimatedBox implements", () => {
  const source = fs.readFileSync(
    path.join(repoRoot, "src/animations/AnimatedBox.js"),
    "utf8",
  );
  const supported = new Set(
    [...source.matchAll(/effect === "([A-Za-z]+)"/g)].map((m) => m[1]),
  );
  assert.ok(supported.size >= 10, `AnimatedBox effects read as ${supported.size}`);
  const text = readSkill("fletbox-motion");
  const listed = text
    .split("**Effects `AnimatedBox` knows:**")[1]
    .split("Anything outside")[0];
  assert.ok(listed, "the motion skill no longer lists the effects it claims exist");
  for (const [, effect] of listed.matchAll(/`([A-Za-z]+)`/g)) {
    assert.ok(
      supported.has(effect),
      `motion skill names effect "${effect}", which AnimatedBox never compares`,
    );
  }
  // Every effect it names in a code block too.
  for (const [, effect] of text.matchAll(/effect:\s*["']([A-Za-z]+)["']/g)) {
    assert.ok(supported.has(effect), `motion skill animates effect "${effect}" — not implemented`);
  }
});

await check("the gate, the design skill and the docs agree on which rule proves which code", () => {
  const text = readSkill("fletbox-design");
  const numbers = [...text.matchAll(/^## (\d{2}) /gm)].map((m) => m[1]);
  assert.ok(numbers.length >= 20, `only ${numbers.length} numbered rules`);
  numbers.forEach((value, index) => {
    assert.equal(
      value,
      String(index).padStart(2, "0"),
      `rule numbering broke at "${value}" (expected ${String(index).padStart(2, "0")})`,
    );
  });

  // The section a rule owns: its heading up to the next heading of the same or
  // higher level. A code is "named by rule 12" only inside that slice, so the
  // citation cannot satisfy the contract by living in the summary table at the
  // bottom of the file.
  const sections = new Map();
  const headings = [...text.matchAll(/^## (\d{2}) .*$/gm)];
  headings.forEach((heading, index) => {
    const start = heading.index + heading[0].length;
    const end = index + 1 < headings.length ? headings[index + 1].index : text.length;
    sections.set(heading[1], text.slice(start, end));
  });

  const emitted = new Set([...ERROR_CODES, ...WARN_CODES, ...INFO_CODES]);
  for (const code of emitted) {
    const rule = CODE_RULE[code];
    assert.ok(rule, `${code} is reported by npm run ui with no rule to cite`);
    assert.ok(
      sections.has(rule),
      `${code} cites rule ${rule}, which is not a heading in fletbox-design`,
    );
    assert.ok(
      sections.get(rule).includes(code),
      `${code} is filed under rule ${rule} but the skill names it somewhere else`,
    );
  }
  for (const code of Object.keys(CODE_RULE)) {
    assert.ok(
      emitted.has(code),
      `CODE_RULE cites ${code}, which no longer exists in the gate`,
    );
  }

  // The human-facing table must print the same number the gate prints.
  const docs = fs.readFileSync(
    path.join(repoRoot, "docs", "guides", "clean-ui.md"),
    "utf8",
  );
  const documented = new Map(
    [...docs.matchAll(/^\|\s*`([A-Z_]+)`\s*\|\s*(\d{2})\s*\|/gm)].map((m) => [m[1], m[2]]),
  );
  assert.ok(
    documented.size >= 20,
    `the docs code table read as ${documented.size} rows — the shape changed`,
  );
  for (const [code, rule] of Object.entries(CODE_RULE)) {
    assert.ok(documented.has(code), `docs/guides/clean-ui.md never lists ${code}`);
    assert.equal(
      documented.get(code),
      rule,
      `docs/guides/clean-ui.md files ${code} under rule ${documented.get(code)}, the gate says ${rule}`,
    );
  }
  for (const code of documented.keys()) {
    assert.ok(CODE_RULE[code], `docs/guides/clean-ui.md lists ${code}, which the gate no longer emits`);
  }
});

await check("the API proof bites — an invented prop is rejected", async () => {
  const badRoot = path.join(scratch, "bad");
  fs.mkdirSync(path.join(badRoot, "src"), { recursive: true });
  fs.writeFileSync(
    path.join(badRoot, "src", "B.js"),
    "import { Container } from 'flet-box';\nconst x = Container({ hoverColor: 'red', onHoverStart: () => {} });\nexport default x;\n",
    "utf8",
  );
  const { exitCode } = await checkApi(["--root", badRoot], { print: () => {} });
  assert.notEqual(exitCode, 0, "check-api accepted a prop that does not exist");
});

await check("the inline proof bites — a name it must reject", () => {
  // Replaying the inline scanner over a line with a invented prop has to throw,
  // otherwise the check passes because it never finds a call.
  const callRe = /([A-Z][A-Za-z0-9]*)\(\s*\{([^{}]*)\}/g;
  const found = [..."`ListView({ itemSize: 48, virtualise: true })`".matchAll(callRe)];
  assert.equal(found.length, 1, "the inline call scanner stopped matching");
  const props = widgetProps.get("ListView");
  assert.ok(props.has("itemSize") && !props.has("virtualise"), "ListView props read wrong");
});

// ---------------------------------------------------------------------------
// 3 — it ships
// ---------------------------------------------------------------------------

/**
 * The exact paths the published tarball carries.
 *
 * Read from the artifact, not from `npm pack --json`: the release of v1.1.0
 * died here in CI with "Cannot read properties of undefined (reading 'files')"
 * while passing on the laptop, because the workflow installs `npm@latest` and
 * that npm prints a different shape (and mixes an `npm warn` into stdout). A
 * contract that only holds on one npm version is not a contract, so this packs
 * for real and lists the bytes.
 *
 * @returns {Set<string>}
 */
const packedFiles = () => {
  const out = path.join(scratch, "pack");
  fs.mkdirSync(out, { recursive: true });
  const packed = spawnSync("npm", ["pack", "--pack-destination", out], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  const tarball = fs
    .readdirSync(out)
    .filter((f) => f.endsWith(".tgz"))
    .map((f) => path.join(out, f))[0];
  if (!tarball) {
    const npmVersion = spawnSync("npm", ["--version"], { encoding: "utf8" }).stdout.trim();
    assert.fail(
      `npm pack produced no tarball to inspect (npm ${npmVersion}): ` +
        `${(packed.stderr || packed.stdout || "").split("\n").filter(Boolean).slice(-3).join(" / ")}`,
    );
  }
  const listed = spawnSync("tar", ["tzf", tarball], { encoding: "utf8" });
  assert.equal(listed.status, 0, `tar could not read ${tarball}`);
  fs.rmSync(tarball, { force: true });
  return new Set(
    listed.stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^package\//, "")),
  );
};

await check("the published package carries the skills", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  assert.ok(pkg.files.includes("skills/"), "package.json files is missing skills/");
  const packed = packedFiles();
  assert.ok(packed.size > 100, `the tarball listed ${packed.size} files — that is not the package`);
  assert.ok(packed.has("bin/cli.js"), "the tarball has no CLI to run");
  for (const name of names) {
    assert.ok(packed.has(`skills/${name}/SKILL.md`), `skills/${name}/SKILL.md is not in the tarball`);
  }
});

// ---------------------------------------------------------------------------
// 4 — a created app receives it, and every pointer lands
// ---------------------------------------------------------------------------

const appRoot = path.join(scratch, "made");
fs.mkdirSync(appRoot, { recursive: true });

await check("flet-box create installs every skill, byte for byte", () => {
  execFileSync(
    "node",
    [path.join(repoRoot, "bin/cli.js"), "create", "made", "--template", "blank", "--quiet"],
    { cwd: appRoot, encoding: "utf8", stdio: "pipe" },
  );
  const project = path.join(appRoot, "made");
  for (const name of names) {
    const source = readSkill(name);
    for (const rootDir of ["skills", ".claude/skills", ".qoder/skills"]) {
      const file = path.join(project, rootDir, name, "SKILL.md");
      assert.ok(fs.existsSync(file), `the app has no ${rootDir}/${name}/SKILL.md`);
      assert.equal(
        fs.readFileSync(file, "utf8"),
        source,
        `${rootDir}/${name}/SKILL.md differs from skills/${name}/SKILL.md`,
      );
    }
    const rule = path.join(project, ".cursor/rules", `${name}.mdc`);
    assert.ok(fs.existsSync(rule), `no Cursor rule for ${name}`);
    const text = fs.readFileSync(rule, "utf8");
    assert.ok(text.startsWith("---\n"), `${name}.mdc has no frontmatter`);
    assert.match(text, /alwaysApply: (true|false)/, `${name}.mdc never says when it applies`);
    assert.ok(
      text.includes(`skills/${name}/SKILL.md`),
      `${name}.mdc does not point at its skill`,
    );
  }
});

/**
 * Every relative markdown link in `docs` that does not land inside `dir`.
 *
 * A link is `[label](target)`, and only `target` is a path — reading `label`
 * instead is the bug this function exists to not have, because a label is a word
 * like "fletbox-rules" and resolves to nothing, so the check fails on every
 * healthy app and an editor stops trusting it.
 *
 * @param {string} dir project root
 * @param {string[]} docs project-relative files to read
 * @returns {{ doc: string, line: number, target: string, toSkill: boolean }[]}
 */
const brokenLinks = (dir, docs) => {
  const broken = [];
  for (const doc of docs) {
    const file = path.join(dir, doc);
    if (!fs.existsSync(file)) continue;
    const from = path.dirname(file);
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
      const target = match[2];
      if (/^https?:|^#/.test(target)) continue;
      const clean = target.replace(/^\.\//, "");
      if (fs.existsSync(path.resolve(from, clean))) continue;
      broken.push({
        doc,
        line: text.slice(0, match.index).split("\n").length,
        target,
        toSkill: /SKILL\.md$/.test(clean),
      });
    }
  }
  return broken;
};

/** Count the links that do reach a SKILL.md, so the index cannot quietly vanish. */
const skillLinkCount = (dir, docs) => {
  let count = 0;
  for (const doc of docs) {
    const file = path.join(dir, doc);
    if (!fs.existsSync(file)) continue;
    for (const match of fs.readFileSync(file, "utf8").matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
      if (/SKILL\.md$/.test(match[2].replace(/^\.\//, ""))) count++;
    }
  }
  return count;
};

const appDocs = [
  "AGENTS.md",
  ".claude/CLAUDE.md",
  "README.md",
  ".cursor/rules/fletbox.mdc",
  ...names.map((name) => `.cursor/rules/${name}.mdc`),
];

await check("every skill link the agent is sent to resolves in the app", () => {
  const project = path.join(appRoot, "made");
  for (const doc of appDocs) {
    assert.ok(fs.existsSync(path.join(project, doc)), `the app has no ${doc}`);
  }
  const broken = brokenLinks(project, appDocs);
  assert.deepEqual(
    broken.map((b) => `${b.doc}:${b.line} ${b.target}`),
    [],
    "an agent was sent to a file the app does not have",
  );
  assert.ok(
    skillLinkCount(project, appDocs) >= 4,
    "only the .mdc pointers reach a SKILL.md — the index is missing",
  );
});

await check("the link proof bites — a pointer at nothing is caught", () => {
  // A check that stopped matching would report a clean app forever, so this one is
  // proven against a file that must fail: the same shape AGENTS.md §0 writes, with
  // a target that is not in the app, plus the label-only mistake it replaced.
  const ghost = path.join(scratch, "ghost");
  fs.mkdirSync(path.join(ghost, "skills", "fletbox-rules"), { recursive: true });
  fs.writeFileSync(path.join(ghost, "skills", "fletbox-rules", "SKILL.md"), "# rules\n", "utf8");
  fs.writeFileSync(
    path.join(ghost, "AGENTS.md"),
    "| [fletbox-rules](skills/fletbox-rules/SKILL.md) | ok |\n| [ghost](skills/fletbox-ghost/SKILL.md) | gone |\n[x](AGENTS.md) |\n",
    "utf8",
  );
  const broken = brokenLinks(ghost, ["AGENTS.md"]);
  assert.deepEqual(
    broken.map((b) => `${b.line} ${b.target}`),
    ["2 skills/fletbox-ghost/SKILL.md"],
    `the scanner answered ${JSON.stringify(broken)}`,
  );
  assert.equal(broken[0].toSkill, true, "a dead SKILL.md link is not flagged as one");
  assert.equal(skillLinkCount(ghost, ["AGENTS.md"]), 2, "the live skill links stopped counting");
});

await check("the app is left somewhere to start", () => {
  const project = path.join(appRoot, "made");
  const agents = fs.readFileSync(path.join(project, "AGENTS.md"), "utf8");
  assert.match(agents, /## 0\. Start here — the skills folder/);
  for (const name of names) {
    assert.ok(agents.includes(`skills/${name}/SKILL.md`), `AGENTS.md §0 never lists ${name}`);
  }
  assert.match(
    agents,
    /skills\/fletbox-design\/SKILL\.md/,
    "the verification loop does not cite the design skill",
  );
  const index = fs.readFileSync(path.join(project, ".fletbox/memory/MEMORY.md"), "utf8");
  assert.match(index, /notes\/current-status\.md/, "the memory index has no status entry");
  const status = fs.readFileSync(
    path.join(project, ".fletbox/memory/notes/current-status.md"),
    "utf8",
  );
  for (const label of [
    "**Doing:**",
    "**Done and verified:**",
    "**Not done / half-done:**",
    "**Next:**",
    "**Blocked:**",
  ]) {
    assert.ok(status.includes(label), `the status note lost ${label}`);
  }
  for (const doc of ["AGENTS.md", ".claude/CLAUDE.md", "README.md"]) {
    assert.ok(
      !fs.readFileSync(path.join(project, doc), "utf8").includes("fletbox-clean-ui"),
      `${doc} still names the skill that no longer ships`,
    );
  }
});

fs.rmSync(scratch, { recursive: true, force: true });

console.log(
  failures.length
    ? `\n❌ ${failures.length} skills check(s) failed:\n   ${failures.join("\n   ")}`
    : `\n✅ ${names.length} skills: they load, they teach only real APIs, they ship, and an app can start from them.`,
);
process.exit(failures.length ? 1 : 0);
