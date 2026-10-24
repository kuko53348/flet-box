// tests/motion.test.js
// Contract for the motion engine: the named transitions, the curve table, the
// transform that several loops share, the reduced-motion preference, and the two
// rules the animation API is built on — a step's own timing, and a bare number
// being a framework unit.
//
// Every assertion below FAILED before its fix:
//   - `animate(el, 'translateY', …)` wrote a JS field, not a CSS transform, so the
//     element never moved and the loop still reported success;
//   - two loops on one element overwrote each other's whole `transform` string;
//   - the imperative engine knew four curves;
//   - `prefers-reduced-motion` changed nothing anywhere in the framework;
//   - `AnimatedBox` read `duration`/`delay`/`loop` off whichever descriptor came
//     first, and a numeric `delay` made the whole `animation` shorthand invalid,
//     so the element simply did not animate;
//   - `animate()` turned `rgb()`/`rgba()` into `"NaNpx"`, which the browser drops.
// Eleven of these were proven red against the previous source tree. Four more do
// not fail there and are named for what they are: the guard marked "drift" keeps
// the sync and the awaitable form of a preset meaning the same gesture, the
// `AnimatedText` and CSS-time guards pass today and are here because they each
// caught a bug in the rewrite itself (a stagger written as `"0.1s"` was read as
// `0.1ms`), and the `pulse()` parity guard documents the swell the async form now
// shares.
//
// It publishes `window.__MOTION = { pass, fail, results }`.
import {
  animate,
  animateAsync,
  animateSpring,
  animateSpringAsync,
  stopAnimation,
  fadeOut,
  pulse,
  pulseAsync,
  slideIn,
  slideInAsync,
  slideOutAsync,
  popIn,
  popInAsync,
  shake,
  shakeAsync,
  EASING_NAMES,
  cubicBezier,
  spring,
  stagger,
  prefersReducedMotion,
  getMotionMode,
  setMotionMode,
  onMotionModeChange,
  motionDuration,
} from "../src/animations/index.js";
import { EASINGS, resolveEasing } from "../src/animations/easings.js";
import { AnimatedBox } from "../src/animations/AnimatedBox.js";
import { AnimatedText } from "../src/animations/AnimatedText.js";
import { ParallaxBox } from "../src/animations/ParallaxBox.js";
import { setBaseFontSize } from "../src/utils/units.js";

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
    results.push({ name, ok: false, detail: error.message });
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/** Awaits `count` animation frames, so a loop has visibly advanced. */
const frames = async (count) => {
  for (let i = 0; i < count; i++) await frame();
};

/** The test element, mounted fresh for one assertion. */
const mount = (styles = {}) => {
  const el = document.createElement("div");
  Object.assign(el.style, { width: "40px", height: "40px", ...styles });
  document.body.appendChild(el);
  return el;
};

/** Translated offset the browser actually applied, in px. */
const translation = (el) => {
  const value = getComputedStyle(el).transform;
  if (!value || value === "none") return { x: 0, y: 0 };
  const matrix = new DOMMatrixReadOnly(value);
  return { x: matrix.e, y: matrix.f };
};

const scaleOf = (el) => {
  const value = getComputedStyle(el).transform;
  if (!value || value === "none") return 1;
  return new DOMMatrixReadOnly(value).a;
};

/**
 * The rule a widget is actually running: its name and the `@keyframes` text the
 * engine injected for it. Chrome serializes the `animation` shorthand with the
 * name last, so that is where it is read from.
 */
const ruleOf = (child) => {
  const parts = (child.style.animation || "").trim().split(/\s+/);
  const name = parts[parts.length - 1];
  const sheet = [...document.head.querySelectorAll("style")].find((style) =>
    style.textContent.includes(`@keyframes ${name} {`),
  );
  return { name, body: sheet ? sheet.textContent : "", sheet };
};

/** One frame of a generated rule, exactly as the engine wrote it. */
const frameOf = (body, percent) => {
  const match = body.match(new RegExp(`(?:^|[\\n{])\\s*${percent}% \\{([^}]*)\\}`));
  return match ? match[1] : "";
};

