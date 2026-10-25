/**
 * ANIMATED BOX - Widget with CSS animations
 * @module animations/AnimatedBox
 *
 * COMPLETE LIST OF ANIMATABLE PROPERTIES:
 * - backgroundColor, color, borderRadius, opacity
 * - transform: scale, rotate, rotateX, rotateY, translateX, translateY
 * - width, height
 * - marginTop/Right/Bottom/Left
 * - paddingTop/Right/Bottom/Left
 * - borderWidth, borderColor
 * - boxShadow (offsetX, offsetY, blur, spread, color)
 * - background (gradients: linear, radial, conic)
 *
 * Each entry is `{ effect, from, to }` plus the optional `duration`, `delay`,
 * `loop` and `reverse`, and each one is honoured: a step's own duration is how
 * long *that* step takes, not the duration of whichever step came first.
 *
 * ⭐ Numbers in length properties (width, height, translate, etc.)
 *   are automatically converted to rem (consistent with widget-factory behavior)
 */

import { toREM } from "../utils/units.js";
import { injectKeyframes, animationName } from "../utils/styleInjector.js";
import { mixColor } from "./color.js";
import { prefersReducedMotion, markMotionLoop } from "./motion.js";

/**
 * Effect names whose values represent CSS lengths and must be expressed in rem.
 * @type {Set<string>}
 */
const lengthEffects = new Set([
  "width",
  "height",
  "translateX",
  "translateY",
  "translateZ",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderWidth",
  "borderRadius",
]);

/**
 * Effect names that are dimensionless scalars (no CSS unit appended).
 * @type {Set<string>}
 */
const noUnitEffects = new Set([
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skewX",
  "skewY",
  "opacity",
]);

/**
 * The effects that land inside the single `transform` declaration.
 *
 * Two CSS animations that both write `transform` do not compose: the one listed
 * last wins and the other's movement disappears. So these are always generated
 * into one rule, and the rule is the reason a group exists at all.
 * @type {Set<string>}
 */
const transformEffects = new Set([
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skewX",
  "skewY",
  "translateX",
  "translateY",
  "translateZ",
]);

/**
 * Maps shorthand effect keys (used in the animations API) to their canonical
 * CSS property names used during keyframe generation. The right-hand names are
 * what the property is written as; the left-hand ones are the spellings the
 * examples and the snippet library use.
 * @type {Object.<string, string>}
 */
const effectMap = {
  // Color / visual
  bgColor: "backgroundColor",
  textColor: "color",
  rounded: "borderRadius",
  // Transform
  scale: "scale",
  scaleX: "scaleX",
  scaleY: "scaleY",
  rotate: "rotate",
  rotateY: "rotateY",
  rotateX: "rotateX",
  rotateZ: "rotateZ",
  skewX: "skewX",
  skewY: "skewY",
  translateX: "translateX",
  translateY: "translateY",
  translateZ: "translateZ",
  opacity: "opacity",
  // Dimensions and spacing
  width: "width",
  height: "height",
  marginTop: "marginTop",
  marginRight: "marginRight",
  marginBottom: "marginBottom",
  marginLeft: "marginLeft",
  paddingTop: "paddingTop",
  paddingRight: "paddingRight",
  paddingBottom: "paddingBottom",
  paddingLeft: "paddingLeft",
  borderWidth: "borderWidth",
  borderColor: "borderColor",
  // Shadow
  boxShadow: "boxShadow",
  elevation: "boxShadow",
  // Gradient
  gradient: "background",
  textGradient: "background",
  backgroundGradient: "background",
};

/**
 * Interpolates between two numeric values that may carry CSS unit suffixes.
 * A length that needs rem is converted by its own branch in
 * {@link generateRule}, through the framework's shared `toREM`.
 *
 * @param {number|string} from - Starting value (number or string with optional unit).
 * @param {number|string} to   - Ending value (number or string with optional unit).
 * @param {number}        t    - Interpolation factor in [0, 1].
 * @returns {string} Interpolated value with the starting value's unit re-attached.
 */
