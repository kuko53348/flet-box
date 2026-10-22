/**
 * @file Skeleton.js
 * @description Loading placeholder (pulse/wave) using globally injected keyframes.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { injectKeyframes } from "../utils/styleInjector.js";

import { toREM } from "../utils/units.js";

export const Skeleton = (props) => {
  const {
    variant = "text", // 'text', 'circular', 'avatar', 'image', 'card', 'listTile', 'button'
    width,
    height,
    borderRadius,
    animation = "pulse", // 'pulse', 'wave', 'none'
    count = 1,
    gap = 8,

    // Color props for consistency
    bgColor = colors.gray200,
    highlightColor = colors.gray100,
    shimmerColor = colors.gray300,

    // Animation timing
    pulseDuration = "1.5s",
    waveDuration = "1.5s",

    ...rest
  } = props;

  // Default dimensions based on variant
  const getDefaultDimensions = () => {
    switch (variant) {
      case "text":
        return { width: "100%", height: 16, borderRadius: 4 };
      case "circular":
        return { width: 48, height: 48, borderRadius: "50%" };
      case "avatar":
        return { width: 40, height: 40, borderRadius: "50%" };
      case "image":
        return { width: "100%", height: 150, borderRadius: 8 };
      case "card":
        return { width: "100%", height: 120, borderRadius: 12 };
      case "listTile":
        return { width: "100%", height: 56, borderRadius: 8 };
      // The shape a button actually has: 40 units tall (the Fitts floor the Button
      // preset uses) with the Button's own 16-unit corner, not an invented 36x24
      // pill — a skeleton that does not match the control it replaces reads as a
      // layout shift when the real one loads.
      case "button":
        return { width: 120, height: 40, borderRadius: 16 };
      default:
        return { width: "100%", height: 20, borderRadius: 4 };
    }
  };

  const defaults = getDefaultDimensions();
  const finalWidth = width !== undefined ? width : defaults.width;
  const finalHeight = height !== undefined ? height : defaults.height;
  const finalBorderRadius =
    borderRadius !== undefined ? borderRadius : defaults.borderRadius;

  // Animation styles
  const getAnimationStyle = () => {
    if (animation === "pulse") {
      return {
        animation: `skeleton-pulse ${pulseDuration} ease-in-out infinite`,
      };
    }
    if (animation === "wave") {
      return {
        background: `linear-gradient(90deg, ${bgColor} 25%, ${highlightColor} 50%, ${bgColor} 75%)`,
        backgroundSize: "200% 100%",
        animation: `skeleton-wave ${waveDuration} ease-in-out infinite`,
      };
    }
    return {};
  };

  // Build specific variant structure using WidgetFactory
  const buildVariant = () => {
    // Button variant
    if (variant === "button") {
      return WidgetFactory({
        tag: "div",
        width: toREM(finalWidth),
        height:
          toREM(finalHeight),
        backgroundColor: bgColor,
        borderRadius: toREM(finalBorderRadius),
        ...getAnimationStyle(),
      });
    }

    // ListTile variant
    if (variant === "listTile") {
      const container = WidgetFactory({
        tag: "div",
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
      });

      const avatar = WidgetFactory({
        tag: "div",
        width: 40,
        height: 40,
        backgroundColor: bgColor,
        borderRadius: "50%",
        flexShrink: 0,
        ...getAnimationStyle(),
      });
      container.appendChild(avatar);

      const textContainer = WidgetFactory({
        tag: "div",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      });

      const line1 = WidgetFactory({
        tag: "div",
        width: "80%",
        height: 14,
        backgroundColor: bgColor,
        borderRadius: 4,
        ...getAnimationStyle(),
      });

      const line2 = WidgetFactory({
        tag: "div",
        width: "60%",
        height: 12,
        backgroundColor: bgColor,
        borderRadius: 4,
        ...getAnimationStyle(),
      });

      textContainer.appendChild(line1);
      textContainer.appendChild(line2);
      container.appendChild(textContainer);

      return container;
    }

    // Card variant
    if (variant === "card") {
      const container = WidgetFactory({
        tag: "div",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
      });

      const imageArea = WidgetFactory({
        tag: "div",
        width: "100%",
        height: 120,
        backgroundColor: bgColor,
        borderRadius: 8,
        ...getAnimationStyle(),
      });
      container.appendChild(imageArea);

      const textLines = WidgetFactory({
        tag: "div",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        paddingHorizontal: 8,
      });

      const line1 = WidgetFactory({
        tag: "div",
        width: "90%",
        height: 16,
        backgroundColor: bgColor,
        borderRadius: 4,
        ...getAnimationStyle(),
      });

      const line2 = WidgetFactory({
        tag: "div",
        width: "70%",
        height: 12,
        backgroundColor: bgColor,
        borderRadius: 4,
        ...getAnimationStyle(),
      });

      textLines.appendChild(line1);
      textLines.appendChild(line2);
      container.appendChild(textLines);

      return container;
    }

    // Simple variants (text, circular, avatar, image)
    return WidgetFactory({
      tag: "div",
      width: toREM(finalWidth),
      height:
        toREM(finalHeight),
      backgroundColor: bgColor,
      borderRadius: toREM(finalBorderRadius),
      ...getAnimationStyle(),
    });
  };

  // Createste multiple items container using WidgetFactory
  const container = WidgetFactory({
    tag: "div",
    widgetName: "Skeleton",
    display: "flex",
    flexDirection: "column",
    gap: toREM(gap),
    width: "100%",
  });

  for (let i = 0; i < count; i++) {
    container.appendChild(buildVariant());
  }

  injectKeyframes(
    "skeleton-pulse",
    "0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; }",
    "skeleton-styles",
  );
  injectKeyframes(
    "skeleton-wave",
    "0% { background-position: 200% 0; } 100% { background-position: -200% 0; }",
  );

  return container;
};

export default Skeleton;