/** The number inside the first `function(value)` of a frame, or `null`. */
const numberIn = (text, name) => {
  const match = text.match(new RegExp(`${name}\\((-?[\\d.]+)`));
  return match ? Number(match[1]) : null;
};

/** The time values (ms) a serialized `animation` shorthand carries. */
const timesOf = (child) =>
  (child.style.animation.match(
    /(?:^|[\s,])(\d+(?:\.\d+)?(?:ms|s))(?=[\s,]|$)/g,
  ) || []).map((token) => {
    const value = Number(token.trim().replace(/m?s$/, ""));
    return token.trim().endsWith("ms") ? value : value * 1000;
  });

/** Removes the element and stops anything still animating it. */
const unmount = (el) => {
  stopAnimation(el);
  el.remove();
};

// A tall body so a scroll-driven parallax has somewhere to go.
document.body.style.minHeight = "3000px";

// ========== THE TRANSFORM THE ENGINE WRITES ==========

await t("animate() moves an element on the Y axis", async () => {
  const el = mount();
  animate(el, "translateY", 24, 0, 120, "easeOut");
  await frames(2);
  const mid = translation(el);
  assert(mid.y > 0 && mid.y < 24, `translateY never painted: transform=${getComputedStyle(el).transform}`);
  await frames(12);
  assert(Math.abs(translation(el).y) < 1.5, `did not settle at 0: ${translation(el).y}`);
  unmount(el);
});

await t("two loops on one element share one transform", async () => {
  const el = mount();
  animate(el, "translateY", 20, 0, 140, "easeOut");
  animate(el, "scale", 0.9, 1, 140, "easeOut");
  await frames(2);
  const inline = el.style.transform;
  assert(
    inline.includes("translateY(") && inline.includes("scale("),
    `the second loop replaced the first: ${inline}`,
  );
  assert(translation(el).y > 0, `translateY is not in the applied transform: ${getComputedStyle(el).transform}`);
  await frames(12);
  assert(Math.abs(scaleOf(el) - 1) < 0.02, `scale did not settle: ${scaleOf(el)}`);
  unmount(el);
});

await t("a rotation and a slide compose in CSS order", async () => {
  const el = mount();
  animate(el, "rotate", 0, 90, 60, "linear");
  animate(el, "translateX", 0, 10, 60, "linear");
  await frames(8);
  assert(/translateX\([^)]+\)\s*rotate\(/.test(el.style.transform), `order wrong: ${el.style.transform}`);
  unmount(el);
});

// ========== THE CURVE TABLE ==========

await t("every named curve is a curve", () => {
  assert(EASING_NAMES.length > 4, `the table is still short: ${EASING_NAMES.length}`);
  for (const name of EASING_NAMES) {
    const curve = EASINGS[name];
    assert(typeof curve === "function", `${name} is a name with no curve behind it`);
    assert(Math.abs(curve(0)) < 1e-9, `${name} does not start where the element is`);
    assert(Math.abs(curve(1) - 1) < 1e-6, `${name} does not end at the target`);
    assert(Number.isFinite(curve(0.5)), `${name} is not finite mid-flight`);
  }
  assert(EASING_NAMES.includes("easeOutBack"), "the overshoot family is missing");
  assert(EASING_NAMES.includes("emphasizedDecelerate"), "the Material shapes are missing");
  // The shape contract, measured off the same table the engine reads.
  const probe = cubicBezier(0.2, 0, 0, 1);
  assert(probe(0) === 0 && probe(1) === 1, "cubicBezier must pass through both ends");
  const mid = probe(0.5);
  assert(mid > 0.5 && mid < 1, `a decelerating curve must lead linear: ${mid}`);
  const unknown = console.warn;
  let warned = 0;
  console.warn = () => {
    warned++;
  };
  const fallback = resolveEasing("ease-out");
  console.warn = unknown;
  assert(warned === 1, "a CSS name in animate() must be named, not swallowed");
  assert(fallback(0.25) === 0.25, "the fallback is linear, so say so");
});

