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

  // The CI files a consumer gets are built here, not in the repo — this repo's
  // own `.github/` is a different thing. Read the templates out of the tarball
  // (importing them also proves they need nothing but Node) and hold the
  // contract that `flet-box create` promises: the site publishes on a push,
  // the OTA manifest publishes only on a tag, and the address is in the log.
  const templates = await import(
    path.join(pkg, "bin", "utils", "templates.js")
  );
  const web = templates.githubWorkflow("Check App", "com.check.app");
  const native = templates.nativeWorkflow("Check App");
  if (typeof web !== "string" || typeof native !== "string") {
    fail("create has no workflow templates to write");
  } else {
    const deployLines = web
      .split("\n")
      .filter((l) => /Upload Pages artifact|Deploy to GitHub Pages/.test(l))
      .length;
    if (deployLines !== 2) fail(`the web workflow lost a Pages step (${deployLines}/2)`);
    // Neither Pages step may be gated on a tag again: that is the bug the user
    // reports as "the Actions ran green and no website was created".
    if (/if: startsWith\(github.ref, 'refs\/tags\/v'\)/.test(web)) {
      fail("the web workflow gates Pages on a release tag, so a push publishes nothing");
    }
    // Two jobs, like the docs site: only the deploy job can reach Pages, so a
    // bundle that fails to build cannot replace the live site.
    const deployJob = web.split("\n  deploy:")[1];
    if (!deployJob || !/needs: build/.test(deployJob)) {
      fail("the web workflow has no deploy job that waits for the build");
    } else {
      if (!/actions\/deploy-pages@v5/.test(deployJob)) {
        fail("the web workflow's deploy job does not deploy");
      }
      if (/actions\/deploy-pages@v5/.test(web.split("\n  deploy:")[0])) {
        fail("the web workflow deploys from the build job, so a failed build can still replace the site");
      }
      if (!/name: github-pages/.test(deployJob)) {
        fail("the web workflow lost the github-pages environment on the deploy job");
      }
    }
    if (!/if: \$\{\{ !startsWith\(github.ref, 'refs\/tags\/v'\) \}\}\s*\n\s*run: rm -f www\/config\.json/.test(web)) {
      fail("the web workflow no longer strips www/config.json from a non-release build");
    }
    if (!/pages: write/.test(web) || !/id-token: write/.test(web)) {
      fail("the web workflow lost the Pages permissions the deploy step needs");
    }
    // `environment.url` also mentions page_url, so match the log lines: the
    // user asked to be able to read the address from the run output. Two
    // different moments matter — the address before the deploy runs (so a green
    // run with no site is explainable) and the annotation after it.
    if (!/site: [^\n]*github\.io/.test(web)) {
      fail("the web workflow never prints the site address before deploying");
    }
    if (!/::notice [^\n]*steps\.deployment\.outputs\.page_url/.test(web)) {
      fail("the web workflow publishes no run annotation with the address");
    }
    if (!/Settings -> Pages/.test(web)) {
      fail("the web workflow no longer says which setting makes the deploy land");
    }
    if (!/^on:\s*\n\s*workflow_dispatch:/m.test(native) || /on:\s*\n\s*push:/m.test(native)) {
      fail("the native workflow runs on a push again (a macOS runner is not free)");
    }
    if (/deploy-pages|upload-pages-artifact/.test(native)) {
      fail("the native workflow publishes the site, which build.yml already does");
    }
    if (!/inputs\.platform == 'android'/.test(native) || !/inputs\.platform == 'ios'/.test(native)) {
      fail("the native workflow lost the platform choice");
    }
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`check-cli-install: ${failures.length} problem(s) with the published package`);
  for (const f of failures) console.error(`  · ${f}`);
  process.exit(1);
}
console.log("check-cli-install: the packed CLI runs with no node_modules in scope");
