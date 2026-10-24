// navigations/Tabs.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { Container } from "../widgets/Container.js";
import { Column } from "../widgets/Column.js";
import { Row } from "../widgets/Row.js";
import { Text } from "../widgets/Text.js";
import { Icon } from "../widgets/Icon.js";
import { toREM } from "../utils/units.js";

/**
 * @typedef {Object} TabDefinition
 * @property {string} label - Display text for the tab.
 * @property {string} [title] - Alias for label.
 * @property {string} [icon] - Material Icon name shown alongside the label.
 * @property {number|string} [badge] - Badge value shown in a small chip on the tab.
 */

/**
 * @typedef {Object} TabsProps
 * @property {Array<string|TabDefinition>} [tabs=[]] - Tab definitions. A plain string is treated as the label.
 * @property {HTMLElement[]} [children=[]] - Content panels, one per tab (matched by index).
 * @property {number} [activeIndex=0] - Initially active tab index.
 * @property {Function} [onChange] - Called with the new index whenever the active tab changes.
 * @property {"underline"|"filled"|"pills"|"slider"} [variant="underline"] - Visual style of the tab bar.
 * @property {"small"|"medium"|"large"} [size="medium"] - Size preset controlling padding, font size, and height.
 * @property {string} [color] - Accent color (indicator, active icon).
 * @property {string} [textColor] - Label color for inactive tabs.
 * @property {string} [activeTextColor] - Label color for the active tab.
 * @property {string} [bgColor] - Background fill of the tab bar (slider/filled variants).
 * @property {string} [buttonColor] - Slider thumb color (slider variant).
 * @property {"left"|"center"|"right"} [alignment="left"] - Alignment hint (not yet fully applied).
 * @property {boolean} [fullWidth=true] - Whether tabs stretch to fill the available width.
 * @property {boolean} [showDivider=true] - Whether to show a bottom border on the underline variant.
 * @property {string} [dividerColor] - Color of the underline divider.
 * @property {boolean} [showIcon=false] - Whether to render the tab's icon.
 * @property {"left"|"right"} [iconPosition="left"] - Position of the icon relative to the label.
 * @property {number} [iconSize=18] - Icon size in pixels.
 * @property {Array<number|string>} [badges=[]] - Badge values indexed by tab position; overrides tab-level badge.
 */

/**
 * Tabs renders a horizontal tab bar with associated content panels.
 *
 * Four visual variants are supported:
 * - `underline` — a moving underline indicator below the active tab.
 * - `filled` — tabs on a solid background, active tab visually distinct.
 * - `pills` — rounded pill-shaped tab buttons.
 * - `slider` — an animated filled thumb that slides under the active tab.
 *
 * The active tab tracks a `currentIndex` state internally. Keyboard
 * navigation (Enter/Space) and ARIA attributes are included for accessibility.
 *
 * A ResizeObserver and a window resize listener keep the slider thumb
 * position correct when the tab bar dimensions change.
 *
 * @param {TabsProps} props
 * @returns {HTMLElement} The tabs container element, augmented with:
 *   - `activeIndex` (getter/setter) — read or set the active tab index.
 *   - `setActiveTab(index: number)` — alias for the setter.
 */
