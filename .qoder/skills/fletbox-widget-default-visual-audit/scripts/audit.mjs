#!/usr/bin/env node
// audit.mjs — measured contrast of every visible ink in the gallery, in both themes.
//
//   node audit.mjs --gallery <dir> [--root <repo>] [--width 1360] [--json <file>]
//
// The composite is the reason this exists: `getComputedStyle` returns rgba for a
// translucent fill, and comparing that raw value against the page color is how a
// 6% accent tint reads as "fine" while the pixels say 2.41:1. Each ancestor alpha is
// composited over the one below it before the WCAG ratio is taken.
//
// Thresholds are the WCAG ones the repo's clean-UI gate uses: 4.5:1 normal text,
// 3:1 large (>=24px, or >=18.66px bold). Non-text glyphs (icon rims, star outlines)
// need a targeted probe — see probe.mjs.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Skip, flag, repoRoot, openBrowser, serve, waitForGallery, switchTheme } from "./lib.mjs";

const SCAN = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((v) => parseFloat(v));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const ratio = (a, b) => {
    const la = lum(a);
    const lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };

  // Walks up until a non-transparent background, compositing any alpha found on the way.
  const resolveBg = (node) => {
    let cur = node;
    while (cur && cur !== document.documentElement) {
      const bg = parse(getComputedStyle(cur).backgroundColor);
      if (bg && bg.a > 0) {
        if (bg.a < 1) {
          const under = resolveBg(cur.parentElement) || { r: 255, g: 255, b: 255, a: 1 };
          return over(bg, under);
        }
        return bg;
      }
      cur = cur.parentElement;
    }
    const bodyBg = parse(getComputedStyle(document.body).backgroundColor);
    return bodyBg && bodyBg.a > 0 ? bodyBg : { r: 255, g: 255, b: 255, a: 1 };
  };

  const out = [];
  for (const card of document.querySelectorAll("#app .card")) {
    const name = card.querySelector(".name")?.textContent || "?";
    const stage = card.querySelector(".stage");
    if (!stage) continue;
    const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el || seen.has(el)) continue;
      seen.add(el);
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) {
        continue;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      // A gradient or image background is not a flat color: the ratio would be a lie.
      if (style.backgroundImage !== "none") continue;
      const fg = parse(style.color);
      if (!fg) continue;
      const bg = resolveBg(el);
      const ink = fg.a < 1 ? over(fg, bg) : fg;
      const r = ratio(ink, bg);
      const px = parseFloat(style.fontSize);
      const bold = parseInt(style.fontWeight, 10) >= 700;
      const min = px >= 24 || (bold && px >= 18.66) ? 3 : 4.5;
      if (r < min) {
        out.push({
          card: name,
          text: text.slice(0, 42),
          fg: `rgb(${Math.round(ink.r)},${Math.round(ink.g)},${Math.round(ink.b)})`,
          bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
          ratio: Number(r.toFixed(2)),
          px,
          bold,
          min,
          tag: el.tagName.toLowerCase(),
        });
      }
    }
  }
  return out;
};

async function main() {
  const argv = process.argv.slice(2);
  const gallery = resolve(flag(argv, "gallery", "") || "");
  const root = repoRoot(argv, resolve(gallery, "src"));
  const width = Number(flag(argv, "width", 1360));
  const json = resolve(flag(argv, "json", resolve(gallery, "contrast.json")));

  const server = await serve(gallery);
  const { browser } = await openBrowser(root);
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${server.url}?v=${Date.now()}`, { waitUntil: "networkidle2" });
    const light = await waitForGallery(page);
    const report = { light: await page.evaluate(SCAN) };

    const dark = await switchTheme(page, "dark");
    report.dark = await page.evaluate(SCAN);

    writeFileSync(json, JSON.stringify({ ...report, errors }, null, 2));
    console.log(`contrast.json -> ${json}`);
    for (const theme of ["light", "dark"]) {
      const rows = report[theme];
      const dedup = [];
      const seen = new Set();
      for (const r of rows) {
        const key = `${r.card}|${r.text}|${r.fg}|${r.bg}`;
        if (seen.has(key)) continue;
        seen.add(key);
        dedup.push(r);
      }
      dedup.sort((a, b) => a.ratio - b.ratio);
      console.log(`\n=== ${theme}: ${rows.length} low-contrast runs (${dedup.length} distinct, worst first)`);
      for (const r of dedup.slice(0, 40)) {
        console.log(
          `  ${r.card.padEnd(22)}${String(r.ratio).padStart(5)}:1 (min ${r.min})  ` +
            `${r.fg} on ${r.bg}  ${r.px}px ${r.tag}  "${r.text}"`
        );
      }
      if (dedup.length > 40) console.log(`  … ${dedup.length - 40} more in the JSON`);
    }
    console.log(
      `\ncards ${light.cards}/${dark.cards} · rendered ${light.rendered}/${dark.rendered} · ` +
        `failures ${light.failures.length}/${dark.failures.length} · missing ${[
          ...new Set([...light.missing, ...dark.missing]),
        ].join(", ") || "-"}`
    );
    console.log("Ratios below the threshold are candidates, not verdicts: classify each one against references/probe-traps.md.");
    if (errors.length) console.log(`pageerrors: ${errors.slice(0, 5).join(" | ")}`);
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
