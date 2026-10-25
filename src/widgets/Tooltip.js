/**
 * @file Tooltip.js
 * @description Hover/focus tooltip rendered as a fixed-position portal on `document.body`.
 * Hover only where a pointer can hover, and the bubble is placed inside the
 * device's safe area.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { resolveReactive } from "../widget-factory/reactiveValue.js";
import { colors } from "../utils/themes.js";

import { toREM } from "../utils/units.js";

/** The bubble and the thing it describes have to be able to name each other. */
let tooltipIdSeed = 0;

/**
 * The device's own edge insets, in CSS pixels.
 *
 * `env()` has no JavaScript getter — the only way to read it is to measure an
 * element that uses it — and the placement below needs the number, not just the
 * CSS: a bubble that clears the viewport by 10px still sits on the status bar of
 * a notched phone. The probe is a child of the bubble it measures, so showing a
 * tooltip never puts a second node in `document.body`, and it is re-read on every
 * show because rotation moves the inset from the top edge to the sides.
 */
const makeInsetProbe = () => {
  const probe = document.createElement("div");
  // Out of the flow, so the bubble keeps the size its text gives it.
  probe.style.cssText =
    "position:absolute;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;" +
    "padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);" +
    "padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px);";
  return probe;
};

const readInsets = (probe) => {
  if (!probe) return { top: 0, bottom: 0, left: 0, right: 0 };
  const cs = getComputedStyle(probe);
  return {
    top: parseFloat(cs.paddingTop) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
    right: parseFloat(cs.paddingRight) || 0,
  };
};