export const Tabs = (props) => {
  const {
    tabs = [],
    children = [],
    activeIndex = 0,
    onChange,
    variant = "underline",
    size = "medium",
    color = colors.primary,
    textColor = colors.textSecondary,
    // `background` made the active label the page color, so it vanished on a
    // transparent tab bar (2.4:1 in light, 1.3:1 in dark). Resolved per variant
    // below: the slider sits on a secondary thumb and needs the ink color.
    activeTextColor,
    bgColor = colors.gray100,
    // The thumb carries the accent, and its label is the ink color in both
    // themes. `secondary` missed AA on the light thumb (4.23:1); primary is
    // 6.65:1 with ink, 6.68:1 in dark.
    buttonColor = color,
    alignment = "left",
    fullWidth = true,
    showDivider = true,
    dividerColor = colors.border,
    showIcon = false,
    iconPosition = "left",
    iconSize = 18,
    badges = [],
    ...rest
  } = props;

  let currentIndex = activeIndex;
  let activeIndicator = null;
  let tabsWrapperRef = null;
  let tabButtonsRef = [];

  // Size preset lookup — controls padding, font size, icon size, content
  // padding, and minimum height in a single prop for consistent scaling.
  const sizes = {
    small: { p: "6px 12px", f: 12, g: 4, i: 14, cp: 12, h: 32 },
    medium: { p: "8px 16px", f: 14, g: 8, i: 18, cp: 16, h: 40 },
    large: { p: "12px 20px", f: 16, g: 10, i: 22, cp: 20, h: 48 },
  };
  const sz = sizes[size] || sizes.medium;

  const resolvedActiveTextColor =
    activeTextColor ?? (variant === "slider" ? colors.onPrimary : colors.text);

  const tabBackground = (isActive) => {
    if (!isActive) return "transparent";
    if (variant === "pills") return `${color}1A`;
    if (variant === "filled") return colors.card;
    return "transparent";
  };

  /** Extract display label from a tab definition or plain string. */
  const getLabel = (t) =>
    typeof t === "object" ? t.label || t.title : String(t);

  /** Extract icon name from a tab definition (returns null for plain strings). */
  const getIcon = (t) => (typeof t === "object" ? t.icon || null : null);

  /**
   * Resolve the badge value for a given tab index.
   * The `badges` prop array takes priority over the tab-level `badge` field.
   */
  const getBadge = (i) => badges[i] || tabs[i]?.badge || null;

  const container = Container({
    width: "100%",
    display: "flex",
    flexDirection: "column",
    ...rest,
  });

  const tabBar = Container({
    position: "relative",
    backgroundColor:
      variant === "slider"
        ? bgColor
        : variant === "filled"
          ? bgColor
          : "transparent",
    borderBottom:
      variant === "underline" && showDivider
        ? `1px solid ${dividerColor}`
        : "none",
    borderRadius: variant === "slider" ? 24 : variant === "pills" ? 20 : 0,
    padding: variant === "slider" ? "4px" : 0,
    flexShrink: 0,
  });

  const tabsWrapper = Row({
    alignItems: "center",
    justifyContent: fullWidth ? "space-between" : "flex-start",
    gap: variant === "pills" ? 4 : 0,
    position: "relative",
    flexWrap: "nowrap",
    width: fullWidth ? "100%" : "auto",
    backgroundColor: variant === "slider" ? bgColor : "transparent",
    borderRadius: variant === "slider" ? 24 : 0,
    padding: variant === "slider" ? "4px" : 0,
  });
  tabsWrapperRef = tabsWrapper;

  const tabButtons = [];

  tabs.forEach((tab, idx) => {
    const label = getLabel(tab);
    const icon = getIcon(tab);
    const badge = getBadge(idx);
    const isActive = currentIndex === idx;

    // Build the content inside each tab button. Every documented value of
    // `iconPosition` keeps the icon: "left" puts it before the label, "right"
    // after it, and "top"/"bottom" stack it above/below the label row.
    const iconWidget =
      showIcon && icon
        ? Icon({
            name: icon,
            size: iconSize || sz.i,
            color: isActive ? resolvedActiveTextColor : textColor,
          })
        : null;
    const labelWidget = label
      ? Text({
          text: label,
          size: sz.f,
          color: isActive ? resolvedActiveTextColor : textColor,
          weight: isActive ? "500" : "400",
        })
      : null;
    const badgeWidget = badge
      ? Container({
          backgroundColor: colors.danger,
          borderRadius: 10,
          padding: "2px 6px",
          marginLeft: 4,
          child: Text({ text: String(badge), size: 10, color: "#fff" }),
        })
      : null;

    const line = [labelWidget, badgeWidget].filter(Boolean);
    if (iconWidget && iconPosition !== "top" && iconPosition !== "bottom") {
      if (iconPosition === "left") line.unshift(iconWidget);
      else line.push(iconWidget);
    }
    const labelRow = Row({
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      children: line,
    });
    const stacked =
      iconWidget && (iconPosition === "top" || iconPosition === "bottom");
    const content = stacked
      ? Column({
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          children:
            iconPosition === "top"
              ? [iconWidget, labelRow]
              : [labelRow, iconWidget],
        })
      : labelRow;

    const btn = Container({
      borderRadius: variant === "slider" ? 20 : variant === "pills" ? 20 : 0,
      backgroundColor: tabBackground(isActive),
      color: isActive ? resolvedActiveTextColor : textColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: sz.g,
      padding: sz.p,
      cursor: "pointer",
      transition: "all 0.2s",
      flex: fullWidth ? 1 : "0 0 auto",
      whiteSpace: "nowrap",
      // Subtract the slider's internal padding so buttons don't overflow it.
      minHeight: sz.h - (variant === "slider" ? 8 : 0),
      zIndex: 2,
      // Accessibility: expose as a tab role with aria-selected.
      role: "tab",
      tabIndex: 0,
      "aria-selected": isActive.toString(),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (currentIndex !== idx) {
            currentIndex = idx;
            updateActiveTab(idx);
            onChange?.(idx);
          }
        }
      },
      child: content,
    });

    btn.onclick = () => {
      if (currentIndex !== idx) {
        currentIndex = idx;
        updateActiveTab(idx);
        onChange?.(idx);
      }
    };

    tabButtons.push(btn);
    tabsWrapper.appendChild(btn);
  });
  tabButtonsRef = tabButtons;

  // The slider variant uses an absolutely positioned "thumb" div that
  // animates to the active tab's position via CSS transform. The default
  // `underline` variant needs the same moving element: without it the active
  // tab had no cue besides its label color.
  const usesIndicator = variant === "slider" || variant === "underline";
  if (usesIndicator) {
    activeIndicator = WidgetFactory({
      tag: "div",
      position: "absolute",
      ...(variant === "slider"
        ? {
            top: "4px",
            left: "4px",
            height: "calc(100% - 8px)",
            backgroundColor: buttonColor,
            borderRadius: 20,
          }
        : {
            bottom: "0",
            left: "0",
            height: "2px",
            backgroundColor: color,
            borderRadius: "2px 2px 0 0",
          }),
      transition: "transform 0.3s ease, width 0.3s ease",
      pointerEvents: "none",
      zIndex: 1,
    });
    tabsWrapper.appendChild(activeIndicator);
  }

  tabBar.appendChild(tabsWrapper);
  container.appendChild(tabBar);

  const contentContainer = Container({
    display: "flex",
    padding: `${toREM(sz.cp)} 0`,
    width: "100%",
    overflow: "auto",
  });
  container.appendChild(contentContainer);

  /**
   * Swap the content panel to the one matching `currentIndex`.
   */
  const updateContent = () => {
    while (contentContainer.firstChild)
      contentContainer.removeChild(contentContainer.firstChild);
    const active = children[currentIndex];
    if (active instanceof HTMLElement) contentContainer.appendChild(active);
  };

  /**
   * Reposition the slider thumb to sit under the active tab button.
   * Reads live DOM rectangles so it stays accurate after layout changes.
   */
  const updateSliderPosition = () => {
    if (!activeIndicator || !tabButtonsRef[currentIndex]) return;
    const btn = tabButtonsRef[currentIndex];
    const wrapperRect = tabsWrapperRef.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const left = btnRect.left - wrapperRect.left;
    activeIndicator.style.width = `${btnRect.width}px`;
    activeIndicator.style.transform = `translateX(${left}px)`;
  };

  /**
   * Apply active/inactive styles to all tab buttons and update the content
   * panel and slider position. Called on every tab change.
   *
   * @param {number} idx - The newly active tab index.
   */
  const updateActiveTab = (idx) => {
    tabButtonsRef.forEach((btn, i) => {
      const isActive = i === idx;

      // Keep aria-selected in sync with the visual state.
      btn.setAttribute("aria-selected", isActive.toString());

      const textSpan = btn.querySelector("span:not(.material-icons)");
      if (textSpan) {
        textSpan.style.color = isActive ? resolvedActiveTextColor : textColor;
        textSpan.style.fontWeight = isActive ? "500" : "400";
      }
      const iconEl = btn.querySelector(".material-icons");
      if (iconEl) {
        iconEl.style.color = isActive ? resolvedActiveTextColor : textColor;
      }
      btn.style.color = isActive ? resolvedActiveTextColor : textColor;
      btn.style.backgroundColor = tabBackground(isActive);
    });

    updateSliderPosition();
    updateContent();
  };

  // Mount the initially active pane during construction. Without this the pane
  // area stayed empty until the user clicked a *different* tab, even though the
  // first tab already rendered as `aria-selected="true"`.
  updateContent();

  // Defer the initial slider position calculation by one frame so the DOM
  // has been laid out and getBoundingClientRect() returns real values.
  let initialPositionTimer = setTimeout(() => {
    initialPositionTimer = null;
    updateSliderPosition();
  }, 16);

  // Debounced window resize handler — recomputes slider position after the
  // layout has stabilised following the resize event.
  let resizeTimeout = null;
  let resizeObserver = null;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (activeIndicator && tabButtonsRef[currentIndex]) {
        updateSliderPosition();
      }
    }, 100);
  };
  window.addEventListener("resize", handleResize);

  // Also observe the tab bar element itself so the indicator repositions when
  // the container resizes independently of the window (e.g. sidebar toggle).
  // Only slider and underline render an indicator, so skip it for the others.
  if (usesIndicator && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => updateSliderPosition());
    if (tabsWrapperRef) resizeObserver.observe(tabsWrapperRef);
  }

  // Cleanup: release the timers, the window listener and the observer on EITHER
  // teardown path. `_cleanup` is only run by runApp's teardownTree / Scaffold; a
  // plain DOM disconnect goes through the lifecycle observer, which never calls
  // it — so without `onUnmount` the resize listener stayed registered and the
  // ResizeObserver kept observing (and retaining) a detached tab bar. The
  // disposer is idempotent because both paths can run.
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (initialPositionTimer) {
      clearTimeout(initialPositionTimer);
      initialPositionTimer = null;
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
    window.removeEventListener("resize", handleResize);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  };
  container.onUnmount(dispose);

  const originalCleanup = container._cleanup;
  container._cleanup = () => {
    dispose();
    if (originalCleanup) originalCleanup();
  };

  // ========== PUBLIC API ==========
  Object.defineProperty(container, "activeIndex", {
    get: () => currentIndex,
    set: (idx) => {
      if (idx >= 0 && idx < tabs.length && currentIndex !== idx) {
        currentIndex = idx;
        updateActiveTab(idx);
        onChange?.(idx);
      }
    },
  });

  /**
   * Programmatically activate a tab by index.
   * Equivalent to setting `container.activeIndex = idx`.
   *
   * @param {number} idx - Zero-based tab index.
   */
  container.setActiveTab = (idx) => {
    container.activeIndex = idx;
  };

  return container;
};

export default Tabs;