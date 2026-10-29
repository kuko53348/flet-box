#!/usr/bin/env node
// shots.mjs — render the gallery in BOTH themes and write the screenshots this audit reads.
//
//   node shots.mjs --gallery <dir> [--root <repo>] [--width 1360] [--dsf 1] [--out <dir>]
//   node shots.mjs --gallery <dir> --card Radio --dsf 4      # one card, big enough to judge a ring
//
// Headless Chrome boots in the dark scheme, so the theme comes from the gallery's own
// toggle (setTheme), not from prefers-color-scheme, and every run waits for
// window.__GALLERY.theme to actually flip. Group crops exist because a full-page PNG of
// 60 cards is downscaled when it is shown back in chat, which hides exactly the hairlines
// and low-contrast ink the audit is looking for. `--card` is the same idea one level down:
// a 20-unit radio rim or an 8-unit dot is not reviewable at dsf 1.
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { Skip, flag, repoRoot, openBrowser, serve, waitForGallery, switchTheme } from "./lib.mjs";

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function main() {
  const argv = process.argv.slice(2);
  const gallery = resolve(flag(argv, "gallery", "") || "");
  if (!gallery || !existsSync(resolve(gallery, "gallery.js"))) {
    throw new Skip("pass --gallery <dir> built by build-gallery.mjs");
  }
  const root = repoRoot(argv, resolve(gallery, "src"));
  const width = Number(flag(argv, "width", 1360));
  const dsf = Number(flag(argv, "dsf", 1));
  const out = resolve(flag(argv, "out", gallery));
  const card = flag(argv, "card", "");

  const server = await serve(gallery);
  const { browser } = await openBrowser(root);
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${String(e)}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console: ${m.text()}`);
    });
    await page.setViewport({ width, height: 900, deviceScaleFactor: dsf });
    await page.goto(`${server.url}?v=${Date.now()}`, { waitUntil: "domcontentloaded" });
    const light = await waitForGallery(page);
    await page.evaluate(() => window.scrollTo(0, 0));

    // One crop per section: the group title is the sibling before each grid.
    const groups = await page.evaluate(() =>
      [...document.querySelectorAll("#app .grid")].map((grid) => {
        const title = grid.previousElementSibling.getBoundingClientRect();
        const rect = grid.getBoundingClientRect();
        return {
          name: grid.previousElementSibling.textContent,
          x: 0,
          y: Math.max(0, title.top + window.scrollY - 8),
          width: document.documentElement.clientWidth,
          height: title.height + rect.height + 16,
        };
      })
    );

    const files = [];
    const cardBox = card
      ? await page.evaluate((name) => {
          const el = [...document.querySelectorAll("#app .card")].find(
            (c) => (c.querySelector(".name") || {}).textContent === name
          );
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            x: Math.max(0, r.x - 8),
            y: r.y + window.scrollY - 8,
            width: r.width + 16,
            height: r.height + 16,
          };
        }, card)
      : null;
    if (card && !cardBox) throw new Skip(`no card named "${card}" in the gallery`);
    const shoot = async (theme) => {
      const full = resolve(out, `gallery-${theme}.png`);
      await page.screenshot({ path: full, fullPage: true });
      files.push(full);
      if (cardBox) {
        const file = resolve(out, `${theme}-card-${slugify(card)}.png`);
        await page.screenshot({ path: file, clip: cardBox, captureBeyondViewport: true });
        files.push(file);
      }
      for (const box of groups) {
        const file = resolve(out, `${theme}-${slugify(box.name)}.png`);
        await page.screenshot({ path: file, clip: box, captureBeyondViewport: true });
        files.push(file);
      }
    };

    await shoot("light");
    const dark = await switchTheme(page, "dark");
    await page.evaluate(() => window.scrollTo(0, 0));
    await shoot("dark");

    console.log(
      JSON.stringify(
        {
          url: server.url,
          viewport: { width, height: 900, deviceScaleFactor: dsf },
          light: {
            cards: light.cards,
            rendered: light.rendered,
            failures: light.failures,
            missing: light.missing,
          },
          dark: {
            cards: dark.cards,
            rendered: dark.rendered,
            failures: dark.failures,
            missing: dark.missing,
          },
          groups: groups.map((g) => slugify(g.name)),
          consoleErrors: errors.slice(0, 12),
          files,
        },
        null,
        2
      )
    );
    if (light.failures.length || dark.failures.length) {
      console.log("\nA card that throws is a real finding: open it with probe.mjs before touching a widget.");
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch((err) => {
  if (err instanceof Skip) {
    console.log(`SKIP: ${err.message}`);
    process.exit(0);
  }
  console.error(`FAIL: ${err.stack || err.message}`);
  process.exit(1);
});
