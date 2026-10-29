// tests/errorboundary.test.js
// The error boundary: a widget that throws must not take the screen with it.
//
// Before this, a throw inside a widget travelled straight out of the factory,
// out of the component and out of `runApp`, and the root stayed empty — a
// blank page with one red line in the console. The person saw nothing; the
// developer saw a stack trace with no hint of which widget was on screen.
//
// It publishes `window.__ERRORBOUNDARY = { pass, fail, results }`.
import { Button, Container, Text } from "../src/widgets/index.js";
import { runApp } from "../src/core/index.js";
import { WidgetFactory } from "../src/widget-factory/index.js";
import { colors } from "../src/utils/themes.js";
import { FAILURE_ATTR, getLastFailure } from "../src/utils/errorBoundary.js";

const results = [];
const record = (name, ok, detail) => results.push({ name, ok, detail });

/** `#fef2f2` → `rgb(254, 242, 242)`, so a computed style can be compared. */
const rgb = (hex) => {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const n = parseInt(full, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const run = async () => {
  // ============================================================
  // 1. A WIDGET THAT FAILS TO BUILD
  // ============================================================
  // `child` that is not a node is the ordinary mistake: `items[0]` was an
  // object, not a widget. It throws inside `addChildren`, in the factory.
  const broken = Container({ child: { not: "a node" } });
  const placeholder = broken.querySelector('[role="alert"]');

  record(
    "a widget that fails to build is marked",
    broken.getAttribute(FAILURE_ATTR) === "render",
    broken.getAttribute(FAILURE_ATTR) || "no marker",
  );
  record(
    "a widget that fails to build paints a placeholder",
    Boolean(placeholder),
    placeholder ? "" : "no placeholder was painted",
  );
  record(
    "the placeholder is announced to a screen reader",
    placeholder?.getAttribute("role") === "alert",
    placeholder?.getAttribute("role") || "no role",
  );
  record(
    "the placeholder names the widget that failed",
    (placeholder?.textContent || "").includes("Container"),
    placeholder?.textContent || "",
  );
  record(
    "the placeholder carries the error message",
    (placeholder?.textContent || "").length > "Container could not be rendered".length,
    placeholder?.textContent || "",
  );

  // ============================================================
  // 2. THE REST OF THE SCREEN SURVIVES
  // ============================================================
  const sibling = Text({ text: "still here" });
  const parent = Container({ children: [broken, sibling] });
  document.body.appendChild(parent);

  record(
    "a sibling widget still renders next to the broken one",
    sibling.textContent === "still here" && parent.contains(sibling),
    sibling.textContent,
  );
  record(
    "the broken widget keeps its place in the tree",
    parent.contains(broken) && broken.querySelector('[role="alert"]') !== null,
    "the placeholder is inside the widget",
  );

  // ============================================================
  // 3. THE PLACEOLDER IS PAINTED WITH THE THEME, NOT WITH A HEX
  // ============================================================
  const computed = placeholder ? getComputedStyle(placeholder) : null;
  record(
    "the placeholder paints the theme's error tint",
    computed?.backgroundColor === rgb(colors.errorBg),
    `${computed?.backgroundColor} vs ${rgb(colors.errorBg)}`,
  );
  record(
    "the placeholder writes the page's ink, not the red",
    computed?.color === rgb(colors.text),
    `${computed?.color} vs ${rgb(colors.text)}`,
  );
  record(
    "the placeholder's font size is a framework unit",
    computed?.fontSize === "14px",
    computed?.fontSize || "",
  );

  // ============================================================
  // 4. A FAILED UPDATE KEEPS WHAT WAS ALREADY ON SCREEN
  // ============================================================
  const stable = Container({ child: Text({ text: "before" }) });
  document.body.appendChild(stable);
  stable.update({ child: { still: "not a node" } });

  record(
    "a failed update keeps the content the widget had",
    stable.textContent.includes("before"),
    stable.textContent,
  );
  record(
    "a failed update marks the widget",
    stable.getAttribute(FAILURE_ATTR) === "update",
    stable.getAttribute(FAILURE_ATTR) || "no marker",
  );

  // A later, good update clears the failure and puts the content back.
  stable.update({ child: Text({ text: "after" }) });
  record(
    "a good update clears the failure and restores the content",
    stable.getAttribute(FAILURE_ATTR) === null && stable.textContent.includes("after"),
    `${stable.getAttribute(FAILURE_ATTR)} · ${stable.textContent}`,
  );

  // ============================================================
  // 5. A HANDLER THAT THROWS IS CAUGHT AND NAMED
  // ============================================================
  const button = Button({
    text: "boom",
    onPress: () => {
      throw new Error("the handler exploded");
    },
  });
  document.body.appendChild(button);
  button.click();

  const handlerFailure = getLastFailure();
  record(
    "a handler that throws is caught",
    handlerFailure?.message === "the handler exploded",
    handlerFailure?.message || "nothing was reported",
  );
  record(
    "the report names the widget that owns the handler",
    handlerFailure?.widgetName === "Button",
    handlerFailure?.widgetName || "no widget name",
  );
  record(
    "the report says which handler failed",
    handlerFailure?.phase === "handler" && handlerFailure?.event === "click",
    `${handlerFailure?.phase} · ${handlerFailure?.event}`,
  );
  record(
    "the widget is still on screen after its handler threw",
    document.body.contains(button),
    "the button was removed",
  );

  // ============================================================
  // 6. THE APP RENDER THAT THROWS PAINTS THE ROOT
  // ============================================================
  const root = document.getElementById("root");
  runApp(() => {
    throw new Error("the component exploded");
  }, "root");

  const appPlaceholder = root.querySelector('[role="alert"]');
  record(
    "a component that throws paints the root instead of leaving it blank",
    Boolean(appPlaceholder) && root.children.length > 0,
    `${root.children.length} child(ren) in the root`,
  );
  record(
    "the root's placeholder carries the message",
    (appPlaceholder?.textContent || "").includes("the component exploded"),
    appPlaceholder?.textContent || "",
  );

  // ============================================================
  // 7. THE ERRORS NO WIDGET OWNS
  // ============================================================
  window.dispatchEvent(
    new ErrorEvent("error", {
      error: new Error("nobody owned this"),
      filename: "app.js",
      lineno: 12,
      message: "nobody owned this",
    }),
  );
  const globalFailure = getLastFailure();
  record(
    "an error no widget owns is reported with its source",
    globalFailure?.phase === "global" && globalFailure?.source === "app.js:12",
    `${globalFailure?.phase} · ${globalFailure?.source}`,
  );

  // A rejected promise never reaches a widget either. The event arrives on a
  // later task — and inside a module with a top-level await, Chrome delivers
  // it *after* this function resumes — so the harness waits for the event
  // itself instead of guessing when it lands.
  const rejectionSeen = new Promise((resolve) => {
    window.addEventListener("unhandledrejection", () => resolve(), { once: true });
  });
  Promise.reject(new Error("the promise gave up"));
  await Promise.race([
    rejectionSeen,
    new Promise((resolve) => setTimeout(resolve, 100)),
  ]);
  const rejection = getLastFailure();
  record(
    "a rejected promise is reported",
    rejection?.phase === "rejection" && rejection?.message === "the promise gave up",
    `${rejection?.phase} · ${rejection?.message}`,
  );

  // ============================================================
  // 8. THE BOUNDARY DOES NOT SWALLOW THE ERROR
  // ============================================================
  // A handler that throws must not reach the page as an uncaught exception:
  // the report is the point, and a broken handler is not a broken page.
  let escaped = false;
  try {
    WidgetFactory("div", {
      widgetName: "Escaped",
      child: { not: "a node" },
    });
  } catch (error) {
    escaped = true;
  }
  record(
    "the factory does not rethrow what it caught",
    escaped === false,
    "the error escaped the factory",
  );

  window.__ERRORBOUNDARY = {
    pass: results.filter((r) => r.ok).length,
    fail: results.filter((r) => !r.ok).length,
    total: results.length,
    results,
  };

  const summary = document.getElementById("summary");
  if (summary) {
    summary.textContent = `ERROR BOUNDARY: ${window.__ERRORBOUNDARY.pass}/${window.__ERRORBOUNDARY.total} OK${
      window.__ERRORBOUNDARY.fail ? ` — ${window.__ERRORBOUNDARY.fail} FAILED` : ""
    }`;
    summary.style.color = window.__ERRORBOUNDARY.fail ? "#ff6b6b" : "#4ec9b0";
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
  console.log("[flet-box error boundary]", window.__ERRORBOUNDARY);
};

await run();
