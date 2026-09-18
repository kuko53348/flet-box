// Doc-verification probe: asserts the behaviors documented for the 15 pilot
// widgets (Chapters 1-2). Grounds the docs in real runtime behavior.
import * as W from "../src/widgets/index.js";

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
const px = (v) => v;

const host = document.createElement("div");
host.style.cssText = "position:absolute;left:-9999px;top:0;width:600px;";
document.body.appendChild(host);
const mount = (el) => { host.appendChild(el); return el; };

// ---------------- Text ----------------
t("Text: default size 16px", () => { const e = mount(W.Text({ text: "x" })); eq(cs(e).fontSize, "16px"); });
t("Text: size number -> px", () => { const e = mount(W.Text({ text: "x", size: 28 })); eq(cs(e).fontSize, "28px"); });
t("Text: type h2 -> H2 tag", () => { const e = W.Text({ text: "x", type: "h2" }); eq(e.tagName, "H2"); });
t("Text: default tag is SPAN", () => { eq(W.Text({ text: "x" }).tagName, "SPAN"); });
t("Text: align -> text-align", () => { const e = mount(W.Text({ text: "x", align: "center" })); eq(cs(e).textAlign, "center"); });
t("Text: styles bold wraps in STRONG", () => { const e = W.Text({ text: "x", styles: ["bold"] }); eq(e.tagName, "STRONG"); });
t("Text: text prop sets content", () => { eq(W.Text({ text: "hello" }).textContent, "hello"); });

// ---------------- Container ----------------
t("Container: default flex column", () => { const e = W.Container({}); eq(e.style.display, "flex"); eq(e.style.flexDirection, "column"); });
t("Container: bgColor applied", () => { const e = mount(W.Container({ bgColor: "#ff0000" })); eq(cs(e).backgroundColor, "rgb(255, 0, 0)"); });
t("Container: padding number -> px", () => { const e = mount(W.Container({ padding: 20 })); eq(cs(e).paddingTop, "20px"); });

// ---------------- Row ----------------
t("Row: default width 100% and row", () => { const e = W.Row({ children: [] }); eq(e.style.width, "100%"); eq(e.style.flexDirection, "row"); });
t("Row: gap number -> px", () => { const e = mount(W.Row({ gap: 8, children: [] })); eq(cs(e).gap, "8px"); });
t("Row: justifyContent space-between", () => { const e = mount(W.Row({ justifyContent: "space-between", children: [] })); eq(cs(e).justifyContent, "space-between"); });

// ---------------- Column ----------------
t("Column: default column, width 100%", () => { const e = W.Column({ children: [] }); eq(e.style.flexDirection, "column"); eq(e.style.width, "100%"); });
t("Column: alignItems applied", () => { const e = mount(W.Column({ alignItems: "center", children: [] })); eq(cs(e).alignItems, "center"); });

// ---------------- Stack ----------------
t("Stack: default position relative", () => { const e = W.Stack({ children: [] }); eq(e.style.position, "relative"); });
t("Stack: absolute child positioned", () => {
  const child = W.Text({ text: "o", position: "absolute", top: 8, left: 8 });
  const e = mount(W.Stack({ width: 100, height: 100, children: [child] }));
  eq(cs(child).position, "absolute"); eq(cs(child).top, "8px");
});

// ---------------- Icon ----------------
t("Icon: material-icons class + name text", () => { const e = W.Icon({ name: "favorite" }); if (!e.className.includes("material-icons")) throw new Error("no material-icons class"); eq(e.textContent, "favorite"); });
t("Icon: size -> px font", () => { const e = mount(W.Icon({ name: "star", size: 20 })); eq(cs(e).fontSize, "20px"); });

// ---------------- Image ----------------
t("Image: IMG tag with src/alt", () => { const e = W.Image({ src: "/a.png", alt: "A" }); eq(e.tagName, "IMG"); eq(e.getAttribute("src"), "/a.png"); eq(e.getAttribute("alt"), "A"); });
t("Image: objectFit via style fallback", () => { const e = mount(W.Image({ src: "/a.png", objectFit: "cover" })); eq(cs(e).objectFit, "cover"); });

// ---------------- Button ----------------
t("Button: BUTTON tag + label text", () => { const e = mount(W.Button({ text: "Click me" })); eq(e.tagName, "BUTTON"); if (!e.textContent.includes("Click me")) throw new Error("label missing"); });
t("Button: onPress fires on click", () => { let n = 0; const e = mount(W.Button({ text: "x", onPress: () => n++ })); e.click(); eq(n, 1); });
t("Button: disabled ignores onPress", () => { let n = 0; const e = mount(W.Button({ text: "x", disabled: true, onPress: () => n++ })); e.click(); eq(n, 0); eq(cs(e).cursor, "not-allowed"); });
t("Button: outlined variant has solid border", () => { const e = mount(W.Button({ text: "x", variant: "outlined" })); if (!cs(e).borderTopStyle.includes("solid")) throw new Error("no solid border"); });
t("Button: fullWidth -> 100%", () => { const e = mount(W.Button({ text: "x", fullWidth: true })); eq(cs(e).width, cs(e).width); if (e.style.width !== "100%") throw new Error("width not 100%"); });

