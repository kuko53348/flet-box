// Full doc-verification probe: runs the Chapter 3-7 fragments against the real
// runtime. Each fragment encodes the documented behavior; reality validates it.
import * as W from "../src/widgets/index.js";
import { colors } from "../src/utils/themes.js";

import ch3 from "./doccheck-ch3.js";
import ch4 from "./doccheck-ch4.js";
import ch5 from "./doccheck-ch5.js";
import ch6 from "./doccheck-ch6.js";
import ch7 from "./doccheck-ch7.js";

const results = [];
let pass = 0, fail = 0;
const t = (name, fn) => {
  try {
    const r = fn();
    if (r === false) throw new Error("assertion returned false");
    results.push({ name, ok: true }); pass++;
  } catch (e) {
    results.push({ name, ok: false, err: String(e && e.message ? e.message : e) }); fail++;
  }
};
const eq = (a, b, m) => { if (a !== b) throw new Error((m || "") + ` expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); };
const cs = (el) => getComputedStyle(el);

const host = document.createElement("div");
host.style.cssText = "position:absolute;left:-9999px;top:0;width:600px;";
document.body.appendChild(host);
const mount = (el) => { host.appendChild(el); return el; };

const ctx = { t, eq, cs, mount, W, colors };

const chapters = [
  ["ch3", ch3], ["ch4", ch4], ["ch5", ch5], ["ch6", ch6], ["ch7", ch7],
];
for (const [label, run] of chapters) {
  try {
    run(ctx);
  } catch (e) {
    results.push({ name: `${label}: FRAGMENT THREW`, ok: false, err: String(e && e.message ? e.message : e) }); fail++;
  }
}

window.__DOCCHECK = { pass, fail, total: pass + fail, results };
const s = document.getElementById("summary");
if (s) s.textContent = `doccheck-all: ${pass} passed, ${fail} failed (of ${pass + fail})`;
const out = document.getElementById("out");
if (out) {
  out.innerHTML = "";
  for (const r of results) {
    const li = document.createElement("li");
    li.textContent = (r.ok ? "PASS  " : "FAIL  ") + r.name + (r.err ? "  -> " + r.err : "");
    li.style.color = r.ok ? "#9ccc65" : "#ef5350";
    out.appendChild(li);
  }
}
