// navigations/CollapsibleSideBar.js
import { WidgetFactory } from "../widget-factory/index.js";
import { Container } from "../widgets/Container.js";
import { Column } from "../widgets/Column.js";
import { Icon } from "../widgets/Icon.js";
import { useState } from "../tools/useState.js";
import { colors } from "../utils/themes.js";

/**
 * @typedef {Object} CollapsibleSideBarProps
 * @property {HTMLElement} [children] - Content widget rendered inside the scrollable area.
 * @property {boolean} [expanded=true] - Initial expanded state.
 * @property {string} [id] - Stable identifier used to persist the expanded state across
 *   page navigations via `useState`. When omitted, all CollapsibleSideBar instances
 *   share the same state key, so provide an id when using multiple sidebars.
 * @property {number} [widthExpanded=260] - Width in pixels when fully expanded.
 * @property {number} [widthCollapsed=60] - Width in pixels when collapsed (icon-only).
 * @property {number} [iconSize=24] - Size of the collapse/expand toggle icon.
 * @property {Function} [onToggle] - Callback fired with the new `expanded` boolean after each toggle.
 * @property {string} [bgColor] - Background color of the sidebar.
 * @property {string} [borderRight] - CSS border value applied to the right edge.
 */

/**
 * CollapsibleSideBar is a vertically scrollable side panel that can be
 * toggled between an expanded state (showing full content) and a collapsed
 * state (icon-only, narrow strip).
 *
 * The expanded state is persisted via `useState` so it survives page
 * navigations within a session. Provide a unique `id` when rendering
 * multiple instances to avoid state collisions.
 *
 * The toggle button renders a `chevron_left` icon when expanded and
 * `chevron_right` when collapsed. The content area fades out when collapsed
 * and has `pointer-events: none` applied, preventing accidental interaction
 * with hidden content.
 *
 * Width transitions are driven by CSS `transition: width 0.3s ease` for a
 * smooth animation without JavaScript timers.
 *
 * @param {CollapsibleSideBarProps} props
 * @returns {HTMLElement} The sidebar container element, augmented with:
 *   - `updateWidth(w: number|string)` — resize the sidebar programmatically.
 */
export const CollapsibleSideBar = ({
  children,
  expanded = true,
  id,
  widthExpanded = 260,
  widthCollapsed = 60,
  iconSize = 24,
  onToggle,
  bgColor = colors.surface,
  borderRight = `1px solid ${colors.border}`,
  ...rest
}) => {
  // Persist the expanded state so collapsing/expanding survives navigation.
  // A namespaced key is used when `id` is provided to allow multiple
  // independent sidebars on the same page.
  const [stateValue, setIsExpanded] = useState(
    id ? `collapsible-sidebar:${id}` : "collapsible-sidebar",
    expanded,
  );
  let expandedState = Boolean(stateValue.valueOf());

  /**
   * Toggle the sidebar between expanded and collapsed states.
   * Updates the persisted state and fires the `onToggle` callback.
   */
  const toggle = () => {
    const newState = !expandedState;
    expandedState = newState;
    setIsExpanded(newState);
    if (onToggle) onToggle(newState);
  };

  const currentWidth = expandedState ? widthExpanded : widthCollapsed;

  // Main sidebar container — fixed width with smooth CSS width transition.
  const container = WidgetFactory({
    tag: "div",
    id,
    style: {
      width:
        typeof currentWidth === "number" ? `${currentWidth}px` : currentWidth,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: bgColor,
      borderRight: borderRight,
      transition: "width 0.3s ease",
      overflow: "hidden",
      flexShrink: 0,
      ...rest.style,
    },
    ...rest,
  });

  // Toggle button — always visible so the user can expand/collapse regardless
  // of the current state. The icon flips direction to reflect the state.
  const toggleButton = Container({
    padding: 16,
    cursor: "pointer",
    onclick: toggle,
    child: Icon({
      name: expandedState ? "chevron_left" : "chevron_right",
      size: iconSize,
      color: colors.textSecondary,
    }),
  });
  container.appendChild(toggleButton);

  // Content wrapper — fades and becomes non-interactive when collapsed.
  // Opacity + pointer-events together ensure collapsed content cannot be
  // focused or clicked, even though the DOM nodes remain mounted.
  const contentWrapper = Container({
    flex: 1,
    width: "100%",
    opacity: expandedState ? 1 : 0,
    transition: "opacity 0.2s ease",
    pointerEvents: expandedState ? "auto" : "none",
    overflow: "auto",
    child: children,
  });
  container.appendChild(contentWrapper);

  /**
   * Resize the sidebar to a new width without triggering a toggle.
   * Useful when the parent layout needs to adjust sidebar proportions
   * dynamically (e.g. responsive breakpoint changes).
   *
   * @param {number|string} newWidth - New width (number = pixels, string = CSS value).
   */
  container.updateWidth = (newWidth) => {
    container.style.width =
      typeof newWidth === "number" ? `${newWidth}px` : newWidth;
  };

  return container;
};

export default CollapsibleSideBar;
