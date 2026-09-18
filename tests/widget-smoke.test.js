// Smoke test: instantiate every widget with minimal valid props and mount it.
// Catches ReferenceError / undefined-symbol bugs (like the old InstallButton).
import * as W from "../src/widgets/index.js";

const results = [];
let pass = 0;
let fail = 0;

const record = (name, ok, err) => {
  results.push({ name, ok, err: err ? String(err && err.message ? err.message : err) : null });
  if (ok) pass++;
  else fail++;
};

// Minimal props per widget so each can build without throwing.
const fixtures = {
  Container: () => ({}),
  Row: () => ({ children: [] }),
  Column: () => ({ children: [] }),
  Stack: () => ({ children: [] }),
  ListView: () => ({ children: [] }),
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
  Badge: () => ({ count: 1, child: W.Text({ text: "b" }) }),
  Divider: () => ({}),
  Accordion: () => ({ title: "a", child: W.Text({ text: "x" }) }),
  Input: () => ({}),
  Radio: () => ({ name: "r", value: "1" }),
  Switch: () => ({}),
  Checkbox: () => ({}),
  Dropdown: () => ({ options: [{ label: "o", value: "1" }] }),
  SnackBar: () => ({ message: "m" }),
  Modal: () => ({ title: "m" }),
  BottomSheet: () => ({ child: W.Text({ text: "s" }) }),
  AlertDialog: () => ({ title: "d" }),
  FloatingActionButton: () => ({}),
  CodeViewer: () => ({ code: "let a=1;" }),
  Inspector: () => ({}),
  DraggBox: () => ({ child: W.Text({ text: "d" }) }),
  DroppBox: () => ({ child: W.Text({ text: "p" }) }),
  DataTable: () => ({ columns: ["a"], rows: [["1"]] }),
  Carousel: () => ({ items: [W.Text({ text: "1" })] }),
  Tooltip: () => ({ text: "tip", child: W.Text({ text: "hover" }) }),
  Pagination: () => ({ total: 10, current: 1 }),
  TreeView: () => ({ data: [] }),
  Stepper: () => ({ steps: [{ label: "s1" }] }),
  Skeleton: () => ({}),
  Chart: () => ({ data: [1, 2, 3] }),
  QRCode: () => ({ text: "qr" }),
  Slider: () => ({ min: 0, max: 10, value: 5 }),
  InstallButton: () => ({}),
  Video: () => ({ src: "" }),
  Audio: () => ({ src: "" }),
  CircularBar: () => ({ value: 40 }),
  CircularChart: () => ({ data: [{ value: 1 }] }),
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

// Also flag exported widgets we did not cover in fixtures.
const missing = Object.keys(W).filter(
  (k) => typeof W[k] === "function" && !fixtures[k] && !/^[A-Z]/.test(k) === false,
);

window.__SMOKE = { pass, fail, results, missing, total: names.length };

// Render into the page for the harness viewer.
const out = document.getElementById("out");
const summary = document.getElementById("summary");
if (summary) {
  summary.textContent = `SMOKE: ${pass}/${names.length} widgets instantiated OK${fail ? ` — ${fail} FAILED` : ""}`;
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
