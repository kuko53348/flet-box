#!/usr/bin/env node
/**
 * Measure one widget's DEFAULT appearance in both themes, as numbers.
 *
 *   node measure-defaults.mjs --root <flet-box checkout> --widget Switch \
 *        [--props '{"label":"Notifications","value":true}'] [--row 'Option A'] \
 *        [--themes light,dark] [--depth 3] [--scale 2] [--out /tmp/fb-defaults]
 *
 * Prints computed geometry, paint and text contrast per element, and writes a
 * clipped PNG per theme. It never judges "looks good" — it reports what the
 * browser actually laid out, which is the only evidence that settles a defaults
 * report.
 */
import { join } from "node:path";
import { openProbe, parseArgs, parsePropsArg, need, fail, ensureDir } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const root = args.root || process.cwd();
const widgetName = need(args.widget, "widget");
const props = parsePropsArg(args.props);
const themes = String(args.themes || "light,dark").split(",");
const depth = Number(args.depth || 3);
const outDir = String(args.out || "/tmp/fb-defaults");
const label = typeof args.row === "string" ? args.row : null;

let probe;
try {
  probe = await openProbe({ root, scale: Number(args.scale || 2) });
} catch (e) {
  fail(`could not open the probe page: ${e.message}`);
}
await ensureDir(outDir);

const buildAndMeasure = (theme) =>
  probe.page.evaluate(
    async ({ theme, widgetName, props, depth, label }) => {
      const FB = await import("/src/index.js");
      const { setTheme, colors } = await import("/src/utils/themes.js");
      setTheme(theme);

      const make = FB[widgetName];
      if (typeof make !== "function") {
        return { error: `"${widgetName}" is not an exported widget` };
      }

      document.getElementById("fbprobe")?.remove();
      const host = document.createElement("div");
      host.id = "fbprobe";
      host.style.cssText =
        "position:fixed;left:40px;top:120px;z-index:9999;padding:24px;background:" +
        colors.background +
        ";color:" +
        colors.text +
        ";";
      const widget = make(props);
      host.append(label ? FB.Row({ gap: 10, children: [widget, FB.Text({ text: label })] }) : widget);
      document.body.appendChild(host);
      await new Promise((r) => setTimeout(r, 300));

      const rgb = (value) => {
        const m = /rgba?\(([^)]+)\)/.exec(String(value || ""));
        if (!m) return null;
        const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      };
      const lum = (c) => {
        const f = (v) => v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4;
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
      };
      const over = (fg, bg) => {
        const a = lum(fg), b = lum(bg);
        return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
      };
      // Paint is composited by walking up: a transparent child sits on the
      // host's theme background, and that is the pair contrast must use.
      const paintUnder = (el) => {
        for (let n = el; n; n = n.parentElement) {
          const c = rgb(getComputedStyle(n).backgroundColor);
          if (c && c.a > 0) return c;
          if (n.id === "fbprobe") break;
        }
        return rgb(colors.background);
      };
      const ownText = (el) =>
        [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ");

      const box = (el) => {
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.x * 100) / 100,
          y: Math.round(r.y * 100) / 100,
          w: Math.round(r.width * 100) / 100,
          h: Math.round(r.height * 100) / 100,
          cy: Math.round((r.y + r.height / 2) * 100) / 100,
        };
      };

      const rows = [];
      const queue = [[widget, 0, "root"]];
      while (queue.length) {
        const [el, d, path] = queue.shift();
        const cs = getComputedStyle(el);
        const text = ownText(el);
        const fg = rgb(cs.color);
        const entry = {
          path,
          depth: d,
          tag: el.tagName.toLowerCase(),
          name: el._widgetName || null,
          ...box(el),
          display: cs.display,
          alignItems: cs.alignItems,
          justifyContent: cs.justifyContent,
          gap: cs.gap,
          border: cs.border,
          radius: cs.borderRadius,
          bg: cs.backgroundColor,
          color: cs.color,
          shadow: cs.boxShadow,
          minH: cs.minHeight,
          minW: cs.minWidth,
          pad: cs.padding,
          margin: cs.margin,
          cursor: cs.cursor,
          opacity: cs.opacity,
        };
        if (text) {
          entry.text = text.slice(0, 40);
          if (fg) entry.contrast = over(fg, paintUnder(el));
        }
        rows.push(entry);
        if (d < depth) {
          [...el.children].forEach((child, i) => queue.push([child, d + 1, `${path}.${i}`]));
        }
        if (rows.length > 30) break;
      }

      let alignment = null;
      if (label) {
        const row = host.firstElementChild;
        alignment = {
          row: box(row),
          cells: [...row.children].map((c, i) => ({
            i,
            name: c._widgetName || c.tagName.toLowerCase(),
            ...box(c),
            text: ownText(c).slice(0, 24),
          })),
        };
      }

      return { theme, palette: { primary: colors.primary, text: colors.text, background: colors.background }, elements: rows, alignment };
    },
    { theme, widgetName, props, depth, label },
  );

const report = { widget: widgetName, props, row: label, themes: {} };
for (const theme of themes) {
  const data = await buildAndMeasure(theme);
  if (data.error) fail(data.error);
  const clip = await probe.page.evaluate(() => {
    const host = document.getElementById("fbprobe");
    const r = host.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  const png = join(outDir, `${widgetName.toLowerCase()}-${theme}.png`);
  await probe.page.screenshot({ path: png, clip });
  data.png = png;
  report.themes[theme] = data;
}

await probe.close();
console.log(JSON.stringify(report, null, 2));

for (const [theme, data] of Object.entries(report.themes)) {
  const rootEl = data.elements[0];
  const worst = data.elements
    .filter((e) => e.contrast !== undefined)
    .sort((a, b) => a.contrast - b.contrast)[0];
  console.log(
    `${theme.padEnd(5)} ${widgetName} root ${rootEl.w}x${rootEl.h} ` +
      `border "${rootEl.border}" bg ${rootEl.bg} cursor ${rootEl.cursor}` +
      (worst ? `  | weakest text contrast ${worst.contrast}:1 at ${worst.path} "${worst.text || ""}"` : "") +
      (data.alignment ? `  | row h ${data.alignment.row.h}` : ""),
  );
}
