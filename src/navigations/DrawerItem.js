// src/navigations/DrawerItem.js
import { Container } from "../widgets/Container.js";
import { Row } from "../widgets/Row.js";
import { Text } from "../widgets/Text.js";
import { Icon } from "../widgets/Icon.js";
import { colors } from "../utils/themes.js";
import { goTo, subscribe, getCurrentPath } from "./Router.js";
import { closeDrawer } from "./Drawer.js";

/**
 * Module-level EventTarget used to broadcast selection events between all
 * DrawerItem instances in the same drawer. When one item is selected, all
 * others listen to the "drawer-item-selected" event and deactivate themselves,
 * ensuring only one item appears active at a time without global mutable state.
 *
 * @type {EventTarget}
 */
const selectionEvent = new EventTarget();

/**
 * Cached copy of the current route path at module load time.
 * Updated via the router subscription so every item can determine its own
 * active state without re-querying the router on every render.
 *
 * @type {string}
 */
let globalCurrentPath = getCurrentPath();

// Keep the module-level path cache in sync with router navigations.
subscribe(() => {
  globalCurrentPath = getCurrentPath();
  selectionEvent.dispatchEvent(
    new CustomEvent("route-changed", { detail: { path: globalCurrentPath } }),
  );
});

/**
 * @typedef {Object} DrawerItemProps
 * @property {string} [icon] - Material Icon name shown at the leading edge.
 * @property {string} label - Display label (also used as the item's unique identity for selection broadcasts).
 * @property {string} [route] - Router path navigated to when the item is pressed.
 * @property {Function} [onPress] - Additional callback fired on every press, after routing.
 * @property {Function} [onSelect] - Callback fired only on the first press when the item transitions to selected.
 * @property {number} [borderRadius=24] - Corner radius of the item container.
 * @property {number} [gap=12] - Gap between the icon, label, and trailing icon.
 * @property {boolean} [disableTransform=true] - Disable CSS transform effects (avoids stacking context issues inside a drawer).
 * @property {string} [trailingIcon="chevron_right"] - Material Icon name at the trailing edge.
 * @property {string} [hintColor] - Background tint on hover when the item is not selected.
 * @property {string} [selectedColor] - Accent color applied to text, icon, and background when active.
 * @property {string} [unselectedColor] - Default text and icon color when inactive.
 * @property {string} [iconColor] - Override color for the leading icon (defaults to selectedColor/unselectedColor).
 * @property {string} [trailingIconColor] - Override color for the trailing icon.
 * @property {boolean} [closeOnPress=true] - Whether to close the containing drawer automatically on press.
 */

/**
 * DrawerItem renders a single tappable row inside a Drawer.
 *
 * It syncs its selected state with the router so the active route is always
 * visually highlighted. When pressed, it navigates to `route`, fires any
 * callbacks, optionally closes the drawer, and broadcasts a selection event
 * so sibling DrawerItems can deactivate themselves.
 *
 * Keyboard navigation is supported: Enter and Space trigger the same action
 * as a click, and the item has `role="button"` and `aria-selected` for
 * screen-reader compatibility.
 *
 * @param {DrawerItemProps} props
 * @returns {HTMLElement} The item container element.
 */
