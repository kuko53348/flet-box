// Measure where the content column actually lands, per viewport width, and
// whether the page overflows sideways. Symmetry is the pass condition; a wide
// screen that renders flush left is the bug this probe exists to catch.
//
// node layout.mjs [--routes /,/category/layout,/widget/Row] [--widths 1600,1280,900,520]
//                  [--theme dark] [--tolerance 2] [--shots]

import { mkdirSync } from "node:fs";
import { BASE, WIDTH, OUT_DIR, opt, has, withBrowser, openPage, gotoAndWait } from "./lib.mjs";

const routes = opt("routes", "/,/category/layout,/widget/Row").split(",").filter(Boolean);
const widths = opt("widths", `${WIDTH},1280,900,520`).split(",").map(Number);
const theme = opt("theme", "");
const tolerance = Number(opt("tolerance", 2));

const measure = async (page, width, route) => {
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  await gotoAndWait(page, route, 400);
  return page.evaluate(
    ([w, r]) => {
      const column = [...document.querySelectorAll("div")].find((node) =>
        (node.getAttribute("style") || "").includes("max-width"),
      );
      if (!column) return { width: w, route: r, found: false };
      const box = column.getBoundingClientRect();
      const parent = column.parentElement;
      const cs = getComputedStyle(parent);
      return {
        width: w,
        route: r,
        found: true,
        left: Math.round(box.left),
        right: Math.round(innerWidth - box.right),
        columnWidth: Math.round(box.width),
        margin: getComputedStyle(column).margin,
        parent: {
          display: cs.display,
          flexDirection: cs.flexDirection,
          alignItems: cs.alignItems,
          width: Math.round(parent.getBoundingClientRect().width),
        },
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    },
    [width, route],
  );
};

const rows = [];
const problems = [];

await withBrowser(async (browser) => {
  const { page, problems: channel } = await openPage(browser, { theme: theme || undefined });
  for (const width of widths) {
    for (const route of routes) {
      channel.length = 0;
      const row = await measure(page, width, route);
      rows.push(row);
      if (channel.length) problems.push(`${width}px ${route}: ${channel.join(" | ")}`);
      if (!row.found) {
        problems.push(`${width}px ${route}: no capped column found — the page may not render a max-width wrapper`);
        continue;
      }
      if (row.overflow > 0) problems.push(`${width}px ${route}: page scrolls sideways by ${row.overflow}px`);
      const delta = Math.abs(row.left - row.right);
      const capped = row.columnWidth < row.width - tolerance;
      if (capped && delta > tolerance)
        problems.push(`${width}px ${route}: column is ${row.columnWidth} wide in ${row.width}, off-centre by ${delta}px (left ${row.left}, right ${row.right})`);
    }
  }
  if (has("shots")) {
    mkdirSync(OUT_DIR, { recursive: true });
    for (const width of widths.slice(0, 1)) {
      for (const route of routes) {
        await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
        await gotoAndWait(page, route, 500);
        const file = `${OUT_DIR}/layout-${width}${route === "/" ? "-home" : route.replace(/\//g, "-")}.png`;
        await page.screenshot({ path: file });
        rows.push({ screenshot: file });
      }
    }
  }
  await page.close().catch(() => {});
});

console.log(JSON.stringify({ ok: problems.length === 0, base: BASE, theme: theme || "app default", rows, problems }, null, 2));
process.exit(problems.length ? 1 : 0);
