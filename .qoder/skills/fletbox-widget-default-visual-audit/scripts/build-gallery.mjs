#!/usr/bin/env node
// build-gallery.mjs — mount every FletBox widget with its DEFAULTS, outside the repo.
//
//   node build-gallery.mjs [--root <flet-box checkout>] [--out <dir>] [--serve]
//
// Writes <out>/{index.html,gallery.js}, symlinks <out>/src -> <repo>/src, and prints
// the URL. The symlink is what makes the audit honest: the gallery renders the working
// tree, so a widget default you just edited is on screen on the next reload without
// republishing anything. Never pass a color prop here — the point is the default.
import { copyFileSync, mkdirSync, rmSync, symlinkSync, lstatSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HERE, Skip, flag, hasFlag, repoRoot, serve, sleep } from "./lib.mjs";

const ASSETS = resolve(dirname(HERE), "assets", "gallery");

async function main() {
  const root = repoRoot(process.argv.slice(2));
  const out = resolve(flag(process.argv.slice(2), "out", "/tmp/fletbox-defaults-gallery"));

  if (out === root || out.startsWith(root + "/")) {
    throw new Skip(
      `--out ${out} is inside the framework repo. The gallery is a throwaway probe: keep it ` +
        "outside the checkout so it is never staged, bundled or committed."
    );
  }

  mkdirSync(out, { recursive: true });
  for (const file of ["index.html", "gallery.js"]) {
    copyFileSync(join(ASSETS, file), join(out, file));
  }

  // ln -sfn: a leftover symlink to an old checkout would render the previous code.
  const link = join(out, "src");
  try {
    lstatSync(link);
    rmSync(link, { recursive: true, force: true });
  } catch {
    /* nothing there yet */
  }
  symlinkSync(join(root, "src"), link, "dir");

  console.log(`gallery dir : ${out}`);
  console.log(`framework   : ${root} (symlinked as ./src)`);
  console.log(`widgets     : every export of src/index.js, no color prop passed`);
  console.log(`manifest    : window.__GALLERY = { theme, cards, rendered, failures, missing }`);

  if (!hasFlag(process.argv.slice(2), "serve")) {
    console.log(`\nnext: node ${join(HERE, "shots.mjs")} --gallery ${out}`);
    return;
  }

  const server = await serve(out);
  console.log(`\nserving     : ${server.url} (pid ${process.pid}, Cache-Control: no-store)`);
  console.log("            : Ctrl-C to stop; the port is chosen free, so it never collides with :8000");
  await sleep(1 << 30);
}

main().catch((err) => {
  if (err instanceof Skip) {
    console.log(`SKIP: ${err.message}`);
    process.exit(0);
  }
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
});