const interpolateNumber = (from, to, t) => {
  const fromNum = parseFloat(from);
  const toNum = parseFloat(to);
  const fromUnit = from.toString().replace(fromNum.toString(), "");
  const toUnit = to.toString().replace(toNum.toString(), "");
  const value = fromNum + (toNum - fromNum) * t;
  const unit = fromUnit || toUnit || "px";
  return `${value}${unit}`;
};

/**
 * Interpolates between two CSS box-shadow values, blending lengths and color.
 *
 * @param {string|null} shadow1 - Starting box-shadow string.
 * @param {string|null} shadow2 - Ending box-shadow string.
 * @param {number}      t       - Interpolation factor in [0, 1].
 * @returns {string|null} Interpolated box-shadow string, or the non-null input if one is missing.
 */
const interpolateBoxShadow = (shadow1, shadow2, t) => {
  if (!shadow1 || !shadow2) return shadow1 || shadow2;
  const parseShadow = (shadow) => {
    const parts = shadow.trim().split(/\s+/);
    let offsetX, offsetY, blur, spread, color;
    let colorIndex = parts.findIndex(
      (p) => isNaN(parseFloat(p)) && !p.match(/^\d+(\.\d+)?(px|%|em|rem)$/),
    );
    if (colorIndex === -1) colorIndex = parts.length;
    offsetX = parts[0];
    offsetY = parts[1];
    blur = parts[2] || "0px";
    spread = parts[3] || "0px";
    color = parts.slice(colorIndex).join(" ");
    return { offsetX, offsetY, blur, spread, color };
  };
  const s1 = parseShadow(shadow1);
  const s2 = parseShadow(shadow2);
  // box-shadow lengths keep their original units (not converted to rem)
  const interpolateLength = (len1, len2, t) => interpolateNumber(len1, len2, t);
  const newOffsetX = interpolateLength(s1.offsetX, s2.offsetX, t);
  const newOffsetY = interpolateLength(s1.offsetY, s2.offsetY, t);
  const newBlur = interpolateLength(s1.blur, s2.blur, t);
  const newSpread = interpolateLength(s1.spread, s2.spread, t);
  const newColor = mixColor(s1.color, s2.color, t);
  return `${newOffsetX} ${newOffsetY} ${newBlur} ${newSpread} ${newColor}`;
};

/**
 * Interpolates between two CSS gradient values (linear, radial, or conic).
 * Blends stop colors and, for linear gradients, the angle.
 *
 * @param {string|null} gradient1 - Starting gradient CSS string.
 * @param {string|null} gradient2 - Ending gradient CSS string.
 * @param {number}      t         - Interpolation factor in [0, 1].
 * @returns {string|null} Interpolated gradient string, or the non-null input if one is missing.
 */