export const DrawerItem = (props) => {
  const {
    icon,
    label,
    route,
    onPress,
    onSelect,
    borderRadius = 24,
    gap = 12,
    disableTransform = true,
    trailingIcon = "chevron_right",
    hintColor = colors.gray100,
    selectedColor = colors.primary,
    unselectedColor = colors.text,
    iconColor,
    trailingIconColor,
    closeOnPress = true,
    ...rest
  } = props;

  // DOM references held in closure so updateUI can mutate them without
  // querying the DOM repeatedly.
  let containerRef = null;
  let textRef = null;
  let iconRef = null;
  let trailingIconRef = null;
  let isSelected = false;
  let unsubscribeRouter = null;
  let unsubscribeGlobal = null;

  /**
   * Apply visual styles that reflect the current selected/unselected state.
   * Called whenever `isSelected` changes.
   */
  const updateUI = () => {
    const finalTextColor = isSelected ? selectedColor : unselectedColor;
    const finalIconColor = iconColor || finalTextColor;
    const finalTrailingIconColor = trailingIconColor || finalTextColor;

    if (containerRef) {
      // Subtle tinted background on the selected item for visual hierarchy.
      containerRef.style.backgroundColor = isSelected
        ? `${selectedColor}15`
        : "transparent";
      // Reflect selection state for screen readers.
      containerRef.setAttribute("aria-selected", isSelected.toString());
    }
    if (textRef) {
      textRef.style.color = finalTextColor;
      textRef.style.fontWeight = isSelected ? "600" : "400";
    }
    if (iconRef) iconRef.style.color = finalIconColor;
    if (trailingIconRef) trailingIconRef.style.color = finalTrailingIconColor;
  };

  /**
   * Compare the current router path against this item's `route` and update
   * `isSelected` accordingly. Only triggers a UI update when the state
   * actually changes to avoid unnecessary DOM writes.
   */
  const checkActive = () => {
    const currentPath = getCurrentPath();
    const shouldBeSelected =
      route === currentPath || (route === "/" && currentPath === "");
    if (shouldBeSelected !== isSelected) {
      isSelected = shouldBeSelected;
      updateUI();
    }
  };

  /**
   * Handle a press/click on the item.
   * Order of operations: mark selected → fire callbacks → navigate → close drawer.
   */
  const handleClick = () => {
    if (!isSelected) {
      isSelected = true;
      updateUI();
      // Broadcast to siblings so they deactivate themselves.
      selectionEvent.dispatchEvent(
        new CustomEvent("drawer-item-selected", { detail: { id: label } }),
      );
    }
    if (onSelect) onSelect();
    if (onPress) onPress();
    if (route) goTo(route);
    if (closeOnPress) closeDrawer();
  };

  // Subscribe to router changes to keep the active state in sync with
  // browser back/forward navigation and programmatic goTo() calls.
  unsubscribeRouter = subscribe(() => checkActive());

  // Listen for sibling selection events: if another item was just selected,
  // deactivate this one.
  const handleGlobalSelection = (e) => {
    if (isSelected && e.detail.id !== label) {
      isSelected = false;
      updateUI();
    }
  };
  selectionEvent.addEventListener("drawer-item-selected", handleGlobalSelection);
  unsubscribeGlobal = () =>
    selectionEvent.removeEventListener(
      "drawer-item-selected",
      handleGlobalSelection,
    );

  // Compute initial active state before first render.
  checkActive();

  const container = Container({
    padding: "12px 16px",
    cursor: "pointer",
    borderRadius: borderRadius,
    margin: "4px 8px",
    disableTransform: disableTransform,
    // Keyboard accessibility: allow focus and respond to Enter/Space.
    role: "button",
    tabIndex: 0,
    "aria-selected": isSelected.toString(),
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    onclick: handleClick,
    onHover: (e) => {
      if (!isSelected) e.currentTarget.style.backgroundColor = hintColor;
    },
    onHoverEnd: (e) => {
      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
    },
    ...rest,
  });

  // ========== BUILD ROW CONTENT ==========
  const rowChildren = [];

  if (icon) {
    const iconWidget = Icon({ name: icon, size: 22, color: unselectedColor });
    rowChildren.push(iconWidget);
    iconRef = iconWidget;
  }

  const textWidget = Text({
    text: label,
    size: 15,
    color: unselectedColor,
    fontWeight: "400",
    flex: 1,
  });
  rowChildren.push(textWidget);
  textRef = textWidget;

  if (trailingIcon) {
    const trailWidget = Icon({
      name: trailingIcon,
      size: 18,
      color: unselectedColor,
    });
    rowChildren.push(trailWidget);
    trailingIconRef = trailWidget;
  }

  const row = Row({
    alignItems: "center",
    justifyContent: "space-between",
    gap: gap,
    children: rowChildren,
  });

  container.appendChild(row);
  containerRef = container;
  // Apply the initial visual state now that DOM refs are set.
  updateUI();

  // Cleanup: unsubscribe from router and selection events to prevent memory leaks.
  const originalCleanup = container._cleanup;
  container._cleanup = () => {
    if (unsubscribeRouter) unsubscribeRouter();
    if (unsubscribeGlobal) unsubscribeGlobal();
    if (originalCleanup) originalCleanup();
  };

  return container;
};

export default DrawerItem;
