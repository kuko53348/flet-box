/**
 * ParallaxBox - A container that applies a parallax offset to its child content.
 *
 * Supports three interaction modes:
 * - `"scroll"`: offset follows the window scroll position.
 * - `"mouse"`:  offset tracks the pointer relative to the widget center.
 * - `"hover"`:  offset snaps to a position based on where the pointer enters,
 *               then resets on mouse leave.
 *
 * The returned element exposes public methods (`updateSpeed`, `updateDirection`,
 * `setPosition`, `reset`) and a `_cleanup()` function that removes all event
 * listeners when the element is destroyed.
 *
 * @module animations/ParallaxBox
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { AnimatedBox } from "../animations/AnimatedBox.js";

/**
 * Creates a parallax-effect container.
 *
 * @param {object}          [props={}]
 * @param {"scroll"|"mouse"|"hover"} [props.type="scroll"]
 *   Interaction mode that drives the parallax offset.
 * @param {number}          [props.speed=0.5]
 *   Multiplier applied to scroll distance or pointer deviation. Higher values
 *   produce more pronounced movement.
 * @param {"vertical"|"horizontal"|"both"} [props.direction="vertical"]
 *   Which axes the parallax offset is applied to.
 * @param {number}          [props.maxOffset=100]
 *   Maximum pixel offset allowed in each direction.
 * @param {boolean}         [props.reverse=false]
 *   When `true`, the movement direction is inverted.
 * @param {HTMLElement|null} [props.child]
 *   The content element to wrap. Returns `null` if not provided.
 * @param {boolean}         [props.disabled=false]
 *   When `true`, all parallax transforms are suppressed.
 * @param {Function}        [props.onParallaxMove]
 *   Callback invoked on every transform update with `{ x, y }` offsets.
 * @param {number}          [props.duration=300]
 *   CSS transition duration (ms) for smooth motion.
 * @param {string}          [props.easing="ease-out"]
 *   CSS transition timing function.
 * @param {...*}            [props.rest]
 *   Additional props forwarded to the outer container's WidgetFactory call.
 * @returns {HTMLElement|null} The container element with the parallax wrapper
 *   inside, or `null` if `child` was not provided.
 */