const interpolateGradient = (gradient1, gradient2, t) => {
  if (!gradient1 || !gradient2) return gradient1 || gradient2;

  const linearMatch = (grad) => grad.match(/linear-gradient\((.*?)\)/i);
  const radialMatch = (grad) => grad.match(/radial-gradient\((.*?)\)/i);
  const conicMatch = (grad) => grad.match(/conic-gradient\((.*?)\)/i);

  let type = "linear";
  let params1 = "",
    params2 = "";

  if (linearMatch(gradient1)) {
    type = "linear";
    params1 = linearMatch(gradient1)[1];
    params2 = linearMatch(gradient2)[1];
  } else if (radialMatch(gradient1)) {
    type = "radial";
    params1 = radialMatch(gradient1)[1];
    params2 = radialMatch(gradient2)[1];
  } else if (conicMatch(gradient1)) {
    type = "conic";
    params1 = conicMatch(gradient1)[1];
    params2 = conicMatch(gradient2)[1];
  } else {
    return gradient1;
  }

  const parseStops = (paramStr) => {
    let angleOrPosition = "";
    let stopsPart = paramStr;

    const angleMatch = paramStr.match(/^([\d.]+deg)\s*,/);
    const positionMatch = paramStr.match(/^(circle|ellipse|at\s+[^,]+)\s*,/i);
    if (angleMatch) {
      angleOrPosition = angleMatch[1];
      stopsPart = paramStr.substring(angleMatch[0].length);
    } else if (positionMatch) {
      angleOrPosition = positionMatch[0].replace(/,$/, "");
      stopsPart = paramStr.substring(positionMatch[0].length);
    }

    const stopRegex = /([^,]+?)(\s+[\d.]+%?)?(?=,|$)/g;
    let stops = [];
    let match;
    while ((match = stopRegex.exec(stopsPart)) !== null) {
      let color = match[1].trim();
      let position = match[2] ? match[2].trim() : null;
      stops.push({ color, position });
    }
    return { angleOrPosition, stops };
  };

  const p1 = parseStops(params1);
  const p2 = parseStops(params2);

  let newAngleOrPosition = p1.angleOrPosition;
  if (p1.angleOrPosition && p2.angleOrPosition) {
    if (p1.angleOrPosition.includes("deg")) {
      const deg1 = parseFloat(p1.angleOrPosition);
      const deg2 = parseFloat(p2.angleOrPosition);
      const newDeg = deg1 + (deg2 - deg1) * t;
      newAngleOrPosition = `${newDeg}deg`;
    } else {
      newAngleOrPosition = p1.angleOrPosition;
    }
  }

  const maxStops = Math.max(p1.stops.length, p2.stops.length);
  const stops = [];
  for (let i = 0; i < maxStops; i++) {
    const stop1 = p1.stops[i] || p1.stops[p1.stops.length - 1];
    const stop2 = p2.stops[i] || p2.stops[p2.stops.length - 1];
    const color = mixColor(stop1.color, stop2.color, t);
    let position = "";
    if (stop1.position && stop2.position) {
      const pos1 = parseFloat(stop1.position);
      const pos2 = parseFloat(stop2.position);
      const newPos = pos1 + (pos2 - pos1) * t;
      position = ` ${newPos}%`;
    } else if (stop1.position) {
      position = ` ${stop1.position}`;
    } else if (stop2.position) {
      position = ` ${stop2.position}`;
    }
    stops.push(`${color}${position}`);
  }

  const stopsString = stops.join(", ");
  if (type === "linear") {
    return `linear-gradient(${newAngleOrPosition ? newAngleOrPosition + ", " : ""}${stopsString})`;
  } else if (type === "radial") {
    return `radial-gradient(${newAngleOrPosition ? newAngleOrPosition + ", " : ""}${stopsString})`;
  } else if (type === "conic") {
    return `conic-gradient(${newAngleOrPosition ? newAngleOrPosition + ", " : ""}${stopsString})`;
  }
  return gradient1;
};

/** The duration a step that does not name one gets. */
const DEFAULT_DURATION = 500;

/**
 * Reads a step's time as milliseconds.
 *
 * A bare number is milliseconds and a unit string is parsed, because that is what
 * the docs promise (`delay` is "in milliseconds") and what `AnimatedText` writes
 * (`"0.1s"`). Handing the `animation` shorthand an unqualified number — `delay:
 * 200` — makes the whole declaration invalid, and the element does not animate at
 * all, which reads as the widget being broken rather than as a missing unit.
 *
 * @param {number|string|undefined|null} value
 * @param {number} fallback - Milliseconds to use when the value is absent or nonsense.
 * @returns {number} A finite, non-negative number of milliseconds.
 */
