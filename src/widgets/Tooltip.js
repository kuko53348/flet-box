// widgets/Tooltip.js - Fixed (using text instead of textContent)
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const Tooltip = (props) => {
  let {
    text,
    child,
    position = "top",
    delay = 300,
    bgColor = colors.secondary,
    textColor = "#ffffff",
    fontSize = 12,
    padding = "6px 10px",
    borderRadius = 6,
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

    ...rest
  } = props;

  if (!child) return null;

  let tooltipElement = null;
  let timeoutId = null;
  let isVisible = false;

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
      backgroundColor: bgColor,
      borderRadius:
        typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
      padding: padding,
      maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
      boxShadow: shadow,
      border:
        borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
      child: WidgetFactory({
        tag: "span",
        text: text, // ✅ "text" is the correct prop in FletBox
        fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
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
      position: "fixed",
      zIndex: zIndex,
      opacity: 0,
      visibility: "hidden",
      transition: `opacity ${animationDuration}ms ease, visibility ${animationDuration}ms ease`,
      pointerEvents: "none",
    });

    tooltip.appendChild(content);
    if (arrow) tooltip.appendChild(arrow);

    document.body.appendChild(tooltip);
    tooltipElement = tooltip;

    tooltip._content = content;
    tooltip._arrow = arrow;

    return tooltip;
  };

  const positionTooltip = (targetRect, tooltipRect) => {
    if (!tooltipElement) return;

    let top, left;
    let arrowTop, arrowLeft;

    switch (position) {
      case "top":
        top = targetRect.top - tooltipRect.height - offset;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        if (tooltipElement._arrow) {
          arrowTop = tooltipRect.height;
          arrowLeft = tooltipRect.width / 2 - arrowSize;
          tooltipElement._arrow.style.borderWidth = `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`;
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
          tooltipElement._arrow.style.borderWidth = `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`;
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
          tooltipElement._arrow.style.borderWidth = `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`;
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
          tooltipElement._arrow.style.borderWidth = `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`;
          tooltipElement._arrow.style.borderColor = `transparent ${bgColor} transparent transparent`;
          tooltipElement._arrow.style.top = `${arrowTop}px`;
          tooltipElement._arrow.style.left = `${arrowLeft}px`;
        }
        break;
    }

    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) top = 10;

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

      scrollHandler = hideOnScrollOrResize;
      resizeHandler = hideOnScrollOrResize;
      window.addEventListener("scroll", scrollHandler, true);
      window.addEventListener("resize", resizeHandler);
    }, delay);
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

  wrappedChild.addEventListener("mouseenter", showTooltip);
  wrappedChild.addEventListener("mouseleave", hideTooltip);
  wrappedChild.addEventListener("focus", showTooltip);
  wrappedChild.addEventListener("blur", hideTooltip);

  const originalCleanup = wrappedChild._cleanup;
  wrappedChild._cleanup = () => {
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
    if (originalCleanup) originalCleanup();
  };

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
