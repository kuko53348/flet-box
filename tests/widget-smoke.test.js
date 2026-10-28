// Smoke test: instantiate every widget with minimal valid props and mount it.
// Catches ReferenceError / undefined-symbol bugs (like the old InstallButton).
import * as W from "../src/widgets/index.js";
import * as Public from "../src/index.js";

const results = [];
let pass = 0;
let fail = 0;

const record = (name, ok, err) => {
  results.push({ name, ok, err: err ? String(err && err.message ? err.message : err) : null });
  if (ok) pass++;
  else fail++;
};

// Minimal props per widget so each can build without throwing.
// These are the names the widgets actually read — see tests/props-full.test.js
// for the full documented prop set of every component.
const fixtures = {
  Container: () => ({}),
  Row: () => ({ children: [] }),
  Column: () => ({ children: [] }),
  Stack: () => ({ children: [] }),
  ListView: () => ({ data: [], renderItem: (item) => W.Text({ text: String(item) }) }),
  GridView: () => ({ children: [] }),
  Text: () => ({ text: "hi" }),
  Button: () => ({ text: "btn" }),
  Icon: () => ({ name: "home" }),
  Image: () => ({ src: "" }),
  Avatar: () => ({}),
  Card: () => ({ child: W.Text({ text: "c" }) }),
  ListTile: () => ({ title: "t" }),
  ProgressBar: () => ({ value: 50 }),
  Rating: () => ({ value: 3 }),
  Chip: () => ({ label: "chip" }),
  Badge: () => ({ value: 1, child: W.Text({ text: "b" }) }),
  Divider: () => ({}),
  Accordion: () => ({ title: "a", children: [W.Text({ text: "x" })] }),
  AdSense: () => ({}),
  AdMob: () => ({
    plugin: {
      initialize: () => Promise.resolve(),
      showBanner: () => Promise.resolve(),
      removeBanner: () => Promise.resolve(),
    },
  }),
  Input: () => ({}),
  Radio: () => ({ name: "r", value: "1" }),
  Switch: () => ({}),
  Checkbox: () => ({}),
  Dropdown: () => ({ options: [{ label: "o", value: "1" }] }),
  SnackBar: () => ({ message: "m" }),
  Modal: () => ({ title: "m" }),
  BottomSheet: () => ({ content: W.Text({ text: "s" }) }),
  AlertDialog: () => ({ title: "d" }),
  FloatingActionButton: () => ({}),
  CodeViewer: () => ({ code: "let a=1;" }),
  Inspector: () => ({}),
  DraggBox: () => ({ child: W.Text({ text: "d" }) }),
  DroppBox: () => ({ child: W.Text({ text: "p" }) }),
  DataTable: () => ({ columns: ["a"], rows: [["1"]] }),
  Carousel: () => ({ items: [W.Text({ text: "1" })] }),
  Tooltip: () => ({ text: "tip", child: W.Text({ text: "hover" }) }),
  Pagination: () => ({ totalItems: 57, pageSize: 10, currentPage: 1, onPageChange: () => {} }),
  TreeView: () => ({
    nodes: [{ id: "a", label: "a", children: [{ id: "b", label: "b" }] }],
  }),
  Stepper: () => ({ steps: [{ label: "s1" }] }),
  ThemePicker: () => ({ showLabels: true }),
  Skeleton: () => ({}),
  Chart: () => ({ data: [1, 2, 3] }),
  QRCode: () => ({ value: "qr" }),
  Slider: () => ({ min: 0, max: 10, value: 5 }),
  InstallButton: () => ({}),
  Video: () => ({ src: "" }),
  Audio: () => ({ src: "" }),
  CircularBar: () => ({ value: 40 }),
  CircularChart: () => ({ data: [{ value: 1 }] }),
  Markdown: () => ({ text: "# hi" }),
};

const host = document.createElement("div");
host.style.cssText = "position:absolute;left:-9999px;top:0;width:600px;";
document.body.appendChild(host);

const names = Object.keys(fixtures);
for (const name of names) {
  const fn = W[name];
  if (typeof fn !== "function") {
    record(name, false, new Error(`not exported / not a function`));
    continue;
  }
  let el;
  try {
    el = fn(fixtures[name]());
  } catch (err) {
    record(name, false, err);
    continue;
  }
  try {
    if (el && el.nodeType === 1) host.appendChild(el);
    record(name, true);
  } catch (err) {
    record(name, false, err);
  }
}

// A widget whose declaration writes `props?:` promises that the caller may
// leave the argument out. The promise is in the type, so it has to hold at
// runtime: the gallery that called `ThemePicker()` with nothing found out it
// was a lie, and the screen died before it painted a pixel.
const optionalWidgets = await (async () => {
  try {
    const dts = await (await fetch("../src/index.d.ts")).text();
    return [
      ...dts.matchAll(/export\s+function\s+([A-Z][\w$]*)\s*\(\s*props\?\s*:/g),
    ].map((m) => m[1]);
  } catch {
    return [];
  }
})();

for (const name of optionalWidgets) {
  // The promise is made by the public barrel: that is what a caller imports.
  const fn = Public[name] ?? W[name];
  if (typeof fn !== "function") {
    record(`${name} (declared optional)`, false, new Error("not exported"));
    continue;
  }
  let el;
  try {
    el = fn();
  } catch (err) {
    record(`${name} (declared optional)`, false, err);
    continue;
  }
  // Some widgets own a resource — a canvas with a running loop, a listener —
  // and hand back the disposer. Nothing here needs the element mounted.
  try {
    el?._cleanup?.();
  } catch {
    /* a widget that cannot be disposed is still a widget that constructed */
  }
  record(`${name} (declared optional)`, true);
}

// Also flag exported widgets we did not cover in fixtures.
const missing = Object.keys(W).filter(
  (k) => typeof W[k] === "function" && !fixtures[k] && !/^[A-Z]/.test(k) === false,
);

const total = names.length + optionalWidgets.length;

window.__SMOKE = { pass, fail, results, missing, total };

// Render into the page for the harness viewer.
const out = document.getElementById("out");
const summary = document.getElementById("summary");
if (summary) {
  summary.textContent = `SMOKE: ${pass}/${total} widgets instantiated OK${fail ? ` — ${fail} FAILED` : ""}`;
  summary.style.color = fail ? "#ff6b6b" : "#4ec9b0";
}
if (out) {
  for (const r of results) {
    const li = document.createElement("li");
    li.style.color = r.ok ? "#4ec9b0" : "#ff6b6b";
    li.textContent = `${r.ok ? "PASS" : "FAIL"} ${r.name}${r.err ? " — " + r.err : ""}`;
    out.appendChild(li);
  }
}
console.log("[flet-box smoke]", window.__SMOKE);