const cssMs = (value, fallback) => {
  const num = (text) => {
    const parsed = parseFloat(text);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    // "0.5s" is seconds, "500ms" and a bare "500" are milliseconds. The unit is
    // read from the END of the string: a `\bs\b` test never matches "0.1s", because
    // the digit and the `s` are both word characters, and the delay would be
    // one thousandth of what the caller wrote.
    if (/(?:^|[^a-z])ms\s*$/i.test(text)) return parsed;
    if (/(?:^|[^a-z])s\s*$/i.test(text)) return parsed * 1000;
    return parsed;
  };
  if (typeof value === "number")
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  if (typeof value !== "string" || value.trim() === "") return fallback;
  return num(value.trim()) ?? fallback;
};

/**
 * Formats one transform function's value the way the keyframes do.
 *
 * @param {string} effect - A canonical transform name.
 * @param {number|string} value - A bare number is a framework unit, not a pixel.
 * @returns {string} The value with the unit that function needs.
 */
const transformValue = (effect, value) => {
  if (typeof value === "string") return value;
  if (effect.startsWith("rotate") || effect.startsWith("skew")) return `${value}deg`;
  if (effect.startsWith("translate")) return toREM(value);
  return String(value);
};

/**
 * The order the parts are written in, so the start state and the keyframes agree
 * with each other and with `animate()` — CSS applies transforms left to right, and
 * translating first is what keeps a rotation about the element's own centre.
 * @type {string[]}
 */
const TRANSFORM_ORDER = [
  "translateX",
  "translateY",
  "translateZ",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skewX",
  "skewY",
  "scale",
  "scaleX",
  "scaleY",
];

/**
 * Writes each step's `from` on the element before its rule starts playing.
 *
 * @param {HTMLElement} child - The element about to be animated.
 * @param {Array<object>} steps - The resolved descriptors.
 * @returns {void}
 */
const writeStartValues = (child, steps) => {
  const transforms = new Map();
  steps.forEach((anim) => {
    const effect = effectMap[anim.effect] || anim.effect;
    const { from } = anim;
    if (transformEffects.has(effect)) {
      transforms.set(effect, from);
      return;
    }
    if (effect === "backgroundColor") {
      child.style.backgroundColor = from;
    } else if (effect === "color") {
      child.style.color = from;
    } else if (effect === "borderColor") {
      child.style.borderColor = from;
    } else if (effect === "boxShadow") {
      child.style.boxShadow = from;
    } else if (effect === "background") {
      child.style.background = from;
    } else if (effect === "opacity") {
      child.style.opacity = from;
    } else if (typeof from === "number" && lengthEffects.has(effect)) {
      // A length written as a plain number is a framework unit
      child.style[effect] = toREM(from);
    } else {
      child.style[effect] = from;
    }
  });
  if (transforms.size === 0) return;
  child.style.transform = TRANSFORM_ORDER.filter((name) => transforms.has(name))
    .map((name) => `${name}(${transformValue(name, transforms.get(name))})`)
    .join(" ");
};

/**
 * True when a timing group writes the `transform` declaration.
 *
 * @param {{members: Array<object>}} group
 * @returns {boolean}
 */
const groupHasTransform = (group) =>
  group.members.some((anim) =>
    transformEffects.has(effectMap[anim.effect] || anim.effect),
  );

/**
 * Generates a CSS `@keyframes` body for one timing group.
 *
 * Every step of a group is written into the same rule — that is what lets a
 * `translateY` and a `scale` share one `transform` declaration instead of
 * overwriting each other — but each step runs on its own clock: it waits its
 * `offset`, takes its own `duration`, and holds `to` for the rest of the rule.
 * A group spans the longest of its steps, so a 400 ms fade inside a 600 ms
 * entrance is finished and holding when the last frame is written.
 *
 * @param {Array<{effect: string, from: *, to: *, reverse?: boolean, offset?: number, duration?: number}>} entries
 *   The steps of the group, already resolved to millisecond `offset`/`duration`.
 * @param {number} span - The group's total length in ms; the rule's duration.
 * @returns {string} CSS keyframe body string (100 steps, 0%–100%).
 */