await t("spring() returns a curve and the duration it needs", () => {
  const loose = spring({ stiffness: 170, damping: 26 });
  assert(loose.duration > 100 && loose.duration < 1500, `settle time off: ${loose.duration}`);
  assert(loose.easing(0) === 0, "a spring starts where the element is");
  assert(Math.abs(loose.easing(1) - 1) < 1e-9, "a spring ends at the target");
  const bouncy = spring({ stiffness: 300, damping: 8 });
  assert(bouncy.overshoot === true, "a lightly damped spring must overshoot");
  const maximum = Math.max(...Array.from({ length: 40 }, (_, i) => bouncy.easing(i / 39)));
  assert(maximum > 1.02, `no overshoot in the curve: ${maximum}`);
  const stiff = spring({ damping: 200 });
  assert(stiff.overshoot === false && stiff.duration <= 2000, `overdamped wrong: ${stiff.duration}`);
});

await t("animateSpring() settles where animate() would have", async () => {
  const el = mount();
  animateSpring(el, "scale", 0.9, 1, { stiffness: 320, damping: 12 });
  await frames(6);
  await animateSpringAsync(el, "scale", 0.9, 1, { stiffness: 320, damping: 20 });
  assert(Math.abs(scaleOf(el) - 1) < 0.01, `spring did not settle: ${scaleOf(el)}`);
  unmount(el);
});

// ========== THE NAMED TRANSITIONS ==========

await t("slideIn() arrives and leaves nothing behind", async () => {
  const el = mount({ opacity: "0" });
  const cancel = slideIn(el, { direction: "up", distance: 24, duration: 120 });
  await frames(2);
  assert(translation(el).y > 1, `never travelled: ${getComputedStyle(el).transform}`);
  await frames(12);
  assert(Math.abs(translation(el).y) < 1.5, `did not land: ${translation(el).y}`);
  assert(el.style.opacity === "1", `still faded: ${el.style.opacity}`);
  assert(cancel() === false, "a finished gesture should report nothing to cancel");
  unmount(el);
});

await t("slideIn({ direction }) picks the axis the words mean", async () => {
  const leftward = mount();
  slideIn(leftward, { direction: "left", distance: 20, duration: 40, fade: false });
  await frames(1);
  assert(translation(leftward).x > 0, `entering while travelling left must start right: ${leftward.style.transform}`);
  const upward = mount();
  slideIn(upward, { direction: "up", distance: 20, duration: 40, fade: false });
  await frames(1);
  assert(translation(upward).y > 0, `entering while travelling up must start below: ${upward.style.transform}`);
  unmount(leftward);
  unmount(upward);
});

await t("slideOutAsync() resolves after the exit", async () => {
  const el = mount();
  await slideOutAsync(el, { direction: "down", distance: 16, duration: 120 });
  assert(el.style.opacity === "0", `still visible: ${el.style.opacity}`);
  assert(translation(el).y > 8, `did not leave: ${translation(el).y}`);
  unmount(el);
});

await t("popIn() overshoots and settles at 1", async () => {
  const el = mount();
  let peak = 0;
  const watch = setInterval(() => {
    peak = Math.max(peak, scaleOf(el));
  }, 8);
  await popInAsync(el, { from: 0.94, duration: 160 });
  clearInterval(watch);
  assert(Math.abs(scaleOf(el) - 1) < 0.02, `did not settle: ${scaleOf(el)}`);
  assert(peak > 1, `an entrance with no overshoot is not popIn: ${peak}`);
  unmount(el);
});

await t("shake() ends at rest", async () => {
  const el = mount();
  let moved = 0;
  const watch = setInterval(() => {
    moved = Math.max(moved, Math.abs(translation(el).x));
  }, 8);
  await shakeAsync(el, { axis: "x", distance: 8, cycles: 3, duration: 160 });
  clearInterval(watch);
  assert(moved > 1, `the element never moved: ${moved}`);
  assert(Math.abs(translation(el).x) < 0.6, `left off its column: ${translation(el).x}`);
  unmount(el);
});

