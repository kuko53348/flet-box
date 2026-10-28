// scripts/check-codegen-contract.mjs
//
// Contract for `AGENTS_FOR_CODE_GEN.md` — the file that tells an agent which
// widgets exist, what it may write, and how its work is proved.
//
// It is the one document that can teach a wrong API: the skills are read by an
// agent that already knows the framework, but this one is the *entry point* for
// an agent that has never seen it, and it ships inside every app `flet-box
// create` builds. A wrong name here is worse than a wrong name in a comment,
// because an agent copies what a contract shows.
//
// So the checks are the same ones the skills get, plus the ones this file
// needs of its own:
//
//  1. it ships (package.json `files`, and the real tarball);
//  2. every example in it is a real call — the good ones pass the
//     anti-hallucination gate, and the bad ones are rejected by it, which
//     proves both that the gate works and that the examples are really bad;
//  3. every widget, prop, color token and rule number it names exists;
//  4. a created app receives it byte-for-byte, its AGENTS.md points at it, and
//     its cheatsheet is there and fresh.
//
// Run with: node scripts/check-codegen-contract.mjs — it is in `npm test`.

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkApi } from "../bin/commands/checkApi.js";
import { CONTRACT_FILE, contractPath, readContract } from "../bin/utils/contract.js";
import { readSkill } from "../bin/utils/skills.js";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

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

const contract = readContract();
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-contract-"));