const generateRule = (entries, span) => {
  const steps = 100;
  let frames = [];

  for (let i = 0; i <= steps; i++) {
    // Where the group's clock is, in ms, at this frame.
    const clock = (i / steps) * span;
    let transformParts = [];
    let styleParts = [];

    entries.forEach((anim) => {
      const effect = effectMap[anim.effect] || anim.effect;
      // Straight `from → to` is the default: a one-shot entry animation must hold
      // `to`. Cycling back is opt-in, or every documented `opacity 0 → 1` faded
      // to invisible again at 100%.
      const { from, to, reverse = false, offset = 0, duration = span } = anim;

      // The step's own progress through its own duration.
      const t =
        duration <= 0
          ? 1
          : Math.min(1, Math.max(0, (clock - offset) / duration));

      let value;
      let color;

      if (reverse) {
        // Sine-wave cycling: value oscillates between `from` and `to`
        const angle = t * Math.PI * 2;
        const mid = (from + to) / 2;
        const amp = (to - from) / 2;
        value = mid + amp * Math.sin(angle - Math.PI / 2);
        const cycleColor = (Math.sin(angle - Math.PI / 2) + 1) / 2;

        if (
          effect === "backgroundColor" ||
          effect === "color" ||
          effect === "borderColor"
        ) {
          color = mixColor(from, to, cycleColor);
        } else if (effect === "boxShadow") {
          value = interpolateBoxShadow(from, to, cycleColor);
        } else if (effect === "background") {
          value = interpolateGradient(from, to, cycleColor);
        } else {
          const fromNum = parseFloat(from);
          const toNum = parseFloat(to);
          let cycledNum = fromNum + (toNum - fromNum) * cycleColor;

          if (noUnitEffects.has(effect)) {
            value = cycledNum;
          } else if (lengthEffects.has(effect)) {
            // Convert interpolated pixel value to rem
            value = toREM(cycledNum);
          } else {
            const fromUnit = from.toString().replace(fromNum.toString(), "");
            const toUnit = to.toString().replace(toNum.toString(), "");
            const unit = fromUnit || toUnit || "px";
            value = `${cycledNum}${unit}`;
          }
        }
      } else {
        // Linear forward pass: value progresses straight from `from` to `to`
        if (
          effect === "backgroundColor" ||
          effect === "color" ||
          effect === "borderColor"
        ) {
          color = mixColor(from, to, t);
        } else if (effect === "boxShadow") {
          value = interpolateBoxShadow(from, to, t);
        } else if (effect === "background") {
          value = interpolateGradient(from, to, t);
        } else {
          if (noUnitEffects.has(effect)) {
            const fromNum = parseFloat(from);
            const toNum = parseFloat(to);
            value = fromNum + (toNum - fromNum) * t;
          } else if (lengthEffects.has(effect)) {
            // Interpolate numerically then convert to rem
            const fromNum = parseFloat(from);
            const toNum = parseFloat(to);
            const rawValue = fromNum + (toNum - fromNum) * t;
            value = toREM(rawValue);
          } else {
            value = interpolateNumber(from, to, t);
          }
        }
      }

      // Build transform() calls. They all land in one `transform` declaration, in
      // the CSS order — travel, then turn, then size — so a rotation spins about
      // the element's own centre instead of the page's.
      if (effect === "scale" || effect === "scaleX" || effect === "scaleY") {
        transformParts.push(`${effect}(${value})`);
      } else if (
        effect === "rotate" ||
        effect === "rotateX" ||
        effect === "rotateY" ||
        effect === "rotateZ" ||
        effect === "skewX" ||
        effect === "skewY"
      ) {
        transformParts.push(`${effect}(${value}deg)`);
      } else if (
        effect === "translateX" ||
        effect === "translateY" ||
        effect === "translateZ"
      ) {
        // Value is already in rem when it originated from a plain number
        transformParts.push(`${effect}(${value})`);
      }
      // Build CSS property declarations
      else if (effect === "opacity") {
        styleParts.push(`opacity: ${value};`);
      } else if (effect === "backgroundColor") {
        styleParts.push(`background-color: ${color || value};`);
      } else if (effect === "color") {
        styleParts.push(`color: ${color || value};`);
      } else if (effect === "borderRadius") {
        styleParts.push(`border-radius: ${value};`);
      } else if (effect === "width") {
        styleParts.push(`width: ${value};`);
      } else if (effect === "height") {
        styleParts.push(`height: ${value};`);
      } else if (effect === "borderWidth") {
        styleParts.push(`border-width: ${value};`);
      } else if (effect === "borderColor") {
        styleParts.push(`border-color: ${color || value};`);
      } else if (effect.startsWith("margin")) {
        const cssProp = effect.replace(/([A-Z])/g, "-$1").toLowerCase();
        styleParts.push(`${cssProp}: ${value};`);
      } else if (effect.startsWith("padding")) {
        const cssProp = effect.replace(/([A-Z])/g, "-$1").toLowerCase();
        styleParts.push(`${cssProp}: ${value};`);
      } else if (effect === "boxShadow") {
        styleParts.push(`box-shadow: ${value};`);
      } else if (effect === "background") {
        styleParts.push(`background: ${value};`);
      }
    });

    const transformStyle = transformParts.length
      ? `transform: ${transformParts.join(" ")};`
      : "";
    frames[i] = `${i}% { ${transformStyle} ${styleParts.join(" ")} }`;
  }

  return frames.join("\n");
};

