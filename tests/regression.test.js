// tests/regression.test.js
// Regression guards for the bugs fixed during the widget audit.
//
// Every assertion below FAILED before its fix, so a regression re-breaks a real
// bug that the existing suites did not cover:
//   - the engine used to wipe a widget's children on any update();
//   - ListView.updateData() recursed until the stack overflowed;
//   - DataTable.updateData() threw on the second call and updateColumns() wiped rows;
//   - SnackBar.close() fired onClose once per call instead of exactly once;
//   - AnimatedBox appended a permanent <style> on every call;
//   - Skeleton documented a `shimmerColor` it never read;
//   - a 14px input made iOS zoom the whole page on focus;
//   - a full-height Drawer put its header under the notch and its footer under
//     the home indicator;
//   - a Tooltip parked itself inside the status bar and a tap left it on screen
//     with nothing ever dismissing it;
//   - GridView read neither the `children` callers hand it nor the row height it
//     reserves, so a "3-column grid" painted one column of full-width rows;
//   - a Badge anchored itself to the width its parent happened to give the
//     wrapper, so the pill sat on the far edge of the card instead of the icon.
//
// It publishes `window.__REGRESSION = { pass, fail, results }`.
import * as W from "../src/widgets/index.js";
import {
  AppBar,
  Tabs,
  Scaffold,
  Drawer,
  DrawerItem,
  BottomNavigation,
  CollapsibleSideBar,
  AdaptiveScaffold,
} from "../src/navigations/index.js";
import { goTo, getCurrentPath, initRouter, clearRouter } from "../src/navigations/Router.js";
import { WidgetFactory } from "../src/widget-factory/index.js";
import { AnimatedBox } from "../src/animations/AnimatedBox.js";
import { AnimatedText } from "../src/animations/AnimatedText.js";
import { MatrixRain } from "../src/animations/MatrixRain.js";
import { animate, pulse, stopAnimation } from "../src/animations/animate.js";
import { runApp } from "../src/core/runApp.js";
import { useState, saveState, getState } from "../src/tools/useState.js";
import { colors, palettes, setTheme, applySystemTheme } from "../src/utils/themes.js";
import { color } from "../src/tools/color.js";
import { TAP_MINIMUM } from "../src/tools/scale.js";
import {
  BREAKPOINTS,
  BREAKPOINT_NAMES,
  breakpointForWidth,
  atLeast,
  pick,
  onBreakpointChange,
} from "../src/tools/breakpoints.js";
import { loadFont, fontsReady } from "../src/tools/fonts.js";
import { ensureFieldFont, looksLikeIOS } from "../src/utils/fieldFont.js";

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

// `innerWidth` is a read-only accessor on Window, so a responsive test has to
// shadow it with its own configurable property and hand the descriptor back.
// Nothing else in the harness may read a viewport it did not ask for.
const withWidth = (px, fn) => {
  const original = Object.getOwnPropertyDescriptor(window, "innerWidth");
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    get: () => px,
  });
  try {
    return fn();
  } finally {
    if (original) Object.defineProperty(window, "innerWidth", original);
    else delete window.innerWidth;
  }
};

const host = document.createElement("div");
host.style.cssText = "position:absolute;left:-9999px;top:0;width:600px;";
document.body.appendChild(host);

const mount = (el) => {
  host.appendChild(el);
  return el;
};

