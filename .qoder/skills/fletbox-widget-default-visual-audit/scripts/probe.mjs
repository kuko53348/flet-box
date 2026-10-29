#!/usr/bin/env node
// probe.mjs — measure one card of the gallery instead of eyeballing it.
//
//   node probe.mjs --gallery <dir> --card Dropdown --theme both \
//        --fn '(el, h) => ({ rootBg: getComputedStyle(el.firstElementChild).backgroundColor,
//                             rowHeights: [...el.querySelectorAll("*")].map(n => Math.round(n.getBoundingClientRect().height)).slice(0, 8) })'
//
// Prints one JSON value per theme. `--fn` is an async function source, evaluated in the
// page, receiving the card's .stage element (or #app when --card is omitted) and the
// helpers below. This is for the claims a screenshot cannot settle: a row's real height,
// which element is actually on top, where a clip plane cuts, what ink composites to.
//
// Helpers (h):
//   h.colors          the live token object
//   h.rect(el)        rounded {x,y,w,h}
//   h.stackAt(x,y)    elementsFromPoint as {tag,cls,z,text} — the only honest answer to "is it covered?"
//                     (viewport-relative: scrollIntoView the card first or the stack is empty)
//   h.ink(el)         composited {fg,bg,ratio} of one element's *text* color
//   h.tone(cssColor, el)  the same ratio for a non-text paint (rim, dot, fill, gridline)
//                     measured against the opaque surface actually behind `el`
//   h.press(el)       full pointer+mouse sequence, so CSS hit-testing and the press effect really run
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { Skip, flag, repoRoot, openBrowser, serve, waitForGallery, switchTheme } from "./lib.mjs";

const HELPERS = `
window.__probeHelpers = (FB) => {
  const parse = (c) => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(",").map((v) => parseFloat(v));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const ratio = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
  const bgOf = (node) => {
    let cur = node;
    while (cur && cur !== document.documentElement) {
      const bg = parse(getComputedStyle(cur).backgroundColor);
      if (bg && bg.a > 0) return bg.a < 1 ? over(bg, bgOf(cur.parentElement) || { r: 255, g: 255, b: 255, a: 1 }) : bg;
      cur = cur.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const rgb = (c) => "rgb(" + Math.round(c.r) + "," + Math.round(c.g) + "," + Math.round(c.b) + ")";
  return {
    colors: FB.colors,
    rect: (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; },
    stackAt: (x, y) => document.elementsFromPoint(x, y).slice(0, 6).map((n) => ({
      tag: n.tagName.toLowerCase(),
      cls: (n.className || "").toString().slice(0, 40),
      z: getComputedStyle(n).zIndex,
      text: (n.textContent || "").trim().slice(0, 30),
    })),
    ink: (el) => {
      const s = getComputedStyle(el);
      const fg = parse(s.color);
      const bg = bgOf(el);
      const ink = fg && fg.a < 1 ? over(fg, bg) : fg;
      return ink ? { fg: rgb(ink), bg: rgb(bg), ratio: Number(ratio(ink, bg).toFixed(2)) } : null;
    },
    tone: (cssColor, el) => {
      const fg = parse(cssColor);
      if (!fg) return null;
      const bg = bgOf(el);
      const c = fg.a < 1 ? over(fg, bg) : fg;
      return { fg: rgb(c), bg: rgb(bg), ratio: Number(ratio(c, bg).toFixed(2)) };
    },
    press: async (el) => {
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      for (const t of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
        const Ctor = t.startsWith("pointer") ? PointerEvent : MouseEvent;
        el.dispatchEvent(new Ctor(t, { bubbles: true, clientX: x, clientY: y }));
        await new Promise((k) => setTimeout(k, 20));
      }
      // the press/hover transitions run for 0.2s: read the settled value, not the first frame.
      await new Promise((k) => setTimeout(k, 320));
    },
  };
};
`;

async function main() {
  const argv = process.argv.slice(2);
  const gallery = resolve(flag(argv, "gallery", "") || "");
  if (!gallery || !existsSync(resolve(gallery, "gallery.js"))) throw new Skip("pass --gallery <dir>");
  const root = repoRoot(argv, resolve(gallery, "src"));
  const fn = flag(argv, "fn");
  if (!fn) throw new Skip("pass --fn '(el, h) => ({ ... })'");
  const card = flag(argv, "card", "");
  const theme = flag(argv, "theme", "light");
  const dsf = Number(flag(argv, "dsf", 1));

  const server = await serve(gallery);
  const { browser } = await openBrowser(root);
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.setViewport({ width: 1360, height: 900, deviceScaleFactor: dsf });
    await page.evaluateOnNewDocument(HELPERS);
    await page.goto(`${server.url}?v=${Date.now()}`, { waitUntil: "domcontentloaded" });
    await waitForGallery(page);

    const run = () =>
      page.evaluate(
        async ({ src, name }) => {
          const stage = name
            ? [...document.querySelectorAll("#app .card")]
                .find((c) => (c.querySelector(".name") || {}).textContent === name)
                ?.querySelector(".stage")
            : document.querySelector("#app");
          if (!stage) {
            return { error: `no card named "${name}"`, cards: window.__GALLERY.cards };
          }
          const callable = (0, eval)(`(${src})`);
          return await callable(stage, window.__probeHelpers(window.__FB));
        },
        { src: fn, name: card }
      );

    const out = {};
    if (theme === "both") {
      out.light = await run();
      await switchTheme(page, "dark");
      out.dark = await run();
    } else {
      if (theme !== "light") await switchTheme(page, theme);
      out[theme] = await run();
    }
    console.log(JSON.stringify(out, null, 2));
    if (errors.length) console.log(`consoleErrors: ${errors.slice(0, 6).join(" | ")}`);
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