/**
 * Wraps an existing DOM element with a generated CSS keyframe animation.
 *
 * Accepts an array of animation descriptors, generates one `@keyframes` rule per
 * timing group, injects it into the document, then applies the rules to the child
 * element through `element.style.animation`. Positional overrides (`top`, `right`,
 * `bottom`, `left`) are forwarded to the child's `dataset` for layout use.
 *
 * @param {object}             props
 * @param {Array<object>}      [props.animations]  - Array of animation descriptors. Each entry
 *   has at minimum `{ effect, from, to }` and may carry its own `duration` (ms), `delay`
 *   (ms or a CSS time), `loop` and `reverse` — all four are read off that entry.
 * @param {string}             [props.timing="ease"]      - CSS `animation-timing-function`.
 * @param {number|string}      [props.delay="0s"]         - Default delay for the steps that
 *   do not name one: a number is milliseconds, a string is handed to CSS.
 * @param {string}             [props.fillMode="forwards"] - CSS `animation-fill-mode`.
 * @param {HTMLElement|null}   [props.child]              - The DOM element to animate.
 * @param {number|string}      [props.top]                - CSS top offset forwarded to child dataset.
 * @param {number|string}      [props.right]              - CSS right offset forwarded to child dataset.
 * @param {number|string}      [props.bottom]             - CSS bottom offset forwarded to child dataset.
 * @param {number|string}      [props.left]               - CSS left offset forwarded to child dataset.
 * @returns {HTMLElement|null} The mutated `child` element (with animation applied), or `null`
 *   if no `child` was provided.
 */