await t("a gesture replaces the animation on the same property", async () => {
  const el = mount();
  animate(el, "translateY", 0, 100, 200, "linear");
  slideIn(el, { direction: "up", distance: 20, duration: 40, fade: false });
  await frames(10);
  assert(translation(el).y < 5, `the first loop is still writing: ${translation(el).y}`);
  unmount(el);
});

// ========== CHOREOGRAPHY ==========

await t("stagger() grows and then stops growing", () => {
  assert(stagger(0, { step: 60 }) === 0, "the first item is not late");
  assert(stagger(3, { step: 60, max: 8 }) === 180, `wrong step: ${stagger(3, { step: 60, max: 8 })}`);
  assert(stagger(20, { step: 60, max: 8 }) === 480, "a 20-row entrance must be capped");
  assert(stagger(-2, { step: 60 }) === 0, "a negative index cannot buy negative delay");
});

// ========== REDUCED MOTION ==========

await t("the mode is a preference, not a guess", async () => {
  assert(getMotionMode() === "auto", `fresh mode: ${getMotionMode()}`);
  assert(prefersReducedMotion() === false, "the harness machine animates by default");
  let seen = null;
  const off = onMotionModeChange((reduced) => {
    seen = reduced;
  });
  setMotionMode("reduce");
  assert(getMotionMode() === "reduce", "the mode did not stick");
  assert(seen === true, "the listener never heard about it");
  assert(prefersReducedMotion() === true, "prefersReducedMotion ignored the mode");
  assert(motionDuration(240) === 0, `reduce must buy no time: ${motionDuration(240)}`);
  setMotionMode("auto");
  assert(motionDuration(240) === 240, `auto must keep the duration: ${motionDuration(240)}`);
  setMotionMode("full");
  assert(motionDuration(240) === 240, "full always animates");
  off();
  setMotionMode("auto");
  seen = null;
  const late = onMotionModeChange(() => {
    seen = "again";
  });
  setMotionMode("auto");
  assert(seen === null, "an unsubscribed listener must not fire");
  late();
});

await t("an unknown mode is refused, not applied", () => {
  const warning = console.warn;
  let logged = 0;
  console.warn = () => {
    logged++;
  };
  const before = getMotionMode();
  setMotionMode("everything");
  console.warn = warning;
  assert(getMotionMode() === before, `a typo changed the mode: ${getMotionMode()}`);
  assert(logged === 1, "refusing silently is the bug this guards");
});

await t("reduced motion runs one frame that writes the end value", async () => {
  setMotionMode("reduce");
  const el = mount({ opacity: "0.2" });
  const started = performance.now();
  await animateAsync(el, "opacity", 0.2, 1, 800);
  const elapsed = performance.now() - started;
  assert(el.style.opacity === "1", `the state did not land: ${el.style.opacity}`);
  assert(elapsed < 400, `it still waited for the duration: ${Math.round(elapsed)}ms`);
  unmount(el);
  setMotionMode("auto");
});

await t("reduced motion still moves the element to where it belongs", async () => {
  setMotionMode("reduce");
  const el = mount({ opacity: "0" });
  await slideInAsync(el, { direction: "up", distance: 24, duration: 300 });
  assert(el.style.opacity === "1", `slideIn left it invisible: ${el.style.opacity}`);
  assert(translation(el).y === 0, `it parked off place: ${translation(el).y}`);
  const field = mount();
  await shakeAsync(field, { axis: "x", distance: 8 });
  assert(translation(field).x === 0, `a reduce shake must not displace: ${translation(field).x}`);
  unmount(el);
  unmount(field);
  setMotionMode("auto");
});