export const ParallaxBox = (props = {}) => {
  let {
    type = "scroll",
    speed = 0.5,
    direction = "vertical",
    maxOffset = 100,
    reverse = false,
    child,
    disabled = false,
    onParallaxMove,
    duration = 300,
    easing = "ease-out",
    ...rest
  } = props;

  if (!child) return null;

  let containerRef = null;
  let animationFrame = null;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let animatedContent = null;
  let initialTimer = null;
  const transitionTimers = new Set();

  /**
   * Schedules removal of the CSS transition after it has finished playing,
   * so subsequent programmatic transforms are instant rather than animated.
   *
   * @returns {void}
   */
  const clearTransitionLater = () => {
    const timer = setTimeout(() => {
      transitionTimers.delete(timer);
      if (animatedContent) animatedContent.style.transition = "";
    }, duration);
    transitionTimers.add(timer);
  };

  /**
   * Applies a CSS `transform` to the inner animated wrapper, clamped to
   * `maxOffset`, respecting the active `direction` and `reverse` settings.
   *
   * @param {number}  x         - Desired horizontal offset in pixels.
   * @param {number}  y         - Desired vertical offset in pixels.
   * @param {boolean} [animate=true] - When `true`, a CSS transition is set;
   *   when `false`, the transition is removed for an instant snap.
   * @returns {void}
   */
  const applyTransform = (x, y, animate = true) => {
    if (disabled) return;

    let moveX = x;
    let moveY = y;

    if (direction === "vertical") moveX = 0;
    if (direction === "horizontal") moveY = 0;

    if (reverse) {
      moveX = -moveX;
      moveY = -moveY;
    }

    moveX = Math.max(-maxOffset, Math.min(maxOffset, moveX));
    moveY = Math.max(-maxOffset, Math.min(maxOffset, moveY));

    targetX = moveX;
    targetY = moveY;

    if (onParallaxMove) onParallaxMove({ x: moveX, y: moveY });

    if (animatedContent) {
      const transformParts = [];
      if (direction === "horizontal" || direction === "both") {
        transformParts.push(`translateX(${moveX}px)`);
      }
      if (direction === "vertical" || direction === "both") {
        transformParts.push(`translateY(${moveY}px)`);
      }
      animatedContent.style.transform = transformParts.join(" ");
      if (animate) {
        animatedContent.style.transition = `transform ${duration}ms ${easing}`;
      } else {
        animatedContent.style.transition = "none";
      }
      clearTransitionLater();
    }
  };

  /**
   * Resets the inner wrapper's transform back to the origin (0, 0).
   *
   * @param {boolean} [animate=true] - Whether to animate the reset.
   * @returns {void}
   */
  const resetTransform = (animate = true) => {
    targetX = 0;
    targetY = 0;
    if (animatedContent) {
      animatedContent.style.transform = "translateX(0) translateY(0)";
      if (animate) {
        animatedContent.style.transition = `transform ${duration}ms ${easing}`;
      } else {
        animatedContent.style.transition = "none";
      }
      clearTransitionLater();
    }
    if (onParallaxMove) onParallaxMove({ x: 0, y: 0 });
  };

  /**
   * Window scroll event handler for `type="scroll"` mode.
   * Converts the current scroll position into a parallax offset and calls
   * `applyTransform` inside a `requestAnimationFrame` callback.
   *
   * @returns {void}
   */
  const handleScroll = () => {
    if (disabled || type !== "scroll") return;
    if (animationFrame) cancelAnimationFrame(animationFrame);

    animationFrame = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      let moveY = scrollY * speed;
      let moveX = scrollX * speed;

      applyTransform(moveX, moveY, true);
    });
  };

  /**
   * Pointer move handler for `type="mouse"` and `type="hover"` modes.
   * Calculates the pointer's normalized offset from the container center and
   * converts it to a pixel offset scaled by `maxOffset`.
   *
   * @param {MouseEvent} e
   * @returns {void}
   */
  const handleMouseMove = (e) => {
    if (disabled || (type !== "mouse" && type !== "hover")) return;
    if (animationFrame) cancelAnimationFrame(animationFrame);

    animationFrame = requestAnimationFrame(() => {
      const rect = containerRef.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let moveX = (e.clientX - centerX) / (rect.width / 2);
      let moveY = (e.clientY - centerY) / (rect.height / 2);

      moveX = moveX * maxOffset;
      moveY = moveY * maxOffset;

      applyTransform(moveX, moveY, true);
    });
  };

  /**
   * `mouseenter` handler for `type="hover"` mode.
   * Snaps the offset to match the pointer's entry position within the element.
   *
   * @param {MouseEvent} e
   * @returns {void}
   */
  const handleMouseEnter = (e) => {
    if (disabled || type !== "hover") return;
    const rect = containerRef.getBoundingClientRect();
    const percentX = (e.clientX - rect.left) / rect.width;
    const percentY = (e.clientY - rect.top) / rect.height;

    let moveX = (percentX - 0.5) * maxOffset * 2;
    let moveY = (percentY - 0.5) * maxOffset * 2;

    applyTransform(moveX, moveY, true);
  };

  /**
   * `mouseleave` handler — resets the parallax offset back to zero.
   *
   * @returns {void}
   */
  const handleMouseLeave = () => {
    if (disabled || (type !== "mouse" && type !== "hover")) return;
    resetTransform(true);
  };

  // Outer container — position: relative + overflow: hidden to clip the child
  const container = WidgetFactory({
    tag: "div",
    position: "relative",
    overflow: "hidden",
    style: rest.style || {},
    ...rest,
  });

  containerRef = container;

  // Inner wrapper that receives CSS transforms; will-change enables GPU compositing
  const animatedWrapper = WidgetFactory({
    tag: "div",
    style: {
      willChange: "transform",
      transition: `transform ${duration}ms ${easing}`,
      transform: "translateX(0) translateY(0)",
    },
  });

  // Append child content to the animated wrapper
  if (child) {
    if (child instanceof HTMLElement) {
      animatedWrapper.appendChild(child);
    } else if (typeof child === "string") {
      const textNode = document.createTextNode(child);
      animatedWrapper.appendChild(textNode);
    } else if (Array.isArray(child)) {
      child.forEach((item) => {
        if (item instanceof HTMLElement) animatedWrapper.appendChild(item);
        else if (typeof item === "string") {
          animatedWrapper.appendChild(document.createTextNode(item));
        }
      });
    }
  }

  animatedContent = animatedWrapper;
  container.appendChild(animatedWrapper);

  // Attach the appropriate event listeners for the selected interaction mode
  if (type === "scroll") {
    window.addEventListener("scroll", handleScroll);
    // Run once after a short delay to sync with the current scroll position
    initialTimer = setTimeout(() => {
      initialTimer = null;
      handleScroll();
    }, 100);
  } else if (type === "mouse" || type === "hover") {
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    if (type === "hover") {
      container.addEventListener("mouseenter", handleMouseEnter);
    }
  }

  // ========== PUBLIC METHODS ==========

  /**
   * Updates the parallax speed multiplier at runtime and re-applies the
   * current transform (scroll mode only).
   *
   * @param {number} newSpeed - New speed multiplier.
   * @returns {void}
   */
  container.updateSpeed = (newSpeed) => {
    speed = newSpeed;
    if (type === "scroll") handleScroll();
  };

  /**
   * Updates the active parallax direction and re-applies or resets the transform.
   *
   * @param {"vertical"|"horizontal"|"both"} newDirection
   * @returns {void}
   */
  container.updateDirection = (newDirection) => {
    direction = newDirection;
    if (type === "scroll") handleScroll();
    else resetTransform(true);
  };

  /**
   * Programmatically sets the parallax offset to a specific position.
   *
   * @param {number}  x              - Horizontal offset in pixels.
   * @param {number}  y              - Vertical offset in pixels.
   * @param {boolean} [animate=true] - Whether to animate the change.
   * @returns {void}
   */
  container.setPosition = (x, y, animate = true) => {
    applyTransform(x, y, animate);
  };

  /**
   * Resets the parallax offset back to the origin (0, 0).
   *
   * @param {boolean} [animate=true] - Whether to animate the reset.
   * @returns {void}
   */
  container.reset = (animate = true) => {
    resetTransform(animate);
  };

  // ========== CLEANUP ==========

  const originalCleanup = container._cleanup;
  /**
   * Removes all event listeners, cancels pending animation frames, clears
   * timers, and calls any previously assigned `_cleanup` function.
   *
   * @returns {void}
   */
  container._cleanup = () => {
    if (type === "scroll") {
      window.removeEventListener("scroll", handleScroll);
    } else {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (type === "hover") {
        container.removeEventListener("mouseenter", handleMouseEnter);
      }
    }
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (initialTimer) clearTimeout(initialTimer);
    transitionTimers.forEach((timer) => clearTimeout(timer));
    transitionTimers.clear();
    if (originalCleanup) originalCleanup();
  };

  return container;
};

export default ParallaxBox;