export const Tooltip = (props) => {
  let {
    text,
    child,
    position = "top",
    // Neither delay prop carries a default: `tooltipDelay` is the deprecated
    // alias of `delay`, so a caller that only sets the alias must not have the
    // 300 ms default of the other name win over it.
    delay = null,
    /** @deprecated Use `delay` instead. */
    tooltipDelay = null,
    bgColor = colors.secondary,
    textColor = colors.onSecondary,
    fontSize = 12,
    padding = `${toREM(4)} ${toREM(8)}`,
    borderRadius = 4,
    offset = 8,
    showArrow = true,
    disabled = false,

    maxWidth = 200,
    textAlign = "center",
    zIndex = 9999,
    animationDuration = 200,
    arrowSize = 6,

    borderColor = "transparent",
    borderWidth = 0,
    shadow = "0 2px 8px rgba(0,0,0,0.15)",
  } = props;

  if (!child) return null;

  // The wait before the tooltip appears. A live `useState` value is a function,
  // and `setTimeout` would coerce it to NaN — resolve it before using it.
  const showDelay = Number(resolveReactive(delay ?? tooltipDelay) ?? 300);

  let tooltipElement = null;
  let timeoutId = null;
  let isVisible = false;

  const tooltipId = `fletbox-tooltip-${++tooltipIdSeed}`;

  let scrollHandler = null;
  let resizeHandler = null;

  const hideOnScrollOrResize = () => {
    if (isVisible) {
      hideTooltip();
    }
  };

  const createTooltip = () => {
    if (tooltipElement) return tooltipElement;

    // ✅ FIXED: use "text" instead of "textContent"
    const content = WidgetFactory({
      widgetName: "Tooltip",
      backgroundColor: bgColor,
      borderRadius:
        toREM(borderRadius),
      padding: padding,
      maxWidth: toREM(maxWidth),
      boxShadow: shadow,
      border:
        borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
      child: WidgetFactory({
        tag: "span",
        text: text, // ✅ "text" is the correct prop in FletBox
        fontSize: toREM(fontSize),
        color: textColor,
        textAlign: textAlign,
        display: "block",
        lineHeight: "1.4",
      }),
    });

    let arrow = null;
    if (showArrow) {
      arrow = WidgetFactory({
        tag: "div",
        position: "absolute",
        width: 0,
        height: 0,
        borderStyle: "solid",
      });
    }

    const tooltip = WidgetFactory({
      tag: "div",
      // The bubble is what `aria-describedby` on the trigger points at, so the id
      // and the role live on the element that is actually shown and hidden — its
      // subtree is the sentence a reader hears.
      id: tooltipId,
      role: "tooltip",
      position: "fixed",
      zIndex: zIndex,
      opacity: 0,
      visibility: "hidden",
      transition: `opacity ${animationDuration}ms ease, visibility ${animationDuration}ms ease`,
      pointerEvents: "none",
    });

    const probe = makeInsetProbe();
    tooltip.appendChild(probe);
    tooltip.appendChild(content);
    if (arrow) tooltip.appendChild(arrow);

    document.body.appendChild(tooltip);
    tooltipElement = tooltip;

    tooltip._content = content;
    tooltip._arrow = arrow;
    tooltip._probe = probe;

    return tooltip;
  };

  const positionTooltip = (targetRect, tooltipRect) => {
    if (!tooltipElement) return;

    // The edge the bubble actually gets: the requested one when it fits, the
    // opposite when it does not. Clamping a `top` bubble into the viewport used
    // to park it at y=10 — over the iOS status bar, above the AppBar it
    // describes — because "there is no room up here" and "put it at the top of
    // the screen" are not the same instruction.
    const MARGIN = 10;
    const inset = readInsets(tooltipElement._probe);
    const boxTop = inset.top + MARGIN;
    const boxBottom = window.innerHeight - inset.bottom - MARGIN;
    const boxLeft = inset.left + MARGIN;
    const boxRight = window.innerWidth - inset.right - MARGIN;
    const needed = tooltipRect.height + offset;
    const wide = tooltipRect.width + offset;
    const room = {
      top: targetRect.top - boxTop,
      bottom: boxBottom - targetRect.bottom,
      left: targetRect.left - boxLeft,
      right: boxRight - targetRect.right,
    };
    const flip = { top: "bottom", bottom: "top", left: "right", right: "left" };
    const fits = { top: room.top >= needed, bottom: room.bottom >= needed, left: room.left >= wide, right: room.right >= wide };
    const side = fits[position] ? position : fits[flip[position]] ? flip[position] : position;

    let top, left;
    let arrowTop, arrowLeft;

    switch (side) {
      case "top":
        top = targetRect.top - tooltipRect.height - offset;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        if (tooltipElement._arrow) {
          arrowTop = tooltipRect.height;
          arrowLeft = tooltipRect.width / 2 - arrowSize;
          tooltipElement._arrow.style.borderWidth = `${toREM(arrowSize)} ${toREM(arrowSize)} 0 ${toREM(arrowSize)}`;
          tooltipElement._arrow.style.borderColor = `${bgColor} transparent transparent transparent`;
          tooltipElement._arrow.style.top = `${arrowTop}px`;
          tooltipElement._arrow.style.left = `${arrowLeft}px`;
        }
        break;
      case "bottom":
        top = targetRect.bottom + offset;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        if (tooltipElement._arrow) {
          arrowTop = -arrowSize;
          arrowLeft = tooltipRect.width / 2 - arrowSize;
          tooltipElement._arrow.style.borderWidth = `0 ${toREM(arrowSize)} ${toREM(arrowSize)} ${toREM(arrowSize)}`;
          tooltipElement._arrow.style.borderColor = `transparent transparent ${bgColor} transparent`;
          tooltipElement._arrow.style.top = `${arrowTop}px`;
          tooltipElement._arrow.style.left = `${arrowLeft}px`;
        }
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.left - tooltipRect.width - offset;
        if (tooltipElement._arrow) {
          arrowTop = tooltipRect.height / 2 - arrowSize;
          arrowLeft = tooltipRect.width;
          tooltipElement._arrow.style.borderWidth = `${toREM(arrowSize)} 0 ${toREM(arrowSize)} ${toREM(arrowSize)}`;
          tooltipElement._arrow.style.borderColor = `transparent transparent transparent ${bgColor}`;
          tooltipElement._arrow.style.top = `${arrowTop}px`;
          tooltipElement._arrow.style.left = `${arrowLeft}px`;
        }
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.right + offset;
        if (tooltipElement._arrow) {
          arrowTop = tooltipRect.height / 2 - arrowSize;
          arrowLeft = -arrowSize;
          tooltipElement._arrow.style.borderWidth = `${toREM(arrowSize)} ${toREM(arrowSize)} ${toREM(arrowSize)} 0`;
          tooltipElement._arrow.style.borderColor = `transparent ${bgColor} transparent transparent`;
          tooltipElement._arrow.style.top = `${arrowTop}px`;
          tooltipElement._arrow.style.left = `${arrowLeft}px`;
        }
        break;
    }

    // Keep the bubble inside the safe area on every axis. `Math.max(boxTop, …)`
    // guards the other end for a bubble taller or wider than the screen, where
    // the two bounds cross.
    left = Math.min(Math.max(left, boxLeft), Math.max(boxLeft, boxRight - tooltipRect.width));
    top = Math.min(Math.max(top, boxTop), Math.max(boxTop, boxBottom - tooltipRect.height));

    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
  };

  const showTooltip = () => {
    if (disabled) return;
    if (isVisible) return;

    timeoutId = setTimeout(() => {
      const tooltip = createTooltip();
      const childRect = child.getBoundingClientRect();

      tooltip.style.visibility = "visible";
      tooltip.style.opacity = "0";

      const tooltipRect = tooltip.getBoundingClientRect();
      positionTooltip(childRect, tooltipRect);

      requestAnimationFrame(() => {
        tooltip.style.opacity = "1";
        tooltip.style.visibility = "visible";
      });

      isVisible = true;
      // The link is made while the bubble is up and broken while it is not: an
      // `aria-describedby` pointing at a hidden node is a control that claims a
      // description it is not being given.
      child.setAttribute("aria-describedby", tooltipId);

      scrollHandler = hideOnScrollOrResize;
      resizeHandler = hideOnScrollOrResize;
      window.addEventListener("scroll", scrollHandler, true);
      window.addEventListener("resize", resizeHandler);
    }, showDelay);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (tooltipElement && isVisible) {
      tooltipElement.style.opacity = "0";
      tooltipElement.style.visibility = "hidden";
      isVisible = false;
      child.removeAttribute("aria-describedby");

      if (scrollHandler) {
        window.removeEventListener("scroll", scrollHandler, true);
        scrollHandler = null;
      }
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
        resizeHandler = null;
      }
    }
  };

  const wrappedChild = child;

  // A device that cannot hover has no state a tooltip can live in. iOS WebKit
  // fires a synthetic `mouseenter` for the first tap and never a matching
  // `mouseleave`, so one tap pinned a bubble to the screen and a second tap on
  // another control stacked a second one on top of it — measured: two bubbles
  // visible at once, neither ever hidden. A pointer that does hover keeps the
  // behaviour, and the keyboard path below stays open for everyone.
  const canHover =
    typeof window === "undefined" || !window.matchMedia || window.matchMedia("(hover: hover)").matches;

  if (canHover) {
    wrappedChild.addEventListener("mouseenter", showTooltip);
    wrappedChild.addEventListener("mouseleave", hideTooltip);
  }
  wrappedChild.addEventListener("focus", showTooltip);
  wrappedChild.addEventListener("blur", hideTooltip);

  wrappedChild.onUnmount(() => {
    if (timeoutId) clearTimeout(timeoutId);
    if (tooltipElement && tooltipElement.parentNode) {
      tooltipElement.parentNode.removeChild(tooltipElement);
    }
    if (scrollHandler)
      window.removeEventListener("scroll", scrollHandler, true);
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    wrappedChild.removeEventListener("mouseenter", showTooltip);
    wrappedChild.removeEventListener("mouseleave", hideTooltip);
    wrappedChild.removeEventListener("focus", showTooltip);
    wrappedChild.removeEventListener("blur", hideTooltip);
  });

  wrappedChild.showTooltip = showTooltip;
  wrappedChild.hideTooltip = hideTooltip;
  wrappedChild.updateContent = (newText) => {
    text = newText;
    if (tooltipElement && tooltipElement._content) {
      const textSpan = tooltipElement._content.querySelector("span");
      if (textSpan) textSpan.textContent = newText;
    }
  };
  wrappedChild.updatePosition = () => {
    if (isVisible && tooltipElement) {
      const childRect = child.getBoundingClientRect();
      const tooltipRect = tooltipElement.getBoundingClientRect();
      positionTooltip(childRect, tooltipRect);
    }
  };

  return wrappedChild;
};

export default Tooltip;