/** The part of the document under a heading, up to the next heading of any level. */
const section = (heading) => {
  const start = contract.indexOf(heading);
  assert.notEqual(start, -1, `the contract has no "${heading}" section`);
  const rest = contract.slice(start + heading.length);
  const next = rest.search(/^#{2,3} /m);
  return next === -1 ? rest : rest.slice(0, next);
};

const jsBlocks = (text) => [...text.matchAll(/```js\n([\s\S]*?)```/g)].map((m) => m[1]);

// ---------------------------------------------------------------------------
// 1 — it ships
// ---------------------------------------------------------------------------

await check("the contract is a file at the package root", () => {
  assert.ok(fs.existsSync(contractPath()), "AGENTS_FOR_CODE_GEN.md is missing");
  assert.ok(contract.length > 2000, `the contract is ${contract.length} chars — too thin to be one`);
  assert.match(contract, /golden rule/i, "the contract does not state the golden rule");
  assert.match(contract, /cheatsheet\.md/, "the contract never points at the cheatsheet");
  assert.match(contract, /api\.json/, "the contract never points at api.json");
});

await check("the published package carries the contract", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  assert.ok(
    pkg.files.includes(CONTRACT_FILE),
    `package.json files is missing ${CONTRACT_FILE}`,
  );
  const out = path.join(scratch, "pack");
  fs.mkdirSync(out, { recursive: true });
  const packed = spawnSync("npm", ["pack", "--pack-destination", out], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  assert.equal(packed.status, 0, `npm pack failed: ${packed.stderr}`);
  const tarball = fs
    .readdirSync(out)
    .filter((f) => f.endsWith(".tgz"))
    .map((f) => path.join(out, f))[0];
  assert.ok(tarball, "npm pack produced no tarball to inspect");
  const listed = spawnSync("tar", ["tzf", tarball], { encoding: "utf8" });
  assert.equal(listed.status, 0, `tar could not read ${tarball}`);
  const files = listed.stdout
    .split("\n")
    .map((line) => line.trim().replace(/^package\//, ""))
    .filter(Boolean);
  assert.ok(
    files.includes(CONTRACT_FILE),
    `${CONTRACT_FILE} is not in the tarball — an installed app would have no contract`,
  );
});

// ---------------------------------------------------------------------------
// 2 — the examples are real calls
// ---------------------------------------------------------------------------

/** Run a block of code through the anti-hallucination gate. */
const gate = async (blocks, label) => {
  const root = path.join(scratch, label);
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  blocks.forEach((code, i) => {
    fs.writeFileSync(
      path.join(root, "src", `${label}-${i}.js`),
      `// extracted from AGENTS_FOR_CODE_GEN.md\n${code}\nexport {};\n`,
      "utf8",
    );
  });
  const { exitCode, findings } = await checkApi(["--root", root], { print: () => {} });
  return { exitCode, findings: findings || [] };
};

await check("every good example passes the anti-hallucination gate", async () => {
  const blocks = jsBlocks(section("### Good"));
  assert.ok(blocks.length >= 1, "the contract has no good example to check");
  const { exitCode, findings } = await gate(blocks, "good");
  assert.equal(
    exitCode,
    0,
    `the gate rejected the contract's own example:\n   ${findings
      .map((f) => `${f.code} ${f.file || ""} ${f.detail || f.message || ""}`)
      .join("\n   ")}`,
  );
});

await check("every bad example is rejected by the gate", async () => {
  const blocks = jsBlocks(section("### Bad"));
  assert.ok(blocks.length >= 1, "the contract has no bad example to check");
  const { exitCode, findings } = await gate(blocks, "bad");
  assert.notEqual(
    exitCode,
    0,
    "the gate accepted the contract's bad example — it would teach what it must forbid",
  );
  const codes = new Set(findings.map((f) => f.code));
  assert.ok(
    codes.has("POSITIONAL_ARG") || codes.has("UNKNOWN_EXPORT") || codes.has("MODULE_NOT_FOUND"),
    `the bad example failed for an unexpected reason: ${[...codes].join(", ")}`,
  );
});

// ---------------------------------------------------------------------------
// 3 — every name it uses exists
// ---------------------------------------------------------------------------

const dtsSource = fs.readFileSync(path.join(repoRoot, "src/index.d.ts"), "utf8");
const { parseInterfaces, propsInterfaceFor, resolveInterfaceProps } = await import(
  "../bin/utils/dtsProps.js"
);
const interfaces = parseInterfaces(dtsSource);
const barrel = await import("../src/index.js");
const exported = new Set(Object.keys(barrel));
const utilityNames = new Set([...exported].filter((key) => /^[a-z]/.test(key)));

const widgetProps = new Map();
for (const widget of exported) {
  if (!/^[A-Z]/.test(widget)) continue;
  const iface = propsInterfaceFor(interfaces, widget);
  const props = new Set(iface ? resolveInterfaceProps(interfaces, iface).keys() : []);
  props.add("child");
  props.add("children");
  widgetProps.set(widget, props);
}

await check("every `Widget({ prop: … })` names a real widget and prop", () => {
  const callRe = /([A-Z][A-Za-z0-9]*)\(\s*\{([^{}]*)\}/g;
  const keyRe = /(?:^|[,{\s])['"]?([A-Za-z][A-Za-z0-9]*)['"]?\s*:/g;
  const chunks = [
    ...[...contract.matchAll(/`([^`\n]*\{[^`\n]*)`/g)].map((m) => m[1]),
    ...jsBlocks(contract),
  ];
  let seen = 0;
  for (const chunk of chunks) {
    for (const match of chunk.matchAll(callRe)) {
      const widget = match[1];
      const props = widgetProps.get(widget);
      assert.ok(props, `"${widget}" is not an exported widget (in \`${chunk}\`)`);
      for (const key of match[2].matchAll(keyRe)) {
        assert.ok(
          props.has(key[1]) || utilityNames.has(key[1]),
          `${widget} has no prop \`${key[1]}\``,
        );
      }
      seen++;
    }
  }
  assert.ok(seen >= 5, `the contract only shows ${seen} widget calls — it teaches by example`);
});

// Every prop name the framework really has: the ones a widget's type declares,
// plus the ones the engine routes but the types do not declare yet.
const { ALL_PROPS } = await import("../src/widget-factory/translateProps.js");
const propNames = new Set(Object.keys(ALL_PROPS));
for (const props of widgetProps.values()) {
  for (const prop of props) propNames.add(prop);
}

await check("every `colors.X` token exists in both themes", async () => {
  const { palettes } = await import("../src/utils/themes.js");
  const tokens = [...contract.matchAll(/colors\.([A-Za-z0-9]+)/g)].map((m) => m[1]);
  assert.ok(tokens.length >= 3, `the contract names ${tokens.length} color tokens`);
  for (const token of tokens) {
    assert.ok(
      token in palettes.light && token in palettes.dark,
      `colors.${token} is not a token of both themes`,
    );
  }
});

await check("every rule number the contract cites exists in the design skill", () => {
  const skill = readSkill("fletbox-design");
  const rules = new Set([...skill.matchAll(/^## (\d{2}) /gm)].map((m) => m[1]));
  const cited = [...contract.matchAll(/\((\d{2}(?:, \d{2})*)\)/g)].flatMap((m) =>
    m[1].split(", "),
  );
  assert.ok(cited.length >= 5, `the contract cites ${cited.length} rule numbers`);
  for (const rule of cited) {
    assert.ok(rules.has(rule), `the contract cites rule ${rule}, which the design skill does not have`);
  }
});

await check("every command the contract names is a real one", async () => {
  const { packageJson: appTemplate } = await import("../bin/utils/templates.js");
  const app = JSON.parse(appTemplate("demo"));
  const framework = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
  );
  for (const [, script] of contract.matchAll(/`npm run ([a-z:-]+)`/g)) {
    // The contract ships inside an app, so the app's scripts are the promise.
    assert.ok(
      app.scripts[script],
      `the contract says "npm run ${script}", which the generated app does not answer`,
    );
  }
  assert.ok(
    framework.scripts.verify,
    "the framework has no `npm run verify`, so the contract's protocol cannot be run here",
  );
  for (const [, command] of contract.matchAll(/`flet-box ([a-z-]+)/g)) {
    assert.ok(
      ["verify", "unpack", "check-api", "audit-fix", "create", "run", "build"].includes(command),
      `the contract names "flet-box ${command}", which is not a command`,
    );
  }
});

// ---------------------------------------------------------------------------
// 4 — a created app receives it
// ---------------------------------------------------------------------------

const appRoot = path.join(scratch, "made");
fs.mkdirSync(appRoot, { recursive: true });

await check("flet-box create hands the app the contract, byte for byte", () => {
  execFileSync(
    "node",
    [path.join(repoRoot, "bin/cli.js"), "create", "made", "--template", "blank", "--quiet"],
    { cwd: appRoot, encoding: "utf8", stdio: "pipe" },
  );
  const project = path.join(appRoot, "made");
  const file = path.join(project, CONTRACT_FILE);
  assert.ok(fs.existsSync(file), `the app has no ${CONTRACT_FILE}`);
  assert.equal(
    fs.readFileSync(file, "utf8"),
    contract,
    "the app's contract differs from the one at the package root",
  );
  const agents = fs.readFileSync(path.join(project, "AGENTS.md"), "utf8");
  assert.ok(
    agents.includes(CONTRACT_FILE),
    "the app's AGENTS.md never points at the code-generation contract",
  );
});

await check("the app's AGENTS.md teaches only props that exist", () => {
  // A sentence that introduces a list of props is a claim about the API, and
  // the factory drops a key it does not know: a name that is not a prop is a
  // silent no-op in every screen that copies the contract. It shipped `radius`
  // for years — the registry calls it `borderRadius` — and nothing said so.
  const project = path.join(appRoot, "made");
  const agents = fs.readFileSync(path.join(project, "AGENTS.md"), "utf8");
  const claimed = [];
  for (const match of agents.matchAll(/props \(([^)]*)\)/g)) {
    for (const name of match[1].matchAll(/`([A-Za-z][A-Za-z0-9]*)`/g)) claimed.push(name[1]);
  }
  assert.ok(
    claimed.length >= 8,
    `the app's contract claims ${claimed.length} props — it lost the lists`,
  );
  for (const name of claimed) {
    assert.ok(
      propNames.has(name),
      `the app's AGENTS.md teaches \`${name}\`, which no widget declares`,
    );
  }
});

await check("the app's cheatsheet is there and fresh", () => {
  const project = path.join(appRoot, "made");
  const cheatsheet = path.join(project, ".fletbox/api/cheatsheet.md");
  assert.ok(fs.existsSync(cheatsheet), "the app has no cheatsheet");
  const text = fs.readFileSync(cheatsheet, "utf8");
  assert.match(text, /Widgets: \d+/, "the cheatsheet does not say how many widgets it holds");
  assert.match(text, /## Button/, "the cheatsheet does not list a widget");
  const pkg = JSON.parse(fs.readFileSync(path.join(project, "package.json"), "utf8"));
  assert.ok(pkg.scripts.predev, "the app has no predev, so its context is never refreshed");
  assert.match(
    pkg.scripts.predev,
    /check-api --emit-api/,
    "the app's predev does not regenerate the cheatsheet",
  );
});

await check("the API proof bites — an invented prop is rejected", async () => {
  const badRoot = path.join(scratch, "bad-app");
  fs.mkdirSync(path.join(badRoot, "src"), { recursive: true });
  fs.writeFileSync(
    path.join(badRoot, "src", "B.js"),
    "import { Container } from 'flet-box';\nconst x = Container({ onHoverStart: () => {} });\nexport default x;\n",
    "utf8",
  );
  const { exitCode } = await checkApi(["--root", badRoot], { print: () => {} });
  assert.notEqual(exitCode, 0, "check-api accepted a prop that does not exist");
});

fs.rmSync(scratch, { recursive: true, force: true });

console.log(
  failures.length
    ? `\n❌ ${failures.length} contract check(s) failed:\n   ${failures.join("\n   ")}`
    : `\n✅ The code-generation contract ships, teaches only real APIs, and every app receives it.`,
);
process.exit(failures.length ? 1 : 0);
