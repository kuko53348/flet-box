// Crawl every catalog page in both themes and report what actually rendered.
// This is the pass that catches a missing import: a module that calls a widget
// it never imported passes both gates and throws here, as [data-example-error].
//
// node crawl.mjs [--port 9130] [--width 1600] [--themes light,dark]
//                [--widgets Row,Button] [--tolerance 2]

import { BASE, WIDTH, opt, withBrowser, openPage, gotoAndWait, loadCatalog } from "./lib.mjs";

const themes = opt("themes", "light,dark").split(",").filter(Boolean);
const only = opt("widgets", "").split(",").filter(Boolean);
const tolerance = Number(opt("tolerance", 2));

const { names } = await loadCatalog();
const targets = only.length ? names.filter((name) => only.includes(name) || only.includes(name.toLowerCase())) : names;
if (!targets.length) {
  console.error(`NO MATCH: none of ${only.join(", ")} is in the catalog (${names.length} widgets).`);
  console.error("Known names are case-sensitive: --widgets Row,Button,Markdown");
  process.exit(1);
}

const results = [];
const problems = [];

await withBrowser(async (browser) => {
  for (const theme of themes) {
    const { page, problems: channel } = await openPage(browser, { theme });
    for (const name of targets) {
      channel.length = 0;
      const label = `${theme} /widget/${name}`;
      try {
        await gotoAndWait(page, `/widget/${name}`, 350);
      } catch (error) {
        problems.push(`${label}: navigation failed — ${error.message}`);
        continue;
      }
      const report = await page.evaluate(() => {
        const failures = [...document.querySelectorAll("[data-example-error]")].map((node) =>
          node.getAttribute("data-example-error"),
        );
        const empty = [];
        for (const stage of document.querySelectorAll("[data-stage]")) {
          const box = stage.getBoundingClientRect();
          const painted = [...stage.querySelectorAll("*")].some((node) => {
            const r = node.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          });
          if (box.height < 20 || !painted) empty.push(stage.getAttribute("data-stage"));
        }
        const column = [...document.querySelectorAll("div")].find((node) =>
          (node.getAttribute("style") || "").includes("max-width"),
        );
        const bounds = column?.getBoundingClientRect();
        return {
          cards: document.querySelectorAll("[data-example]").length,
          stages: document.querySelectorAll("[data-stage]").length,
          failures,
          empty,
          left: bounds ? Math.round(bounds.left) : null,
          right: bounds ? Math.round(innerWidth - bounds.right) : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });

      if (channel.length) problems.push(`${label}: ${channel.join(" | ")}`);
      if (report.failures.length) problems.push(`${label}: example errors — ${report.failures.join(", ")}`);
      if (report.empty.length) problems.push(`${label}: empty stages — ${report.empty.join(", ")}`);
      if (!report.cards) problems.push(`${label}: no cards rendered (the example module is missing or failed to register)`);
      if (report.left !== null && Math.abs(report.left - report.right) > tolerance)
        problems.push(`${label}: column off-centre by ${Math.abs(report.left - report.right)}px (left ${report.left}, right ${report.right})`);
      if (report.overflow > 0) problems.push(`${label}: page scrolls sideways by ${report.overflow}px`);

      results.push({ theme, name, ...report });
    }
    await page.close().catch(() => {});
  }
});

const summary = themes.map((theme) => {
  const rows = results.filter((row) => row.theme === theme);
  return {
    theme,
    pages: rows.length,
    cards: rows.reduce((sum, row) => sum + row.cards, 0),
    failures: rows.filter((row) => row.failures.length).length,
    emptyStages: rows.filter((row) => row.empty.length).length,
    maxOffCentre: rows.reduce((max, row) => Math.max(max, row.left === null ? 0 : Math.abs(row.left - row.right)), 0),
  };
});

console.log(JSON.stringify({ ok: problems.length === 0, base: BASE, width: WIDTH, targets: targets.length, summary, problems: problems.slice(0, 60), problemCount: problems.length }, null, 2));
process.exit(problems.length ? 1 : 0);
