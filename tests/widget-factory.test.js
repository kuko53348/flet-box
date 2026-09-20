// tests/widget-factory.test.js
// Regression suite for the core (widget-factory). No dependencies: it runs in
// the browser served by the dev server. It sets the current behavior as the
// contract so the core stays frozen and only widgets are worked on.
import { WidgetFactory } from "../src/widget-factory/widgetFactory.js";
import { _debugRegistrySize } from "../src/widget-factory/lifecycle.js";

const results = [];
let pass = 0;
let fail = 0;

const tick = (ms = 40) => new Promise((r) => setTimeout(r, ms));

function check(name, cond, detail = "") {
  if (cond) {
    pass++;
    results.push({ name, ok: true });
  } else {
    fail++;
    results.push({ name, ok: false, detail });
  }
}
function eq(name, actual, expected) {
  check(name, actual === expected, `got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}

const mount = (w) => {
  document.body.appendChild(w);
  return w;
};

async function run() {
  const baseline = _debugRegistrySize();

  // ---------- 1. Tag normalization ----------
  eq("tag string → DIV", WidgetFactory("div").tagName, "DIV");
  eq("tag objeto {tag} → SPAN", WidgetFactory({ tag: "span" }).tagName, "SPAN");
  eq("objeto sin tag → DIV", WidgetFactory({}).tagName, "DIV");
  eq("tag inválido → DIV", WidgetFactory(null).tagName, "DIV");

  // ---------- 2. child / children ----------
  const both = WidgetFactory({ tag: "div", child: "a", children: ["b", "c"] });
  eq("child+children → gana children (2 hijos)", both.childNodes.length, 2);
  eq("child+children → texto 'bc'", both.textContent, "bc");
  const single = WidgetFactory({ tag: "div", child: "hola" });
  eq("child único → 1 hijo", single.childNodes.length, 1);
  eq("child string → nodo de texto", single.childNodes[0].nodeType, 3);
  const multi = WidgetFactory({ tag: "div", children: ["x", "y"] });
  eq("children array → 2 hijos", multi.childNodes.length, 2);

  // ---------- 3. Unidades ----------
  eq("width num → rem", WidgetFactory({ tag: "div", width: 16 }).style.width, "1rem");
  eq("padding num → rem", WidgetFactory({ tag: "div", padding: 8 }).style.padding, "0.5rem");
  eq("zIndex num → sin unidad", WidgetFactory({ tag: "div", zIndex: 5 }).style.zIndex, "5");
  eq("width string → se respeta", WidgetFactory({ tag: "div", width: "50%" }).style.width, "50%");

  // ---------- 4. Alias ≡ canonical (multi-dialect philosophy) ----------
  const a = WidgetFactory({ tag: "div", bgColor: "#ff0000" });
  const b = WidgetFactory({ tag: "div", backgroundColor: "#ff0000" });
  eq("alias bgColor aplica", a.style.backgroundColor, "rgb(255, 0, 0)");
  eq("canónico backgroundColor aplica", b.style.backgroundColor, "rgb(255, 0, 0)");
  a.bgColor = "#00ff00";
  eq("alias reactivo actualiza", a.style.backgroundColor, "rgb(0, 255, 0)");
  b.backgroundColor = "#0000ff";
  eq("canónico reactivo actualiza", b.style.backgroundColor, "rgb(0, 0, 255)");
  eq(
    "onPress ≡ onClick (domProp click)",
    typeof WidgetFactory({ tag: "button", onPress: () => {} }).onclick,
    "function",
  );
  eq(
    "onClick alias también",
    typeof WidgetFactory({ tag: "button", onClick: () => {} }).onclick,
    "function",
  );

  // ---------- 5. Eventos: sin doble disparo tras update ----------
  let n = 0;
  const btn = mount(WidgetFactory({ tag: "button", onPress: () => n++ }));
  btn.click();
  eq("primer click dispara 1 vez", n, 1);
  btn.update({ onPress: () => (n += 10) });
  btn.click();
  eq("update reemplaza handler (no acumula)", n, 11);
  btn.remove();

  // ---------- 6. Lifecycle: mount/unmount 1 vez + poda ----------
  const lw = WidgetFactory({ tag: "div" });
  let m = 0;
  let u = 0;
  lw.onMount(() => m++);
  lw.onUnmount(() => u++);
  mount(lw);
  lw.triggerMount();
  await tick();
  eq("mount se dispara 1 vez (observer+triggerMount)", m, 1);
  lw.remove();
  await tick();
  eq("unmount se dispara 1 vez", u, 1);
  await tick(60);
  eq("registro podado tras unmount (sin fuga)", _debugRegistrySize(), baseline);

  // ---------- 7. Synchronous reparenting: no teardown ----------
  const rw = WidgetFactory({ tag: "div" });
  let rm = 0;
  let ru = 0;
  rw.onMount(() => rm++);
  rw.onUnmount(() => ru++);
  mount(rw);
  await tick();
  rw.remove();
  document.body.appendChild(rw);
  await tick(60);
  eq("reparent: sin unmount", ru, 0);
  eq("reparent: mount no se duplica", rm, 1);
  rw.remove();
  await tick(60);
  eq("reparent: sigue registrado (unmount final)", ru, 1);

  // ---------- 8. Burst: no memory leaks ----------
  const burst = [];
  for (let i = 0; i < 30; i++) burst.push(mount(WidgetFactory({ tag: "div", padding: i })));
  await tick();
  burst.forEach((w) => w.remove());
  await tick(80);
  eq("30 widgets creados+eliminados → registro vuelve al baseline", _debugRegistrySize(), baseline);

  // ---------- 9. stackPosition ----------
  const sp = WidgetFactory({ tag: "div", position: "stack", center: true });
  eq("stack → position absolute", sp.style.position, "absolute");
  eq("stack center → transform centrado", sp.style.transform, "translate(-50%, -50%)");

  // ---------- 10. Effects ----------
  eq("con onclick → cursor pointer", WidgetFactory({ tag: "div", onPress: () => {} }).style.cursor, "pointer");
  eq(
    "disableTransform → sin cursor pointer",
    WidgetFactory({ tag: "div", onPress: () => {}, disableTransform: true }).style.cursor,
    "",
  );

  // ---------- 11. update / getProps ----------
  const up = WidgetFactory({ tag: "div", padding: 4 });
  up.update({ padding: 8 });
  eq("update mergea props", up.getProps().padding, 8);
  eq("update reaplica estilo", up.style.padding, "0.5rem");
  up.update({ children: ["x"] });
  eq("update reemplaza children", up.childNodes.length, 1);
  eq("update children texto", up.textContent, "x");

  // ---------- Render ----------
  const summary = document.getElementById("summary");
  const out = document.getElementById("out");
  summary.innerHTML = `<span class="${fail ? "fail" : "pass"}">${pass} OK · ${fail} FALLOS</span>`;
  results.forEach((r) => {
    const li = document.createElement("li");
    li.className = r.ok ? "pass" : "fail";
    li.textContent = `${r.ok ? "✅" : "❌"} ${r.name}${r.detail ? " — " + r.detail : ""}`;
    out.appendChild(li);
  });
  window.__TESTS = { pass, fail, results };
  console.log(`[TESTS] ${pass} OK, ${fail} FALLOS`);
  if (fail) console.error("[TESTS] Fallos:", results.filter((r) => !r.ok));
}

run();
