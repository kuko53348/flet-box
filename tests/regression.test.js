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
import { AppBar, Tabs, Scaffold, Drawer, BottomNavigation } from "../src/navigations/index.js";
import { goTo, getCurrentPath, initRouter, clearRouter } from "../src/navigations/Router.js";
import { WidgetFactory } from "../src/widget-factory/index.js";
import { AnimatedBox } from "../src/animations/AnimatedBox.js";
import { AnimatedText } from "../src/animations/AnimatedText.js";
import { MatrixRain } from "../src/animations/MatrixRain.js";
import { animate, pulse, stopAnimation } from "../src/animations/animate.js";
import { runApp } from "../src/core/runApp.js";
import { useState, saveState, getState } from "../src/tools/useState.js";

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

  // ------------------------------------------------------------- AppBar title
  await t("AppBar: centerTitle:false keeps an auto-width title flush left", () => {
    // Two bugs stacked here. The title zone is a Container, so it inherited
    // `flex-direction: column`: `align-items: center` centred the title
    // HORIZONTALLY while `justify-content` — the prop that carries
    // `centerTitle` — went vertical, so an auto-width widget title was always
    // centred (a string title hid it because its Text spans the full width).
    // The empty leading zone then added its 48px balance width on top, pushing
    // even a correctly left-aligned title off the bar's own padding.
    const title = () => W.Container({ width: "auto", child: W.Text({ text: "Nuevo Milenio" }) });
    const leftOf = (bar) =>
      Math.round(
        bar.children[1].firstElementChild.getBoundingClientRect().left -
          bar.getBoundingClientRect().left,
      );
    const flush = mount(AppBar({ title: title(), centerTitle: false, paddingLeft: 20, actions: [W.Text({ text: "cta" })] }));
    const centered = mount(AppBar({ title: title(), centerTitle: true, paddingLeft: 20, actions: [W.Text({ text: "cta" })] }));
    ok(
      Math.abs(leftOf(flush) - 20) <= 1,
      `centerTitle:false put the title ${leftOf(flush)}px from the edge, expected 20 (its paddingLeft)`,
    );
    ok(
      leftOf(centered) > leftOf(flush) + 20,
      `centerTitle:true did not move the title (${leftOf(centered)} vs ${leftOf(flush)})`,
    );
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

  await t("Drawer: body rows keep content height instead of being squeezed", async () => {
    // The scrollable body is a `flex: 1` column inside a fixed-height panel and
    // every widget defaults to `flex-shrink: 1`, so as soon as the rows did not
    // fit, each one was crushed toward its own padding instead of the body
    // overflowing and scrolling.
    const rows = Array.from({ length: 30 }, (_, i) =>
      W.Container({ height: 48, child: W.Text({ text: `item ${i}` }) }),
    );
    const d = Drawer({ body: rows });
    d.open();
    await wait(30);
    try {
      ok(
        rows.every((r) => getComputedStyle(r).flexShrink === "0"),
        `a body child still shrinks (${getComputedStyle(rows[0]).flexShrink})`,
      );
      const shortest = Math.min(...rows.map((r) => r.offsetHeight));
      ok(shortest >= 40, `rows collapsed to ${shortest}px, expected their 48px content height`);
      const bodyColumn = d.element.lastElementChild.firstElementChild.firstElementChild;
      ok(
        bodyColumn.scrollHeight > bodyColumn.clientHeight,
        "the body never overflowed, so the squeeze was not exercised",
      );
    } finally {
      d.destroy();
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

  // -------------------------------------------------- animate: cancelable loops
  await t("animate: cancel() freezes the property and stopAnimation ends the loop", async () => {
    const box = document.createElement("div");
    host.appendChild(box);
    const cancel = animate(box, "opacity", 0, 1, 600);
    await wait(80);
    const mid = box.style.opacity;
    ok(mid !== "" && Number(mid) > 0 && Number(mid) < 1, `not animating (style.opacity="${mid}")`);
    ok(cancel() === true, "cancel() did not report a live loop");
    await wait(100);
    ok(box.style.opacity === mid, `the loop kept writing after cancel (${mid} → ${box.style.opacity})`);
    ok(cancel() === false, "cancel() is not idempotent");

    const other = document.createElement("div");
    host.appendChild(other);
    animate(other, "opacity", 0, 1, 600);
    await wait(40);
    ok(stopAnimation(other) === true, "stopAnimation found nothing to stop");
    const frozen = other.style.opacity;
    await wait(100);
    ok(other.style.opacity === frozen, `stopAnimation left the loop running (${frozen} → ${other.style.opacity})`);
    box.remove();
    other.remove();
  });

  await t("animate: a second animation on a property replaces the first", async () => {
    // Two loops writing one style fight: the older one resumed after the newer had
    // finished and drove the property back to ITS target.
    const box = document.createElement("div");
    host.appendChild(box);
    animate(box, "opacity", 0, 1, 300);
    await wait(40);
    animate(box, "opacity", 1, 0, 60);
    await wait(240);
    ok(
      Number(box.style.opacity) === 0,
      `the replaced animation resumed: opacity=${box.style.opacity}`,
    );
    box.remove();
  });

  await t("pulse: cancel() stops phase two (no leftover setTimeout)", async () => {
    const box = document.createElement("div");
    host.appendChild(box);
    const cancel = pulse(box, 400);
    await wait(90);
    const scaled = box.style.transform;
    const value = Number((scaled.match(/scale\(([\d.]+)/) || [])[1]);
    ok(value > 1, `pulse never scaled up (transform="${scaled}")`);
    cancel();
    await wait(260); // the phase-two timer used to fire inside this window
    ok(
      box.style.transform === scaled,
      `pulse kept animating after cancel (${scaled} → ${box.style.transform})`,
    );
    box.remove();
  });

  // --------------------------------------------- ListView: frames and geometry
  await t("ListView: unmount cancels the scroll frame (no onEndReached after detach)", async () => {
    let ended = 0;
    const list = W.ListView({
      data: Array.from({ length: 60 }, (_, i) => i),
      itemSize: 20,
      height: 100,
      expand: false,
      renderItem: (i) => W.Text({ text: `row ${i}` }),
      onEndReached: () => {
        ended++;
      },
    });
    host.appendChild(list);
    await wait(80);

    const scroller = list.firstElementChild;
    ok(scroller !== null, "the scroll container was not built");

    // Queue the throttled frame while still attached, then unmount before it runs.
    scroller.dispatchEvent(new Event("scroll"));
    list.remove();
    const atDispatch = ended;
    await wait(150);
    ok(
      ended === atDispatch,
      `onEndReached fired ${ended - atDispatch} time(s) on a detached list`,
    );
  });

  await t("ListView: the header height is not counted twice", async () => {
    const header = document.createElement("div");
    header.style.height = "50px";
    header.textContent = "HEADER";

    const list = W.ListView({
      data: Array.from({ length: 20 }, (_, i) => i),
      itemSize: 40,
      gap: 0,
      height: 200,
      expand: false,
      ListHeaderComponent: header,
      renderItem: (i) => W.Text({ text: `row ${i}` }),
    });
    host.appendChild(list);
    await wait(80);

    const scroller = list.firstElementChild;
    const inner = Array.from(scroller.children).find((child) => child !== header);
    ok(inner !== undefined, "the virtual container was not found");

    const innerHeight = parseFloat(inner.style.height);
    ok(
      innerHeight === 20 * 40,
      `inner height ${innerHeight}px for 20×40px rows — header/footer are siblings, not part of it`,
    );
    const firstRow = inner.firstElementChild.firstElementChild;
    ok(
      parseFloat(firstRow.style.top) === 0,
      `row 0 sits at ${firstRow.style.top} inside the item area (expected 0px)`,
    );
    list.remove();
  });

  await t("ListView: growing the viewport renders the newly visible rows", async () => {
    const list = W.ListView({
      data: Array.from({ length: 100 }, (_, i) => i),
      itemSize: 20,
      gap: 0,
      height: 60,
      expand: false,
      renderItem: (i) => W.Text({ text: `row ${i}` }),
    });
    host.appendChild(list);
    await wait(80);

    const visible = list.firstElementChild.firstElementChild.firstElementChild;
    const before = visible.children.length;
    ok(before > 0, "the list rendered nothing");

    list.style.height = "400px";
    await wait(120);
    const after = visible.children.length;
    ok(
      after > before,
      `rows stayed at ${before} after the list grew from 60px to 400px — nothing re-measured the viewport`,
    );
    list.remove();
  });

  // ------------------------------------------- Slider: thumb retry loop
  await t("Slider: the thumb retry loop stops when the widget unmounts", async () => {
    const origRaf = window.requestAnimationFrame;
    let frames = 0;
    window.requestAnimationFrame = (cb) =>
      origRaf((time) => {
        frames++;
        return cb(time);
      });
    try {
      // `frames` counts every rAF callback in the page, so the background rate has
      // to be measured with the same window length as the assertion. The slider's
      // own loop shows up as a doubling of that rate.
      host.replaceChildren();
      const WINDOW = 180;
      await wait(WINDOW);
      const noise = frames;

      // A hidden track measures 0, so positioning retries every frame until the
      // widget can be measured. That retry used to be an untracked recursive rAF.
      const hidden = document.createElement("div");
      hidden.style.display = "none";
      host.appendChild(hidden);
      const slider = W.Slider({ min: 0, max: 10, value: 5 });
      hidden.appendChild(slider);
      await wait(WINDOW);
      const whileUnmeasurable = frames - noise;
      ok(
        whileUnmeasurable > noise + 3,
        `the retry loop never ran (${whileUnmeasurable} frames vs ${noise} background) — the guard proves nothing`,
      );

      slider.remove();
      hidden.remove();
      const atRemoval = frames;
      await wait(WINDOW);
      const afterUnmount = frames - atRemoval;
      ok(
        afterUnmount <= noise + 3,
        `${afterUnmount} frames ran after unmount (background ${noise}) — the loop never stops`,
      );
    } finally {
      window.requestAnimationFrame = origRaf;
    }
  });

  // ------------------------------------------------- Stepper: showNavigation
  await t("Stepper: showNavigation:false renders no navigation", () => {
    const steps = [{ label: "One" }, { label: "Two" }];
    const withNav = mount(W.Stepper({ steps, activeStep: 0 }));
    const noNav = mount(W.Stepper({ steps, activeStep: 0, showNavigation: false }));

    ok(withNav.textContent.includes("Next"), "the default stepper lost its navigation");
    ok(
      !noNav.textContent.includes("Next") && !noNav.textContent.includes("Back"),
      "showNavigation:false still rendered the nav buttons",
    );
    ok(
      noNav.children.length === 2,
      `expected steps + content only, got ${noNav.children.length} sections`,
    );
  });

  // ------------------------------------------- useState: surgical vs structural
  await t("useState: a key stops forcing full renders once the component no longer reads it structurally", async () => {
    // The reactivity model has two halves: a key passed straight into a prop is
    // patched surgically, a key the component *computes with* needs the app render.
    // Flagging the second half forever — because one earlier render used it in a
    // template literal — silently disables the first half for good.
    let renders = 0;
    let setN = null;
    let setMode = null;
    const root = document.createElement("div");
    root.id = "sticky-root";
    document.body.appendChild(root);

    saveState("stickyN", 0);
    saveState("stickyMode", true);

    const App = () => {
      renders++;
      const [n, setNV] = useState("stickyN", 0);
      const [asText, setAsText] = useState("stickyMode", true);
      setN = setNV;
      setMode = setAsText;
      const showLabel = asText.valueOf();
      return W.Column({
        children: [
          showLabel
            ? W.Text({ text: "count=" + n }) // computed with `n` → app render
            : W.Text({ id: "bound-text", text: n }), // passed as a prop → surgical
        ],
      });
    };

    runApp(App, "sticky-root");
    await wait(80);
    ok(renders === 1, `expected 1 render, got ${renders}`);
    ok(root.textContent.includes("count=0"), `initial content: ${root.textContent}`);

    setN(1);
    await wait(80);
    ok(renders === 2, `a structurally-read key must re-render the app (${renders})`);

    setMode(false); // rebuild so `n` only ever reaches a prop
    await wait(80);
    ok(renders === 3, `the mode switch did not re-render (${renders})`);

    const bound = root.querySelector("#bound-text");
    ok(bound !== null, "the prop-bound text was not built");
    const before = renders;
    setN(7);
    await wait(80);
    ok(renders === before, `the app re-rendered ${renders - before} time(s) for a bound-only key`);
    ok(
      bound.textContent === "7",
      `the surgical update never reached the widget: "${bound.textContent}"`,
    );

    setMode(true);
    await wait(80);
    setN(9);
    await wait(80);
    ok(
      root.textContent.includes("count=9"),
      `the structural path stopped tracking the key: ${root.textContent}`,
    );
    root.remove();
  });

  await t("useState: setState compares against the store, not the value captured at render", () => {
    const seen = [];
    const [, setN, onN] = useState("desyncN", 1);
    onN((value) => seen.push(value));

    saveState("desyncN", 2); // someone else moved the key
    setN(1); // this setter still believes the value is 1
    ok(getState("desyncN") === 1, `dispatch skipped — store=${getState("desyncN")}`);
    ok(seen.length === 2, `expected 2 notifications, got ${seen.length}`);

    saveState("desyncN", 10);
    setN((prev) => prev + 1);
    ok(
      getState("desyncN") === 11,
      `the updater received a stale value: store=${getState("desyncN")}`,
    );
  });

  // ------------------------------------------------- documented-but-dead props
  await t("engine: `visible` hides the widget and restores its own display", async () => {
    // `visible` was in CommonProps and every doc page, but no registry entry and
    // no handler existed, so it was silently dropped and the widget always showed.
    const row = mount(W.Row({ visible: false, children: [W.Text({ text: "x" })] }));
    ok(getComputedStyle(row).display === "none", `display=${getComputedStyle(row).display}`);
    row.visible = true;
    await wait(20);
    ok(getComputedStyle(row).display === "flex", "the flex display was not restored");
    const inline = mount(WidgetFactory({ tag: "div", display: "inline", visible: false }));
    ok(getComputedStyle(inline).display === "none", "boolean false did not hide");
    inline.visible = true;
    ok(getComputedStyle(inline).display === "inline", "the original display was lost");
  });

  await t("engine: `wrap: true` and `expand: true` write valid CSS", async () => {
    // Both were plain style props, so `applyUnit` turned `true` into `1`:
    // `flex-wrap: 1` and `flex: 1`-as-a-string are invalid and did nothing.
    const wrapped = mount(W.Row({ wrap: true, width: 100, children: [W.Text({ text: "a" })] }));
    ok(getComputedStyle(wrapped).flexWrap === "wrap", `flex-wrap=${getComputedStyle(wrapped).flexWrap}`);
    const nowrap = mount(W.Row({ wrap: false }));
    ok(getComputedStyle(nowrap).flexWrap === "nowrap", `false must map to nowrap, got ${getComputedStyle(nowrap).flexWrap}`);
    const keyword = mount(W.Row({ wrap: "wrap-reverse" }));
    ok(getComputedStyle(keyword).flexWrap === "wrap-reverse", "the string form must still pass through");

    const grown = mount(W.Container({ expand: true }));
    ok(/^1\s/.test(getComputedStyle(grown).flexGrow + " ") || getComputedStyle(grown).flexGrow === "1",
      `flex-grow=${getComputedStyle(grown).flexGrow}`);
    const still = mount(W.Container({ expand: false }));
    ok(getComputedStyle(still).flexBasis !== "", `expand:false left no flex shorthand: ${getComputedStyle(still).flex}`);
  });

  await t("engine: `for`/`htmlFor` bind a <label> instead of writing a junk attribute", async () => {
    // `setAttribute("htmlFor", …)` creates a literal `htmlfor`-ish attribute the
    // browser ignores, so the label never pointed at its control.
    const viaFor = mount(WidgetFactory({ tag: "label", text: "A", for: "field-a" }));
    const viaAlias = mount(WidgetFactory({ tag: "label", text: "B", htmlFor: "field-b" }));
    ok(viaFor.getAttribute("for") === "field-a", `for did not land: ${viaFor.outerHTML}`);
    ok(viaFor.htmlFor === "field-a", `label.for did not reflect: "${viaFor.htmlFor}"`);
    ok(viaAlias.htmlFor === "field-b", `htmlFor did not map to for: "${viaAlias.htmlFor}"`);
  });

  await t("Image: onLoad and onError are real DOM events", async () => {
    // Registered as `special`, which nothing handled: the callbacks were consumed
    // by the engine and never reached the <img>, so neither ever fired.
    const png =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==";
    const loaded = [];
    const okImg = mount(W.Image({ src: png, onLoad: (e) => loaded.push(e.target.naturalWidth), onError: () => loaded.push("error") }));
    const failed = [];
    W.Image({ src: "/definitely-not-an-image.png", onError: () => failed.push("error"), onLoad: () => failed.push("load") });
    await wait(500);
    ok(loaded[0] === 1, `onLoad did not fire: ${JSON.stringify(loaded)}`);
    ok(failed[0] === "error", `onError did not fire: ${JSON.stringify(failed)}`);
    ok(okImg.tagName === "IMG", "Image stopped rendering an <img>");
  });

  await t("Input: clearable, passwordToggle and onEnter do what Input.md says", async () => {
    // All three were documented in Input.md and declared in InputProps, and were
    // dead registry entries: no trailing control appeared and Enter never fired.
    const entered = [];
    const clear = mount(W.Input({ label: "Search", clearable: true, value: "abc", onEnter: (v, e) => entered.push(`${v}:${e.key}`) }));
    const btn = clear.querySelector("button");
    ok(btn !== null, "clearable rendered no trailing control");
    ok(clear._input.value === "abc", "the initial value was lost");
    btn.click();
    ok(clear.getValue() === "", `clear left "${clear.getValue()}"`);

    const field = clear._input;
    field.value = "typed";
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    ok(entered.length === 0, "onEnter fired for a non-Enter key");
    field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    ok(entered.length === 1 && entered[0].startsWith("typed:"), `onEnter: ${JSON.stringify(entered)}`);

    const reveal = mount(W.Input({ type: "password", passwordToggle: true, value: "s3cret" }));
    const eye = reveal.querySelector("button");
    ok(eye !== null, "passwordToggle rendered no reveal button");
    ok(reveal._input.type === "password", "the field is not a password field to begin with");
    eye.click();
    ok(reveal._input.type === "text", "clicking reveal did not show the value");
    reveal.querySelector("button").click();
    ok(reveal._input.type === "password", "clicking again did not hide the value");
    ok(reveal.getValue() === "s3cret", `the value was cleared by toggling: "${reveal.getValue()}"`);

    const off = mount(W.Input({ value: "plain" }));
    ok(off.querySelector("button") === null, "a plain Input grew a trailing control");
  });

  await t("Checkbox/Radio/Switch: activeColor paints the active state", async () => {
    // The three controls hardcoded the theme color when active, so the documented
    // `activeColor` prop changed nothing.
    const box = mount(W.Checkbox({ checked: true, activeColor: "rgb(37, 99, 235)" }));
    ok(box.style.backgroundColor === "rgb(37, 99, 235)", `Checkbox bg=${box.style.backgroundColor}`);
    const untoggled = mount(W.Checkbox({ activeColor: "rgb(37, 99, 235)" }));
    untoggled.setChecked(true);
    ok(untoggled.style.backgroundColor === "rgb(37, 99, 235)", `after setChecked: ${untoggled.style.backgroundColor}`);

    const radio = mount(W.Radio({ activeColor: "rgb(22, 163, 74)" }));
    radio.select();
    ok(radio.style.backgroundColor === "rgb(22, 163, 74)", `Radio after select(): ${radio.style.backgroundColor}`);

    const sw = mount(W.Switch({ value: true, activeColor: "rgb(124, 58, 237)" }));
    ok(sw.style.backgroundColor === "rgb(124, 58, 237)", `Switch bg=${sw.style.backgroundColor}`);
    sw.updateValue(false);
    ok(sw.style.backgroundColor !== "rgb(124, 58, 237)", "the off state kept the active color");

    const themed = mount(W.Checkbox({ checked: true }));
    ok(themed.style.backgroundColor !== "", "the default theme color disappeared");
  });

  await t("Stack: alignment anchors children at the documented nine points", async () => {
    // `alignment` was in StackProps, Stack.md and three examples, and Stack never
    // read it: every preset rendered a plain block with children at the top-left.
    const read = (alignment, extra = {}) => {
      const s = mount(W.Stack({ alignment, width: 120, height: 80, ...extra }));
      const cs = getComputedStyle(s);
      return `${cs.display}/${cs.justifyContent}/${cs.alignItems}`;
    };
    ok(read("center") === "flex/center/center", `center → ${read("center")}`);
    ok(read("bottom-right") === "flex/flex-end/flex-end", `bottom-right → ${read("bottom-right")}`);
    ok(read("top-left") === "flex/flex-start/flex-start", `top-left → ${read("top-left")}`);
    ok(read("top-center") === "flex/flex-start/center", `top-center → ${read("top-center")}`);
    ok(read("bottom-center") === "flex/flex-end/center", `bottom-center → ${read("bottom-center")}`);
    // an explicit axis must win over the preset, and no alignment keeps the block
    ok(read("center", { justifyContent: "flex-end" }) === "flex/flex-end/center", "explicit justifyContent ignored");
    ok(getComputedStyle(mount(W.Stack({ width: 40, height: 40 }))).display === "block", "a plain Stack stopped being a block");
  });

  await t("BottomNavigation: a navigating onTabChange does not recurse", async () => {
    // updateColorsFromRouter() fired onTabChange on every router event, so the
    // documented usage (go to the tab's route from the callback) looped
    // route change -> goTo -> route change until the call stack blew and the
    // whole app rendered nothing.
    const items = [
      { icon: "home", label: "Home", route: "/home" },
      { icon: "info", label: "About", route: "/about" },
    ];
    // goTo() refuses a path that is not registered, so the router needs routes
    // before the bar can be driven. This guard is the last one, and clearRouter()
    // resets the singleton afterwards.
    const blank = () => WidgetFactory("div");
    initRouter({ "/": blank, "/home": blank, "/about": blank }, "/home");

    let calls = 0;
    mount(
      BottomNavigation({
        items,
        onTabChange: (index) => {
          calls++;
          if (calls < 40) goTo(items[index].route);
        },
      }),
    );
    await wait(60);
    ok(calls < 5, `fired ${calls} time(s) while mounting`);

    goTo("/about");
    await wait(60);
    ok(calls >= 1 && calls < 8, `after one navigation: ${calls}`);
    ok(getCurrentPath() === "/about", `router is at ${getCurrentPath()}`);
    clearRouter();
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