// ---------------- Input ----------------
t("Input: contains native input", () => { const e = mount(W.Input({})); if (!e.querySelector("input")) throw new Error("no native input"); });
t("Input: getValue/setValue", () => { const e = mount(W.Input({})); e.setValue("abc"); eq(e.getValue(), "abc"); });
t("Input: type forwarded to native input", () => { const e = mount(W.Input({ type: "password" })); eq(e.querySelector("input").type, "password"); });
t("Input: label rendered", () => { const e = mount(W.Input({ label: "Email" })); const l = e.querySelector("label"); if (!l || !l.textContent.includes("Email")) throw new Error("no label"); });
t("Input: email validation", () => { const e = mount(W.Input({ validation: "email" })); e.setValue("bad"); eq(e.isValid(), false); e.setValue("a@b.co"); eq(e.isValid(), true); });

// ---------------- Checkbox ----------------
t("Checkbox: default unchecked, not native input", () => { const e = W.Checkbox({}); eq(e.getChecked(), false); if (e.tagName === "INPUT") throw new Error("should be custom"); });
t("Checkbox: setChecked/getChecked", () => { const e = W.Checkbox({}); e.setChecked(true); eq(e.getChecked(), true); });
t("Checkbox: onCheck fires on click", () => { let v = null; const e = mount(W.Checkbox({ onCheck: (x) => v = x })); e.click(); eq(v, true); });

// ---------------- Radio ----------------
t("Radio: group deselects others on click", () => {
  const r1 = mount(W.Radio({ name: "grp" })); const r2 = mount(W.Radio({ name: "grp" }));
  r1.click(); eq(r1.isSelected(), true);
  r2.click(); eq(r2.isSelected(), true); eq(r1.isSelected(), false);
});
t("Radio: select() does not deselect siblings", () => {
  const r1 = mount(W.Radio({ name: "grp2" })); const r2 = mount(W.Radio({ name: "grp2" }));
  r1.select(); r2.select(); eq(r1.isSelected(), true); eq(r2.isSelected(), true);
});

// ---------------- Switch ----------------
t("Switch: default off + toggle on click", () => { let v = null; const e = mount(W.Switch({ onToggle: (x) => v = x })); eq(e.getValue(), false); e.click(); eq(v, true); eq(e.getValue(), true); });
t("Switch: updateValue", () => { const e = W.Switch({}); e.updateValue(false); eq(e.getValue(), false); });
t("Switch: size large -> 60px", () => { const e = mount(W.Switch({ size: "large" })); eq(cs(e).width, "60px"); });

// ---------------- Slider ----------------
t("Slider: clamps value to max", () => { const e = W.Slider({ value: 150, max: 100 }); eq(e.getValue(), 100); });
t("Slider: setValue/getValue", () => { const e = W.Slider({ min: 0, max: 100 }); e.setValue(50); eq(e.getValue(), 50); });
t("Slider: value property setter", () => { const e = W.Slider({ min: 0, max: 100 }); e.value = 30; eq(e.getValue(), 30); });
t("Slider: onChanged fires", () => { let v = null; const e = W.Slider({ min: 0, max: 100, onChanged: (x) => v = x }); e.setValue(42); eq(v, 42); });

// ---------------- Dropdown ----------------
t("Dropdown: value getter", () => { const e = W.Dropdown({ options: [{ value: "a", label: "A" }], value: "a" }); eq(e.value, "a"); });
t("Dropdown: options getter length", () => { const e = W.Dropdown({ options: ["x", "y", "z"] }); eq(e.options.length, 3); });
t("Dropdown: open/close are functions", () => { const e = mount(W.Dropdown({ options: ["x"] })); eq(typeof e.open, "function"); eq(typeof e.close, "function"); e.open(); e.close(); });
t("Dropdown: value setter fires onChange", () => { let v = null; const e = W.Dropdown({ options: [{ value: "a", label: "A" }, { value: "b", label: "B" }], onChange: (x) => v = x }); e.value = "b"; eq(v, "b"); });

// ---------------- Rating ----------------
t("Rating: setValue/getValue", () => { const e = W.Rating({ max: 5 }); e.setValue(4); eq(e.getValue(), 4); });
t("Rating: value property", () => { const e = W.Rating({ max: 5 }); e.value = 3; eq(e.getValue(), 3); });
t("Rating: readOnly ignores setValue", () => { const e = W.Rating({ max: 5, value: 2, readOnly: true }); e.setValue(5); eq(e.getValue(), 2); });
t("Rating: onChange fires", () => { let v = null; const e = W.Rating({ max: 5, onChange: (x) => v = x }); e.setValue(4); eq(v, 4); });

window.__DOCCHECK = { pass, fail, total: pass + fail, results };
const s = document.getElementById("summary");
if (s) s.textContent = `doccheck: ${pass} passed, ${fail} failed (of ${pass + fail})`;
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