// Ink measurements have to hold in both palettes: a light-only fix for a
// white-on-bright-plate bug looks perfect on the machine that wrote it.
const withBothThemes = (fn) => {
  const saved = localStorage.getItem("fletbox-theme");
  try {
    for (const name of ["light", "dark"]) {
      setTheme(name);
      fn(name);
    }
  } finally {
    if (saved) setTheme(saved);
    else applySystemTheme();
  }
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

  // ------------------------------------------------------- Ink follows plate
  await t("Button: a named fill keeps its label readable in both themes", () => {
    // `bgColor` used to leave the label with the theme ink, so a button filled
    // with the theme's own primary painted a near-invisible label: black on
    // near-black in light, near-white on near-white in dark.
    withBothThemes((theme) => {
      for (const fill of [colors.primary, colors.secondary, "#facc15"]) {
        const btn = mount(W.Button({ text: "Go", bgColor: fill }));
        const s = getComputedStyle(btn);
        const ratio = color(s.color).contrastRatio(s.backgroundColor);
        ok(
          ratio >= 4.5,
          `${theme}: ${s.color} on ${s.backgroundColor} fill is ${ratio.toFixed(2)}:1`,
        );
        btn.remove();
      }
    });
  });

  await t("SnackBar: signal presets keep their label readable in both themes", () => {
    // The presets painted the theme ink on the signal plate; in dark that is
    // near-white on a bright green/amber, measured under 2.5:1.
    withBothThemes((theme) => {
      for (const type of ["success", "error", "warning", "info"]) {
        const el = W.SnackBar({ message: "saved", type, duration: 0 }).getElement();
        const s = getComputedStyle(el);
        const ratio = color(s.color).contrastRatio(s.backgroundColor);
        ok(
          ratio >= 4.5,
          `${theme} ${type}: ${s.color} on ${s.backgroundColor} is ${ratio.toFixed(2)}:1`,
        );
        el.remove();
      }
    });
  });

  await t("CodeViewer: syntax tokens stay readable on the code block in both themes", () => {
    // The One Dark map was applied to the light theme's #F4F4F5 pane, where its
    // green string measured 1.6:1. The palette now follows the block's surface.
    const code = 'const greeting = "hello"; // note\nconst fn = (x) => x + 1;\nreturn 42;';
    withBothThemes((theme) => {
      const cv = mount(W.CodeViewer({ code, showLineNumbers: true }));
      const bg = getComputedStyle(cv.children[0]).backgroundColor;
      const spans = [...cv.querySelectorAll('span[style*="color"]')];
      ok(spans.length >= 5, `${theme}: only ${spans.length} coloured tokens`);
      for (const span of spans) {
        const fg = getComputedStyle(span).color;
        const ratio = color(fg).contrastRatio(bg);
        ok(
          ratio >= 4.5,
          `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1 ("${span.textContent}")`,
        );
      }
      cv.remove();

      // Raw characters (`=`, `=>`, `+`) used to be left unspanned, so they
      // inherited the page ink and vanished on a pane of the opposite theme.
      const paneBg = theme === "light" ? "#0f172a" : "#fafafa";
      const pane = mount(
        W.CodeViewer({ code, backgroundColor: paneBg, showLineNumbers: true }),
      );
      const offBg = getComputedStyle(pane.children[0]).backgroundColor;
      const plain = [...pane.querySelectorAll('span[style*="color"]')].filter(
        (s) => s.textContent === "=" || s.textContent === ">" || s.textContent === "+",
      );
      ok(plain.length >= 2, `${theme}: "=" and ">" were left to inherit the page ink`);
      for (const span of plain) {
        const fg = getComputedStyle(span).color;
        const ratio = color(fg).contrastRatio(offBg);
        ok(
          ratio >= 4.5,
          `${theme}: ${fg} on ${offBg} is ${ratio.toFixed(2)}:1 ("${span.textContent}")`,
        );
      }
      // The gutter default follows the pane too: the theme's textSecondary on an
      // opposite pane measured under 3:1.
      const gutter = pane.children[0].firstElementChild.firstElementChild;
      const gutterInk = getComputedStyle(gutter).color;
      const gutterRatio = color(gutterInk).contrastRatio(offBg);
      ok(
        gutterRatio >= 4.5,
        `${theme}: gutter ${gutterInk} on ${offBg} is ${gutterRatio.toFixed(2)}:1`,
      );
      pane.remove();
    });
  });

  await t("CodeViewer: the copy button is visible and copies the raw code", async () => {
    const code = 'const x = "y";';
    const saved = localStorage.getItem("fletbox-theme");
    const realClipboard = navigator.clipboard;
    let copied = null;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: (text) => { copied = text; return Promise.resolve(); } },
    });
    try {
      for (const theme of ["light", "dark"]) {
        setTheme(theme);
        const cv = mount(W.CodeViewer({ code, title: "x.js" }));
        const btn = [...cv.querySelectorAll("button")].find((b) => b.textContent === "Copy");
        ok(btn, `${theme}: the header has no copy button`);
        const s = getComputedStyle(btn);
        const ratio = color(s.color).contrastRatio(s.backgroundColor);
        ok(
          ratio >= 4.5,
          `${theme}: copy label ${s.color} on ${s.backgroundColor} is ${ratio.toFixed(2)}:1`,
        );
        btn.click();
        await wait(20);
        ok(copied === code, `${theme}: clipboard received ${JSON.stringify(copied)}`);
        ok(btn.textContent === "Copied", `${theme}: feedback label is "${btn.textContent}"`);
        cv.remove();
        copied = null;
      }
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: realClipboard,
      });
      if (saved) setTheme(saved);
      else applySystemTheme();
    }
  });

  // ------------------------------------------------------------- AnimatedBox
  await t("AnimatedBox: identical keyframes are injected only once", () => {
    // Only the keyframe sheets count: the engine also owns one stylesheet for the
    // reduced-motion recipe, and that is injected once per page by design.
    const count = () =>
      [...document.head.querySelectorAll("style")].filter((s) => s.textContent.includes("@keyframes")).length;
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

  await t("AnimatedBox: a from→to animation holds `to` at 100% unless reverse is set", () => {
    // The sine-wave cycle used to be the default, so every documented entry
    // animation (opacity 0→1, translateY 16→0) snapped back to `from` at the end:
    // faded text became invisible again and letters stayed 16px down.
    const keyframesFor = (anim) => {
      AnimatedBox({
        animations: [anim],
        child: W.Text({ text: "x" }),
      });
      const styles = [...document.head.querySelectorAll("style")]
        .map((s) => s.textContent)
        .filter((text) => text.includes("@keyframes anim-") && text.includes("translateY("));
      return styles[styles.length - 1] || "";
    };
    const forward = keyframesFor({ effect: "translateY", from: 14, to: 0, duration: 300 });
    ok(
      /100% \{[^}]*translateY\(0(?:rem|px)?\)/.test(forward),
      `forward animation ends at ${(forward.match(/100% \{[^}]*\}/) || ["(no 100% frame)"])[0]}`,
    );
    const cycled = keyframesFor({ effect: "translateY", from: 14, to: 3, reverse: true, duration: 300 });
    ok(
      /100% \{[^}]*translateY\(0\.875rem\)/.test(cycled),
      `reverse:true must cycle back, ends at ${(cycled.match(/100% \{[^}]*\}/) || ["(no 100% frame)"])[0]}`,
    );
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

  await t("Markdown: a `-` list renders one <ul> with dots, not a nested <ol>", () => {
    // The ordered-list pass re-wrapped the first unordered item, so `- a\n- b`
    // came out as `<ul><ol><li>a</li></ol><li>b</li></ul>`: the first bullet was
    // numbered and sat one indent level deeper than the second.
    const md = W.Markdown({ text: "- uno\n- dos\n\n1. first\n2. second" });
    const uls = md.querySelectorAll("ul");
    const ols = md.querySelectorAll("ol");
    ok(uls.length === 1, `${uls.length} <ul> for one unordered list`);
    ok(ols.length === 1, `${ols.length} <ol> for one ordered list`);
    ok(
      md.querySelector("ul ol") === null && md.querySelector("ol ul") === null,
      `a list is nested inside the other: ${md.innerHTML.slice(0, 160)}`,
    );
    ok(uls[0].querySelectorAll(":scope > li").length === 2, "the <ul> does not hold both items");
    ok(ols[0].querySelectorAll(":scope > li").length === 2, "the <ol> does not hold both items");

    for (const marker of ["*", "+"]) {
      const list = W.Markdown({ text: `${marker} uno\n${marker} dos` });
      ok(
        list.querySelectorAll("ul > li").length === 2,
        `"${marker}" is not accepted as a list marker: ${list.innerHTML.slice(0, 120)}`,
      );
      ok(!list.textContent.includes(marker), `the "${marker}" marker leaked into the words`);
    }

    // An outside marker hangs ~1.5px left of the li text at the default 14px
    // font, and the root clips with `overflow: auto`, so a 1em indent showed
    // half a disc. The default has to leave the whole marker inside.
    mount(md);
    const ulStyle = getComputedStyle(uls[0]);
    const indent = parseFloat(ulStyle.paddingLeft);
    const em = parseFloat(ulStyle.fontSize);
    ok(
      indent >= em * 1.25 - 0.01,
      `the list indent is ${indent}px: an outside marker hangs past the root edge and gets clipped`,
    );
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

  await t("Radio: the 40-unit hit box does not push the ring off the label", async () => {
    // Row's default `align-items: stretch` stretched a label beside the radio to
    // the hit box's 40 units, and the block text sat at the top of that box: the
    // ring measured ~10 units below the words' centre, and a requested 10-unit
    // `gap` read as 20 because the box's padding sat inside the gap.
    const row = mount(
      W.Row({ gap: 10, children: [W.Radio({}), W.Text({ text: "Option A" })] }),
    );
    await wait(30);
    const box = row.firstElementChild.getBoundingClientRect();
    const ring = row.firstElementChild.firstElementChild.getBoundingClientRect();
    const label = row.lastElementChild.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();

    ok(
      box.height >= ring.height + 19 && box.width >= ring.width + 19,
      `the press target shrank to ${box.width}x${box.height} around a ${ring.width}x${ring.height} ring`,
    );
    ok(
      Math.abs(rowBox.height - ring.height) < 1,
      `the row is ${rowBox.height}px tall around a ${ring.height}px ring`,
    );
    ok(
      Math.abs(ring.top + ring.height / 2 - (label.top + label.height / 2)) < 1,
      `ring centre ${ring.top + ring.height / 2} vs label centre ${label.top + label.height / 2}`,
    );
    ok(
      Math.abs(label.left - ring.right - 10) < 1.5,
      `the visible gap is ${label.left - ring.right}px, expected 10`,
    );
  });

  await t("Radio: the unselected ring is visible in both themes", () => {
    // The rim used `colors.border`, which is a hairline: 1.27:1 on the light
    // page and 1.16:1 on the dark card, so an empty radio disappeared. 3:1 is
    // the WCAG minimum for a control boundary that carries state.
    withBothThemes((theme) => {
      const radio = mount(W.Radio({}));
      const rim = getComputedStyle(radio.firstElementChild).borderTopColor;
      const ratio = color(rim).contrastRatio(colors.card);
      ok(ratio >= 3, `${theme}: rim ${rim} on ${colors.card} is ${ratio.toFixed(2)}:1`);
      radio.remove();
    });
  });

  await t("Radio: the documented label sits beside the ring, not before it", () => {
    // `label` went to the factory as a flat prop, so it became the root's
    // textContent: the words rendered *before* the ring, outside the press
    // target, and the requested `gap` was never used. It now composes the
    // label like Switch and Checkbox do.
    const radio = mount(W.Radio({ label: "Monthly" }));
    const ring = radio.firstElementChild;
    const label = radio.lastElementChild;
    ok(
      ring.tagName === "DIV" && ring.style.borderRadius === "50%",
      "the label replaced the ring",
    );
    ok(label.textContent === "Monthly", `label reads "${label.textContent}"`);
    ok(radio.firstChild === ring, "the text still comes before the ring");
    const frame = ring.getBoundingClientRect();
    const words = label.getBoundingClientRect();
    const row = radio.getBoundingClientRect();
    ok(
      Math.abs(frame.top + frame.height / 2 - (words.top + words.height / 2)) < 1,
      "the ring and the label are not on the same centre line",
    );
    ok(words.left > frame.right, "the label is not beside the ring");
    ok(row.height >= TAP_MINIMUM, `the labelled row is ${row.height}px tall`);
    radio.click();
    ok(radio.isSelected() === true, "clicking the label did not select the radio");
  });

  await t("Checkbox: the hit box aligns with its label and its rim is visible", async () => {
    // Same defect as the Radio: a 40-unit box in the layout stretched the row
    // and left the label at the top of it, and the unchecked rim was
    // `colors.border` — 1.3:1 on white, 1.2:1 on the dark card.
    withBothThemes((theme) => {
      const row = mount(
        W.Row({ gap: 10, children: [W.Checkbox({}), W.Text({ text: "Accept" })] }),
      );
      const box = row.firstElementChild.getBoundingClientRect();
      const square = row.firstElementChild.firstElementChild.getBoundingClientRect();
      const label = row.lastElementChild.getBoundingClientRect();
      const rowBox = row.getBoundingClientRect();
      ok(
        box.height >= square.height + 19 && box.width >= square.width + 19,
        `${theme}: the press target shrank to ${box.width}x${box.height}`,
      );
      ok(
        Math.abs(rowBox.height - square.height) < 1,
        `${theme}: the row is ${rowBox.height}px tall around a ${square.height}px box`,
      );
      ok(
        Math.abs(square.top + square.height / 2 - (label.top + label.height / 2)) < 1,
        `${theme}: box centre ${square.top + square.height / 2} vs label centre ${label.top + label.height / 2}`,
      );
      ok(
        Math.abs(label.left - square.right - 10) < 1.5,
        `${theme}: the visible gap is ${label.left - square.right}px, expected 10`,
      );
      const rim = getComputedStyle(row.firstElementChild.firstElementChild).borderTopColor;
      const ratio = color(rim).contrastRatio(colors.card);
      ok(ratio >= 3, `${theme}: rim ${rim} on ${colors.card} is ${ratio.toFixed(2)}:1`);
      row.remove();
    });
    await wait(20);
  });

  await t("Switch: pressing does not scale the labelled row", async () => {
    // The root of a labelled Switch is the whole row and the root is what
    // carries the click, so `applyEffects` scaled the label and the toggle
    // together like a button. The knob's slide is the feedback; the row now
    // opts out with `disableTransform`.
    const sw = mount(W.Switch({ label: "Notifications", value: true }));
    await wait(20);
    const label = sw.firstElementChild;
    const before = label.getBoundingClientRect();
    sw.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await wait(30);
    ok(sw.style.scale === "", `mousedown scaled the row to "${sw.style.scale}"`);
    const after = label.getBoundingClientRect();
    ok(
      after.width === before.width && after.height === before.height,
      `the label changed from ${before.width}x${before.height} to ${after.width}x${after.height}`,
    );
    sw.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    sw.click();
    ok(sw.getValue() === false, "the switch stopped toggling");
  });

  await t("Button: hover raises the shadow one elevation step, not two", async () => {
    // Hover replaced the button's level-2 shadow (0 3px 6px) with a hardcoded
    // 0 8px 16px — two steps up and not even on the scale — so the button read
    // as jumping off the page. It now steps to the next SHADOW_LEVELS entry.
    const px = (el) => (getComputedStyle(el).boxShadow.match(/-?\d*\.?\d+px/g) || []).map(parseFloat);
    const btn = mount(W.Button({ text: "Hover", onPress: () => {} }));
    await wait(30);
    const base = px(btn);
    ok(
      base.length === 4 && base[1] === 3 && base[2] === 6,
      `base shadow ${getComputedStyle(btn).boxShadow}`,
    );
    btn.dispatchEvent(new MouseEvent("mouseenter"));
    // the button transitions the shadow for 0.2s; read the settled value
    await wait(320);
    ok(
      px(btn)[1] === 6 && px(btn)[2] === 12,
      `hover shadow ${getComputedStyle(btn).boxShadow}`,
    );
    // an update over a hovered button must not climb the scale again
    btn.update({ opacity: 0.99 });
    await wait(320);
    ok(
      px(btn)[1] === 6,
      `an update while hovered lifted the button to ${getComputedStyle(btn).boxShadow}`,
    );
    btn.dispatchEvent(new MouseEvent("mouseleave"));
    await wait(320);
    ok(
      px(btn)[1] === 3 && px(btn)[2] === 6,
      `leaving restored ${getComputedStyle(btn).boxShadow}`,
    );
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
    // Count the bars' own colour, not "dark" pixels: in the dark theme the
    // primary fill is near-white, so a luminance heuristic measured only the
    // grid lines and reported a chart that had drawn correctly as empty.
    const barRGB = [0, 2, 4].map((i) =>
      parseInt(colors.primary.slice(1 + i, 3 + i), 16),
    );
    let bars = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (
        d[i + 3] === 255 &&
        d[i] === barRGB[0] &&
        d[i + 1] === barRGB[1] &&
        d[i + 2] === barRGB[2]
      )
        bars++;
    }
    ok(bars > 1000, `only ${bars} bar pixels — negative data was not drawn`);
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
  await t("TreeView: folders use the brand tone, files stay neutral", () => {
    // `folderIconColor` defaulted to `colors.warning`, turning every folder the
    // only amber element in a tree whose chevrons and files are grey.
    const tv = W.TreeView({
      nodes: [
        { id: "src", label: "src", children: [{ id: "x", label: "x.js" }] },
      ],
      defaultExpanded: true,
    });
    mount(tv);
    const icons = [...tv.querySelectorAll(".material-icons")].filter((i) =>
      /folder|insert_drive_file/.test(i.textContent),
    );
    const folder = icons.find((i) => i.textContent.startsWith("folder"));
    const file = icons.find((i) => i.textContent === "insert_drive_file");
    ok(folder, "no folder icon rendered");
    ok(file, "no file icon rendered");
    const rgb = (hex) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
    };
    ok(
      getComputedStyle(folder).color === rgb(colors.primary),
      `folder colour=${getComputedStyle(folder).color}, expected ${rgb(colors.primary)}`,
    );
    ok(
      getComputedStyle(file).color === rgb(colors.textSecondary),
      `file colour=${getComputedStyle(file).color}`,
    );
  });

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

  // ------------------------------------------------------ Dropdown reactivity
  await t("Dropdown: a reactive `value` moves the visible selection", async () => {
    // `value` is consumed by the widget's own closure and never forwarded to the
    // factory, so `bindReactiveProps` could not see it: a `useState` bound to the
    // box patched nothing and the old seed stayed on screen while the app's state
    // had moved on (demoMap's destination list, measured 2026-10-19).
    const { useState } = await import("../src/tools/useState.js");
    const [sel, setSel] = useState("ddBoundValue", "a");
    const seen = [];
    const dd = W.Dropdown({ options: ["a", "b"], value: sel, onChange: (v) => seen.push(v) });
    mount(dd);
    await wait(40);
    const shown = () => dd.innerText.replace(/\s+/g, " ").trim();
    ok(shown().startsWith("a"), `initial selection not shown: ${shown()}`);
    setSel("b");
    await wait(60);
    ok(shown().startsWith("b"), `the bound value did not reach the display: ${shown()} (widget holds ${dd.value})`);
    // Loop guard: re-applying the same value must not echo back through onChange,
    // otherwise a state->value->onChange->state app cycle never settles.
    const echoed = seen.length;
    setSel("b");
    await wait(40);
    ok(seen.length === echoed, `an unchanged value fired onChange ${seen.length - echoed} time(s)`);
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

  await t("Scaffold: static mode mounts the appBar, bottomBar and FAB", async () => {
    // Those three zones were only filled in router mode, so the documented
    // `Scaffold({ appBar, body })` example rendered a bare body with no bar.
    const sc = Scaffold({
      appBar: W.Text({ text: "static-top" }),
      body: W.Text({ text: "static-body" }),
      bottomBar: W.Text({ text: "static-bottom" }),
      fab: W.Icon({ name: "add" }),
    });
    host.appendChild(sc);
    await wait(40);
    const slots = [...sc.children];
    ok(slots[0]?.textContent.includes("static-top"), "appBar slot is empty");
    ok(slots[1]?.textContent.includes("static-body"), "body slot is empty");
    ok(slots[2]?.textContent.includes("static-bottom"), "bottomBar slot is empty");
    ok(slots[3]?.children.length === 1, "fab slot is empty");
    sc.remove();
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

  await t("Drawer: the panel pads its content out of the iOS safe area", async () => {
    // The panel spans the viewport edge to edge, so on a notched phone the
    // header sat under the status bar and the footer's last row under the home
    // indicator. Measured with a 59px/34px inset: header top 24px, footer
    // bottom 836px of an 852px screen — the row was 18px inside the gesture
    // bar. The insets are padding on the panel, and `border-box` is what keeps
    // that padding inside the height the panel was given: shrinking the panel
    // instead would leave the darkened page visible above and below it.
    // `env()` reads 0 wherever there is no inset, which is the same
    // no-configuration platform detection the AppBar's top padding uses.
    const d = Drawer({
      header: W.Text({ text: "menu" }),
      footer: W.Text({ text: "foot" }),
    });
    d.open();
    await wait(30);
    try {
      const panel = d.element.querySelector('[role="dialog"]');
      // The computed value resolves `env()` to the device's own inset (0px in
      // this harness), so the authored declaration is what proves the rule.
      ok(
        panel.style.paddingTop === "env(safe-area-inset-top, 0px)",
        `the header is not inset from the status bar (padding-top: ${panel.style.paddingTop || "none"})`,
      );
      ok(
        panel.style.paddingBottom === "env(safe-area-inset-bottom, 0px)",
        `the footer is not inset from the home indicator (padding-bottom: ${panel.style.paddingBottom || "none"})`,
      );
      ok(
        getComputedStyle(panel).boxSizing === "border-box",
        "the insets would push the panel past its own height without border-box",
      );
      ok(
        Math.round(panel.getBoundingClientRect().height) === window.innerHeight,
        `the panel no longer covers the screen edge to edge (${Math.round(panel.getBoundingClientRect().height)} of ${window.innerHeight})`,
      );
      ok(
        panel.style.paddingLeft === "env(safe-area-inset-left, 0px)",
        "a left panel does not step away from the notch in landscape",
      );
      const right = Drawer({ position: "right", header: W.Text({ text: "x" }) });
      try {
        const rightPanel = right.element.querySelector('[role="dialog"]');
        ok(
          rightPanel.style.paddingRight === "env(safe-area-inset-right, 0px)",
          "a right panel insets the wrong side in landscape",
        );
        ok(
          rightPanel.style.paddingLeft === "",
          "a right panel also padded its open side",
        );
      } finally {
        right.destroy();
      }
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

  await t("Modal: closeOnOverlayClick dismisses from the backdrop only", async () => {
    // The prop was documented on both overlays while the backdrop handler sat
    // commented out, so `closeOnOverlayClick: true` (the default) closed nothing.
    const m = W.Modal({ title: "T", content: W.Text({ text: "x" }) });
    await wait(20);
    const overlay = document.body.lastElementChild;
    m.open();
    await wait(20);
    overlay.firstChild?.dispatchEvent?.(
      new MouseEvent("click", { bubbles: true }),
    );
    await wait(20);
    ok(m.isOpen === true, "a click inside the panel closed the modal");
    overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wait(20);
    ok(m.isOpen === false, "a backdrop click did not close the modal");
    m.destroy?.();

    const kept = W.Modal({
      title: "T",
      content: W.Text({ text: "x" }),
      closeOnOverlayClick: false,
    });
    await wait(20);
    const keptOverlay = document.body.lastElementChild;
    kept.open();
    await wait(20);
    keptOverlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wait(20);
    ok(kept.isOpen === true, "closeOnOverlayClick:false still closed on the backdrop");
    kept.destroy?.();
  });

  await t("BottomSheet: closeOnOverlayClick dismisses from the backdrop only", async () => {
    const bs = W.BottomSheet({ content: W.Text({ text: "sheet" }) });
    await wait(20);
    const overlay = document.body.lastElementChild;
    bs.open();
    await wait(60);
    overlay.firstChild?.dispatchEvent?.(new MouseEvent("click", { bubbles: true }));
    await wait(20);
    ok(
      overlay.style.opacity === "1",
      `a click inside the sheet closed it (opacity ${overlay.style.opacity})`,
    );
    overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wait(20);
    ok(
      overlay.style.opacity === "0",
      `a backdrop click did not close the sheet (opacity ${overlay.style.opacity})`,
    );
    await wait(350); // visibility flips after animationDuration (300 ms)
    ok(
      overlay.style.visibility === "hidden",
      "the sheet stayed in the DOM after closing",
    );
    bs.destroy?.();
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

  await t("MatrixRain: _cleanup() stops the loop and keeps the canvas mounted", async () => {
    // The documented contract is "call it when removing the canvas from the DOM",
    // so a caller that only wants to freeze the rain must not lose the element.
    const snapshot = (canvas) => {
      const ctx = canvas.getContext("2d");
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let sum = 0;
      for (let i = 0; i < data.length; i += 401) sum += data[i];
      return sum;
    };

    const canvas = MatrixRain({ fontSize: 14 });
    host.appendChild(canvas);
    await wait(80);
    const first = snapshot(canvas);
    await wait(150);
    const second = snapshot(canvas);
    ok(first !== second, "the rain never painted — nothing to freeze");

    canvas._cleanup();
    ok(canvas.parentNode === host, "_cleanup() removed the canvas from its parent");
    ok(canvas.isConnected, "_cleanup() detached a canvas the caller still holds");

    const frozen = snapshot(canvas);
    await wait(150);
    ok(snapshot(canvas) === frozen, "the loop kept painting after _cleanup()");

    // Releasing twice is what a teardown sweep plus an onUnmount handler does.
    canvas._cleanup();
    canvas.remove();
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

  // --------------------------- ListView: the row slot is a framework unit, not a pixel
  await t("ListView: the virtual row slot grows with the base font", async () => {
    const root = document.documentElement;
    const previous = root.style.fontSize;
    const build = () => {
      const list = W.ListView({
        data: Array.from({ length: 60 }, (_, i) => i),
        itemSize: 60,
        gap: 8,
        height: 200,
        expand: false,
        renderItem: (i) => W.Text({ text: `row ${i}` }),
      });
      host.appendChild(list);
      return list;
    };
    const firstTwoTops = async (list) => {
      await wait(120);
      const rows = Array.from(list.querySelectorAll("div"))
        .filter((n) => n.style.position === "absolute" && n.firstChild)
        .map((n) => parseFloat(n.style.top))
        .sort((a, b) => a - b);
      ok(rows.length > 1, "the list rendered no positioned rows");
      return Math.round(rows[1] - rows[0]);
    };

    root.style.fontSize = "16px";
    const small = build();
    const step16 = await firstTwoTops(small);
    small.remove();

    root.style.fontSize = "24px";
    const big = build();
    const step24 = await firstTwoTops(big);
    big.remove();

    if (previous === undefined) root.style.removeProperty("font-size");
    else root.style.fontSize = previous;

    ok(step16 === 68, `a 60+8 slot measured ${step16}px at the 16px base`);
    ok(
      step24 > step16 * 1.4,
      `rows stayed ${step24}px apart at the 24px base — the slot is frozen in pixels while every row's own box scales with rem, so tall items overlap`,
    );
  });

  // ------------------------------------------------------------- GridView
  // Both guards measure at a 16px root font, so `itemHeight: 40` is 40 CSS pixels
  // and the numbers below are the documented ones, not a scaling artifact. The
  // measurement happens while the grid is still in the DOM: a detached element
  // answers every rect with zeros.
  const measureGrid = async (props, read) => {
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = "16px";
    const grid = W.GridView(props);
    host.appendChild(grid);
    await wait(150);
    const cells = Array.from(grid.querySelectorAll("div")).filter(
      (d) => d.style.position === "absolute" && d.style.width.endsWith("%"),
    );
    const out = read(cells);
    grid.remove();
    if (previous) root.style.fontSize = previous;
    else root.style.removeProperty("font-size");
    return out;
  };

  // Built per test: a grid stretches the elements it is handed, so a shared array
  // would let the first test's layout leak into the second.
  const makeCells = () =>
    Array.from({ length: 6 }, (_, i) =>
      W.Container({ backgroundColor: colors.card, child: W.Text({ text: `${i + 1}` }) }),
    );

  const gridProps = () => ({
    columns: 3,
    itemHeight: 40,
    spacing: 8,
    height: 200,
    expand: false,
    children: makeCells(),
  });

  await t("GridView: children become the grid instead of a vertical stack", () =>
    measureGrid(gridProps(), (cells) => {
      ok(
        cells.length === 6,
        `a 3-column grid of 6 cells laid out ${cells.length} cells — the items never reached the grid math, so they painted as the factory's own children (one per row)`,
      );
      const box = cells.map((c) => c.getBoundingClientRect());
      const cols = new Set(box.map((c) => Math.round(c.x)));
      const rows = new Set(box.map((c) => Math.round(c.y)));
      const widths = new Set(box.map((c) => Math.round(c.width)));
      ok(cols.size === 3, `columns: 3 produced ${cols.size} distinct column positions`);
      ok(rows.size === 2, `6 cells in 3 columns produced ${rows.size} rows`);
      ok(widths.size === 1, `the cells came in ${widths.size} different widths`);
      return true;
    }));

  await t("GridView: a cell fills the slot its itemHeight reserves", () =>
    measureGrid(gridProps(), (cells) => {
      ok(cells.length >= 4, "the grid rendered too few cells to measure");
      const inner = cells.map((c) => c.firstElementChild.getBoundingClientRect());
      // itemHeight is the cell, spacing is the gutter between two of them, and the
      // row pitch has to be the two added together or one row eats the next.
      ok(
        Math.round(inner[0].height) === 40,
        `itemHeight: 40 gave its cell ${Math.round(inner[0].height)}px — the row was reserved but the cell only ever grew as tall as its content`,
      );
      ok(
        Math.round(inner[1].x - (inner[0].x + inner[0].width)) === 8,
        `spacing: 8 left ${Math.round(inner[1].x - (inner[0].x + inner[0].width))}px between two neighbours`,
      );
      ok(
        Math.round(inner[3].y - inner[0].y) === 48,
        `a 40-cell with spacing 8 stacked its rows ${Math.round(inner[3].y - inner[0].y)}px apart, so the cell and the pitch disagree`,
      );
      // The scroll area has to be tall enough for the last row it positions: a
      // height that subtracts the trailing gutter paints the final row over the footer.
      const area = cells[0].parentElement.parentElement;
      const last = cells[cells.length - 1].getBoundingClientRect();
      const areaBottom = area.getBoundingClientRect().top + parseFloat(area.style.height);
      ok(
        last.bottom <= areaBottom + 0.5,
        `the last cell ends at ${last.bottom} but the list declares its area ${areaBottom} — the trailing gutter was subtracted twice`,
      );
      return true;
    }));

  // ------------------------------------------------------------------ Badge
  await t("Badge: the pill anchors to its child, not to the parent's width", async () => {
    // The panel is what every app writes: a full-width Column. Its default
    // `align-items: stretch` used to pull the badge's anchor box to the panel's
    // width, and the pill — positioned against that box — landed on the far edge
    // of the card, hundreds of pixels from the icon it claims to mark.
    const icon = W.Icon({ name: "notifications", size: 28 });
    const panel = W.Container({
      width: "100%",
      padding: 16,
      children: [W.Badge({ value: 3, child: icon })],
    });
    host.appendChild(panel);
    await wait(80);

    const wrap = icon.parentElement;
    const pill = wrap.lastElementChild;
    const ib = icon.getBoundingClientRect();
    const wb = wrap.getBoundingClientRect();
    const pb = pill.getBoundingClientRect();
    ok(
      panel.getBoundingClientRect().width > ib.width * 3,
      "the panel is no wider than the icon: this guard would prove nothing about the stretch",
    );
    ok(
      Math.abs(wb.width - ib.width) <= 1,
      `the anchor box is ${Math.round(wb.width)}px around a ${Math.round(ib.width)}px child — the wrapper took its parent's width, so the badge cannot know where the child ends`,
    );
    ok(
      Math.abs(pb.right - ib.right) <= 8,
      `the pill sits ${Math.round(pb.right - ib.right)}px past the child's right edge, on the parent's corner`,
    );
    panel.remove();
  });

  // ------------------- The OS answer is painted, never written down as a choice
  await t("applySystemTheme follows the OS without pinning the preference", async () => {
    const savedPref = localStorage.getItem("fletbox-theme");
    const realMatchMedia = window.matchMedia;
    localStorage.removeItem("fletbox-theme");
    window.matchMedia = (query) => ({
      matches: /dark/.test(query),
      addEventListener() {},
      removeEventListener() {},
    });
    try {
      const applied = applySystemTheme();
      ok(applied === "dark", `applySystemTheme returned "${applied}" while the OS asked for dark`);
      ok(
        colors.background === palettes.dark.background,
        `the dark palette never reached colors (background is ${colors.background})`,
      );
      ok(
        localStorage.getItem("fletbox-theme") === null,
        "booting wrote the OS answer as the reader's preference, so watchSystemTheme can never follow the OS again",
      );
      setTheme("light");
      ok(
        localStorage.getItem("fletbox-theme") === "light",
        "an explicit setTheme stopped persisting — the reader's own choice would be lost on reload",
      );
    } finally {
      window.matchMedia = realMatchMedia;
      if (savedPref) localStorage.setItem("fletbox-theme", savedPref);
      else localStorage.removeItem("fletbox-theme");
      applySystemTheme();
    }
  });

  // ------------ An installed PWA repaints its system bars with the palette
  // Chrome paints the status bar and the navigation bar from
  // <meta name="theme-color"> and only reads it once per document unless the
  // page rewrites it. While applyPalette left that meta alone, a generated app
  // shipped whatever literal its scaffold hard-coded — #1a1a2e, the pre-zinc
  // indigo — and the bars stayed that color through every theme change. That is
  // the "the bar and the installed app keep the old colors" report.
  await t("applyPalette moves theme-color and color-scheme with the theme", async () => {
    const savedPref = localStorage.getItem("fletbox-theme");
    const savedScheme = document.documentElement.style.colorScheme;
    try {
      document.documentElement.style.colorScheme = "";
      setTheme("dark");
      const darkMeta = document.querySelector('meta[name="theme-color"]');
      ok(
        darkMeta && darkMeta.getAttribute("content") === palettes.dark.surface,
        `dark theme left theme-color at ${darkMeta ? darkMeta.getAttribute("content") : "no meta"} — the bars must read the live palette's surface, the color under the AppBar and the bottom bar`,
      );
      ok(
        document.documentElement.style.colorScheme === "dark",
        `dark theme set color-scheme to "${document.documentElement.style.colorScheme}" — the OS draws its controls (scrollbars, form widgets, the status-bar glyphs) from it`,
      );

      setTheme("light");
      const lightMeta = document.querySelector('meta[name="theme-color"]');
      ok(
        lightMeta && lightMeta.getAttribute("content") === palettes.light.surface,
        `light theme left theme-color at ${lightMeta ? lightMeta.getAttribute("content") : "no meta"}`,
      );
      ok(
        document.documentElement.style.colorScheme === "light",
        `light theme set color-scheme to "${document.documentElement.style.colorScheme}"`,
      );

      // One meta, not one per theme: a page that appends instead of updating
      // hands Chrome several values at once and the bars stop being predictable.
      ok(
        document.querySelectorAll('meta[name="theme-color"]').length === 1,
        `${document.querySelectorAll('meta[name="theme-color"]').length} theme-color metas — a theme change must reuse the same element`,
      );
    } finally {
      document.documentElement.style.colorScheme = savedScheme;
      if (savedPref) setTheme(savedPref);
      else {
        localStorage.removeItem("fletbox-theme");
        applySystemTheme();
      }
    }
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

  await t("Input: the trailing controls are icons, not emoji", async () => {
    // The reveal button used to paint `👁` and `🙈`. An emoji is a colour bitmap:
    // the field's own `color` cannot reach it, the operating system's emoji font
    // draws it (20×17px measured, in a slot the field sizes at 16), and on iOS it
    // is a monkey face sitting in the middle of a form.
    if (document.fonts?.load) await document.fonts.load('16px "Material Icons"');
    ok(document.fonts.check('16px "Material Icons"'), "the face the .material-icons class asks for never loaded");

    const field = mount(W.Input({ type: "password", passwordToggle: true, clearable: true, value: "s3cret" }));
    const [clearBtn, revealBtn] = [...field.querySelectorAll("button")];
    ok(clearBtn !== undefined && revealBtn !== undefined, `expected two trailing controls, got ${field.querySelectorAll("button").length}`);

    const glyphOf = (btn) => btn.firstElementChild;
    const clearGlyph = glyphOf(clearBtn);
    const revealGlyph = glyphOf(revealBtn);
    ok(clearGlyph !== null && revealGlyph !== null, "a trailing control holds raw text instead of an icon element");
    ok(revealGlyph.classList.contains("material-icons"), "the reveal glyph is not drawn by the framework's icon font");
    ok(clearGlyph.textContent === "close", `the clear control reads "${clearGlyph.textContent}"`);
    ok(revealGlyph.textContent === "visibility", `the hidden state reads "${revealGlyph.textContent}"`);

    // The ligature is TEXT: unless it is hidden, a reader says the button's name
    // and then spells out the icon's identifier.
    ok(revealGlyph.getAttribute("aria-hidden") === "true", "the ligature is readable");
    ok(revealBtn.getAttribute("aria-label") === "Show value", "the button lost its accessible name");
    ok(revealBtn.type === "button", "a trailing control would submit the form it lives in");

    // And it fits the slot it is given — the number an emoji (20) or an unloaded
    // ligature ("visibility" is 57px of Arial) would fail.
    const box = revealGlyph.getBoundingClientRect();
    ok(box.width <= 16.5 && box.height <= 16.5, `the glyph overflows its 16px slot (${box.width}×${box.height})`);

    revealBtn.click();
    ok(revealGlyph.textContent === "visibility_off", `revealing did not swap the icon (${revealGlyph.textContent})`);
    ok(revealBtn.getAttribute("aria-label") === "Hide value", "the accessible name did not follow the state");
    ok(field._input.type === "text", "the field stopped revealing");
    revealBtn.click();
    ok(revealGlyph.textContent === "visibility", "hiding did not swap the icon back");
  });

  await t("Checkbox/Radio/Switch: activeColor paints the active state", async () => {
    // The three controls hardcoded the theme color when active, so the documented
    // `activeColor` prop changed nothing.
    // The paint is on the drawn element, not on the widget: each control is now a
    // 40-unit hit box wrapping a smaller visual, so stretching the colour to the
    // root would make the control itself the size of the target.
    // The inline value, not the computed one: the track cross-fades over 200 ms,
    // so getComputedStyle still reports the colour it is leaving for a moment.
    const paint = (el) => el.firstElementChild.style.backgroundColor;
    // The checkbox is an outlined square: its active paint is the rim and the
    // tick, not a filling plate.
    const rim = (el) => getComputedStyle(el.firstElementChild).borderTopColor;
    const box = mount(W.Checkbox({ checked: true, activeColor: "rgb(37, 99, 235)" }));
    ok(rim(box) === "rgb(37, 99, 235)", `Checkbox rim=${rim(box)}`);
    const untoggled = mount(W.Checkbox({ activeColor: "rgb(37, 99, 235)" }));
    untoggled.setChecked(true);
    ok(rim(untoggled) === "rgb(37, 99, 235)", `after setChecked: ${rim(untoggled)}`);

    const radio = mount(W.Radio({ activeColor: "rgb(22, 163, 74)" }));
    radio.select();
    ok(paint(radio) === "rgb(22, 163, 74)", `Radio after select(): ${paint(radio)}`);

    const sw = mount(W.Switch({ value: true, activeColor: "rgb(124, 58, 237)" }));
    ok(paint(sw) === "rgb(124, 58, 237)", `Switch bg=${paint(sw)}`);
    sw.updateValue(false);
    ok(paint(sw) !== "rgb(124, 58, 237)", "the off state kept the active color");

    const themed = mount(W.Checkbox({ checked: true }));
    ok(rim(themed) !== "rgb(0, 0, 0)", "the default theme color disappeared");
  });

  await t("Checkbox: a square frame with a bordered rim and a centred tick", () => {
    // The box was a filled 4-unit-radius blob: the rounding made a 20-unit
    // control read as a pill, and the fill painted over the border it was
    // supposed to show. It is now a flush square whose rim is visible in both
    // states, with the tick centred inside it.
    withBothThemes((theme) => {
      const cb = mount(W.Checkbox({ checked: true }));
      const boxEl = cb.firstElementChild;
      const cs = getComputedStyle(boxEl);
      ok(cs.borderRadius === "0px", `${theme}: corners are ${cs.borderRadius}`);
      ok(cs.borderTopWidth === "2px" && cs.borderTopStyle === "solid", `${theme}: rim is ${cs.borderTop}`);
      ok(
        cs.backgroundColor === "rgba(0, 0, 0, 0)",
        `${theme}: the plate ${cs.backgroundColor} hides the rim`,
      );
      const ratio = color(cs.borderTopColor).contrastRatio(colors.card);
      ok(ratio >= 3, `${theme}: active rim ${cs.borderTopColor} is ${ratio.toFixed(2)}:1`);

      const mark = boxEl.firstElementChild.getBoundingClientRect();
      const frame = boxEl.getBoundingClientRect();
      ok(
        Math.abs(mark.left + mark.width / 2 - (frame.left + frame.width / 2)) < 1 &&
          Math.abs(mark.top + mark.height / 2 - (frame.top + frame.height / 2)) < 1,
        `${theme}: tick centre ${mark.left + mark.width / 2},${mark.top + mark.height / 2} ` +
          `vs frame centre ${frame.left + frame.width / 2},${frame.top + frame.height / 2}`,
      );
      cb.remove();
    });
  });

  await t("Checkbox: the documented label sits beside the box, not over it", () => {
    // `label` went to the factory as a flat prop, which writes the root's
    // textContent and deletes every child — the quick start's checkbox rendered
    // as bare words with no box. It now composes the label like Switch does.
    const cb = mount(W.Checkbox({ label: "Accept terms" }));
    const box = cb.firstElementChild;
    const label = cb.lastElementChild;
    ok(
      box.tagName === "DIV" && box.style.border.includes("solid"),
      "the label replaced the box",
    );
    ok(label.textContent === "Accept terms", `label reads "${label.textContent}"`);
    const row = cb.getBoundingClientRect();
    const words = label.getBoundingClientRect();
    const frame = box.getBoundingClientRect();
    ok(
      Math.abs(frame.top + frame.height / 2 - (words.top + words.height / 2)) < 1,
      "the box and the label are not on the same centre line",
    );
    ok(words.left > frame.right, "the label is not beside the box");
    ok(row.height >= TAP_MINIMUM, `the labelled row is ${row.height}px tall`);
    cb.click();
    ok(cb.getChecked() === true, "clicking the label did not toggle the box");
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

  await t("alignSelf: one child can answer the parent's cross axis alone", () => {
    // The engine had `alignItems` but no `alignSelf`, so a control inside a
    // stretched Row could only accept the parent's answer or wrap itself in
    // another box to dodge it. Routing is what `tests/propscan.html` proves (an
    // unregistered name there warns as an unknown prop); what this guard holds is
    // the geometry and the reactivity, and the alias, which has no CSS name to
    // fall back on.
    const row = mount(
      W.Row({
        alignItems: "stretch",
        height: 80,
        children: [W.Text({ text: "fills" }), W.Button({ text: "sits", alignSelf: "flex-end" })],
      }),
    );
    const kids = [...row.children];
    ok(getComputedStyle(kids[0]).alignSelf === "auto", "the untouched child stopped inheriting");
    ok(getComputedStyle(kids[1]).alignSelf === "flex-end", `alignSelf did not route: ${getComputedStyle(kids[1]).alignSelf}`);
    ok(kids[1].getBoundingClientRect().bottom <= row.getBoundingClientRect().bottom + 1, "the self-aligned child is not at the bottom of the row");
    // the short alias routes the same style, and update() keeps it reactive
    const alias = mount(W.Container({ child: W.Text({ text: "x", selfAlign: "center" }) }));
    ok(getComputedStyle(alias.querySelector("*")).alignSelf === "center", "selfAlign is not an alias of alignSelf");
    const live = mount(W.Text({ text: "a", alignSelf: "flex-start" }));
    live.update({ alignSelf: "center" });
    ok(getComputedStyle(live).alignSelf === "center", "alignSelf stopped being reactive on update()");
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

  // -------------------------------------------------------------------- Maps
  // locate() used to hardcode { timeout: 10000, maximumAge: 0,
  // enableHighAccuracy: true }, so a caller could not widen the window for a
  // slow desktop fix and an app could not tell a timeout from a denial.
  await t("Maps: locate() forwards timeout/maximumAge/highAccuracy to the browser", async () => {
    const real = navigator.geolocation;
    let seen = null;
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (onSuccess, onError, options) => {
          seen = options;
          onError({ code: 3, message: "timed out" });
        },
        watchPosition: () => 1,
        clearWatch: () => {},
      },
    });
    try {
      const map = mount(W.Maps({}));
      const error = await map
        .locate({ timeout: 20000, maximumAge: 5000, highAccuracy: false })
        .catch((e) => e);
      ok(seen && seen.timeout === 20000, `timeout reached as ${seen && seen.timeout}`);
      ok(seen.maximumAge === 5000, `maximumAge reached as ${seen && seen.maximumAge}`);
      ok(seen.enableHighAccuracy === false, `enableHighAccuracy reached as ${seen && seen.enableHighAccuracy}`);
      ok(error && error.code === 3, `rejection kept error.code (${error && error.code})`);

      seen = null;
      await map.locate().catch(() => {});
      ok(
        seen.timeout === 10000 && seen.maximumAge === 0 && seen.enableHighAccuracy === true,
        `defaults changed: ${JSON.stringify(seen)}`,
      );
    } finally {
      Object.defineProperty(navigator, "geolocation", { configurable: true, value: real });
    }
  });

  // setUserPosition() is the permission-free path (a native fix, or an embedded
  // webview that answers code 1 in 0 ms), so it must never touch geolocation.
  await t("Maps: setUserPosition() centres and draws the dot without geolocation", async () => {
    const real = navigator.geolocation;
    let asked = 0;
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: () => { asked++; },
        // Mounting with showUserLocation already watches, which is not what
        // this guard is about: only a one-shot getCurrentPosition would be.
        watchPosition: () => 1,
        clearWatch: () => {},
      },
    });
    try {
      const map = mount(W.Maps({ showUserLocation: true }));
      map.setUserPosition([41.3874, 2.1686], { zoom: 14 });
      await wait(30);
      ok(asked === 0, `asked the browser ${asked} time(s)`);
      const state = map.getState();
      ok(Math.abs(state.center.lat - 41.3874) < 1e-6, `centre lat is ${state.center.lat}`);
      ok(state.zoom === 14, `zoom is ${state.zoom}`);

      map.setUserPosition(null);
      await wait(30);
      ok(Math.abs(map.getState().center.lat - 41.3874) < 1e-6, "null moved the view");
    } finally {
      Object.defineProperty(navigator, "geolocation", { configurable: true, value: real });
    }
  });

  // The background watcher keeps re-reporting its denial on every retry, and its
  // error handler used to clear userPosition unconditionally — so an IP-based or
  // native position set by the app vanished a frame after it was drawn.
  await t("Maps: a watcher error keeps the position set by the app", async () => {
    const real = navigator.geolocation;
    let watchError = null;
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: () => {},
        watchPosition: (_ok, onError) => { watchError = onError; return 7; },
        clearWatch: () => {},
      },
    });
    try {
      const map = mount(W.Maps({ showUserLocation: true }));
      const dot = Array.from(map.children).find((el) => el.style.borderRadius.includes("50%"));
      ok(dot, "no user dot layer found");
      map.setUserPosition([41.3874, 2.1686]);
      await wait(40);
      ok(dot.style.display !== "none", "dot missing before the watcher failed");
      watchError();
      await wait(40);
      ok(dot.style.display !== "none", "the watcher error wiped the position set by the app");
    } finally {
      Object.defineProperty(navigator, "geolocation", { configurable: true, value: real });
    }
  });

  // ---------------------------------------------------------------- polylines
  // Maps had no vector layer at all, so a route or a track could only be faked
  // with pins. A line must reach the canvas AND leave ink on it: a layer that
  // normalises correctly but never paints is the failure this widget is prone to.
  await t("Maps: polylines paint strokes over the tiles and clear with clearPolylines()", async () => {
    const painted = (canvas) => {
      const ctx = canvas.getContext("2d");
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < data.length; i += 4) if (data[i] !== 0) return true;
      return false;
    };
    const map = mount(
      W.Maps({
        center: [0, 0],
        zoom: 3,
        polylines: [
          [[-20, 0], [20, 0]],
          { id: "route", points: [[0, -40], [0, 40]], color: "#ff0000", width: 6, dashed: true },
        ],
      }),
    );
    await wait(60);
    const canvas = Array.from(map.children).find((el) => el.tagName === "CANVAS");
    ok(canvas, "no canvas layer was added");
    ok(canvas.width > 0 && canvas.height > 0, `canvas backing store is ${canvas.width}x${canvas.height}`);
    ok(painted(canvas), "the canvas holds no ink");
    const stored = map.getPolylines();
    ok(stored.length === 2, `${stored.length} lines stored`);
    ok(stored[0].width === 4 && stored[0].color !== "#ff0000", "a bare line got no defaults");
    ok(stored[1].id === "route" && stored[1].dashed === true, "record options lost");
    ok(canvas.style.zIndex === "1", `canvas z-index is ${canvas.style.zIndex}`);
    // Same level as the tiles, but later in the DOM: it must sit above the
    // basemap and below the pins, without renumbering either.
    const tileLayer = Array.from(map.children).find(
      (el) => el !== canvas && el.style.zIndex === "1",
    );
    ok(
      tileLayer && Array.from(map.children).indexOf(canvas) > Array.from(map.children).indexOf(tileLayer),
      "the canvas is not the layer right above the tiles",
    );

    map.clearPolylines();
    await wait(60);
    ok(map.getPolylines().length === 0, "clearPolylines() kept lines");
    ok(!painted(canvas), "clearPolylines() left strokes on the canvas");

    const added = map.addPolyline([[10, 10], [20, 20]]);
    ok(added, "addPolyline() returned nothing");
    await wait(60);
    ok(painted(canvas), "addPolyline() did not repaint");
    ok(map.getPolylines().length === 1, "addPolyline() did not store the line");
    ok(map.removePolyline(added) && map.getPolylines().length === 0, "removePolyline() lost nothing");
    await wait(60);
    ok(!painted(canvas), "removePolyline() left its stroke on the canvas");
  });

  // One coordinate has no direction. Silently drawing it as a speck is what
  // makes a broken route look like a broken map.
  await t("Maps: a line with fewer than two usable points is rejected", () => {
    const map = mount(W.Maps({ polylines: [[[41.3, 2.1]], "nonsense", { points: [] }] }));
    ok(map.getPolylines().length === 0, `${map.getPolylines().length} lines stored`);
    ok(map.addPolyline([[41.3, 2.1]]) === null, "a one-point line was accepted");
  });

  // ---------------------------------------------------------------- pin anchor
  await t("Maps: the tip of a pin lands on its coordinate, whatever the label says", async () => {
    // The pin button was a flex column sized by its own label, so a long label
    // slid the teardrop sideways off the point it marks (measured: 54 px right of
    // the click in demoMap on 2026-10-19), and the rotated square's real corner
    // sits further down than the -10/-22 offset assumed.
    const LAT = 10;
    const LNG = 20;
    const map = mount(
      W.Maps({
        center: [LAT, LNG],
        zoom: 5,
        height: 300,
        markers: [{ id: "here", position: [LAT, LNG], label: "Destino · un nombre de ciudad largo" }],
      }),
    );
    await wait(60);
    const pin = map.querySelector("button[aria-label]");
    ok(pin, "the marker was not built");
    const head = pin.querySelector("span");
    const box = map.getBoundingClientRect();
    const headBox = head.getBoundingClientRect();
    // A 20 px square rotated -45° about its centre: the sharp corner that was at
    // its bottom-left ends up 10 px right of the head and 10 + 10√2 below its top.
    const tipX = headBox.left + 10;
    const tipY = headBox.top + 10 + 10 * Math.SQRT2;
    ok(Math.abs(tipX - (box.left + box.width / 2)) <= 1, `tip x is ${(tipX - box.left - box.width / 2).toFixed(1)} px off centre`);
    ok(Math.abs(tipY - (box.top + box.height / 2)) <= 1, `tip y is ${(tipY - box.top - box.height / 2).toFixed(1)} px off centre`);
    // The hit box hugs the drop: the label must not widen it, or the map loses
    // every click that happens to land on the text.
    ok(Math.abs(pin.getBoundingClientRect().width - 20) <= 1, `the pin button is ${pin.getBoundingClientRect().width} px wide`);
  });

  // ------------------------------------------------------------------ follow
  // Watching with enableHighAccuracy:false + maximumAge:60000 is right for a dot
  // and useless while chasing a moving car: the view would lag minutes behind.
  await t("Maps: followUser() centres on each fix, reports onUserUpdate and asks for fresh positions", async () => {
    const real = navigator.geolocation;
    let seenOptions = null;
    let pushFix = null;
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: () => {},
        watchPosition: (onSuccess, _onError, options) => {
          seenOptions = options;
          pushFix = onSuccess;
          return 11;
        },
        clearWatch: () => {},
      },
    });
    try {
      const fixes = [];
      const map = mount(
        W.Maps({
          showUserLocation: true,
          followUser: true,
          center: [0, 0],
          zoom: 12,
          onUserUpdate: (fix) => fixes.push(fix),
        }),
      );
      // onMount is deferred, so the watcher only opens a tick after mount().
      await wait(40);
      ok(seenOptions, "mount with followUser never opened a watcher");
      ok(seenOptions.enableHighAccuracy === true, `accuracy flag is ${seenOptions.enableHighAccuracy}`);
      ok(seenOptions.maximumAge === 0, `maximumAge is ${seenOptions.maximumAge}`);

      pushFix({ coords: { latitude: 41.3874, longitude: 2.1686, accuracy: 12, heading: 275 } });
      await wait(40);
      const { center } = map.getState();
      ok(Math.abs(center.lat - 41.3874) < 1e-6, `follow left the view at ${center.lat}`);
      ok(Math.abs(center.lng - 2.1686) < 1e-6, `follow left the view at lng ${center.lng}`);
      ok(fixes.length === 1, `${fixes.length} onUserUpdate call(s)`);
      ok(fixes[0].accuracy === 12 && fixes[0].lat === 41.3874, `fix payload is ${JSON.stringify(fixes[0])}`);
      // The bearing is the only way an app can point a moving car at where it is
      // going, and a desktop never gives one: null, not a fake north.
      ok(fixes[0].heading === 275, `the fix dropped the heading: ${JSON.stringify(fixes[0].heading)}`);

      // Turning it off must leave the view alone but keep the dot.
      map.setFollowUser(false);
      await wait(40);
      ok(seenOptions.enableHighAccuracy === false && seenOptions.maximumAge === 60000,
        `watcher kept the following options: ${JSON.stringify(seenOptions)}`);
      pushFix({ coords: { latitude: -33.45, longitude: -70.66, accuracy: 30 } });
      await wait(40);
      ok(Math.abs(map.getState().center.lat - 41.3874) < 1e-6, "the view moved without following");
      ok(fixes.length === 2, "the dot stopped reporting");
      ok(fixes[1].heading === null, `a fix without bearing reported ${JSON.stringify(fixes[1].heading)}`);
    } finally {
      Object.defineProperty(navigator, "geolocation", { configurable: true, value: real });
    }
  });

  // An app that writes onMoveEnd back into the `center` key it binds (the only
  // way fitBounds survives a re-render) made applyProps report a view change
  // every time, so the map invalidated and fired onMoveEnd forever.
  await t("Maps: re-applying an unchanged center is not a view change", async () => {
    let reports = 0;
    const map = mount(W.Maps({ center: [10, 20], zoom: 6, onMoveEnd: () => reports++ }));
    await wait(300);
    const settled = reports;
    map.update({ center: [10, 20], zoom: 6 });
    map.update({ center: [10, 20] });
    map.update({ center: { latitude: 10, longitude: 20 } });
    await wait(300);
    ok(reports === settled, `the same centre reported ${reports - settled} extra move(s)`);

    map.update({ center: [41.3874, 2.1686] });
    await wait(300);
    ok(reports > settled, "a real centre change reported nothing");
    ok(Math.abs(map.getState().center.lat - 41.3874) < 1e-6, "the view did not move");
  });

  // The ± buttons only stop the `click` event: their pointerdown/pointerup still
  // reach the container, so every press on them also reported the coordinate
  // hiding underneath. In demoMap that re-decoded the destination on each zoom
  // step and the drop jumped to the corner of the view (measured 2026-10-19).
  await t("Maps: a press on the widget's own chrome is not a click on the map", async () => {
    const clicks = [];
    const map = mount(
      W.Maps({
        center: [10, 20],
        zoom: 5,
        height: 300,
        width: 400,
        markers: [{ id: "here", position: [10, 20], label: "Ciudad" }],
        onMapClick: (point) => clicks.push(point),
      }),
    );
    await wait(60);
    const press = (target) => {
      const box = target.getBoundingClientRect();
      const at = {
        bubbles: true,
        cancelable: true,
        pointerId: 7,
        button: 0,
        clientX: box.left + box.width / 2,
        clientY: box.top + box.height / 2,
      };
      // The whole sequence a real finger produces: the widget's chrome stops the
      // `click`, but pointerdown/pointerup always reach the container.
      target.dispatchEvent(new PointerEvent("pointerdown", { ...at, buttons: 1 }));
      target.dispatchEvent(new MouseEvent("mousedown", at));
      target.dispatchEvent(new PointerEvent("pointerup", { ...at, buttons: 0 }));
      target.dispatchEvent(new MouseEvent("mouseup", { ...at, buttons: 0 }));
      target.dispatchEvent(new MouseEvent("click", at));
    };

    const plus = map.querySelector('button[aria-label="Zoom in"]');
    ok(plus, "no zoom button was rendered");
    press(plus);
    await wait(60);
    ok(map.getZoom() === 6, `the button did not zoom: still ${map.getZoom()}`);
    ok(clicks.length === 0, `a press on + also reported ${clicks.length} map click(s) at ${JSON.stringify(clicks[0])}`);

    // A double press on the same button must zoom twice — once per click — and
    // not a third time from the container's own dblclick handler.
    plus.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true }));
    await wait(60);
    ok(map.getZoom() === 6, `dblclick on the control zoomed it to ${map.getZoom()}`);

    // The pin swallows its press too, and the bare surface still reports.
    press(map.querySelector('button[aria-label="Ciudad"]'));
    ok(clicks.length === 0, "a press on a pin reported a map click");
    press(map);
    ok(clicks.length === 1, "a press on the map surface reported nothing");
    ok(Math.abs(clicks[0].lat - 10) < 0.5 && Math.abs(clicks[0].lng - 20) < 0.5, `surface click was ${JSON.stringify(clicks[0])}`);
  });

  // A real finger never lands perfectly still: a press drifts a pixel per event.
  // The pan test summed those steps, so a trembling click walked past the 4 px
  // limit, the map claimed the pointer and *neither* handler fired while the view
  // slid by the tremor. Measured with Chrome on 2026-10-19: a shaky press on a pin
  // reported nothing at all.
  await t("Maps: a press that trembles is a click, not a pan", async () => {
    const markerClicks = [];
    const mapClicks = [];
    const map = mount(
      W.Maps({
        center: [10, 20],
        zoom: 6,
        height: 300,
        width: 400,
        markers: [{ id: "here", position: [10, 20], label: "Ciudad" }],
        onMarkerClick: (marker) => markerClicks.push(marker.id),
        onMapClick: (point) => mapClicks.push(point),
      }),
    );
    await wait(60);
    const before = map.getCenter();

    // Every step stays 1 px from the press point; together they walk 5 px.
    const tremble = [[1, 0], [0, 1], [1, 0], [0, 1], [1, 0]];
    const gesture = (target, steps) => {
      const box = target.getBoundingClientRect();
      const at = (dx, dy, buttons) => ({
        bubbles: true,
        cancelable: true,
        pointerId: 11,
        button: 0,
        buttons,
        clientX: box.left + box.width / 2 + dx,
        clientY: box.top + box.height / 2 + dy,
      });
      target.dispatchEvent(new PointerEvent("pointerdown", at(0, 0, 1)));
      for (const [dx, dy] of steps) {
        target.dispatchEvent(new PointerEvent("pointermove", at(dx, dy, 1)));
      }
      target.dispatchEvent(new PointerEvent("pointerup", at(0, 0, 0)));
      target.dispatchEvent(new MouseEvent("click", at(0, 0, 0)));
    };

    gesture(map.querySelector('button[aria-label="Ciudad"]'), tremble);
    await wait(60);
    ok(markerClicks.length === 1, `a trembling press on a pin reported ${markerClicks.length} marker click(s)`);
    ok(mapClicks.length === 0, "the press on the pin also reported a map click");

    gesture(map, tremble);
    await wait(60);
    ok(mapClicks.length === 1, "a trembling press on the map surface reported nothing");
    const after = map.getCenter();
    ok(
      Math.abs(after.lat - before.lat) < 1e-9 && Math.abs(after.lng - before.lng) < 1e-9,
      `the tremor panned the view to ${after.lat}, ${after.lng}`,
    );
  });

  // A vehicle that does not point where it is going is a dot with a label, so
  // `rotation` has to turn the drop around the very tip that sits on its
  // coordinate — and the caption has to stay readable while it does.
  await t("Maps: a rotated marker turns on its tip and keeps its caption upright", async () => {
    const LAT = 10;
    const LNG = 20;
    const map = mount(
      W.Maps({
        center: [LAT, LNG],
        zoom: 5,
        height: 300,
        width: 400,
        markers: [{ id: "car", position: [LAT, LNG], label: "Coche", rotation: 90 }],
      }),
    );
    await wait(60);
    const pin = map.querySelector('button[aria-label="Coche"]');
    ok(pin, "the rotated marker was not built");
    const head = pin.querySelector("span");
    const box = map.getBoundingClientRect();
    const headBox = head.getBoundingClientRect();
    // The button never rotates, so it still says where the tip is, and that
    // point must not have moved when the head turned.
    const tipX = pin.getBoundingClientRect().left + 10;
    const tipY = pin.getBoundingClientRect().top + 10 + 10 * Math.SQRT2;
    ok(Math.abs(tipX - (box.left + box.width / 2)) <= 1, `turning moved the tip ${(tipX - box.left - box.width / 2).toFixed(1)} px sideways`);
    ok(Math.abs(tipY - (box.top + box.height / 2)) <= 1, `turning moved the tip ${(tipY - box.top - box.height / 2).toFixed(1)} px down`);
    ok(/10px 24\.1/.test(getComputedStyle(head).transformOrigin), `the head turns around ${getComputedStyle(head).transformOrigin}`);
    // A 20×25 head turned 90° measures 25 wide and 20 tall: if its box did not
    // change, the transform never reached the element.
    ok(Math.abs(headBox.height - 20) <= 2 && Math.abs(headBox.width - 25) <= 2, `the head did not turn: its box is ${headBox.width}×${headBox.height}`);
    const label = Array.from(pin.querySelectorAll("span")).find((s) => s.textContent);
    ok(label, "the caption is missing");
    const labelMatrix = getComputedStyle(label).transform;
    ok(/matrix\(1, 0, 0, 1/.test(labelMatrix), `the caption turned with the drop: ${labelMatrix}`);
  });

  // A fix arrives every second and a bearing every frame, while `addMarker`
  // appends: the pooled node keyed by the id kept winning on screen and the list
  // grew without bound, so an hour of a tracked ride is 3 600 markers deep.
  await t("Maps: setMarker() moves the pin it already drew instead of stacking one", async () => {
    const taps = [];
    const map = mount(
      W.Maps({
        center: [10, 20],
        zoom: 5,
        height: 300,
        width: 400,
        markers: [{ id: "city", position: [10, 20], label: "Ciudad" }],
        onMarkerClick: (marker) => taps.push(marker),
      }),
    );
    await wait(60);
    ok(typeof map.setMarker === "function", "the map has no setMarker()");
    map.setMarker({ id: "car", position: [10.2, 20.4], rotation: 45 });
    map.setMarker({ id: "car", position: [10.4, 20.6], rotation: 120 });
    map.setMarker({ id: "car", position: [10.6, 20.8], rotation: 200 });
    await wait(60);
    ok(map.getMarkers().length === 2, `the fleet holds ${map.getMarkers().length} markers after three updates`);
    const car = map.getMarkers().find((marker) => marker.id === "car");
    ok(Math.abs(car.position.lat - 10.6) < 1e-9, `the vehicle kept position ${car.position.lat}`);
    ok(car.rotation === 200, `the vehicle kept bearing ${car.rotation}`);
    // city + car + the two ± buttons.
    ok(map.querySelectorAll("button").length === 4, `${map.querySelectorAll("button").length} buttons: the map stacked pins under the vehicle`);

    // The pooled node answers with what it shows now, not with what it was built
    // from: a stale payload makes a car tap report the position it had at mount.
    const city = map.querySelector('button[aria-label="Ciudad"]');
    ok(city, "the city pin disappeared");
    city.click();
    ok(taps.length === 1 && taps[0].id === "city", `the pin answered as ${JSON.stringify(taps[0] && taps[0].id)}`);
    map.setMarker({ id: "city", position: [11, 21], label: "Ciudad" });
    await wait(60);
    city.click();
    ok(taps.length === 2 && Math.abs(taps[1].position.lat - 11) < 1e-9, `the moved pin still answered with ${JSON.stringify(taps[1] && taps[1].position)}`);
  });

  // A bearing changes every second and the caption carries it ("Coche · 90°"),
  // so the pooled pin has to restate its own label — otherwise the drop turns
  // under a caption frozen at mount, and the accessibility name lies too.
  await t("Maps: setMarker() restates the caption of the pin it moves", async () => {
    const map = mount(
      W.Maps({
        center: [10, 20],
        zoom: 5,
        height: 300,
        width: 400,
        markers: [{ id: "car", position: [10, 20], label: "Coche · 0°", rotation: 0 }],
      }),
    );
    await wait(60);
    const pin = map.querySelector('button[aria-label="Coche · 0°"]');
    ok(pin, "the vehicle pin was not built");
    map.setMarker({ id: "car", position: [10, 20], label: "Coche · 90°", rotation: 90 });
    await wait(60);
    const caption = Array.from(pin.querySelectorAll("span")).find((s) => s.textContent);
    ok(caption.textContent === "Coche · 90°", `the drop turned but the caption still reads ${caption.textContent}`);
    ok(pin.getAttribute("aria-label") === "Coche · 90°", `screen readers still hear ${pin.getAttribute("aria-label")}`);
    ok(pin.title === "Coche · 90°", `the tooltip still says ${pin.title}`);

    map.setMarker({ id: "car", position: [10, 20] });
    await wait(60);
    ok(
      !Array.from(pin.querySelectorAll("span")).find((s) => s.textContent),
      "the caption survived a marker that lost its label",
    );
    ok(pin.getAttribute("aria-label") === "Map marker", `a label-less pin is named ${pin.getAttribute("aria-label")}`);
    ok(map.querySelectorAll("button").length === 3, `${map.querySelectorAll("button").length} buttons: restating a label built a second pin`);
  });

  // A vehicle pin sits exactly where the rider is going to tap to choose a
  // pick-up, and the demo proved the cost: with the drop centred on the view,
  // every tap meant for the map landed on the car and reported "Sin rumbo".
  // `clickable: false` has to make the pin transparent to the pointer — muting
  // its handler would leave a dead patch of map under it.
  await t("Maps: a marker with clickable:false lets the tap reach the map", async () => {
    const mapClicks = [];
    const markerClicks = [];
    const LAT = 10;
    const LNG = 20;
    const map = mount(
      W.Maps({
        center: [LAT, LNG],
        zoom: 5,
        height: 300,
        width: 400,
        markers: [
          { id: "car", position: [LAT, LNG], label: "Coche", clickable: false },
          { id: "city", position: [LAT + 3, LNG], label: "Ciudad" },
        ],
        onMapClick: (point) => mapClicks.push(point),
        onMarkerClick: (marker) => markerClicks.push(marker),
      }),
    );
    await wait(60);
    const car = map.querySelector('button[aria-label="Coche"]');
    const city = map.querySelector('button[aria-label="Ciudad"]');
    ok(car && city, `pins drawn: ${JSON.stringify([...map.querySelectorAll("button")].map((b) => b.getAttribute("aria-label")))}`);
    ok(
      getComputedStyle(city).pointerEvents === "auto",
      `a tappable pin is reachable: pointer-events ${getComputedStyle(city).pointerEvents}`,
    );
    ok(getComputedStyle(car).pointerEvents === "none", `an unclickable pin blocks the map: pointer-events ${getComputedStyle(car).pointerEvents}`);
    ok(car.tabIndex === -1, `an unclickable pin is still in the tab order (${car.tabIndex})`);

    // Hit-test for real. Every widget the suite mounted is stacked inside the
    // off-screen host, so this map alone has to be lifted into the viewport.
    const held = ["position", "left", "top", "zIndex"].map((k) => [k, map.style[k]]);
    Object.assign(map.style, { position: "fixed", left: "0px", top: "0px", zIndex: "99999" });
    try {
      const box = car.getBoundingClientRect();
      // The tip, not the middle of the box: the point of the drop is the
      // coordinate the marker carries, and that is what the tap must report.
      const at = { x: box.left + 10, y: box.top + 10 + 10 * Math.SQRT2 };
      const under = document.elementFromPoint(at.x, at.y);
      ok(under === map, `the tap landed on ${(under && (under.getAttribute("aria-label") || under.tagName)) || "nothing"}, not through the pin`);
      const sequence = (type) => {
        const E = type.startsWith("pointer") ? PointerEvent : MouseEvent;
        under.dispatchEvent(new E(type, {
          bubbles: true, cancelable: true, pointerId: 9, button: 0, clientX: at.x, clientY: at.y,
        }));
      };
      sequence("pointerdown");
      sequence("mousedown");
      sequence("pointerup");
      sequence("mouseup");
      sequence("click");
      await wait(60);
      ok(markerClicks.length === 0, `the tap woke the marker handler: ${JSON.stringify(markerClicks[0] && markerClicks[0].id)}`);
      ok(mapClicks.length === 1, `${mapClicks.length} map clicks reported under an unclickable pin`);
      ok(mapClicks.length === 1 && Math.abs(mapClicks[0].lat - LAT) < 0.05, `the tap reported ${JSON.stringify(mapClicks[0])}`);
    } finally {
      for (const [k, value] of held) map.style[k] = value;
    }
  });

  // ---------------- props that lived only in the registry (measured 2026-10-20)
  await t("Avatar: presence bound to a state key moves the dot", async () => {
    // `online` was a `special` registry entry no widget read, so it neither
    // painted anything nor took part in the reactive protocol: the store moved
    // and the avatar stayed as it was built.
    const { useState } = await import("../src/tools/useState.js");
    const [present, setPresent] = useState("avatarPresence", false);
    const a = mount(W.Avatar({ name: "Ada Lovelace", size: 40, online: present }));
    const dot = () => getComputedStyle(a.lastElementChild).display;
    ok(dot() === "none", `the dot was painted while the store said offline`);
    setPresent(true);
    await wait(60);
    ok(dot() !== "none", "the bound presence never reached the dot");
    setPresent(false);
    await wait(60);
    ok(dot() === "none", "the dot stayed on after presence went offline");
  });

  await t("Avatar: update() keeps the content and moves the geometry", async () => {
    // The old widget rebuilt its children from the construction-time props on any
    // update, and never touched width or radius, so an image avatar reverted to
    // initials and a size change left the box the original size.
    const a = mount(W.Avatar({ src: "/a.png", name: "Ada Lovelace", size: 40 }));
    a.update({ size: 64, shape: "square", padding: 8 });
    ok(a.querySelector("img") !== null, "the content reverted to the construction-time node");
    // Geometry is framework units (rem), so the assertion reads the rendered box.
    ok(getComputedStyle(a).width === "64px", `width did not follow size: ${a.style.width}`);
    ok(getComputedStyle(a).padding === "8px", "the factory lost its own key");
    ok(getComputedStyle(a).borderRadius === "0px", `radius did not follow shape: ${a.style.borderRadius}`);
  });

  await t("Tooltip: tooltipDelay is the old name of delay, and delay wins", async () => {
    // `tooltipDelay` was a `special` entry no widget read: passing it changed
    // nothing, and the default 300 ms stayed in force.
    const base = document.body.children.length;
    const slow = mount(W.Tooltip({ text: "slow", child: W.Text({ text: "a" }), tooltipDelay: 40 }));
    slow.showTooltip();
    ok(document.body.children.length === base, "the bubble appeared before the alias delay elapsed");
    await wait(140);
    ok(document.body.children.length === base + 1, "tooltipDelay was ignored and the bubble never came");
    document.body.lastElementChild.remove();
    slow.hideTooltip();

    const fast = mount(W.Tooltip({ text: "fast", child: W.Text({ text: "b" }), delay: 0, tooltipDelay: 5000 }));
    fast.showTooltip();
    await wait(60);
    ok(document.body.children.length === base + 1, `delay lost to its own alias (${document.body.children.length - base} portals)`);
    document.body.lastElementChild.remove();
    fast.hideTooltip();
  });

  await t("Tooltip: a tap on a device that cannot hover leaves no bubble", async () => {
    // iOS fires a synthetic `mouseenter` on the first tap and never the matching
    // `mouseleave`, so the hover listeners used to strand a bubble on screen that
    // nothing could ever dismiss — two taps, two bubbles, both permanent.
    const shown = () =>
      [...document.body.querySelectorAll('[role="tooltip"]')].filter(
        (b) => b.style.visibility === "visible",
      ).length;

    const realMatchMedia = window.matchMedia;
    // Only `(hover: hover)` is answered with a lie; every other query — the
    // reduced-motion feature the engine reads — still goes to the real thing.
    window.matchMedia = (query) =>
      /hover:\s*hover/.test(query)
        ? { matches: false, media: query, addEventListener() {}, removeEventListener() {} }
        : realMatchMedia(query);
    try {
      ok(!window.matchMedia("(hover: hover)").matches, "the shadow did not take");
      const before = shown();
      const touch = mount(W.Tooltip({ text: "stranded", child: W.Text({ text: "t" }), delay: 0 }));

      touch.dispatchEvent(new MouseEvent("mouseenter"));
      await wait(120);
      ok(shown() === before, `a mouse-only hover path painted a bubble on a touch device (${shown() - before} extra)`);

      // The keyboard path is the other half of the gate: hiding hover must not
      // hide focus too, or a Tab user loses the description entirely.
      touch.dispatchEvent(new FocusEvent("focus"));
      await wait(120);
      ok(shown() === before + 1, `focus no longer shows the tooltip (${shown() - before})`);
      touch.dispatchEvent(new FocusEvent("blur"));
      await wait(20);
      ok(shown() === before, "blur left the bubble visible");
    } finally {
      window.matchMedia = realMatchMedia;
    }
  });

  await t("Tooltip: a bubble with no room above the trigger flips below it", async () => {
    // The old clamp only pushed the bubble down to `top: 10` and never sideways
    // past the bottom edge, so a trigger near the top of the screen got a bubble
    // half over the status bar — on a notched phone `10` is inside it.
    const trigger = mount(
      WidgetFactory({
        tag: "div",
        text: "t",
        position: "fixed",
        top: 24,
        left: 120,
        width: 80,
        height: 24,
      }),
    );
    const tip = W.Tooltip({ text: "flipped", child: trigger, position: "top", delay: 0 });

    tip.showTooltip();
    await wait(120);
    const bubble = document.getElementById(tip.getAttribute("aria-describedby"));
    ok(bubble !== null, "the bubble the trigger points at is not in the document");

    const b = bubble.getBoundingClientRect();
    const c = tip.getBoundingClientRect();
    ok(b.top >= c.bottom, `a request for "top" with no room above painted over the trigger (${Math.round(b.top)} vs ${Math.round(c.bottom)})`);
    const arrow = bubble.lastElementChild;
    ok(parseFloat(arrow.style.top) < 0, `the arrow stayed on the wrong side (${arrow.style.top})`);
    ok(b.left >= 0 && b.right <= window.innerWidth, `the flipped bubble hung off the side (${Math.round(b.left)}…${Math.round(b.right)})`);
    tip.hideTooltip();

    // …and the bottom edge is clamped too, which the old code did not know about.
    const low = mount(
      WidgetFactory({
        tag: "div",
        text: "l",
        position: "fixed",
        top: Math.round(window.innerHeight) - 30,
        left: 120,
        width: 80,
        height: 24,
      }),
    );
    const lowTip = W.Tooltip({ text: "clamped", child: low, position: "bottom", delay: 0 });
    lowTip.showTooltip();
    await wait(120);
    const lowBubble = document.getElementById(lowTip.getAttribute("aria-describedby"));
    const lb = lowBubble.getBoundingClientRect();
    ok(
      lb.bottom <= window.innerHeight,
      `a bottom bubble under a trigger at the floor ran past it (${Math.round(lb.bottom)} > ${Math.round(window.innerHeight)})`,
    );
    lowTip.hideTooltip();
  });

  await t("Image: downloadable saves, and never steals onPress", async () => {
    // Neither `downloadable` nor `downloadFileName` was read by the widget, so a
    // "downloadable" image only ever pressed.
    const saved = [];
    const realClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () { saved.push(this.download); };
    let pressed = 0;
    try {
      mount(W.Image({ src: "/files/quote.png", downloadable: true, onPress: () => pressed++ })).click();
    } finally {
      HTMLAnchorElement.prototype.click = realClick;
    }
    ok(saved.length === 1, `the click saved nothing: ${JSON.stringify(saved)}`);
    ok(saved[0] === "quote.png", `saved under the wrong name: ${saved[0]}`);
    ok(pressed === 1, `onPress fired ${pressed} times`);
  });

  await t("Image: the download props survive update() and a state key", async () => {
    // `downloadable`/`downloadFileName` were read once, at construction, and the
    // factory never saw them (`special`): an update or a store change could
    // neither offer a save nor rename the file it offered.
    const saved = [];
    const realClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () { saved.push(this.download); };
    const { useState } = await import("../src/tools/useState.js");
    try {
      const stillPlain = mount(W.Image({ src: "/files/quote.png" }));
      stillPlain.update({ downloadable: true, downloadFileName: "promoted.png" });
      stillPlain.click();
      ok(saved.join() === "promoted.png", `update() did not make it downloadable: ${JSON.stringify(saved)}`);

      saved.length = 0;
      stillPlain.update({ downloadFileName: "renamed.png" });
      stillPlain.click();
      ok(saved.join() === "renamed.png", `the old name kept being offered: ${JSON.stringify(saved)}`);

      saved.length = 0;
      stillPlain.update({ downloadable: false });
      stillPlain.click();
      ok(saved.length === 0, `a saved offer stayed after downloadable went false: ${JSON.stringify(saved)}`);

      const [allow, setAllow] = useState("imageDownloadAllowed", false);
      const bound = mount(W.Image({ src: "/files/report.pdf", downloadable: allow }));
      bound.click();
      ok(saved.length === 0, "the bound store said false and the image downloaded anyway");
      setAllow(true);
      await wait(60);
      bound.click();
      ok(saved.join() === "report.pdf", `the bound store never reached the image: ${JSON.stringify(saved)}`);
    } finally {
      HTMLAnchorElement.prototype.click = realClick;
    }
  });

  // ---------------------------------------------------------------- layout
  // Container paints `overflow: auto` by default. A flex item whose overflow is
  // not `visible` has an automatic minimum size of zero, so inside a column that
  // overflows, every Container became shrinkable to nothing: a 440px photo band
  // rendered 0px and a 49px chip ribbon rendered 24px (padding only).
  await t("Container: an explicit height survives a shrinking column", () => {
    const band = W.Container({
      width: "100%",
      height: 440,
      bgColor: "transparent",
      child: W.Text({ text: "the view comes with the meal" }),
    });
    const ribbon = W.Container({
      width: "100%",
      height: 48,
      bgColor: "transparent",
      child: W.Text({ text: "lechón asado" }),
    });
    mount(
      W.Container({
        width: "100%",
        height: 200,
        overflowY: "auto",
        children: [
          W.Container({ width: "100%", height: 900, bgColor: "transparent", child: W.Text({ text: "tall" }) }),
          band,
          ribbon,
        ],
      }),
    );
    ok(band.offsetHeight === 440, `440px band shrank to ${band.offsetHeight}px`);
    ok(ribbon.offsetHeight === 48, `48px ribbon shrank to ${ribbon.offsetHeight}px`);
  });

  await t("Container: content height survives a shrinking column", () => {
    const chips = W.Container({
      width: "100%",
      paddingTop: 12,
      paddingBottom: 12,
      bgColor: "transparent",
      child: W.Container({ width: "100%", height: 25, bgColor: "transparent", child: W.Text({ text: "chips" }) }),
    });
    mount(
      W.Container({
        width: "100%",
        height: 200,
        overflowY: "auto",
        children: [
          W.Container({ width: "100%", height: 900, bgColor: "transparent", child: W.Text({ text: "tall" }) }),
          chips,
        ],
      }),
    );
    ok(chips.offsetHeight >= 49, `collapsed to ${chips.offsetHeight}px, content is ${chips.scrollHeight}px`);
  });

  // The guard on the fix: opting into flex must still win over the default.
  await t("Container: flex:1 still stretches in a column", () => {
    const page = mount(
      W.Container({
        width: "100%",
        height: 400,
        children: [
          W.Container({ width: "100%", height: 100, bgColor: "transparent", child: W.Text({ text: "a" }) }),
          W.Container({ flex: 1, bgColor: "transparent", child: W.Text({ text: "b" }) }),
        ],
      }),
    );
    ok(page.children[1].offsetHeight >= 280, `flex:1 stretched to ${page.children[1].offsetHeight}px`);
  });

  await t("Rating: a fractional score paints a half star", () => {
    const glyphs = (el) =>
      [...el.querySelectorAll("span.material-icons")].map((s) => s.textContent);

    const fourFour = mount(
      W.Rating({ value: 4.4, max: 5, allowHalf: true, readOnly: true }),
    );
    ok(
      glyphs(fourFour).join("|") === "star|star|star|star|star_half",
      `4.4 rendered "${glyphs(fourFour).join("|")}"`,
    );

    const fourNine = mount(
      W.Rating({ value: 4.9, max: 5, allowHalf: true, readOnly: true }),
    );
    ok(
      glyphs(fourNine).join("|") === "star|star|star|star|star",
      `4.9 rendered "${glyphs(fourNine).join("|")}"`,
    );

    const noHalf = mount(
      W.Rating({ value: 4.4, max: 5, allowHalf: false, readOnly: true }),
    );
    ok(
      !glyphs(noHalf).includes("star_half"),
      `allowHalf:false rendered "${glyphs(noHalf).join("|")}"`,
    );
  });

  await t("stackPosition: a false placement shorthand does not apply", () => {
    const off = mount(
      WidgetFactory({
        tag: "div",
        position: "stack",
        full: false,
        fullWidth: false,
        fullHeight: false,
        center: false,
        centerX: false,
        centerY: false,
      }),
    );
    ok(off.style.position === "absolute", `position is "${off.style.position}"`);
    ok(off.style.width !== "100%", `full:false set width "${off.style.width}"`);
    ok(off.style.height !== "100%", `full:false set height "${off.style.height}"`);
    ok(off.style.top === "", `center:false set top "${off.style.top}"`);
    ok(off.style.left === "", `center:false set left "${off.style.left}"`);
    ok(off.style.transform === "", `center:false set transform "${off.style.transform}"`);
  });

  await t("stackPosition: centerX + centerY compose", () => {
    const both = mount(
      WidgetFactory({ tag: "div", position: "stack", centerX: true, centerY: true }),
    );
    ok(
      both.style.transform === "translateX(-50%) translateY(-50%)",
      `centerX+centerY produced "${both.style.transform}"`,
    );
  });

  await t("Inspector: the documented props object returns a widget that shows the dump", () => {
    // The doc page and InspectorProps both describe `Inspector({ widget, indent })`,
    // but the implementation only ever took a node, so the documented call fell
    // through to `String(props)` and painted "[object Object]".
    const node = W.Button({ text: "Save" });
    const view = mount(W.Inspector({ widget: node, indent: 1 }));
    ok(
      view instanceof HTMLElement,
      `Inspector({ widget }) returned ${typeof view}, not an element`,
    );
    const dump = view.textContent || "";
    ok(
      dump.startsWith("Button("),
      `the printout did not name the widget: "${dump.slice(0, 40)}"`,
    );
    ok(
      dump.includes("'Save'"),
      `the printout lost the inspected prop: "${dump.slice(0, 60)}"`,
    );
    // The positional form is what printWidgetCode and inspectWidget call.
    const text = W.Inspector(node);
    ok(
      typeof text === "string" && text.startsWith("Button("),
      `Inspector(node) stopped returning a string: ${String(text).slice(0, 40)}`,
    );
  });

  // ------------------------------------------------------- navigation shells
  await t("Scaffold: a boolean slot value builds instead of throwing", () => {
    // The slots are typed `Widget | boolean` and only `false` was handled, so
    // `appBar: true` fell through to appendChild(true) and threw on the spot.
    for (const cfg of [
      { appBar: true },
      { bottomBar: true },
      { fab: true },
      { appBar: true, bottomBar: true, fab: true },
    ]) {
      const shell = mount(
        Scaffold({ ...cfg, body: W.Text({ text: "body" }) })
      );
      ok(
        shell instanceof HTMLElement,
        `Scaffold(${JSON.stringify(cfg)}) did not build`
      );
      shell._cleanup();
      shell.remove();
    }
    // A slot that is "true" with nothing behind it stays empty; the boolean
    // must not reach the DOM as text.
    const shell = mount(
      Scaffold({ appBar: true, body: W.Text({ text: "body" }) })
    );
    ok(
      !shell.textContent.includes("true"),
      `a boolean leaked into the DOM: "${shell.textContent}"`
    );
    shell._cleanup();
    shell.remove();
  });

  await t("Tabs: iconPosition puts the icon after, above or below the label", () => {
    // Only "left" had a branch, so every other documented value dropped the
    // icon entirely instead of moving it.
    const read = (pos) => {
      const tabs = mount(
        Tabs({
          tabs: [{ label: "Go", icon: "home" }],
          showIcon: true,
          iconPosition: pos,
          children: [W.Text({ text: "panel" })],
        })
      );
      const inner = tabs.querySelector('[role="tab"]').firstElementChild;
      const shape = {
        icons: inner.querySelectorAll(".material-icons").length,
        order: [...inner.children]
          .map((c) => (c.classList.contains("material-icons") ? "i" : "t"))
          .join(""),
        dir: getComputedStyle(inner).flexDirection,
      };
      tabs._cleanup();
      tabs.remove();
      return shape;
    };
    const left = read("left");
    ok(left.icons === 1 && left.order === "it", `"left" gave ${JSON.stringify(left)}`);
    const right = read("right");
    ok(right.icons === 1 && right.order === "ti", `"right" gave ${JSON.stringify(right)}`);
    const top = read("top");
    ok(
      top.icons === 1 && top.order === "it" && top.dir === "column",
      `"top" gave ${JSON.stringify(top)}`
    );
    const bottom = read("bottom");
    ok(
      bottom.icons === 1 && bottom.order === "ti" && bottom.dir === "column",
      `"bottom" gave ${JSON.stringify(bottom)}`
    );
  });

  await t("DrawerItem: onSelect marks the transition, onPress every tap", () => {
    // Both callbacks ran on every tap, so a screen that counted "opened"
    // counted one per tap while its own doc page promised the first only.
    const seen = [];
    const item = mount(
      DrawerItem({
        label: "Notifications",
        closeOnPress: false,
        onSelect: () => seen.push("select"),
        onPress: () => seen.push("press"),
      })
    );
    item.click();
    item.click();
    item.click();
    const selects = seen.filter((s) => s === "select").length;
    const presses = seen.filter((s) => s === "press").length;
    ok(
      selects === 1,
      `onSelect fired ${selects} times — it must fire once, when the item becomes selected`
    );
    ok(presses === 3, `onPress fired ${presses} times — it must fire on every tap`);
    ok(
      seen.join(",") === "select,press,press,press",
      `unexpected order: ${seen.join(",")}`
    );
    item._cleanup();
    item.remove();
  });

  await t("CollapsibleSideBar: the toggle repaints width, chevron and content", async () => {
    // toggle() only wrote the persisted state, so the bar kept the width, the
    // glyph and the content opacity it was built with: it never collapsed.
    const bar = mount(
      CollapsibleSideBar({
        children: W.Text({ text: "nav" }),
        id: "collapse-guard",
        widthExpanded: 200,
        widthCollapsed: 60,
      })
    );
    const toggle = bar.firstElementChild;
    const content = bar.lastElementChild;
    const shape = () => ({
      width: getComputedStyle(bar).width,
      icon: toggle.textContent.trim(),
      opacity: content.style.opacity,
      pointerEvents: content.style.pointerEvents,
      mounted: bar.contains(content),
    });
    const open = shape();
    ok(
      open.width === "200px" && open.icon === "chevron_left" && open.opacity === "1",
      `initial state: ${JSON.stringify(open)}`
    );
    toggle.click();
    await wait(400);
    const collapsed = shape();
    ok(
      collapsed.width === "60px",
      `the bar did not narrow on toggle: ${collapsed.width}`
    );
    ok(
      collapsed.icon === "chevron_right",
      `the chevron did not flip: ${collapsed.icon}`
    );
    ok(
      collapsed.opacity === "0" && collapsed.pointerEvents === "none",
      `collapsed content stayed interactive: ${JSON.stringify(collapsed)}`
    );
    ok(collapsed.mounted, "collapsing removed the content from the DOM");
    toggle.click();
    await wait(400);
    const again = shape();
    ok(
      again.width === "200px" && again.icon === "chevron_left" && again.opacity === "1",
      `expanding back gave ${JSON.stringify(again)}`
    );
    bar._cleanup();
    bar.remove();
  });

  // --------------------------------------------------------------------- AdMob
  // `autoShow` is the mount switch. It used to sit inside showBanner() itself,
  // so autoShow:false silenced the manual container.show() too and a banner
  // saved for a paywall moment could never be asked for.
  await t("AdMob: autoShow:false silences the mount, not the manual show()", async () => {
    const calls = [];
    const plugin = {
      initialize: () => {
        calls.push("initialize");
        return Promise.resolve();
      },
      showBanner: (options) => {
        calls.push(`showBanner:${options.position}:${options.adId}`);
        return Promise.resolve();
      },
      removeBanner: () => {
        calls.push("removeBanner");
        return Promise.resolve();
      },
    };
    const node = mount(
      W.AdMob({ plugin, autoInitialize: true, autoShow: false, position: "top" }),
    );
    await wait(30);
    ok(calls.length === 0, `autoShow:false still asked the plugin on mount (${calls.join(", ")})`);
    await node.show();
    ok(
      calls.includes("showBanner:TOP_CENTER:ca-app-pub-3940256099942544/6300978111"),
      `show() never reached the plugin (${calls.join(", ") || "no calls"})`,
    );
    await node.hide();
    ok(calls.includes("removeBanner"), "hide() did not remove the banner");
    node.remove();
  });

  // ---------------------------------------------------------- breakpoints
  // The responsive vocabulary is one table, and the guard is that the table is
  // the ONLY answer: the same widths must drive `pick`, `atLeast` and the
  // `AdaptiveScaffold` drawer, or an app gets two layouts at the same width.
  await t("breakpointForWidth: the table is the widths, not the names", () => {
    const edges = [
      [0, "xs"], [559, "xs"], [560, "sm"], [767, "sm"],
      [768, "md"], [1023, "md"], [1024, "lg"], [1279, "lg"],
      [1280, "xl"], [4096, "xl"], [-100, "xs"],
    ];
    for (const [px, name] of edges) {
      ok(
        breakpointForWidth(px) === name,
        `breakpointForWidth(${px}) is "${breakpointForWidth(px)}", expected "${name}"`,
      );
    }
    ok(BREAKPOINT_NAMES.join() === "xs,sm,md,lg,xl", "the names are out of width order");
    ok(BREAKPOINTS.md === 768, "`md` moved off the 768 line AdaptiveScaffold has always used");
  });

  await t("pick: an unnamed step inherits the nearest smaller one", () => {
    const values = { xs: 8, md: 16 };
    const cases = [[0, 8], [560, 8], [768, 16], [1024, 16], [1280, 16]];
    for (const [px, want] of cases) {
      withWidth(px, () => {
        const got = pick(values, "fallback");
        ok(got === want, `at ${px}px pick gave ${got}, expected ${want}`);
      });
    }
    // Nothing named below the viewport answers with the fallback, not `undefined`
    // by accident of a missing key.
    withWidth(0, () => ok(pick({}, "fallback") === "fallback", "empty table ignored the fallback"));
  });

  await t("atLeast: a step asks for its own width, and an unknown name is free", () => {
    withWidth(767, () => {
      ok(atLeast("sm") === true, "767 is not at least sm");
      ok(atLeast("md") === false, "767 answered md as reached");
    });
    withWidth(768, () => ok(atLeast("md") === true, "768 did not reach md"));
    withWidth(100, () => ok(atLeast("huge") === true, "an unknown name must not block a layout"));
  });

  await t("onBreakpointChange: one call per crossing, none per pixel", async () => {
    const seen = [];
    let unsubscribe;
    withWidth(700, () => {
      // The remembered baseline is built inside the first subscription, so the
      // crossing below is measured from a known step.
      unsubscribe = onBreakpointChange((name) => seen.push(name));
      window.dispatchEvent(new Event("resize"));
      ok(seen.length === 0, "a resize that stayed in the step fired a listener");
      withWidth(800, () => window.dispatchEvent(new Event("resize")));
      ok(seen.length === 1, `one crossing fired ${seen.length} times (expected 1)`);
      ok(seen[0] === "md", `the crossing reported "${seen[0]}", expected "md"`);
      withWidth(1300, () => window.dispatchEvent(new Event("resize")));
      ok(seen.length === 2, `the second crossing fired ${seen.length - 1} times`);
      unsubscribe();
      withWidth(800, () => window.dispatchEvent(new Event("resize")));
      ok(seen.length === 2, "an unsubscribed listener still heard the crossing");
    });
  });

  await t("AdaptiveScaffold: its drawer line IS BREAKPOINTS.md", () => {
    // `CollapsibleSideBar` declares no `widgetName`, so the sidebar is found by
    // the one style nothing else in the shell writes: the width transition the
    // collapse animates through.
    const hasSidebar = (el) =>
      [...el.querySelectorAll("*")].some((n) => (n.style.transition || "").includes("width"));
    // A mobile shell appends its Drawer to `document.body`, so anything the two
    // builds add has to go back off when the assertion is done.
    const before = new Set(document.body.children);
    const nav = () => [W.Text({ text: "Home" })];
    try {
      withWidth(767, () => {
        const shell = AdaptiveScaffold({ body: W.Text({ text: "b" }), leftNavBar: nav() });
        ok(
          !hasSidebar(shell),
          "a 767px viewport got the desktop sidebar instead of the drawer",
        );
      });
      withWidth(768, () => {
        const shell = AdaptiveScaffold({ body: W.Text({ text: "b" }), leftNavBar: nav() });
        ok(hasSidebar(shell), "a 768px viewport still got the mobile drawer");
      });
    } finally {
      for (const node of [...document.body.children]) {
        if (!before.has(node)) node.remove();
      }
    }
  });

  await t("loadFont: a face that cannot be had resolves false, never hangs", async () => {
    const settled = await Promise.race([
      loadFont("FbMissingFamily", { url: "/tests/fixtures/no-such-stylesheet.css" }),
      wait(4000).then(() => "hung"),
    ]);
    ok(settled === false, `a dead stylesheet resolved ${settled}, expected false`);
    ok(await fontsReady() === true, "fontsReady() did not settle in the browser");
  });

  await t("Skeleton: a documented shimmerColor paints the wave band", async () => {
    const band = (props) => {
      const root = mount(W.Skeleton({ animation: "wave", ...props }));
      const painted = getComputedStyle(root.firstElementChild).backgroundImage;
      root.remove();
      return painted;
    };
    ok(
      band({ shimmerColor: "#ff0000" }).includes("rgb(255, 0, 0)"),
      "shimmerColor never reached the gradient",
    );
    ok(
      band({ highlightColor: "#00ff00" }).includes("rgb(0, 255, 0)"),
      "highlightColor stopped painting the band",
    );
    const both = band({ highlightColor: "#00ff00", shimmerColor: "#0000ff" });
    ok(
      both.includes("rgb(0, 0, 255)") && !both.includes("rgb(0, 255, 0)"),
      "shimmerColor did not win over highlightColor",
    );
  });

  await t("Input: an iOS field is never under 16px, which is what zoomed the page", async () => {
    const html = document.documentElement;
    const hadMarker = html.hasAttribute("data-fb-ios");
    const savedRootFont = html.style.fontSize;
    try {
      // The floor: 14 → 16 and 12 → 16, a field already at 16 untouched, and a
      // raised root font still lifts the field above the floor instead of being
      // replaced by it (medium is 0.875rem, not a flat 16px).
      const fieldPx = (size, rootPx) => {
        if (rootPx) html.style.fontSize = `${rootPx}px`;
        const root = mount(W.Input({ label: "Email", size }));
        const px = parseFloat(getComputedStyle(root.querySelector("input")).fontSize);
        root.remove();
        html.style.fontSize = savedRootFont;
        return px;
      };

      html.setAttribute("data-fb-ios", "");
      ok(fieldPx() === 16, "a medium field stayed under the 16px threshold iOS zooms at");
      ok(
        document.getElementById("fletbox-field-font"),
        "creating a widget did not inject the field-font rule",
      );
      ok(fieldPx("small") === 16, "a small field stayed under the 16px threshold iOS zooms at");
      ok(fieldPx("large") === 16, "a large field lost its own size to the floor");
      ok(fieldPx(undefined, 20) === 17.5, "the floor replaced the design size instead of bounding it");
      ok(
        document.querySelectorAll("#fletbox-field-font").length === 1,
        "the field-font stylesheet was injected more than once",
      );

      html.removeAttribute("data-fb-ios");
      ok(fieldPx() === 14, "the iOS floor leaked onto a platform that does not need it");

      // The detector: iPhone, iPadOS masquerading as a Mac, and both negatives.
      ok(
        looksLikeIOS("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "iPhone", 5),
        "an iPhone was not read as iOS",
      );
      ok(
        looksLikeIOS("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", 5),
        "iPadOS (desktop UA + touch points) was not read as iOS",
      );
      ok(
        !looksLikeIOS("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", 0),
        "a desktop Mac was read as iOS",
      );
      ok(
        !looksLikeIOS("Mozilla/5.0 (Linux; Android 14; Pixel 8)", "Linux armv8l", 5),
        "Android was read as iOS",
      );

      // The engine marks the document when the navigator says iOS.
      const hadUa = Object.getOwnPropertyDescriptor(navigator, "userAgent");
      Object.defineProperty(navigator, "userAgent", {
        configurable: true,
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      });
      try {
        ensureFieldFont();
        ok(html.hasAttribute("data-fb-ios"), "the engine did not mark the document as iOS");
      } finally {
        if (hadUa) Object.defineProperty(navigator, "userAgent", hadUa);
        else delete navigator.userAgent;
      }
    } finally {
      html.style.fontSize = savedRootFont;
      if (!hadMarker) html.removeAttribute("data-fb-ios");
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
