/**
 * @file prop-probe.mjs
 * Measures what a prop actually does in a real Chrome, before reporting it as a
 * bug. Static checkers cannot see the difference between a prop that is wired to
 * nothing and a prop whose declared type cannot reach the engine.
 *
 * Usage (one expression per call, prints the rendered root):
 *   node prop-probe.mjs 'Text({ text: "x", visible: false })'
 *   node prop-probe.mjs 'Text({ text: "x" })' --pair 'Text({ text: "x", hidden: true })'
 *   node prop-probe.mjs 'Row({ children: [], wrap: true })' --pair 'Row({ children: [], wrap: "wrap" })'
 *
 * Reads and renders only; never writes to the repo.
 */
import { requireBrowserDeps, withTimeout } from "./lib.mjs";

const argv = process.argv.slice(2);
const valueAfter = (flag) => {
  const i = argv.indexOf(flag);
  return i !== -1 ? argv[i + 1] : null;
};
const expr = argv.find((a) => !a.startsWith("--"));
const pair = valueAfter("--pair");
if (!expr) {
  console.log("usage: node prop-probe.mjs '<Widget({ ... })>' [--pair '<expr>']");
  process.exit(1);
}

const { browser, base, close } = await requireBrowserDeps();
const page = await browser.newPage();
// Must be a page served from the probe origin: `about:blank` has no base URL,
// so the dynamic import of `/src/index.js` would not resolve.
await page.goto(`${base}/__probe__`, { waitUntil: "domcontentloaded" });

const describe = async (source) =>
  page.evaluate(async (code) => {
    const api = await import("/src/index.js");
    const warnings = [];
    for (const kind of ["warn", "error"]) {
      const orig = console[kind].bind(console);
      console[kind] = (...a) => {
        warnings.push(`${kind}: ${String(a.join(" ")).slice(0, 200)}`);
        orig(...a);
      };
    }
    document.body.innerHTML = "";
    const scope = new Proxy(api, {
      has: () => true,
      get: (t, k) => (k in t ? t[k] : globalThis[k]),
    });
    let error = null;
    let widget = null;
    try {
      // No "use strict": `with` is a SyntaxError in strict mode.
      widget = new Function("scope", `with (scope) { return (${code}); }`)(scope);
      if (widget instanceof Node) document.body.appendChild(widget);
      else document.body.appendChild(widget.el || widget.container || document.createTextNode(String(widget)));
    } catch (e) {
      error = `${e.name}: ${String(e.message).slice(0, 200)}`;
    }
    const root = document.body.firstElementChild;
    const attrs = {};
    if (root) for (const a of root.getAttributeNames()) attrs[a] = root.getAttribute(a).slice(0, 200);
    const out = {
      error,
      warnings,
      tag: root ? root.tagName.toLowerCase() : null,
      attrs,
      inlineStyle: root ? root.getAttribute("style") || "" : "",
      computed: root
        ? (() => {
            const s = getComputedStyle(root);
            return { display: s.display, visibility: s.visibility, opacity: s.opacity, flexWrap: s.flexWrap, boxShadow: s.boxShadow, pointerEvents: s.pointerEvents };
          })()
        : null,
      childCounts: root
        ? {
            buttons: root.querySelectorAll("button").length,
            inputs: root.querySelectorAll("input").length,
            spans: root.querySelectorAll("span").length,
            total: root.querySelectorAll("*").length,
          }
        : null,
    };
    document.body.innerHTML = "";
    return out;
  }, source);

const results = [[expr, await withTimeout(describe(expr), 20000, "probe")]];
if (pair) results.push([pair, await withTimeout(describe(pair), 20000, "probe")]);

for (const [source, r] of results) {
  console.log(`\n== ${source}`);
  if (r.error) console.log(`   ERROR ${r.error}`);
  console.log(`   tag=${r.tag} attrs=${JSON.stringify(Object.keys(r.attrs))}`);
  for (const [k, v] of Object.entries(r.attrs)) console.log(`     ${k} = ${v}`);
  console.log(`   inline-style: ${r.inlineStyle}`);
  console.log(`   computed: ${JSON.stringify(r.computed)}`);
  console.log(`   children: ${JSON.stringify(r.childCounts)}`);
  for (const w of r.warnings) console.log(`   ${w}`);
}
if (results.length === 2) {
  const [a, b] = results.map(([, r]) => r);
  const same = a.inlineStyle === b.inlineStyle && JSON.stringify(a.attrs) === JSON.stringify(b.attrs);
  console.log(`\nDIFF: ${same ? "identical render -> the second prop does nothing extra" : "renders differ -> the prop has an effect"}`);
}

await close();