await t("AnimatedBox stops looping and holds its end state", () => {
  const child = document.createElement("div");
  document.body.appendChild(child);
  AnimatedBox({
    animations: [
      { effect: "opacity", from: 0, to: 1, duration: 500, loop: true },
      { effect: "translateY", from: 24, to: 0, duration: 500 },
    ],
    delay: "1s",
    child,
  });
  const running = child.style.animation;
  assert(running.includes("500ms"), `duration wrong while motion is allowed: ${running}`);
  assert(running.includes("infinite"), `a loop the reader allowed stopped: ${running}`);

  setMotionMode("reduce");
  const held = document.createElement("div");
  document.body.appendChild(held);
  AnimatedBox({
    animations: [
      { effect: "opacity", from: 0, to: 1, duration: 500, loop: true },
      { effect: "translateY", from: 24, to: 0, duration: 500 },
    ],
    delay: "1s",
    child: held,
  });
  const reduced = held.style.animation;
  assert(reduced.includes("0.01ms"), `keyframes still run at length: ${reduced}`);
  assert(!reduced.includes("infinite"), `a loop survived reduced motion: ${reduced}`);
  assert(!reduced.includes("1s"), `content held invisible for a delay: ${reduced}`);
  setMotionMode("auto");
  child.remove();
  held.remove();
});

// The OS preference can flip after mount, and the JS values above are read once
// at build time. A live loop is answered by a media rule the browser owns.
await t("AnimatedBox carries the OS preference rule", () => {
  const loop = document.createElement("div");
  document.body.appendChild(loop);
  AnimatedBox({
    animations: [{ effect: "rotate", from: 0, to: 360, duration: 1000, loop: true }],
    child: loop,
  });
  const rule = document.getElementById("fletbox-reduced-motion");
  assert(rule !== null, "no CSS answers prefers-reduced-motion after mount");
  assert(
    loop.getAttribute("data-fb-anim") !== null,
    "the animated element carries no hook, so the rule can never reach it",
  );
  const text = rule.textContent;
  assert(text.includes("@media (prefers-reduced-motion: reduce)"), `not a media rule: ${text}`);
  assert(text.includes("[data-fb-anim]"), `wrong selector: ${text}`);
  for (const declaration of [
    "animation-duration: 0.01ms !important",
    "animation-delay: 0s !important",
    "animation-iteration-count: 1 !important",
  ]) {
    assert(text.includes(declaration), `the recipe is missing ${declaration}`);
  }
  // The selector must actually match the element the engine animated — a hook
  // name that drifts from the attribute silently un-guards every loop.
  assert(loop.matches("[data-fb-anim]") === true, "the rule's selector does not reach the animated element");
  const injected = [...document.querySelectorAll("#fletbox-reduced-motion")].length;
  assert(injected === 1, `the rule was injected ${injected} times`);
  loop.remove();
});

await t("ParallaxBox parks when the reader asked for no movement", async () => {
  const box = ParallaxBox({ type: "scroll", speed: 0.5, direction: "vertical", maxOffset: 60, child: mount() });
  document.body.appendChild(box);
  const inner = box.firstElementChild;

  setMotionMode("full");
  window.scrollTo(0, 400);
  await frames(4);
  const moved = Math.abs(new DOMMatrixReadOnly(getComputedStyle(inner).transform || "none").f);
  assert(moved > 1, `the harness cannot prove parallax moves: ${moved}`);

  setMotionMode("reduce");
  window.scrollTo(0, 900);
  await frames(4);
  const parked = new DOMMatrixReadOnly(getComputedStyle(inner).transform || "none").f;
  assert(Math.abs(parked) < 0.01, `it kept moving under reduce: ${parked}`);

  setMotionMode("auto");
  window.scrollTo(0, 0);
  box._cleanup?.();
  box.remove();
});

// A widget that holds a loop should stop it the moment the preference flips.
await t("a live loop obeys the mode it was started under", async () => {
  const el = mount();
  setMotionMode("full");
  const off = onMotionModeChange((reduced) => {
    if (reduced) stopAnimation(el);
  });
  animate(el, "translateY", 0, 40, 600, "linear");
  await frames(3);
  setMotionMode("reduce");
  off();
  await frames(3);
  const frozen = translation(el).y;
  await frames(6);
  assert(translation(el).y === frozen, "a loop outlived the preference change");
  unmount(el);
  setMotionMode("auto");
});

