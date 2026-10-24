// utils/visualEffects.js
/**
 * Visual Effects - Reusable visual effects for widgets
 * @module utils/visualEffects
 */

import { prefersReducedMotion, markMotionLoop } from "../animations/motion.js";

// Cache for injected keyframes
const injectedKeyframes = new Set();

/**
 * Inject CSS keyframes if not already injected
 * @param {string} name - Animation name
 * @param {string} keyframes - CSS keyframes
 */
export const injectKeyframes = (name, keyframes) => {
  if (injectedKeyframes.has(name)) return;
  const style = document.createElement("style");
  style.textContent = `@keyframes ${name} { ${keyframes} }`;
  document.head.appendChild(style);
  injectedKeyframes.add(name);
};

/**
 * Apply stripe pattern to an element
 * @param {HTMLElement} element - Target element
 * @param {Object} options - Stripe options
 */
export const applyStripes = (element, options = {}) => {
  const {
    color = "rgba(255, 255, 255, 0.15)",
    size = 10,
    angle = 45,
    animated = false,
    duration = "0.5s",
  } = options;

  const stripePattern = `repeating-linear-gradient(
        ${angle}deg,
        ${color} 0px,
        ${color} ${size}px,
        transparent ${size}px,
        transparent ${size * 2}px
    )`;

  element.style.backgroundImage = stripePattern;
  element.style.backgroundSize = `${size * 2}px ${size * 2}px`;

  if (animated) {
    element.style.animation = `progress-stripes ${duration} linear infinite`;
    // A `infinite` CSS loop is stopped by the media rule, not by a JS check: the
    // check reads the preference when the effect is applied, so a loop already
    // running when the reader flips the OS setting would keep running.
    markMotionLoop(element);

    injectKeyframes(
      "progress-stripes",
      `
            0% { background-position: 0 0; }
            100% { background-position: ${size * 2}px 0; }
        `,
    );
  }
};

/**
 * Remove stripe pattern from element
 */
export const removeStripes = (element) => {
  element.style.backgroundImage = "";
  element.style.animation = "";
};

/**
 * Apply shimmer/skeleton effect
 */
export const applyShimmer = (element, options = {}) => {
  const {
    highlightColor = "rgba(255, 255, 255, 0.3)",
    baseColor = "rgba(0, 0, 0, 0.05)",
    duration = "1.5s",
  } = options;

  element.style.background = `linear-gradient(
        110deg,
        ${baseColor} 0%,
        ${baseColor} 35%,
        ${highlightColor} 50%,
        ${baseColor} 65%,
        ${baseColor} 100%
    )`;
  element.style.backgroundSize = "200% 100%";
  element.style.animation = `shimmer ${duration} ease-in-out infinite`;
  markMotionLoop(element);

  injectKeyframes(
    "shimmer",
    `
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    `,
  );
};

/**
 * Apply glow effect
 */
export const applyGlow = (element, options = {}) => {
  const {
    color = "rgba(0, 122, 255, 0.5)",
    intensity = 10,
    duration = "2s",
  } = options;

  element.style.transition = "box-shadow 0.2s ease";
  element.style.animation = `glow-pulse ${duration} ease-in-out infinite`;
  markMotionLoop(element);

  injectKeyframes(
    "glow-pulse",
    `
        0% { box-shadow: 0 0 0 ${color}; }
        50% { box-shadow: 0 0 ${intensity}px ${color}; }
        100% { box-shadow: 0 0 0 ${color}; }
    `,
  );
};

/**
 * Apply indeterminate loading animation
 */
export const applyIndeterminate = (element, options = {}) => {
  const { duration = "1.5s", width = "50%" } = options;

  element.style.position = "relative";
  element.style.width = width;
  element.style.animation = `indeterminate-progress ${duration} ease-in-out infinite`;
  markMotionLoop(element);

  injectKeyframes(
    "indeterminate-progress",
    `
        0% { transform: translateX(-100%); }
        50% { transform: translateX(0%); }
        100% { transform: translateX(100%); }
    `,
  );
};

/**
 * Apply pulse animation
 */
export const applyPulse = (element, options = {}) => {
  const { scale = 1.05, duration = "0.3s" } = options;

  // A pulse is decoration saying "look here", so reduced motion removes it rather
  // than shortening it — the element is left exactly as it was.
  if (prefersReducedMotion()) return;

  element.style.transition = `transform ${duration} ease`;
  element.style.animation = `pulse ${duration} ease-in-out`;

  injectKeyframes(
    "pulse",
    `
        0% { transform: scale(1); }
        50% { transform: scale(${scale}); }
        100% { transform: scale(1); }
    `,
  );
};

export default {
  injectKeyframes,
  applyStripes,
  removeStripes,
  applyShimmer,
  applyGlow,
  applyIndeterminate,
  applyPulse,
};
