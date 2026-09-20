// navigations/BottomNavigation.js
import { WidgetFactory } from "../widget-factory/index.js";
import { Container } from "../widgets/Container.js";
import { Text } from "../widgets/Text.js";
import { Icon } from "../widgets/Icon.js";
import { colors } from "../utils/themes.js";
import { getCurrentPath, subscribe, goTo } from "./Router.js";

/**
 * @typedef {Object} BottomNavigationItem
 * @property {string} icon - Material Icon name.
 * @property {string} [label] - Display label shown below the icon.
 * @property {string} [route] - Router path this tab navigates to.
 *   Defaults to `/<label.toLowerCase()>` when omitted.
 * @property {Function} [onPress] - Additional callback fired when the tab is tapped.
 */

/**
 * @typedef {Object} BottomNavigationProps
 * @property {BottomNavigationItem[]} [items=[]] - Tab definitions.
 * @property {number} [currentIndex=0] - Initially active tab index (non-router mode).
 * @property {Function} [onTabChange] - Callback fired with the new index whenever the active tab changes.
 * @property {string} [backgroundColor] - Background fill color of the bar.
 * @property {string} [selectedColor] - Icon and label color for the active tab.
 * @property {string} [unselectedColor] - Icon and label color for inactive tabs.
 * @property {boolean} [showLabels=true] - Whether to render text labels below icons.
 * @property {number} [iconSize=24] - Icon size in pixels.
 * @property {number} [height=65] - Bar height in pixels.
 * @property {number} [margin=0] - Uniform outer margin.
 * @property {number} [marginTop=0] - Top margin (overrides margin).
 * @property {number} [marginBottom=0] - Bottom margin (overrides margin).
 * @property {number} [marginLeft=0] - Left margin (overrides margin).
 * @property {number} [marginRight=0] - Right margin (overrides margin).
 * @property {number|string} [borderRadius=0] - Corner radius.
 * @property {number|string} [padding=0] - Inner padding.
 * @property {boolean|string} [shadow=true] - Whether to render a shadow; pass a CSS string for a custom shadow.
 * @property {number} [elevation=2] - Shadow depth (0–5), used when shadow is true.
 * @property {boolean} [useRouter=true] - Sync the active tab with the router instead of tracking an internal index.
 */

/**
 * BottomNavigation renders a bottom tab bar with icon and optional label tabs.
 *
 * By default (`useRouter=true`) it integrates with the Router module: tapping
 * a tab calls `goTo(route)` and the active highlighting is driven entirely by
 * the current route, keeping the bar in sync with back/forward navigation and
 * programmatic route changes. Set `useRouter=false` to operate in standalone
 * mode where the bar manages its own active index.
 *
 * @param {BottomNavigationProps} props
 * @returns {HTMLElement} The `<nav>` element, augmented with:
 *   - `setActiveIndex(index: number)` — programmatically activate a tab.
 *   - `getActiveIndex(): number` — returns the currently active tab index.
 *   - `getCurrentRoute(): string|null` — returns the current router path (router mode only).
 */