// A loading loop is the pattern the preference was invented for, and most of
// them are not AnimatedBox — they are widgets writing an `infinite` animation.
await t("a widget loop carries the hook too", async () => {
  const { Skeleton } = await import("../src/widgets/Skeleton.js");
  const { ProgressBar } = await import("../src/widgets/ProgressBar.js");
  const skeleton = Skeleton({ animation: "wave", count: 2 });
  const bar = ProgressBar({ indeterminate: true });
  document.body.appendChild(skeleton);
  document.body.appendChild(bar);
  const marked = [...skeleton.querySelectorAll("[data-fb-anim]")].length;
  assert(marked > 0, "a Skeleton wave is an endless animation with no hook");
  assert(
    bar.querySelector("[data-fb-anim]") !== null,
    "an indeterminate ProgressBar keeps looping outside the rule's reach",
  );
  const { Text } = await import("../src/widgets/Text.js");
  const quiet = Text({ text: "no animation here" });
  document.body.appendChild(quiet);
  assert(
    quiet.matches("[data-fb-anim]") === false,
    "the hook was stamped on an element that animates nothing",
  );
  skeleton.remove();
  bar.remove();
  quiet.remove();
});

// ========== ONE RULE PER STEP, AND ITS OWN CLOCK ==========

// The documented descriptor carries its own `duration`, `delay` and `loop`. When
// those were read off whichever step came first, an entrance ran two steps for
// the length of one, and a numeric delay made the whole shorthand invalid.

await t("a step's duration is its own", () => {
  const el = mount();
  AnimatedBox({
    animations: [
      { effect: "scale", from: 0.5, to: 1, duration: 600 },
      { effect: "opacity", from: 0, to: 1, duration: 400 },
    ],
    child: el,
  });
  assert(el.style.animation.includes("600ms"), `the rule is not the longest step: ${el.style.animation}`);
  const at400ms = frameOf(ruleOf(el).body, 67);
  assert(at400ms.includes("opacity: 1;"), `the 400ms fade was still running: ${at400ms}`);
  const scale = numberIn(at400ms, "scale");
  assert(scale !== null && scale < 0.95, `the 600ms scale finished with the fade: ${scale}`);
  el.remove();
});

await t("a numeric delay still animates", () => {
  const el = mount();
  AnimatedBox({
    animations: [{ effect: "opacity", from: 0, to: 1, duration: 300, delay: 120 }],
    child: el,
  });
  assert(
    el.style.animation !== "",
    `a bare-number delay made the whole shorthand invalid: "${el.style.animation}"`,
  );
  assert(el.style.animation.includes("120ms"), `the delay was lost: ${el.style.animation}`);
  el.remove();
});

await t("a CSS time string means the time it says", () => {
  const el = mount();
  AnimatedBox({
    animations: [{ effect: "opacity", from: 0, to: 1, duration: "0.5s", delay: "200ms" }],
    child: el,
  });
  const list = timesOf(el);
  assert(list.includes(500), `"0.5s" is five hundred milliseconds, not half: ${el.style.animation}`);
  assert(list.includes(200), `"200ms" lost its unit: ${el.style.animation}`);
  el.remove();
});

await t("every step starts where it says", () => {
  const el = mount();
  AnimatedBox({
    animations: [
      { effect: "scale", from: 0.5, to: 1, duration: 200 },
      { effect: "opacity", from: 0, to: 1, duration: 200, delay: 400 },
    ],
    child: el,
  });
  assert(
    el.style.opacity === "0",
    `a later step showed its END value before it began: opacity=${el.style.opacity}`,
  );
  assert(el.style.transform.includes("scale(0.5)"), `the transform start is missing: ${el.style.transform}`);
  el.remove();
});

