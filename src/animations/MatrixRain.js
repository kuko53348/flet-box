/**
 * MatrixRain - Canvas-based Matrix-style falling character animation.
 *
 * Renders a stream of randomly chosen characters cascading downward in a
 * Matrix-green color scheme. Works in both `"fixed"` (full-viewport) and
 * `"absolute"` (parent-relative) positioning modes.
 *
 * The returned `<canvas>` element has a `_cleanup()` method attached to it.
 * Call it when removing the canvas from the DOM to cancel the animation loop,
 * detach event listeners, and disconnect any ResizeObserver.
 *
 * @module animations/MatrixRain
 */

/**
 * Creates and starts a Matrix-rain animation on a `<canvas>` element.
 *
 * @param {object}  [props={}]
 * @param {string}  [props.chars="01アイウエオ…"] - Character pool to draw from.
 *   Defaults to a mix of digits and katakana.
 * @param {number}  [props.fontSize=16]            - Column width and character height in pixels.
 * @param {number}  [props.speed=0.5]              - Base drop speed (rows per frame).
 *   Each drop also adds a random jitter up to `speed` per frame.
 * @param {number}  [props.fadeAmount=0.05]        - Opacity of the black overlay drawn each frame,
 *   controlling how quickly old characters fade. Higher = faster fade.
 * @param {number}  [props.resetProbability=0.975] - Probability threshold above which a drop that
 *   has passed the bottom resets to the top. Values closer to 1 make resets rarer.
 * @param {boolean} [props.useDynamicColor=true]   - When `true`, character brightness increases
 *   toward the bottom of the canvas. When `false`, a flat `#0f0` green is used.
 * @param {"fixed"|"absolute"} [props.position="fixed"] - CSS `position` of the canvas.
 *   Use `"absolute"` to confine the rain inside a positioned parent element.
 * @param {number}  [props.zIndex=1]               - CSS `z-index` of the canvas. Use a low value
 *   (e.g. `1` or even a negative number) to render behind other content.
 * @returns {HTMLCanvasElement} The canvas element, already appended with an animation loop
 *   running. Attach `canvas._cleanup()` to your unmount lifecycle to clean up.
 */
export const MatrixRain = (props = {}) => {
  const {
    chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
    fontSize = 16,
    speed = 0.5,
    fadeAmount = 0.05,
    resetProbability = 0.975,
    useDynamicColor = true,
    position = "fixed",
    zIndex = 1, // Low default so the canvas renders behind other UI elements
  } = props;

  let canvas = null;
  let ctx = null;
  let animationId = null;
  let drops = [];
  let columns = 0;
  let resizeObserver = null;

  /**
   * Determines the canvas dimensions based on positioning mode.
   * In `"absolute"` mode, dimensions come from the parent element's bounding rect.
   * In `"fixed"` mode (default), the full viewport size is used.
   *
   * @returns {{ width: number, height: number }}
   */
  const getCanvasSize = () => {
    const parent = canvas?.parentElement;
    if (position === "absolute" && parent) {
      const rect = parent.getBoundingClientRect();
      return {
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
      };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  /**
   * Resizes the canvas to match its container, recalculates column count,
   * and resets all drop positions. Also attaches a ResizeObserver on first
   * call when in `"absolute"` mode.
   *
   * @returns {void}
   */
  const resizeCanvas = () => {
    if (!canvas) return;
    if (
      position === "absolute" &&
      !resizeObserver &&
      typeof ResizeObserver !== "undefined" &&
      canvas.parentElement
    ) {
      resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(canvas.parentElement);
    }
    const { width, height } = getCanvasSize();
    canvas.width = width;
    canvas.height = height;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -100);
  };

  /**
   * Returns a random character from the configured character pool.
   *
   * @returns {string} A single character.
   */
  const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];

  /**
   * Computes the fill color for a character at a given vertical position.
   * When `useDynamicColor` is `true`, brightness increases toward the bottom,
   * creating a depth illusion. Otherwise returns a flat `#0f0`.
   *
   * @param {number} y            - Current y-coordinate of the character (pixels).
   * @param {number} canvasHeight - Total canvas height in pixels.
   * @returns {string} A CSS color string.
   */
  const getColor = (y, canvasHeight) => {
    if (!useDynamicColor) return "#0f0";
    const intensity = 100 + (y / canvasHeight) * 155;
    return `rgb(0, ${Math.min(255, intensity)}, 0)`;
  };

  /**
   * Initializes the canvas element, sets its styles, and starts the draw loop.
   *
   * @returns {void}
   */
  const init = () => {
    canvas = document.createElement("canvas");
    resizeCanvas();
    canvas.style.display = "block";
    canvas.style.position = position;
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = zIndex;
    canvas.style.pointerEvents = "none";

    ctx = canvas.getContext("2d");

    draw();
  };

  /**
   * Renders a single animation frame: applies a semi-transparent black overlay
   * to fade previous characters, then draws each column's next character at its
   * current drop position and advances the drop.
   *
   * Schedules itself via `requestAnimationFrame` until cleanup is called.
   *
   * @returns {void}
   */
  const draw = () => {
    if (!ctx || !canvas) return;

    // Semi-transparent black overlay produces the trailing-fade effect
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = getRandomChar();
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = getColor(y, canvas.height);
      ctx.fillText(char, x, y);

      // Reset drop to the top once it has passed the bottom edge
      if (y > canvas.height && Math.random() > resetProbability) {
        drops[i] = 0;
      }

      drops[i] += speed + Math.random() * speed;
    }

    animationId = requestAnimationFrame(draw);
  };

  // Initialize canvas and start animation
  init();

  /** Window resize handler — recalculates dimensions on viewport changes. */
  const handleResize = () => {
    resizeCanvas();
  };

  window.addEventListener("resize", handleResize);
  if (position === "absolute" && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
  }

  /**
   * Stops the animation loop, removes event listeners, disconnects the
   * ResizeObserver, and removes the canvas from the DOM.
   *
   * @returns {void}
   */
  const cleanup = () => {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener("resize", handleResize);
    if (resizeObserver) resizeObserver.disconnect();
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };

  // Chain cleanup so any previously assigned _cleanup is also called
  const originalCleanup = canvas._cleanup;
  canvas._cleanup = () => {
    cleanup();
    if (originalCleanup) originalCleanup();
  };

  // Return the canvas directly — not a wrapper container
  return canvas;
};

export default MatrixRain;
