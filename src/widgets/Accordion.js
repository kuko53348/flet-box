// widgets/Accordion.js - Fixed version (expands correctly)
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { Container } from "./Container.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";

export const Accordion = (props) => {
  const {
    title,
    children,
    expanded = false,
    onToggle,
    variant = "contained", // 'contained', 'outlined', 'ghost'
    borderRadius = 8,
    // Colors
    bgColor = colors.surface,
    titleColor = colors.text,
    expandedColor = colors.primary,
    // Borders
    border = null,
    borderColor = colors.border,
    borderWidth = 1,
    // Title
    titleSize = 14,
    titleWeight = "500",
    titlePadding = "12px 16px",
    // Content
    contentPadding = "16px",
    // Icon
    iconCollapsed = "chevron_right",
    iconExpanded = "expand_more",
    iconColor = colors.textSecondary,
    iconSize = 20,
    // Divider
    divider = true,
    dividerColor = colors.border,
    // State
    disabled = false,
    animate = true,
    animationDuration = 300,
    elevation = 0,
    ...rest
  } = props;

  // Internal state
  let isExpanded = expanded;
  let currentTitle = title;
  let currentChildren = children;
  let currentDisabled = disabled;
  let currentVariant = variant;
  let currentBgColor = bgColor;
  let currentExpandedColor = expandedColor;
  let currentTitleColor = titleColor;
  let currentTitleSize = titleSize;
  let currentTitleWeight = titleWeight;
  let currentTitlePadding = titlePadding;
  let currentContentPadding = contentPadding;
  let currentIconCollapsed = iconCollapsed;
  let currentIconExpanded = iconExpanded;
  let currentIconColor = iconColor;
  let currentIconSize = iconSize;
  let currentDivider = divider;
  let currentDividerColor = dividerColor;
  let currentBorderRadius = borderRadius;
  let currentBorder = border;
  let currentBorderColor = borderColor;
  let currentBorderWidth = borderWidth;
  let currentElevation = elevation;
  let currentAnimationDuration = animationDuration;

  let contentWrapper = null;
  let contentInner = null;
  let titleBar = null;
  let titleElement = null;
  let iconElement = null;
  let resizeObserver = null;
  let isAnimating = false;

  // ========== UI UPDATE FUNCTIONS ==========
  const updateUI = () => {
    if (!titleElement || !iconElement || !titleBar || !contentInner) return;

    // Title text
    if (titleElement.textContent !== currentTitle) {
      titleElement.textContent = currentTitle;
    }

    // Title styles
    titleElement.style.color = isExpanded
      ? currentExpandedColor
      : currentTitleColor;
    titleElement.style.fontSize = `${currentTitleSize}px`;
    titleElement.style.fontWeight = currentTitleWeight;

    // Icon
    iconElement.setAttribute(
      "name",
      isExpanded ? currentIconExpanded : currentIconCollapsed,
    );
    iconElement.style.color = currentIconColor;
    iconElement.style.fontSize = `${currentIconSize}px`;

    // Title bar
    titleBar.style.cursor = currentDisabled ? "not-allowed" : "pointer";
    titleBar.style.opacity = currentDisabled ? "0.5" : "1";
    titleBar.style.padding = currentTitlePadding;

    if (currentVariant === "contained") {
      titleBar.style.backgroundColor = isExpanded
        ? `${currentExpandedColor}10`
        : "transparent";
    } else {
      titleBar.style.backgroundColor = "transparent";
    }

    // Divider
    if (currentDivider && isExpanded) {
      contentInner.style.borderTop = `1px solid ${currentDividerColor}`;
    } else {
      contentInner.style.borderTop = "none";
    }

    // Main container border
    if (currentBorder) {
      container.style.border = currentBorder;
    } else if (currentVariant === "outlined") {
      container.style.border = `${currentBorderWidth}px solid ${currentBorderColor}`;
    } else {
      container.style.border = "none";
    }

    // Container background
    if (currentVariant === "contained") {
      container.style.backgroundColor = currentBgColor;
    } else {
      container.style.backgroundColor = "transparent";
    }

    // Border radius
    container.style.borderRadius = `${currentBorderRadius}px`;
    container.style.overflow = "hidden";

    // Shadow
    if (currentElevation > 0) {
      const shadows = {
        1: "0 1px 3px rgba(0,0,0,0.12)",
        2: "0 3px 6px rgba(0,0,0,0.16)",
        3: "0 6px 12px rgba(0,0,0,0.2)",
        4: "0 10px 20px rgba(0,0,0,0.25)",
      };
      container.style.boxShadow = shadows[currentElevation] || shadows[2];
    } else {
      container.style.boxShadow = "none";
    }

    // Content padding
    contentInner.style.padding = currentContentPadding;
  };

  // ========== FIXED HEIGHT ANIMATION ==========
  const getContentHeight = () => {
    if (!contentInner) return 0;
    // Force correct calculation including padding and margins
    const clone = contentInner.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.visibility = "hidden";
    clone.style.display = "block";
    clone.style.height = "auto";
    clone.style.padding = currentContentPadding;
    document.body.appendChild(clone);
    const height = clone.offsetHeight;
    document.body.removeChild(clone);
    return height;
  };

  const setHeight = (height, instant = false) => {
    if (!contentWrapper) return;
    if (animate && !instant) {
      contentWrapper.style.transition = `height ${currentAnimationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      contentWrapper.style.height = height;
    } else {
      contentWrapper.style.transition = "none";
      contentWrapper.style.height = height;
    }
  };

  const expand = (triggerCallback = true) => {
    if (currentDisabled || isAnimating) return;
    if (isExpanded) return;

    isAnimating = true;
    isExpanded = true;

    // Show content to measure
    contentWrapper.style.display = "block";
    contentInner.style.display = "block";

    // Force reflow
    void contentWrapper.offsetHeight;

    // Measure actual height
    const targetHeight = getContentHeight() + "px";

    setHeight("0px");
    setTimeout(() => {
      setHeight(targetHeight);
      setTimeout(() => {
        setHeight("auto", true);
        contentWrapper.style.overflow = "visible";
        isAnimating = false;
        if (triggerCallback && onToggle) onToggle(true);
        updateUI();
      }, currentAnimationDuration);
    }, 10);
  };

  const collapse = (triggerCallback = true) => {
    if (currentDisabled || isAnimating) return;
    if (!isExpanded) return;

    isAnimating = true;

    // Get current height
    const currentHeight = contentInner.scrollHeight + "px";
    contentWrapper.style.overflow = "hidden";
    setHeight(currentHeight);

    setTimeout(() => {
      setHeight("0px");
      isExpanded = false;
      setTimeout(() => {
        contentWrapper.style.display = "none";
        contentWrapper.style.overflow = "";
        contentInner.style.display = "";
        isAnimating = false;
        if (triggerCallback && onToggle) onToggle(false);
        updateUI();
      }, currentAnimationDuration);
    }, 10);
  };

  const toggle = () => {
    if (currentDisabled || isAnimating) return;
    if (isExpanded) collapse();
    else expand();
  };

  // ========== WATCH SIZE CHANGES ==========
  const setupResizeObserver = () => {
    if (!contentInner || !animate) return;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        if (isExpanded && contentWrapper && !isAnimating) {
          const newHeight = getContentHeight() + "px";
          if (
            contentWrapper.style.height !== "auto" &&
            contentWrapper.style.height !== newHeight
          ) {
            setHeight(newHeight);
            setTimeout(() => setHeight("auto", true), currentAnimationDuration);
          }
        }
      });
      resizeObserver.observe(contentInner);
    }
  };

  // ========== WIDGET CONSTRUCTION ==========
  const container = Container({
    style: {
      width: "100%",
      overflow: "hidden",
    },
    ...rest,
  });

  // Title bar
  titleElement = Text({
    text: currentTitle,
    size: currentTitleSize,
    weight: currentTitleWeight,
    color: isExpanded ? currentExpandedColor : currentTitleColor,
    style: { flex: 1 },
  });

  iconElement = Icon({
    name: isExpanded ? currentIconExpanded : currentIconCollapsed,
    size: currentIconSize,
    color: currentIconColor,
    style: {
      transition: animate
        ? `transform ${currentAnimationDuration}ms ease`
        : "none",
    },
  });

  titleBar = Row({
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    style: {
      padding: currentTitlePadding,
      cursor: currentDisabled ? "not-allowed" : "pointer",
      opacity: currentDisabled ? 0.5 : 1,
      backgroundColor:
        isExpanded && currentVariant === "contained"
          ? `${currentExpandedColor}10`
          : "transparent",
    },
    children: [titleElement, iconElement],
  });

  // Wrapper with height animation
  contentWrapper = WidgetFactory({
    tag: "div",
    overflow: "hidden",
    transition: animate
      ? `height ${currentAnimationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
      : "none",
    height: isExpanded ? "auto" : "0",
    display: isExpanded ? "block" : "none",
  });

  // Inner content (no animation, only shown/hidden)
  contentInner = Container({
    style: {
      padding: currentContentPadding,
      borderTop:
        currentDivider && isExpanded
          ? `1px solid ${currentDividerColor}`
          : "none",
    },
    children: currentChildren,
  });

  contentWrapper.appendChild(contentInner);
  container.appendChild(titleBar);
  container.appendChild(contentWrapper);

  // Apply initial styles
  updateUI();

  // Click event
  titleBar.onclick = () => toggle();

  // Size observer
  setupResizeObserver();

  // ========== PUBLIC METHODS AND REACTIVITY ==========
  const setExpanded = (exp, triggerCallback = true) => {
    if (exp === isExpanded) return;
    if (exp) expand(triggerCallback);
    else collapse(triggerCallback);
  };

  const update = (newProps) => {
    let needsUIUpdate = false;

    if (newProps.title !== undefined && newProps.title !== currentTitle) {
      currentTitle = newProps.title;
      needsUIUpdate = true;
    }
    if (newProps.children !== undefined) {
      currentChildren = newProps.children;
      // Replace content
      while (contentInner.firstChild)
        contentInner.removeChild(contentInner.firstChild);
      const childrenArray = Array.isArray(currentChildren)
        ? currentChildren
        : [currentChildren];
      childrenArray.forEach((child) => {
        if (child instanceof HTMLElement) contentInner.appendChild(child);
        else if (typeof child === "string")
          contentInner.appendChild(document.createTextNode(child));
      });
      // If expanded, readjust height
      if (isExpanded && animate && !isAnimating) {
        const newHeight = getContentHeight() + "px";
        if (contentWrapper.style.height !== "auto") {
          setHeight(newHeight);
          setTimeout(() => setHeight("auto", true), currentAnimationDuration);
        }
      }
    }
    if (newProps.disabled !== undefined) currentDisabled = newProps.disabled;
    if (newProps.variant !== undefined) currentVariant = newProps.variant;
    if (newProps.bgColor !== undefined) currentBgColor = newProps.bgColor;
    if (newProps.expandedColor !== undefined)
      currentExpandedColor = newProps.expandedColor;
    if (newProps.titleColor !== undefined)
      currentTitleColor = newProps.titleColor;
    if (newProps.titleSize !== undefined) currentTitleSize = newProps.titleSize;
    if (newProps.titleWeight !== undefined)
      currentTitleWeight = newProps.titleWeight;
    if (newProps.titlePadding !== undefined)
      currentTitlePadding = newProps.titlePadding;
    if (newProps.contentPadding !== undefined) {
      currentContentPadding = newProps.contentPadding;
      contentInner.style.padding = currentContentPadding;
    }
    if (newProps.iconCollapsed !== undefined)
      currentIconCollapsed = newProps.iconCollapsed;
    if (newProps.iconExpanded !== undefined)
      currentIconExpanded = newProps.iconExpanded;
    if (newProps.iconColor !== undefined) currentIconColor = newProps.iconColor;
    if (newProps.iconSize !== undefined) currentIconSize = newProps.iconSize;
    if (newProps.divider !== undefined) currentDivider = newProps.divider;
    if (newProps.dividerColor !== undefined)
      currentDividerColor = newProps.dividerColor;
    if (newProps.borderRadius !== undefined)
      currentBorderRadius = newProps.borderRadius;
    if (newProps.border !== undefined) currentBorder = newProps.border;
    if (newProps.borderColor !== undefined)
      currentBorderColor = newProps.borderColor;
    if (newProps.borderWidth !== undefined)
      currentBorderWidth = newProps.borderWidth;
    if (newProps.elevation !== undefined) currentElevation = newProps.elevation;
    if (newProps.animationDuration !== undefined)
      currentAnimationDuration = newProps.animationDuration;

    if (needsUIUpdate) updateUI();
  };

  // Reactive properties
  Object.defineProperty(container, "expanded", {
    get: () => isExpanded,
    set: (val) => setExpanded(val, true),
  });
  Object.defineProperty(container, "disabled", {
    get: () => currentDisabled,
    set: (val) => update({ disabled: val }),
  });
  container.setExpanded = setExpanded;
  container.toggle = toggle;
  container.update = update;

  // ========== CLEANUP ==========
  const cleanup = () => {
    if (resizeObserver) resizeObserver.disconnect();
    if (contentWrapper && contentWrapper._cleanup) contentWrapper._cleanup();
  };
  const originalCleanup = container._cleanup;
  container._cleanup = () => {
    cleanup();
    if (originalCleanup) originalCleanup();
  };

  return container;
};

export default Accordion;