export const BottomNavigation = (props) => {
  const {
    items = [],
    currentIndex = 0,
    onTabChange,
    backgroundColor = colors.surface,
    selectedColor = colors.primary,
    unselectedColor = colors.textSecondary,
    showLabels = true,
    iconSize = 24,
    height = 65,
    margin = 0,
    marginTop = 0,
    marginBottom = 0,
    marginLeft = 0,
    marginRight = 0,
    borderRadius = 0,
    padding = 0,
    shadow = true,
    elevation = 2,
    useRouter = true,
    ...rest
  } = props;

  let activeIndex = currentIndex;
  const buttons = [];
  let unsubscribe = null;
  // Tracks whether the initial router sync has been performed so we don't
  // override `activeIndex` from the router on subsequent renders.
  let isRouterSynced = false;

  // Resolve shorthand margin/padding/radius props.
  const finalMarginTop = marginTop || margin;
  const finalMarginBottom = marginBottom || margin;
  const finalMarginLeft = marginLeft || margin;
  const finalMarginRight = marginRight || margin;
  const finalBorderRadius =
    typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;
  const finalPadding = typeof padding === "number" ? `${padding}px` : padding;

  // Material Design elevation → box-shadow lookup table.
  const shadows = {
    0: "none",
    1: "0 1px 3px rgba(0,0,0,0.12)",
    2: "0 3px 6px rgba(0,0,0,0.16)",
    3: "0 6px 12px rgba(0,0,0,0.2)",
    4: "0 10px 20px rgba(0,0,0,0.25)",
    5: "0 15px 30px rgba(0,0,0,0.3)",
  };
  const boxShadow = shadow === true ? shadows[elevation] : shadow || "none";

  const container = WidgetFactory({
    tag: "nav",
    display: "flex",
    width: `calc(100% - ${finalMarginLeft}px - ${finalMarginRight}px)`,
    height: height,
    backgroundColor: backgroundColor,
    borderRadius: finalBorderRadius,
    marginTop: finalMarginTop,
    marginBottom: finalMarginBottom,
    marginLeft: finalMarginLeft,
    marginRight: finalMarginRight,
    padding: finalPadding,
    boxShadow: boxShadow,
    flexShrink: 0,
    style: {
      ...rest.style,
    },
    ...rest,
  });

  /**
   * Update icon and label colors for the given active tab index.
   * Used exclusively in non-router mode where the bar manages its own state.
   *
   * @param {number} index - The index of the newly active tab.
   */
  const updateActive = (index) => {
    buttons.forEach((btnData, i) => {
      const isActive = i === index;
      const icon = btnData.btn.querySelector(".material-icons");
      const label = btnData.btn.querySelector(".bottom-nav-label");
      if (icon) icon.style.color = isActive ? selectedColor : unselectedColor;
      if (label) {
        label.style.color = isActive ? selectedColor : unselectedColor;
        label.style.fontWeight = isActive ? "500" : "400";
      }
    });
    if (onTabChange) onTabChange(index);
  };

  /**
   * Re-read the current router path and update icon/label colors to match.
   * Called on every route change event in router mode.
   */
  const updateColorsFromRouter = () => {
    if (!useRouter) return;

    const currentPath = getCurrentPath();

    buttons.forEach((btnData, idx) => {
      const isSelected = btnData.route === currentPath;
      const color = isSelected ? selectedColor : unselectedColor;

      if (btnData.icon) btnData.icon.style.color = color;
      if (btnData.labelWidget) {
        btnData.labelWidget.style.color = color;
        btnData.labelWidget.style.fontWeight = isSelected ? "500" : "400";
      }

      if (isSelected) activeIndex = idx;
    });

    if (onTabChange) onTabChange(activeIndex);
  };

  // ========== BUILD TAB BUTTONS ==========
  items.forEach((item, idx) => {
    const itemRoute = item.route || `/${item.label?.toLowerCase()}`;

    // Determine initial active state — derive from the router path on first
    // render so the correct tab is highlighted when the page loads on a
    // non-root route.
    let isActive = activeIndex === idx;
    if (useRouter && !isRouterSynced) {
      const currentPath = getCurrentPath();
      isActive = itemRoute === currentPath;
      if (isActive) activeIndex = idx;
    }

    const btn = Container({
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      cursor: "pointer",
      padding: "8px 0",
      backgroundColor: "transparent",
      onclick: () => {
        if (useRouter) {
          goTo(itemRoute);
          if (item.onPress) item.onPress();
        } else {
          // In standalone mode, only update state when a different tab is tapped.
          if (activeIndex !== idx) {
            activeIndex = idx;
            updateActive(idx);
            if (item.onPress) item.onPress();
          }
        }
      },
    });

    const icon = Icon({
      name: item.icon,
      size: iconSize,
      color: isActive ? selectedColor : unselectedColor,
    });
    btn.appendChild(icon);

    let labelWidget = null;
    if (showLabels && item.label) {
      labelWidget = Text({
        value: item.label,
        size: 11,
        color: isActive ? selectedColor : unselectedColor,
        fontWeight: isActive ? "500" : "400",
        className: "bottom-nav-label",
      });
      btn.appendChild(labelWidget);
    }

    buttons.push({
      btn,
      route: itemRoute,
      icon,
      // Store the label widget reference so updateColorsFromRouter can update
      // it without querying the DOM.
      labelWidget,
    });
    container.appendChild(btn);
  });

  // Subscribe to router changes once all buttons are built.
  if (useRouter) {
    unsubscribe = subscribe(() => {
      updateColorsFromRouter();
    });
    // Apply initial highlighting based on the current route.
    updateColorsFromRouter();
    isRouterSynced = true;
  }

  // ========== PUBLIC API ==========

  /**
   * Programmatically activate a tab by index.
   * In router mode, navigates to the tab's route. In standalone mode, updates
   * the active index and calls `onPress` if provided.
   *
   * @param {number} index - Zero-based tab index.
   */
  container.setActiveIndex = (index) => {
    if (!useRouter) {
      if (index >= 0 && index < items.length && activeIndex !== index) {
        activeIndex = index;
        updateActive(index);
        if (items[index].onPress) items[index].onPress();
      }
    } else {
      const route =
        items[index]?.route || `/${items[index]?.label?.toLowerCase()}`;
      if (route) goTo(route);
    }
  };

  /**
   * Returns the currently active tab index.
   *
   * @returns {number}
   */
  container.getActiveIndex = () => activeIndex;

  /**
   * Returns the current router path (router mode only).
   *
   * @returns {string|null}
   */
  container.getCurrentRoute = () => {
    if (!useRouter) return null;
    return getCurrentPath();
  };

  // Cleanup: unsubscribe from the router when the bar is removed from the DOM.
  const originalCleanup = container._cleanup;
  container._cleanup = () => {
    if (unsubscribe) unsubscribe();
    if (originalCleanup) originalCleanup();
  };

  return container;
};

export default BottomNavigation;