await t("a loop and an entrance get one rule each", () => {
  const warn = console.warn;
  let warned = 0;
  console.warn = () => {
    warned++;
  };
  const el = mount();
  AnimatedBox({
    animations: [
      { effect: "rotate", from: 0, to: 360, duration: 500, loop: true },
      { effect: "opacity", from: 0, to: 1, duration: 500 },
    ],
    child: el,
  });
  console.warn = warn;
  const parts = el.style.animation.split(", ");
  assert(parts.length === 2, `one rule carries both timings, so the entrance repeats: ${el.style.animation}`);
  assert(
    parts.filter((part) => part.includes("infinite")).length === 1,
    `the loop leaked onto the one-shot: ${el.style.animation}`,
  );
  assert(warned === 0, `a clean split warned ${warned} times`);
  el.remove();
});

await t("splitting a transform across two rules is named", () => {
  const warn = console.warn;
  let message = "";
  console.warn = (text) => {
    message = String(text);
  };
  const el = mount();
  AnimatedBox({
    animations: [
      { effect: "rotate", from: 0, to: 360, duration: 500, loop: true },
      { effect: "translateY", from: 20, to: 0, duration: 500 },
    ],
    child: el,
  });
  console.warn = warn;
  assert(message.includes("transform"), `two rules both wrote transform and nothing was said: "${message}"`);
  el.remove();
});

// One word, several letters: each letter's delay must be its own, and the letters
// must still share a single generated rule — a name per call blew the <head> up
// to one <style> per character.
await t("AnimatedText staggers on one shared rule", async () => {
  const { Text } = await import("../src/widgets/Text.js");
  const box = AnimatedText({
    child: Text({ text: "abcd" }),
    animations: [{ effect: "opacity", from: 0, to: 1, duration: 200 }],
    delayBetween: 0.1,
  });
  document.body.appendChild(box);
  const letters = [...box.children].filter((child) => child.style.animation);
  assert(letters.length === 4, `the word did not survive into letters: ${letters.length}`);
  const names = new Set(letters.map((child) => ruleOf(child).name));
  assert(names.size === 1, `each letter generated its own rule: ${[...names].join(", ")}`);
  const { name } = ruleOf(letters[0]);
  const sheets = [...document.head.querySelectorAll("style")].filter((style) =>
    style.textContent.includes(`@keyframes ${name} {`),
  );
  assert(sheets.length === 1, `the shared rule was injected ${sheets.length} times`);
  const delays = letters.map((child, i) => {
    const list = timesOf(child);
    assert(
      list.includes(200),
      `letter ${i} does not run its own 200ms step: ${child.style.animation}`,
    );
    assert(
      list.includes(i * 100),
      `letter ${i} does not wait ${i * 100}ms: ${child.style.animation}`,
    );
    return i * 100;
  });
  assert(delays.length === 4, `the stagger collapsed: ${delays.join(", ")}`);
  box.remove();
});

// ========== THE UNIT AND COLOR CONTRACT ==========

// The framework rule is that a bare number is a framework unit, resolved against
// the reader's live base font. The animation engine had its own `/16`, so the same
// `20` travelled 20px through a widget and 25px through an animation.

await t("a keyframe length follows the reader's font", () => {
  setBaseFontSize(20);
  const el = mount();
  AnimatedBox({
    animations: [{ effect: "translateY", from: 20, to: 0, duration: 200 }],
    child: el,
  });
  const first = frameOf(ruleOf(el).body, 0);
  assert(
    first.includes("translateY(1rem)"),
    `a bare 20 was divided by a literal 16, not the live base: ${first}`,
  );
  el.remove();
  setBaseFontSize(16);
});

await t("the imperative engine writes framework units too", async () => {
  setBaseFontSize(20);
  const el = mount();
  animate(el, "translateY", 20, 0, 60, "linear");
  await frames(2);
  assert(
    el.style.transform.includes("rem"),
    `a bare 20 painted pixels through animate(): ${el.style.transform}`,
  );
  const away = translation(el).y;
  assert(away > 8 && away < 21, `the unit is off: ${away}px of a 20-unit travel`);
  await frames(10);
  assert(Math.abs(translation(el).y) < 1.5, `did not settle at 0: ${translation(el).y}`);
  unmount(el);
  setBaseFontSize(16);
});

