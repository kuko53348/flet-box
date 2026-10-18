#!/usr/bin/env node
/**
 * Guard the shape of the PUBLISHED package, not the checkout.
 *
 * The repo installs `ws` and `chokidar` as devDependencies, so `node bin/cli.js`
 * works here no matter how many of its modules reach for them at import time.
 * A consumer gets only what `files` ships, with `--omit=dev`, and an eager
 * `import { WebSocketServer } from "ws"` in one command file used to take down
 * every CLI command for them. Extract the real tarball and run it with no
 * node_modules in scope, which is the only shape where that fails.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-install-"));

const failures = [];
const fail = (message) => failures.push(message);

try {
  const packed = execFileSync("npm", ["pack", "--pack-destination", tmp], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
    .trim()
    .split("\n")
    .pop();
  const tarball = path.join(tmp, packed);
  if (!fs.existsSync(tarball)) fail(`npm pack did not produce ${packed}`);

  execFileSync("tar", ["-xzf", tarball, "-C", tmp]);
  const pkg = path.join(tmp, "package");
  const cli = path.join(pkg, "bin", "cli.js");
  if (!fs.existsSync(cli)) fail("the tarball has no bin/cli.js");

  // Nothing is installed next to the extracted package: this is a consumer tree.
  const commands = [
    ["--version", "prints the version"],
    ["check-api", "--list", "reads the API surface"],
    ["--help", "shows the command list"],
  ];
  for (const argv of commands) {
    const r = spawnSync(process.execPath, [cli, ...argv], {
      cwd: pkg,
      encoding: "utf8",
      timeout: 60000,
    });
    const label = `flet-box ${argv[0]}`;
    if (r.status !== 0) {
      fail(`${label} exited ${r.status}: ${(r.stderr || "").split("\n")[0]}`);
    } else if (/ERR_MODULE_NOT_FOUND|Cannot find package/.test(r.stderr)) {
      fail(`${label} resolved a devDependency: ${r.stderr.split("\n")[1]}`);
    }
  }

  // The docs ship for the offline agent, so a release that drops them is a
  // release where `npm run check` stops being able to explain itself.
  const docs = path.join(pkg, "docs", "widget");
  if (!fs.existsSync(docs)) fail("the tarball has no docs/widget/");
  else if (fs.readdirSync(docs).length < 40) fail(`docs/widget has only ${fs.readdirSync(docs).length} pages`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`check-cli-install: ${failures.length} problem(s) with the published package`);
  for (const f of failures) console.error(`  · ${f}`);
  process.exit(1);
}
console.log("check-cli-install: the packed CLI runs with no node_modules in scope");
