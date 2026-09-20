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
 * ⭐ Numbers in length properties (width, height, translate, etc.)
 *   are automatically converted to rem (consistent with widget-factory behavior)
 */

let animationCounter = 0;
const injectedKeyframes = new Set();

/**
 * Converts a numeric pixel value to a rem string.
 * Passes through non-numeric values unchanged.
 *
 * @param {number|string|undefined|null} value - The value to convert.
 * @returns {string|undefined} The value expressed in rem, or undefined if input was nullish.
 */
const toREM = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return `${value / 16}rem`;
  return value;
};

/**
 * Effect names whose values represent CSS lengths and must be expressed in rem.
 * @type {Set<string>}
 */
const lengthEffects = new Set([
  "width",
  "height",
  "translateX",
  "translateY",
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
  "rotate",
  "rotateX",
  "rotateY",
  "opacity",
]);

/**
 * Maps shorthand effect keys (used in the animations API) to their canonical
 * CSS property names used during keyframe generation.
 * @type {Object.<string, string>}
 */
const effectMap = {
  // Color / visual
  bgColor: "backgroundColor",
  textColor: "color",
  rounded: "borderRadius",
  // Transform
  scale: "scale",
  rotate: "rotate",
  rotateY: "rotateY",
  rotateX: "rotateX",
  translateX: "translateX",
  translateY: "translateY",
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
 * Linearly interpolates between two CSS color values (hex, rgb, or rgba).
 *
 * @param {string} color1 - Starting color (hex, rgb, or rgba string).
 * @param {string} color2 - Ending color (hex, rgb, or rgba string).
 * @param {number} t - Interpolation factor in [0, 1].
 * @returns {string} Interpolated color as an rgba() string.
 */
const interpolateColor = (color1, color2, t) => {
  if (color1 === color2) return color1;

  const parseRgb = (color) => {
    if (color.startsWith("#")) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return [r, g, b, 1];
    }
    const match = color.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
    );
    if (match) {
      const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), a];
    }
    return [0, 0, 0, 1];
  };

  const rgbToRgba = (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`;

  const [r1, g1, b1, a1] = parseRgb(color1);
  const [r2, g2, b2, a2] = parseRgb(color2);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  const a = a1 + (a2 - a1) * t;

  return rgbToRgba(r, g, b, a);
};

/**
 * Interpolates between two numeric values that may carry CSS unit suffixes.
 * When `useREM` is true the raw interpolated number is converted to rem.
 *
 * @param {number|string} from - Starting value (number or string with optional unit).
 * @param {number|string} to   - Ending value (number or string with optional unit).
 * @param {number}        t    - Interpolation factor in [0, 1].
 * @param {boolean}       [useREM=false] - When true, result is expressed in rem (÷16).
 * @returns {string|number} Interpolated value, with unit appended when applicable.
 */
const interpolateNumber = (from, to, t, useREM = false) => {
  let fromNum, toNum, fromUnit, toUnit;

  if (typeof from === "number" && typeof to === "number") {
    fromNum = from;
    toNum = to;
    fromUnit = "";
    toUnit = "";
  } else {
    fromNum = parseFloat(from);
    toNum = parseFloat(to);
    fromUnit = from.toString().replace(fromNum.toString(), "");
    toUnit = to.toString().replace(toNum.toString(), "");
  }

  const value = fromNum + (toNum - fromNum) * t;
  if (useREM) {
    // Express the interpolated pixel value in rem
    return `${value / 16}rem`;
  } else {
    const unit = fromUnit || toUnit || "px";
    return `${value}${unit}`;
  }
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
  const interpolateLength = (len1, len2, t) =>
    interpolateNumber(len1, len2, t, false);
  const newOffsetX = interpolateLength(s1.offsetX, s2.offsetX, t);
  const newOffsetY = interpolateLength(s1.offsetY, s2.offsetY, t);
  const newBlur = interpolateLength(s1.blur, s2.blur, t);
  const newSpread = interpolateLength(s1.spread, s2.spread, t);
  const newColor = interpolateColor(s1.color, s2.color, t);
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
    const color = interpolateColor(stop1.color, stop2.color, t);
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

/**
 * Injects a named `@keyframes` rule into the document `<head>`.
 * Skips injection if a rule with the same name has already been added
 * (tracked via the module-level `injectedKeyframes` Set).
 *
 * @param {string} name      - The keyframe animation name.
 * @param {string} keyframes - The keyframe body (everything inside `@keyframes name { … }`).
 * @returns {void}
 */
const injectKeyframes = (name, keyframes) => {
  if (injectedKeyframes.has(name)) return;
  const style = document.createElement("style");
  style.textContent = `@keyframes ${name} { ${keyframes} }`;
  document.head.appendChild(style);
  injectedKeyframes.add(name);
};

/**
 * Generates a CSS `@keyframes` body string from an array of animation descriptors.
 * Each animation describes an effect, a `from` value, a `to` value, and an optional
 * `reverse` flag that controls whether the animation cycles back (sine wave) or plays
 * straight through (linear interpolation).
 *
 * @param {Array<{effect: string, from: *, to: *, reverse?: boolean}>} animations
 *   Array of animation descriptors to combine into a single keyframe sequence.
 * @returns {string} CSS keyframe body string (100 steps, 0%–100%).
 */
const generateKeyframes = (animations) => {
  const steps = 100;
  let frames = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let transformParts = [];
    let styleParts = [];

    animations.forEach((anim) => {
      const effect = effectMap[anim.effect] || anim.effect;
      const { from, to, reverse = true } = anim;

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
          color = interpolateColor(from, to, cycleColor);
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
          color = interpolateColor(from, to, t);
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
            value = interpolateNumber(from, to, t, false);
          }
        }
      }

      // Build transform() calls
      if (effect === "scale") {
        transformParts.push(`scale(${value})`);
      } else if (effect === "rotate") {
        transformParts.push(`rotate(${value}deg)`);
      } else if (effect === "rotateY") {
        transformParts.push(`rotateY(${value}deg)`);
      } else if (effect === "rotateX") {
        transformParts.push(`rotateX(${value}deg)`);
      } else if (effect === "translateX" || effect === "translateY") {
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
 * Accepts an array of animation descriptors, generates a unique `@keyframes`
 * rule, injects it into the document, then applies it to the child element via
 * `element.style.animation`. Positional overrides (`top`, `right`, `bottom`,
 * `left`) are forwarded to the child's `dataset` for layout use.
 *
 * @param {object}             props
 * @param {Array<object>}      [props.animations]  - Array of animation descriptors. Each entry
 *   has at minimum `{ effect, from, to }` and may include `duration`, `delay`, `loop`, `reverse`.
 * @param {string}             [props.timing="ease"]      - CSS `animation-timing-function`.
 * @param {string}             [props.delay="0s"]         - Default animation delay (CSS time string).
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

  // Forward position values to child dataset for use by layout systems
  if (top) child.dataset.top = typeof top === "number" ? `${top}px` : top;
  if (right)
    child.dataset.right = typeof right === "number" ? `${right}px` : right;
  if (bottom)
    child.dataset.bottom = typeof bottom === "number" ? `${bottom}px` : bottom;
  if (left) child.dataset.left = typeof left === "number" ? `${left}px` : left;

  if (animations && animations.length > 0) {
    const firstAnim = animations[0];
    const effect = effectMap[firstAnim.effect] || firstAnim.effect;

    if (firstAnim.effect === "textGradient") {
      // Apply gradient-clip styles to the child (typically a Text widget)
      child.style.color = "transparent";
      child.style.backgroundClip = "text";
      child.style.webkitBackgroundClip = "text";
      child.style.backgroundColor = "transparent";

      // Apply the starting gradient immediately so there is no flash on first render
      const gradientValue = firstAnim.from;
      if (gradientValue) {
        child.style.background = gradientValue;
      }
    }

    /**
     * Applies an initial inline style to the child, converting numeric length
     * values to rem before assignment.
     *
     * @param {string}         prop  - camelCase CSS property name.
     * @param {number|string}  value - Value to set (numbers are rem-converted for length effects).
     * @returns {void}
     */
    const setInitialStyle = (prop, value) => {
      if (value === undefined) return;
      let finalValue = value;
      if (typeof value === "number" && lengthEffects.has(effect)) {
        finalValue = toREM(value);
      }
      child.style[prop] = finalValue;
    };

    // Set the starting (from) value on the child so there is no layout jump
    if (effect === "backgroundColor") {
      child.style.backgroundColor = firstAnim.from;
    } else if (effect === "borderRadius") {
      setInitialStyle("borderRadius", firstAnim.from);
    } else if (effect === "color") {
      child.style.color = firstAnim.from;
    } else if (effect === "width") {
      setInitialStyle("width", firstAnim.from);
    } else if (effect === "height") {
      setInitialStyle("height", firstAnim.from);
    } else if (effect.startsWith("margin")) {
      const prop = effect.replace(/([A-Z])/g, "-$1").toLowerCase();
      setInitialStyle(prop, firstAnim.from);
    } else if (effect.startsWith("padding")) {
      const prop = effect.replace(/([A-Z])/g, "-$1").toLowerCase();
      setInitialStyle(prop, firstAnim.from);
    } else if (effect === "borderWidth") {
      setInitialStyle("borderWidth", firstAnim.from);
    } else if (effect === "borderColor") {
      child.style.borderColor = firstAnim.from;
    } else if (effect === "boxShadow") {
      child.style.boxShadow = firstAnim.from;
    } else if (effect === "background") {
      child.style.background = firstAnim.from;
    }

    const name = `anim-${Date.now()}-${animationCounter++}`;
    const keyframes = generateKeyframes(animations);
    injectKeyframes(name, keyframes);

    const duration = animations[0]?.duration || 500;
    const iteration = animations[0]?.loop ? "infinite" : "1";
    // Per-animation delay takes precedence over the prop-level default
    const animationDelay = animations[0]?.delay || delay;

    child.style.animation = `${name} ${duration}ms ${timing} ${animationDelay} ${iteration} normal ${fillMode}`;
  }

  return child;
};

export default AnimatedBox;