await t("animate() blends rgb() and rgba()", async () => {
  const start = "rgba(255, 0, 0, 0.4)";
  const el = mount({ backgroundColor: start });
  animate(el, "backgroundColor", start, "rgb(0, 0, 255)", 120, "linear");
  await frames(2);
  const written = el.style.backgroundColor;
  assert(written.startsWith("rgb"), `the blend was dropped by CSS: "${written}"`);
  assert(written !== start, `it never left the start color: ${written}`);
  await frames(14);
  const value = getComputedStyle(el).backgroundColor;
  assert(/^rgb\(0,\s*0,\s*255\)$/.test(value), `did not reach the end color: ${value}`);
  unmount(el);
});

await t("an unblendable value stops at the end instead of NaN", async () => {
  const el = mount();
  animate(el, "color", "red", "blue", 60, "linear");
  await frames(2);
  assert(!el.style.color.includes("NaN"), `mid-flight wrote "${el.style.color}"`);
  await frames(12);
  assert(
    getComputedStyle(el).color === "rgb(0, 0, 255)",
    `did not land on the end color: ${getComputedStyle(el).color}`,
  );
  unmount(el);
});

// ========== THE SHORTCUT PRESETS ==========

await t("pulseAsync() resolves with the widget it pulsed", async () => {
  const el = mount();
  const settled = await pulseAsync(el, 120);
  assert(settled === el, `a preset that chains promises should hand back the widget: ${settled}`);
  assert(Math.abs(scaleOf(el) - 1) < 0.02, `the pulse left it scaled: ${scaleOf(el)}`);
  unmount(el);
});

await t("pulse() and pulseAsync() are the same swell", async () => {
  const el = mount();
  pulse(el, 200);
  await frames(3);
  const mid = scaleOf(el);
  assert(mid > 1, `a pulse that never overshoots is not a pulse: ${mid}`);
  await frames(14);
  assert(Math.abs(scaleOf(el) - 1) < 0.02, `the pulse did not return: ${scaleOf(el)}`);
  unmount(el);
});

await t("fadeOut() starts where the element is", async () => {
  const el = mount({ opacity: "0.6" });
  fadeOut(el, 200);
  await frames(3);
  const value = Number(getComputedStyle(el).opacity);
  assert(value <= 0.61, `it flashed to full opacity first: ${value}`);
  assert(value < 0.6, `it never left 0.6: ${value}`);
  await frames(14);
  assert(Number(getComputedStyle(el).opacity) < 0.05, `did not fade out: ${getComputedStyle(el).opacity}`);
  unmount(el);
});

// ========== THE SYNC AND AWAITABLE FORMS AGREE ==========

// Both forms build their gesture from one step plan, so these assertions cannot
// fail today. They are here for the day the two paths are edited separately.

await t("a preset's sync and awaitable forms are the same gesture", async () => {
  const options = { direction: "up", distance: 24, duration: 120 };
  const sync = mount({ opacity: "0" });
  const awaited = mount({ opacity: "0" });
  slideIn(sync, options);
  await slideInAsync(awaited, options);
  await frames(14);
  assert(
    sync.style.transform === awaited.style.transform,
    `the two forms travel differently: "${sync.style.transform}" vs "${awaited.style.transform}"`,
  );
  assert(
    sync.style.opacity === awaited.style.opacity && awaited.style.opacity === "1",
    `the fade disagreed: ${sync.style.opacity} vs ${awaited.style.opacity}`,
  );
  unmount(sync);
  unmount(awaited);
});

window.__MOTION = { pass, fail, results };
document.getElementById("summary").textContent = fail === 0 ? `✅ ${pass} OK` : `❌ ${pass} OK · ${fail} FAILED`;
for (const r of results) {
  const li = document.createElement("li");
  li.textContent = `${r.ok ? "ok  " : "FAIL"} ${r.name}${r.ok ? "" : ` — ${r.detail}`}`;
  document.getElementById("out").appendChild(li);
}
