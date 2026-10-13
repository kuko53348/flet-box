// tests/regression.test.js
// Regression guards for the bugs fixed during the widget audit.
//
// Every assertion below FAILED before its fix, so a regression re-breaks a real
// bug that the existing suites did not cover:
//   - the engine used to wipe a widget's children on any update();
//   - ListView.updateData() recursed until the stack overflowed;
//   - DataTable.updateData() threw on the second call and updateColumns() wiped rows;
//   - SnackBar.close() fired onClose once per call instead of exactly once;
//   - AnimatedBox appended a permanent <style> on every call.
//
// It publishes `window.__REGRESSION = { pass, fail, results }`.
import * as W from "../src/widgets/index.js";
import { AppBar, Tabs, Scaffold, Drawer } from "../src/navigations/index.js";
import { WidgetFactory } from "../src/widget-factory/index.js";
import { AnimatedBox } from "../src/animations/AnimatedBox.js";
import { AnimatedText } from "../src/animations/AnimatedText.js";
import { MatrixRain } from "../src/animations/MatrixRain.js";
import { runApp } from "../src/core/runApp.js";
import { useState } from "../src/tools/useState.js";

const results = [];
let pass = 0;
let fail = 0;

const t = async (name, fn) => {
  try {
    await fn();
    pass++;
    results.push({ name, ok: true });
  } catch (error) {
    fail++;
    results.push({ name, ok: false, detail: String((error && error.message) || error) });
  }
};

const ok = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const host = document.createElement("div");
host.style.cssText = "position:absolute;left:-9999px;top:0;width:600px;";
document.body.appendChild(host);

const mount = (el) => {
  host.appendChild(el);
  return el;
};

