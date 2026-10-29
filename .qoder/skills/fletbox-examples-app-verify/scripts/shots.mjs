// Screenshot the same routes in both themes. The theme is written to
// localStorage before the page's first script runs, so the app boots themed
// instead of being toggled after render (a toggle rebuilds the whole tree and
// the stages settle later than the shot).
//
// node shots.mjs [--routes /,/widget/Row] [--themes light,dark] [--width 1360]
//                 [--full] [--out /tmp/shots/<app>-<port>]

import { mkdirSync } from "node:fs";
import { BASE, OUT_DIR, opt, has, withBrowser, openPage, gotoAndWait } from "./lib.mjs";

const routes = opt("routes", "/").split(",").filter(Boolean);
const themes = opt("themes", "light,dark").split(",").filter(Boolean);
const width = Number(opt("width", 1360));
const fullPage = has("full");

// Creating the output directory is not optional: page.screenshot() throws ENOENT
// on a missing parent, after the whole crawl has already run.
mkdirSync(OUT_DIR, { recursive: true });

const written = [];
const problems = [];

await withBrowser(async (browser) => {
  for (const theme of themes) {
    const { page, problems: channel } = await openPage(browser, { theme, width, height: 1000, deviceScaleFactor: 2 });
    for (const route of routes) {
      channel.length = 0;
      const label = `${theme} ${route}`;
      try {
        await gotoAndWait(page, route, 500);
      } catch (error) {
        problems.push(`${label}: navigation failed — ${error.message}`);
        continue;
      }
      const file = `${OUT_DIR}/${theme}${route === "/" ? "-home" : route.replace(/\//g, "-")}.png`;
      try {
        await page.screenshot({ path: file, fullPage });
        written.push(file);
      } catch (error) {
        problems.push(`${label}: screenshot failed — ${error.message}`);
      }
      const painted = await page.evaluate(() => {
        const stages = [...document.querySelectorAll("[data-stage]")];
        return {
          stages: stages.length,
          cards: document.querySelectorAll("[data-example]").length,
          errors: document.querySelectorAll("[data-example-error]").length,
        };
      });
      if (channel.length) problems.push(`${label}: ${channel.join(" | ")}`);
      if (painted.errors) problems.push(`${label}: ${painted.errors} example(s) threw in the browser`);
      written.push({ [label]: painted });
    }
    await page.close().catch(() => {});
  }
});

console.log(JSON.stringify({ ok: problems.length === 0, base: BASE, files: written.filter((x) => typeof x === "string"), state: written.filter((x) => typeof x === "object"), problems }, null, 2));
process.exit(problems.length ? 1 : 0);
