/**
 * AnimatedText - Animates individual characters of a Text widget.
 *
 * Splits the original text into individual letter widgets, wraps each one in
 * an {@link AnimatedBox}, and lays them out in a flex container. Supports both
 * simultaneous and staggered (per-character delay) animation modes.
 *
 * @module animations/AnimatedText
 */
import { Container } from "../widgets/Container.js";
import { AnimatedBox } from "./AnimatedBox.js";
import { Text } from "../widgets/Text.js";

/**
 * Renders each character of a Text widget as an independently animated element.
 *
 * @param {object}          props
 * @param {HTMLElement}     props.child            - A Text widget whose characters will be animated.
 * @param {Array<object>}   [props.animations]     - Animation descriptors passed to each character's
 *   AnimatedBox. When absent or empty the original `child` is returned unchanged.
 * @param {boolean}         [props.sameTime=false] - When `true`, all characters animate simultaneously
 *   (no per-character delay). When `false`, each character is delayed by `delayBetween` seconds
 *   multiplied by its index.
 * @param {number}          [props.delayBetween=0.1] - Seconds between consecutive character animations
 *   (only used when `sameTime` is `false`).
 * @param {"row"|"column"}  [props.orientation="row"] - Flex direction for the character container.
 *   `"row"` lays characters horizontally (normal reading order);
 *   `"column"` stacks them vertically.
 * @returns {HTMLElement|null} A flex Container holding each animated letter, or `null` if no
 *   `child` was provided.
 */
export const AnimatedText = ({
  child,
  animations,
  sameTime = false,
  delayBetween = 0.1,
  orientation = "row",
}) => {
  if (!child) return null;
  if (!animations || animations.length === 0) return child;

  // Extract text content and props from the original Text widget
  const originalText = child._props?.text || child.textContent || "";
  const originalProps = { ...(child._props || {}) };
  // Ensure no background animation styles bleed into individual letter widgets
  delete originalProps.animations;

  const container = Container({
    display: "flex",
    flexDirection: orientation === "row" ? "row" : "column",
    flexWrap: orientation === "row" ? "wrap" : "nowrap",
    alignItems: orientation === "row" ? "center" : "flex-start",
  });

  const letters = originalText.split("");

  letters.forEach((letter, index) => {
    // Render spaces as fixed-width spacers rather than animated characters
    if (letter === " ") {
      const space = Container({
        textContent: " ",
        display: "inline-block",
        width: orientation === "row" ? "0.3em" : "100%",
        height: orientation === "column" ? "0.3em" : "auto",
      });
      container.appendChild(space);
      return;
    }

    // Compute per-character delay based on position (0 when sameTime is true)
    const baseDelay = sameTime ? 0 : index * delayBetween;

    // Copy all animation descriptors, overriding delay with the per-character value
    const letterAnimations = animations.map((anim) => ({
      ...anim,
      delay: `${baseDelay}s`,
    }));

    // Create a new Text widget for this single character, inheriting all original
    // text props (font, color, size, etc.) but rendering only the one letter.
    const letterWidget = Text({
      ...originalProps,
      text: letter,
      children: undefined,
    });

    // Match the flex layout of the container
    letterWidget.style.display =
      orientation === "row" ? "inline-block" : "block";
    if (orientation === "column") {
      letterWidget.style.textAlign = "center";
    }

    const animatedLetter = AnimatedBox({
      animations: letterAnimations,
      child: letterWidget,
    });

    container.appendChild(animatedLetter);
  });

  return container;
};

export default AnimatedText;
