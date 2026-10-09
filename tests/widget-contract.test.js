// tests/widget-contract.test.js
// Runtime contract suite for the widget library. It complements the static
// checker (scripts/check-widgets.mjs): here we instantiate every public widget
// with empty props and assert the behavioral contract described in
// docs/guides/widget-structure.md.
//
// No dependencies: it runs in the browser served by the dev server.
// Open /tests/widget-contract.html.
import * as Widgets from "../src/widgets/index.js";

const results = [];
let pass = 0;
let fail = 0;
let nameOk = 0;
let nameKo = 0;

function check(name, cond, detail = "") {
  if (cond) {
    pass++;
  } else {
    fail++;
  }
  results.push({ name, ok: !!cond, detail, kind: "hard" });
}
function info(name, cond, detail = "") {
  if (cond) nameOk++;
  else nameKo++;
  results.push({ name, ok: !!cond, detail, kind: "name" });
}

const NON_WIDGETS = new Set(["Inspector", "printWidgetCode", "inspectWidget"]);
const CONTROLLERS = new Set(["AlertDialog", "SnackBar", "BottomSheet", "Modal"]);

// Widgets whose documented behavior is to return `null` (render nothing) when
// there is no value/child to render. The contract is "null on empty state",
// not "always an element".
const NULLABLE = new Set(["Badge", "Carousel", "DraggBox", "Pagination", "Tooltip"]);

// Widgets whose factory cannot be called with strictly empty props; a small
// valid payload keeps the assertion about the *contract*, not about content.
const SAMPLE_PROPS = {
  QRCode: { value: "https://flet-box.dev" },
  Image: { src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" },
  Video: { src: "x.mp4" },
  Audio: { src: "x.mp3" },
  Chart: { data: [{ label: "A", value: 1 }] },
  CircularChart: { data: [{ value: 1 }] },
  Markdown: { text: "hello" },
  DataTable: { columns: [{ key: "a", label: "A" }], rows: [{ a: 1 }] },
};

const run = () => {
  const entries = Object.entries(Widgets).filter(([name]) => !NON_WIDGETS.has(name));

  for (const [name, factory] of entries) {
    if (typeof factory !== "function") {
      check(`${name}: export es función`, false, `tipo=${typeof factory}`);
      continue;
    }

    let instance;
    try {
      instance = factory(SAMPLE_PROPS[name] || {});
    } catch (err) {
      check(`${name}: no lanza con props vacías`, false, String(err && err.message));
      continue;
    }

    if (CONTROLLERS.has(name)) {
      check(
        `${name}: controller devuelve objeto`,
        instance !== null && (typeof instance === "object" || typeof instance === "function"),
      );
      const controller = instance || {};
      check(
        `${name}: controller expone método de ciclo de vida`,
        typeof controller.open === "function" ||
          typeof controller.close === "function" ||
          typeof controller.show === "function" ||
          typeof controller.destroy === "function",
      );
      continue;
    }

    if (NULLABLE.has(name) && instance === null) {
      check(`${name}: devuelve null con props vacías (documentado)`, true);
      continue;
    }

    check(`${name}: devuelve HTMLElement`, instance && instance.nodeType === 1);
    if (!instance || instance.nodeType !== 1) continue;

    info(
      `${name}: _widgetName === "${name}"`,
      instance._widgetName === name,
      `actual="${instance._widgetName}"`,
    );

    check(
      `${name}: expone update()`,
      typeof instance.update === "function",
    );
  }

  const summary = document.getElementById("summary");
  if (summary) {
    summary.innerHTML = `<span class="${fail ? "fail" : "pass"}">${pass} OK · ${fail} FALLOS</span> <small>(nombres: ${nameOk}/${nameOk + nameKo})</small>`;
  }
  const out = document.getElementById("out");
  if (out) {
    for (const r of results) {
      const li = document.createElement("li");
      li.className = r.ok ? "pass" : r.kind === "name" ? "warn" : "fail";
      li.textContent = `${r.ok ? "✅" : r.kind === "name" ? "⚠️" : "❌"} ${r.name}${r.detail ? " — " + r.detail : ""}`;
      out.appendChild(li);
    }
  }

  window.__CONTRACT = { pass, fail, nameOk, nameKo, results };
  console.log(`[CONTRACT] ${pass} OK, ${fail} FALLOS · nombres ${nameOk}/${nameOk + nameKo}`);
};

run();