async function run() {
  // ---------------------------------------------------------------- engine
  await t("engine: update() without child PRESERVES children", () => {
    const card = W.Card({ child: W.Text({ text: "body" }) });
    mount(card);
    card.bgColor = "red";
    ok(
      card.textContent.includes("body"),
      `child wiped: innerHTML="${card.innerHTML}"`,
    );
    ok(getComputedStyle(card).backgroundColor === "rgb(255, 0, 0)", "style not applied");

    const row = W.Row({ children: [W.Text({ text: "a" }), W.Text({ text: "b" })] });
    mount(row);
    row.gap = 8;
    ok(row.children.length === 2, `children=${row.children.length}, expected 2`);

    const stack = W.Stack({ children: [W.Text({ text: "x" })] });
    mount(stack);
    stack.update({ padding: 4 });
    ok(stack.children.length === 1, `children=${stack.children.length}, expected 1`);
  });

  await t("engine: explicit empty text still clears content", () => {
    const el = WidgetFactory({ tag: "div", text: "hi" });
    mount(el);
    ok(el.textContent === "hi", `got "${el.textContent}"`);
    el.update({ text: "" });
    ok(el.textContent === "", `explicit "" must clear, got "${el.textContent}"`);
  });

  // -------------------------------------------------------------- ListView
  await t("ListView: updateData() does not recurse and re-renders new rows", async () => {
    const lv = W.ListView({
      data: ["A", "B"],
      itemSize: 40,
      height: 200,
      renderItem: (item) => W.Text({ text: String(item) }),
    });
    mount(lv);
    await wait(60);
    lv.updateData(["X", "Y"]); // used to throw RangeError: Maximum call stack size exceeded
    await wait(60);
    const text = lv.textContent;
    ok(text.includes("X") && text.includes("Y"), `stale rows, textContent="${text}"`);
    ok(!text.includes("A"), `old rows still rendered: "${text}"`);
  });

  // ------------------------------------------------------------- DataTable
  await t("DataTable: repeated updateData() works and updateColumns() keeps rows", () => {
    const dt = W.DataTable({
      columns: [{ key: "a", label: "A" }],
      rows: [{ a: "1" }, { a: "2" }],
    });
    mount(dt);
    dt.updateData([{ a: "x" }, { a: "y" }]);
    dt.updateData([{ a: "z" }]); // used to throw NotFoundError on the stale tbody
    ok(dt.querySelectorAll("tbody tr").length === 1, "second updateData failed");
    dt.updateColumns([{ key: "a", label: "A2" }]); // used to wipe every row
    ok(
      dt.querySelectorAll("tbody tr").length === 1,
      `updateColumns wiped the rows (${dt.querySelectorAll("tbody tr").length} left)`,
    );
  });

  // --------------------------------------------------------------- SnackBar
  await t("SnackBar: close() is idempotent — onClose fires exactly once", async () => {
    let calls = 0;
    const sb = W.SnackBar({ message: "x", onClose: () => { calls++; } });
    sb.close();
    sb.close();
    sb.close();
    await wait(450); // animationDuration default is 300
    ok(calls === 1, `onClose fired ${calls} times, expected 1`);
  });

  await t("SnackBar: closing immediately never flashes the toast back on", async () => {
    const sb = W.SnackBar({ message: "y" });
    const el = sb.getElement();
    sb.close();
    await wait(40); // the pending show() frame used to set opacity back to "1"
    ok(el.style.opacity === "0", `opacity="${el.style.opacity}", expected "0"`);
    await wait(400);
  });

  // ------------------------------------------------------------- AnimatedBox
  await t("AnimatedBox: identical keyframes are injected only once", () => {
    const count = () => document.head.querySelectorAll("style").length;
    const before = count();
    const box = (to) =>
      AnimatedBox({
        animations: [{ effect: "opacity", from: 0, to }],
        child: W.Text({ text: "x" }),
      });
    box(0.42);
    box(0.42);
    box(0.42);
    const afterThree = count() - before;
    ok(afterThree === 1, `${afterThree} <style> tags for 3 identical animations, expected 1`);
    box(0.77); // different keyframes must add exactly one more
    ok(count() - before === 2, "distinct keyframes must still be injected");
  });

  await t("AnimatedBox: a malformed descriptor is skipped, not thrown", () => {
    // Missing `to` used to throw a TypeError straight out of the caller's render.
    AnimatedBox({
      animations: [{ effect: "backgroundColor", from: "#000" }],
      child: W.Text({ text: "x" }),
    });
  });

  // ---------------------------------------------------------------- Markdown
  await t("Markdown: a `>` inside a quoted attribute cannot smuggle an on* handler", async () => {
    // `<[^<>]+>` stops at the first `>`, so this payload used to sail through the
    // regex sanitizer while the browser still kept the event handler.
    const payload = `<img src="x>y" onerror="window.__pwned=1">`;
    const md = W.Markdown({ text: payload });
    mount(md);
    await wait(30);
    ok(
      md.querySelector("[onerror]") === null,
      `onerror survived sanitization: ${md.innerHTML.slice(0, 160)}`,
    );

    const link = W.Markdown({ text: "[x](javascript:window.__pwned=1)" });
    mount(link);
    await wait(30);
    const a = link.querySelector("a[href]");
    ok(a !== null, 'the anchor lost its href (documented behaviour is href="#")');
    ok(!a.getAttribute("href").includes("javascript:"), "javascript: URL survived");
  });

  // ------------------------------------------------------------------- Input
  await t("Input: the reactive `label` prop updates the label instead of wiping the widget", async () => {
    // `label` maps to `textContent` in the prop database; letting the factory see
    // it replaced the whole composite widget with a text node.
    const input = W.Input({ label: "Name", value: "x" });
    mount(input);
    await wait(20);
    input.label = "Nuevo label";
    await wait(20);
    ok(input.querySelector("input") !== null, "the native <input> was destroyed");
    ok(input.textContent.includes("Nuevo label"), "the label did not update");

    const viaUpdate = W.Input({ label: "A", value: "y" });
    mount(viaUpdate);
    await wait(20);
    viaUpdate.update({ label: "B" });
    await wait(20);
    ok(viaUpdate.querySelector("input") !== null, "update({label}) destroyed the native <input>");
    ok(viaUpdate.textContent.includes("B"), "update({label}) did not update the label");
  });

  // ------------------------------------------------- Checkbox / Switch / Radio
  await t("form controls: the click handler survives update() and reactive setters", async () => {
    // `assignProps` clears `onclick` on every update and only re-applies handlers
    // it can see in the merged props. These widgets assigned `onclick` directly,
    // so the first update (or any reactive setter) left them unable to toggle.
    const box = W.Checkbox({});
    mount(box);
    await wait(20);
    box.click();
    ok(box.getChecked() === true, "Checkbox did not toggle");
    box.update({ opacity: 0.5 });
    await wait(20);
    box.click();
    ok(box.getChecked() === false, "Checkbox stopped toggling after update()");
    box.opacity = 0.9;
    await wait(20);
    box.click();
    ok(box.getChecked() === true, "Checkbox stopped toggling after a reactive setter");

    const sw = W.Switch({});
    mount(sw);
    await wait(20);
    sw.update({ opacity: 0.5 });
    await wait(20);
    sw.click();
    ok(sw.getValue() === true, "Switch did not respond after update()");
    sw.opacity = 0.9;
    await wait(20);
    sw.click();
    ok(sw.getValue() === false, "Switch stopped responding after a reactive setter");

    const calls = [];
    const radio = W.Radio({ name: "regression-group", value: "a", onPress: (v) => calls.push(v) });
    mount(radio);
    await wait(20);
    radio.update({ opacity: 0.5 });
    await wait(20);
    radio.click();
    ok(radio.isSelected() === true, "Radio did not select after update()");
    ok(calls.length === 1, `onPress fired ${calls.length} times, expected 1`);
  });

  // ------------------------------------------------------------------- Chart
  await t("Chart: all-negative data is still drawn inside the canvas", async () => {
    // `Math.max(0, minVal - padding)` inverted the range (min > max) for negative
    // series, so every point landed far outside the canvas and nothing rendered.
    const el = W.Chart({ type: "bar", data: [-30, -10], height: 300, width: 400 });
    mount(el);
    await wait(150);
    const canvas = el.querySelector("canvas");
    ok(canvas !== null, "no canvas produced");
    const d = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let dark = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128 && d[i] < 200) dark++;
    ok(dark > 1000, `only ${dark} dark pixels — negative data was not drawn`);
  });

  // --------------------------------------------------------------- Accordion
  await t("Accordion: the expand/collapse icon glyph actually changes", async () => {
    const acc = W.Accordion({ title: "T", child: W.Text({ text: "body" }) });
    mount(acc);
    await wait(30);
    const icon = acc.querySelector(".material-icons");
    ok(icon !== null, "no icon element");
    const before = icon.textContent;
    acc.setExpanded(true);
    await wait(400);
    ok(
      icon.textContent !== before,
      `the glyph never changed ("${before}" → "${icon.textContent}")`,
    );
  });

  // ----------------------------------------------------------------- TreeView
  await t("TreeView: updateNodes keeps the selection unless null is passed", () => {
    const tv = W.TreeView({ data: [{ id: "a", label: "A" }, { id: "b", label: "B" }] });
    mount(tv);
    tv.setSelected("a");
    tv.updateNodes([{ id: "a", label: "A2" }, { id: "b", label: "B2" }]);
    ok(tv.getSelected() === "a", `selection cleared: ${tv.getSelected()}`);
    tv.updateNodes([{ id: "a", label: "A3" }], null);
    ok(tv.getSelected() === null, "an explicit null must still clear the selection");
  });

  // ------------------------------------------------------------------- Image
  await t("Image: `fit` and `circular` reach real CSS", async () => {
    // Neither key exists in the prop database, so they used to fall through to an
    // inert `style.fit` / `style.circular` and images stayed stretched and square.
    const fit = W.Image({ src: "", width: 40, height: 40, fit: "cover" });
    mount(fit);
    const circ = W.Image({ src: "", width: 40, height: 40, circular: true });
    mount(circ);
    const explicit = W.Image({ src: "", width: 40, height: 40, circular: true, borderRadius: "8px" });
    mount(explicit);
    await wait(20);
    ok(getComputedStyle(fit).objectFit === "cover", `object-fit=${getComputedStyle(fit).objectFit}`);
    ok(getComputedStyle(circ).borderRadius === "50%", `border-radius=${getComputedStyle(circ).borderRadius}`);
    ok(
      getComputedStyle(explicit).borderRadius === "8px",
      "an explicit borderRadius must win over circular",
    );
    ok(W.Image() !== null, "Image() with no props must not throw");
  });

  // ------------------------------------------- reactive text props on composites
  await t("Markdown: the reactive `text` prop re-renders instead of wiping the widget", async () => {
    const md = W.Markdown({ text: "# Hola" });
    mount(md);
    await wait(30);
    ok(md.getContent().includes("<h1"), "initial render failed");
    md.text = "# Adios";
    await wait(30);
    ok(md.getContent().includes("<h1>Adios</h1>"), `not re-rendered: ${md.getContent().slice(0, 60)}`);
    md.update({ text: "# Tercero" });
    await wait(30);
    ok(md.getContent().includes("Tercero"), "update({text}) did not re-render");
  });

  await t("CodeViewer: the reactive `title` prop updates the header, not the DOM", async () => {
    const cv = W.CodeViewer({ code: "const a = 1;", title: "auth.js" });
    mount(cv);
    await wait(30);
    const before = cv.innerHTML.length;
    cv.title = "otro.js";
    await wait(30);
    ok(cv.textContent.includes("otro.js"), "the title did not update");
    ok(cv.textContent.includes("const a = 1;"), "the code was destroyed");
    ok(cv.innerHTML.length >= before * 0.9, `innerHTML collapsed ${before} → ${cv.innerHTML.length}`);
    cv.update({ title: "tercero.js" });
    await wait(30);
    ok(cv.textContent.includes("tercero.js"), "update({title}) did not update the header");
    ok(cv.textContent.includes("const a = 1;"), "update({title}) destroyed the code");
  });

  // -------------------------------------------------------------- navigation
  await t("navigation: window listeners are released on a plain DOM disconnect", async () => {
    // The lifecycle observer fires `onUnmount` but never calls `_cleanup`, so
    // anything released only from `_cleanup` leaked when a widget was removed
    // without a full app rebuild. Track listeners by handler identity.
    const sets = new Map();
    const origAdd = window.addEventListener.bind(window);
    const origRemove = window.removeEventListener.bind(window);
    window.addEventListener = (type, fn, opts) => {
      const k = `${type}|${opts === true ? "c" : "b"}`;
      if (!sets.has(k)) sets.set(k, new Set());
      sets.get(k).add(fn);
      return origAdd(type, fn, opts);
    };
    window.removeEventListener = (type, fn, opts) => {
      const k = `${type}|${opts === true ? "c" : "b"}`;
      if (sets.has(k)) sets.get(k).delete(fn);
      return origRemove(type, fn, opts);
    };
    const count = (type) =>
      [...sets].filter(([k]) => k.startsWith(type + "|")).reduce((n, [, s]) => n + s.size, 0);
    try {
      host.replaceChildren();
      await wait(50);
      const before = count("scroll") + count("resize");
      const made = [
        AppBar({ title: "t", hideOnScroll: true }),
        AppBar({ title: "t", hideOnScroll: true }),
        Tabs({ tabs: ["a", "b"], children: [W.Text({ text: "x" }), W.Text({ text: "y" })] }),
      ];
      made.forEach((el) => host.appendChild(el));
      await wait(30);
      ok(count("scroll") + count("resize") > before, "no listeners were registered at all");
      made.forEach((el) => el.remove());
      await wait(80);
      const leaked = count("scroll") + count("resize") - before;
      ok(leaked <= 0, `${leaked} window listener(s) survived the disconnect`);
    } finally {
      window.addEventListener = origAdd;
      window.removeEventListener = origRemove;
    }
  });

  // --------------------------------------------------- introspection surfaces
  await t("AnimatedText: letters inherit the source Text styles", async () => {
    // It read `child._props`, which nothing ever assigns, so every letter fell
    // back to Text's defaults and the documented inheritance never happened.
    const at = AnimatedText({
      child: W.Text({ text: "Hi", size: 48, color: "#ff0000" }),
      animations: [{ effect: "opacity", from: 0, to: 1 }],
    });
    mount(at);
    await wait(60);
    const letter = at.querySelector("span, div");
    ok(letter !== null, "no letter element produced");
    ok(getComputedStyle(letter).fontSize === "48px", `font-size=${getComputedStyle(letter).fontSize}`);
    ok(getComputedStyle(letter).color === "rgb(255, 0, 0)", `color=${getComputedStyle(letter).color}`);
  });

  await t("Inspector: prints the widget's props", () => {
    // `getWidgetProps` read the never-assigned `_props`, so this always printed
    // `Span()` with no props at all.
    const out = String(W.Inspector(W.Text({ text: "Hello" })));
    ok(out.includes("text"), `no props in output: ${out.slice(0, 80)}`);
    ok(out.includes("Hello"), "the prop value is missing");
  });

  await t("Dropdown: the portal scroll listener is released on close", async () => {
    // It was removed without the capture flag it was added with, so the listener
    // survived and every open/close cycle leaked one.
    const sets = new Map();
    const origAdd = window.addEventListener.bind(window);
    const origRemove = window.removeEventListener.bind(window);
    window.addEventListener = (type, fn, opts) => {
      const k = `${type}|${opts === true ? "c" : "b"}`;
      if (!sets.has(k)) sets.set(k, new Set());
      sets.get(k).add(fn);
      return origAdd(type, fn, opts);
    };
    window.removeEventListener = (type, fn, opts) => {
      const k = `${type}|${opts === true ? "c" : "b"}`;
      if (sets.has(k)) sets.get(k).delete(fn);
      return origRemove(type, fn, opts);
    };
    const countScroll = () =>
      [...sets].filter(([k]) => k.startsWith("scroll|")).reduce((n, [, s]) => n + s.size, 0);
    try {
      const dd = W.Dropdown({ portal: true, options: [{ label: "A", value: "a" }, { label: "B", value: "b" }] });
      mount(dd);
      await wait(20);
      const base = countScroll();
      for (let i = 0; i < 3; i++) {
        dd.open();
        await wait(20);
        dd.close();
        await wait(20);
      }
      ok(countScroll() === base, `scroll listeners grew from ${base} to ${countScroll()}`);
    } finally {
      window.addEventListener = origAdd;
      window.removeEventListener = origRemove;
    }
  });

  // ------------------------------------------------------------ Scaffold/Drawer
  await t("Scaffold/Drawer: teardown destroys the drawer (node + listeners)", async () => {
    // Scaffold only did `removeChild` on the drawer wrapper, never `destroy()`,
    // so the viewport-resize listener, the Escape handler and the close timer
    // survived — and `document.body` grew on every rebuilt scaffold.
    const { dimensions } = await import("../src/tools/dimensions.js");
    let active = 0;
    const origAdd = dimensions.addListener;
    dimensions.addListener = (cb) => {
      active++;
      const off = origAdd(cb);
      return () => {
        active--;
        off();
      };
    };
    try {
      host.replaceChildren();
      await wait(50);
      const baseBody = document.body.children.length;
      const made = [];
      for (let i = 0; i < 3; i++) {
        const sc = Scaffold({
          drawer: Drawer({ child: W.Text({ text: "menu" }) }),
          body: W.Text({ text: "main" }),
        });
        host.appendChild(sc);
        made.push(sc);
        await wait(25);
      }
      ok(active > 0, "the drawer never registered a viewport listener");
      made.forEach((sc) => {
        if (typeof sc._cleanup === "function") sc._cleanup();
        sc.remove();
      });
      await wait(80);
      ok(active === 0, `${active} viewport listener(s) leaked`);
      ok(document.body.children.length <= baseBody, "drawer nodes stayed in document.body");
    } finally {
      dimensions.addListener = origAdd;
    }
  });

  // ------------------------------------------------------- Modal / BottomSheet
  await t("Modal: reopening during the close animation leaves it visible", async () => {
    // The hide-after-close timer was neither stored nor cancelled, so a reopen
    // within the animation window got hidden by the stale timer while still open.
    const m = W.Modal({ title: "T", content: W.Text({ text: "x" }) });
    await wait(20);
    const overlay = document.body.lastElementChild;
    m.open();
    await wait(20);
    ok(overlay.style.visibility === "visible", "open() did not show the overlay");
    m.close();
    await wait(100);
    m.open();
    await wait(350); // past the stale 300 ms timer
    ok(overlay.style.visibility === "visible", "the stale timer hid an OPEN modal");
    ok(m.isOpen === true, "isOpen flipped");
    m.destroy?.();
  });

  await t("BottomSheet: reopening during the close animation leaves it visible", async () => {
    const bs = W.BottomSheet({ child: W.Text({ text: "sheet" }) });
    await wait(20);
    const overlay = document.body.lastElementChild;
    bs.open();
    await wait(20);
    ok(overlay.style.visibility === "visible", "open() did not show the overlay");
    bs.close();
    await wait(80);
    bs.open();
    await wait(400); // past the stale timer
    ok(overlay.style.visibility === "visible", "the stale timer hid an OPEN sheet");
  });

  // ---------------------------------------------------------------- animate.js
  await t("animate.js: negative duration terminates and `from: undefined` never writes NaN", async () => {
    const { animate, animateAsync } = await import("../src/animations/animate.js");
    let frames = 0;
    const timers = new Map();
    const origRaf = window.requestAnimationFrame.bind(window);
    const origCaf = window.cancelAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => {
      frames++;
      const id = setTimeout(() => { timers.delete(id); cb(performance.now()); }, 1);
      timers.set(id, true);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      if (timers.has(id)) { clearTimeout(id); timers.delete(id); } else { origCaf(id); }
    };
    try {
      // A negative duration used to make progress < 1 forever (infinite frames).
      const el = document.createElement("div");
      document.body.appendChild(el);
      frames = 0;
      animate(el, "opacity", 1, 0, -300);
      await wait(120);
      ok(frames < 40, `negative duration kept looping (${frames} frames)`);

      // `from: undefined` is the documented API; it used to write "NaN" forever.
      const el2 = document.createElement("div");
      document.body.appendChild(el2);
      animate(el2, "opacity", undefined, 1, 80);
      await wait(60);
      ok(el2.style.opacity !== "NaN", `wrote "NaN" (opacity=${el2.style.opacity})`);

      // animateAsync used to never resolve with a negative duration.
      let resolved = false;
      const el3 = document.createElement("div");
      document.body.appendChild(el3);
      animateAsync(el3, "opacity", 0, 1, -100).then(() => { resolved = true; });
      await wait(120);
      ok(resolved, "animateAsync never resolved with a negative duration");
    } finally {
      window.requestAnimationFrame = origRaf;
      window.cancelAnimationFrame = origCaf;
    }
  });

  // ------------------------------------------------------------------- Audio
  await t("Audio: the 2 s duration fallback does not fire after unmount", async () => {
    // The timer was never stored, so after teardown it still fetched the whole
    // file, spun up an AudioContext and called onLoad on a discarded widget —
    // once per tree rebuild (i.e. per state change).
    const MINE = "/regression-audio-probe.mp3";
    let fetchMine = 0;
    let ctxMine = 0;
    const origFetch = window.fetch;
    const OrigAC = window.AudioContext;
    window.fetch = (...args) => {
      if (String(args[0]).includes(MINE)) fetchMine++;
      return origFetch(...args);
    };
    window.AudioContext = function (...args) { ctxMine++; return new OrigAC(...args); };
    try {
      // Let the smoke harness's own Audio widget (src: "") finish its fallback
      // first, so the baseline is stable and the delta is attributable to us.
      await wait(2400);
      const baseFetch = fetchMine;
      const baseCtx = ctxMine;
      const a = W.Audio({ src: MINE });
      mount(a);
      await wait(50);
      a.remove();
      if (typeof a._cleanup === "function") a._cleanup();
      await wait(2400); // past the 2 s fallback window
      ok(fetchMine === baseFetch, `the fallback fetched after unmount (${fetchMine - baseFetch} call(s))`);
      ok(ctxMine === baseCtx, `an AudioContext was created after unmount (${ctxMine - baseCtx})`);
    } finally {
      window.fetch = origFetch;
      window.AudioContext = OrigAC;
    }
  });

  // --------------------------------------------------------------- ParallaxBox
  await t("ParallaxBox: the window scroll listener is released on DOM disconnect", async () => {
    // It was released only from the `_cleanup` monkey-patch, which the lifecycle
    // observer never calls — so a plain removal kept a window scroll listener
    // (and the whole closure) alive forever.
    const { ParallaxBox } = await import("../src/animations/ParallaxBox.js");
    const sets = new Map();
    const origAdd = window.addEventListener.bind(window);
    const origRemove = window.removeEventListener.bind(window);
    window.addEventListener = (type, fn, opts) => {
      const k = `${type}|${opts === true ? "c" : "b"}`;
      if (!sets.has(k)) sets.set(k, new Set());
      sets.get(k).add(fn);
      return origAdd(type, fn, opts);
    };
    window.removeEventListener = (type, fn, opts) => {
      const k = `${type}|${opts === true ? "c" : "b"}`;
      if (sets.has(k)) sets.get(k).delete(fn);
      return origRemove(type, fn, opts);
    };
    const countScroll = () =>
      [...sets].filter(([k]) => k.startsWith("scroll|")).reduce((n, [, s]) => n + s.size, 0);
    try {
      host.replaceChildren();
      await wait(50);
      const before = countScroll();
      const made = [];
      for (let i = 0; i < 3; i++) {
        const p = ParallaxBox({ type: "scroll", child: W.Text({ text: "x" }) });
        host.appendChild(p);
        made.push(p);
        await wait(20);
      }
      ok(countScroll() > before, "no scroll listener was registered");
      made.forEach((p) => p.remove());
      await wait(80);
      ok(countScroll() <= before, "the window scroll listener leaked");
    } finally {
      window.addEventListener = origAdd;
      window.removeEventListener = origRemove;
    }
  });

  // ------------------------------------------------- surgical useState binding
  await t("useState: a directly-bound prop updates ONLY that widget (0 rebuilds)", async () => {
    // `const [color, setColor] = useState(key, v); Widget({ bgColor: color })` is
    // meant to be surgical: the factory auto-binds the prop to its key, so a change
    // patches that one widget instead of re-rendering the whole app.
    let renders = 0;
    let setValue = null;
    const root = document.createElement("div");
    root.id = "surgical-root";
    document.body.appendChild(root);
    const App = () => {
      renders++;
      const [color, setColor] = useState("surgicalColor", "red");
      setValue = setColor;
      return W.Container({ id: "surgical-box", bgColor: color });
    };
    runApp(App, "surgical-root");
    await wait(80);

    const box = root.querySelector("#surgical-box");
    ok(box !== null, "the bound widget was not built");
    const before = { renders, bg: getComputedStyle(box).backgroundColor };
    ok(before.bg === "rgb(255, 0, 0)", `initial bg=${before.bg}`);

    setValue("blue");
    await wait(100);

    const after = root.querySelector("#surgical-box");
    ok(getComputedStyle(after).backgroundColor === "rgb(0, 0, 255)", "the prop was not updated");
    ok(after === box, "the DOM node was replaced — the update was not surgical");
    ok(renders === before.renders, `the app re-rendered ${renders - before.renders} time(s)`);
  });

  await t("useState: a DERIVED value still re-renders the app (declarative path intact)", async () => {
    // The other half of the contract: when the state is only read inside the
    // component function (a template literal, a conditional, a list) there is no
    // prop to bind, so the app must re-run. Breaking this would break the model.
    let renders = 0;
    let setValue = null;
    const root = document.createElement("div");
    root.id = "derived-root";
    document.body.appendChild(root);
    const App = () => {
      renders++;
      const [n, setN] = useState("derivedN", 0);
      setValue = setN;
      return W.Column({
        children: [
          W.Text({ text: "N=" + n }),
          n.valueOf() > 2 ? W.Text({ text: "MUCHO" }) : null,
        ],
      });
    };
    runApp(App, "derived-root");
    await wait(80);
    const initialRenders = renders;
    ok(root.textContent.includes("N=0"), `initial content: ${root.textContent}`);

    setValue(5);
    await wait(100);

    ok(renders > initialRenders, "the app did NOT re-render for a derived value");
    ok(root.textContent.includes("N=5"), `stale text: ${root.textContent}`);
    ok(root.textContent.includes("MUCHO"), "the conditional branch did not appear");
  });

  await t("useState: a key used BOTH directly and structurally updates both", async () => {
    // The mixed case: the same key feeds a prop (surgical) *and* a conditional
    // (needs the app render). Skipping the render when a widget is bound broke it:
    // the prop was patched but the conditional never re-evaluated.
    let renders = 0;
    let setValue = null;
    const root = document.createElement("div");
    root.id = "mixed-root";
    document.body.appendChild(root);
    const App = () => {
      renders++;
      const [n, setN] = useState("mixedN", 0);
      setValue = setN;
      const branch = n.valueOf() > 2 ? W.Text({ text: "MUCHO" }) : null;
      return W.Column({
        children: [W.Text({ id: "mixed-direct", text: n }), branch],
      });
    };
    runApp(App, "mixed-root");
    await wait(80);
    const initialRenders = renders;

    setValue(3);
    await wait(150);

    const direct = root.querySelector("#mixed-direct");
    ok(direct !== null, "the direct-bound widget vanished");
    ok(direct.textContent === "3", `direct prop stale: "${direct.textContent}"`);
    ok(root.textContent.includes("MUCHO"), "the conditional did not re-evaluate");
    ok(renders > initialRenders, "the app did not re-render for a structural read");
  });

  await t("useState: reading the value inside a handler keeps the binding surgical", async () => {
    // A read that happens outside the component render (an event handler) must NOT
    // flag the key as structural — otherwise any handler that inspects the current
    // value would silently cost a full app re-render on every change.
    let renders = 0;
    let setValue = null;
    let readNow = null;
    const root = document.createElement("div");
    root.id = "handler-root";
    document.body.appendChild(root);
    const App = () => {
      renders++;
      const [c, setC] = useState("handlerColor", "red");
      setValue = setC;
      readNow = () => c.valueOf();
      return W.Container({ id: "handler-box", bgColor: c, onPress: () => c.valueOf() });
    };
    runApp(App, "handler-root");
    await wait(80);

    readNow(); // simulate the handler firing
    const before = renders;
    setValue("green");
    await wait(150);

    const box = root.querySelector("#handler-box");
    ok(getComputedStyle(box).backgroundColor === "rgb(0, 128, 0)", "the prop did not update");
    ok(renders === before, `a handler read forced ${renders - before} app render(s)`);
  });

  await t("warnings: an unknown prop is reported once, not on every update", async () => {
    // `warnUnknownProp` captured a stack trace and emitted ~8 styled console calls,
    // with no "already warned" check. Because update() re-applies every original
    // prop, one unknown prop cost ~137 µs on EVERY update — ~400x a known prop —
    // for the widget's whole lifetime. Measured: a 31-prop widget went from
    // 1212 µs/update to 12 µs/update.
    const originalGroup = console.group;
    let groups = 0;
    console.group = () => {
      groups++;
    };
    try {
      const w = WidgetFactory({ tag: "div", bgColor: "#fff", columnGap: 2 });
      const afterConstruction = groups;
      ok(afterConstruction <= 1, `warned ${afterConstruction} time(s) while building`);
      for (let i = 0; i < 50; i++) w.update({ bgColor: i % 2 ? "#eee" : "#fff" });
      ok(
        groups === afterConstruction,
        `warned ${groups - afterConstruction} more time(s) across 50 updates`,
      );
      // The prop must still be applied, just without re-warning.
      ok(w.style.columnGap !== undefined, "the unknown prop was not applied as a style");
    } finally {
      console.group = originalGroup;
    }
  });

  await t("useState: unmounting releases the binding (no updates to detached nodes)", async () => {
    // The binding used to be released by monkey-patching `_cleanup`, which the
    // lifecycle observer never calls — so a detached widget stayed registered and
    // kept receiving updates forever. It is now released through `onUnmount`.
    const node = W.Container({ id: "bind-box" });
    const [color, setColor] = useState("bindKey", "red");
    node.update({ bgColor: color }); // introduces the binding via update()
    host.replaceChildren();
    host.appendChild(node);
    await wait(20);
    ok(node.style.backgroundColor === "red", `not bound: "${node.style.backgroundColor}"`);

    node.remove();
    await wait(80); // let the lifecycle observer release the binding
    setColor("blue");
    await wait(60);

    ok(
      node.style.backgroundColor !== "blue",
      "the detached node was still being updated (binding leaked)",
    );
  });

  // -------------------------------------------------------------- MatrixRain
  await t("MatrixRain: stops its rAF loop when detached from the DOM", async () => {
    // A coherent stub: rAF -> setTimeout and cancelAnimationFrame -> clearTimeout,
    // otherwise headless Chrome's frame throttling makes the count meaningless.
    const origRaf = window.requestAnimationFrame.bind(window);
    const origCaf = window.cancelAnimationFrame.bind(window);
    const timers = new Map();
    let frames = 0;
    window.requestAnimationFrame = (cb) => {
      frames++;
      const id = setTimeout(() => { timers.delete(id); cb(); }, 1);
      timers.set(id, true);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      if (timers.has(id)) { clearTimeout(id); timers.delete(id); } else { origCaf(id); }
    };
    try {
      // Let frames pending from the previous assertions settle, then measure the
      // background rAF rate: `frames` counts global calls, so an uncompensated
      // count would blame other widgets.
      host.replaceChildren();
      await wait(80);
      const noiseStart = frames;
      await wait(150);
      const noise = frames - noiseStart;

      const canvas = MatrixRain({ fontSize: 14 });
      document.body.appendChild(canvas);
      await wait(60);
      const whileMounted = frames;
      canvas.remove();
      const atRemoval = frames;
      await wait(150);
      const leaked = frames - atRemoval;

      ok(noise < 60, `background rAF noise too high to measure reliably (${noise})`);
      ok(whileMounted > noise, "the animation never started");
      ok(leaked <= noise + 5, `${leaked} frames ran after detach (background ${noise}) — the loop never stops`);
    } finally {
      window.requestAnimationFrame = origRaf;
      window.cancelAnimationFrame = origCaf;
    }
  });

  // ------------------------------------------------------------------ report
  window.__REGRESSION = { pass, fail, total: pass + fail, results };

  const summary = document.getElementById("summary");
  if (summary) {
    summary.textContent = `REGRESSION: ${pass}/${pass + fail} OK${fail ? ` — ${fail} FAILED` : ""}`;
    summary.style.color = fail ? "#ff6b6b" : "#4ec9b0";
  }
  const out = document.getElementById("out");
  if (out) {
    for (const r of results) {
      const li = document.createElement("li");
      li.style.color = r.ok ? "#4ec9b0" : "#ff6b6b";
      li.textContent = `${r.ok ? "PASS" : "FAIL"} ${r.name}${r.detail ? " — " + r.detail : ""}`;
      out.appendChild(li);
    }
  }
  console.log("[flet-box regression]", window.__REGRESSION);
}

run();