export const AnimatedBox = ({
  animations,
  timing = "ease",
  delay = "0s",
  fillMode = "forwards",
  child,
  top,
  right,
  bottom,
  left,
}) => {
  if (!child) return null;

  // Forward position values to child dataset for use by layout systems. A bare
  // number is a framework unit, so it is written the way every other length in
  // the framework is written: as rem.
  const offset = (value) => (typeof value === "number" ? toREM(value) : value);
  if (top) child.dataset.top = offset(top);
  if (right) child.dataset.right = offset(right);
  if (bottom) child.dataset.bottom = offset(bottom);
  if (left) child.dataset.left = offset(left);

  if (!animations || animations.length === 0) return child;

  // Each step's own `duration` and `delay`, read off that step. Taking whichever
  // descriptor came first is what made the documented
  // `{ scale, duration: 600 } + { opacity, duration: 400 }` entrance run both
  // steps for 600 ms, and what made `AnimatedText`'s per-letter delay the only
  // delay anyone could set.
  const defaultDelay = cssMs(delay, 0);
  const steps = [];
  for (const anim of animations) {
    if (!anim || anim.from === undefined || anim.to === undefined) {
      // Malformed descriptor: skip it with a warning — one, not one per keyframe
      // step — rather than throwing a TypeError out of the caller's whole render.
      console.warn(
        `⚠️ [AnimatedBox] Skipping animation "${anim?.effect}": "from" and "to" are required.`,
      );
      continue;
    }
    steps.push({
      ...anim,
      duration: cssMs(anim.duration, DEFAULT_DURATION),
      delayMs: cssMs(anim.delay, defaultDelay),
      loop: Boolean(anim.loop),
    });
  }
  if (steps.length === 0) return child;

  const gradient = steps.find((anim) => anim.effect === "textGradient");
  if (gradient) {
    // Apply gradient-clip styles to the child (typically a Text widget). The
    // starting gradient arrives below, with every other step's `from`.
    child.style.color = "transparent";
    child.style.backgroundClip = "text";
    child.style.webkitBackgroundClip = "text";
    child.style.backgroundColor = "transparent";
  }

  // Every step starts where it is going to leave from, written inline, so the
  // frame before the animation begins is the frame it begins with. Doing this
  // only for the first step left a delayed or shorter step showing its ending
  // state — a fade that flashed visible before it faded in.
  writeStartValues(child, steps);

  // A looping step and a one-shot step cannot live in the same rule: repeating
  // the rule would repeat the one-shot too, so an entrance meant to play once
  // would flicker forever. Each timing group generates its own `@keyframes`.
  const groups = [];
  for (const loop of [false, true]) {
    const members = steps.filter((anim) => anim.loop === loop);
    if (members.length) groups.push({ loop, members });
  }
  if (groups.length > 1 && groups.every(groupHasTransform)) {
    console.warn(
      '⚠️ [AnimatedBox] transform steps split between a loop and a one-shot: two rules cannot write one `transform`, so only the last rule\'s transform is applied. Keep the transform steps in one group.',
    );
  }

  const rules = groups.map(({ loop, members }) => {
    // The group starts when its earliest step does; a later step waits inside
    // the rule instead of buying a second `animation-delay`.
    const startsAt = Math.min(...members.map((anim) => anim.delayMs));
    const entries = members.map((anim) => ({
      ...anim,
      offset: anim.delayMs - startsAt,
    }));
    const span = entries.reduce(
      (longest, anim) => Math.max(longest, anim.offset + anim.duration),
      0,
    );
    const keyframes = generateRule(entries, span);
    // The name is derived from the keyframe body so identical animations reuse a
    // single <style>. A per-call unique name (`Date.now()`) made the dedupe check
    // in `injectKeyframes` dead code: every call appended a permanent <style> to
    // document.head, and AnimatedText calls this once per letter.
    const name = animationName("anim", keyframes);
    injectKeyframes(name, keyframes);
    return { name, span, startsAt, loop };
  });
  // The hook the OS preference rule matches. The JS values below cover the app's
  // own mode; this is what stops a loop already running when the system setting
  // flips, with nothing to rebuild and no listener to leak.
  markMotionLoop(child);

  // Reduced motion is the accessibility recipe, not a switch-off: a near-zero
  // duration lands the element on its `to` values through `fillMode: forwards`,
  // so the state the animation was carrying still arrives — only the movement
  // disappears. A loop becomes a single frame, and the delay goes with it:
  // content held invisible for two seconds is worse than content that moved.
  const reduced = prefersReducedMotion();
  child.style.animation = rules
    .map((rule) =>
      reduced
        ? `${rule.name} 0.01ms ${timing} 0s 1 normal ${fillMode}`
        : `${rule.name} ${rule.span}ms ${timing} ${rule.startsAt}ms ${
            rule.loop ? "infinite" : "1"
          } normal ${fillMode}`,
    )
    .join(", ");

  return child;
};

export default AnimatedBox;
