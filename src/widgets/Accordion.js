/**
 * @file Accordion.js
 * @description A collapsible panel widget that reveals or hides its content
 * when the title bar is clicked. Supports smooth height animations, multiple
 * visual variants, elevation shadows, and a ResizeObserver that keeps the
 * expanded height correct when the content changes dynamically.
 */

import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { toREM } from "../utils/units.js";
import { composeUpdate } from "../utils/composeUpdate.js";
import { Container } from "./Container.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import { SHADOW_LEVELS } from "../tools/shadow.js";

/**
 * Props owned by the Accordion's own closure state. They are routed to the
 * widget's `update` and never to the factory's (see `composeUpdate`).
 */
const ACCORDION_PROP_KEYS = [
  "title", "children", "expanded", "onToggle", "onPress", "variant",
  "borderRadius", "bgColor", "titleColor", "expandedColor",
  "border", "borderColor", "borderWidth",
  "titleSize", "titleWeight", "titlePadding", "contentPadding",
  "iconCollapsed", "iconExpanded", "iconColor", "iconSize",
  "divider", "dividerColor", "disabled", "animate", "animationDuration",
  "elevation",
];

/**
 * Creates an Accordion widget — a collapsible section with an animated title bar.
 *
 * @param {Object} props - Configuration options for the accordion.
 * @param {string} props.title - The text displayed in the title bar.
 * @param {HTMLElement|HTMLElement[]} props.children - Content rendered inside the expanded panel.
 * @param {boolean} [props.expanded=false] - Whether the accordion starts in the expanded state.
 * @param {Function} [props.onPress] - Callback fired when the expanded state changes. Receives `(isExpanded: boolean)`.
 * @param {Function} [props.onToggle] - @deprecated Use `onPress` instead. Kept as alias for backward compatibility.
 * @param {'contained'|'outlined'|'ghost'} [props.variant='contained'] - Visual style variant.
 * @param {number} [props.borderRadius=8] - Corner radius in pixels.
 * @param {string} [props.bgColor=colors.primaryBg] - Background color of the container (used in 'contained' variant).
 * @param {string} [props.titleColor=colors.text] - Text color of the title when collapsed.
 * @param {string} [props.expandedColor=colors.primary] - Accent color applied to the title-bar background when expanded.
 * @param {string|null} [props.border=null] - Explicit CSS border shorthand. Overrides variant-based border logic.
 * @param {string} [props.borderColor=colors.border] - Border color used in 'outlined' variant.
 * @param {number} [props.borderWidth=1] - Border width in pixels (outlined variant).
 * @param {number} [props.titleSize=14] - Font size of the title text in pixels.
 * @param {string} [props.titleWeight='500'] - Font weight of the title text.
 * @param {string} [props.titlePadding='0.75rem 1rem'] - CSS padding for the title bar.
 * @param {string} [props.contentPadding='1rem'] - CSS padding applied to the inner content area.
 * @param {string} [props.iconCollapsed='chevron_right'] - Material icon name shown when collapsed.
 * @param {string} [props.iconExpanded='expand_more'] - Material icon name shown when expanded.
 * @param {string} [props.iconColor=colors.textSecondary] - Color of the expand/collapse icon.
 * @param {number} [props.iconSize=20] - Size of the icon in pixels.
 * @param {boolean} [props.divider=true] - Whether to show a dividing line between the title and the content.
 * @param {string} [props.dividerColor=colors.border] - Color of the dividing line.
 * @param {boolean} [props.disabled=false] - When true, interactions are blocked and the component is visually dimmed.
 * @param {boolean} [props.animate=true] - Whether to animate the expand/collapse transition.
 * @param {number} [props.animationDuration=300] - Duration of the animation in milliseconds.
 * @param {number} [props.elevation=0] - Box-shadow depth level (0–4).
 * @returns {HTMLElement} The accordion container element, augmented with public methods.
 */
let accordionIdSeed = 0;

export const Accordion = (props) => {
  const {
    title,
    children,
    expanded = false,
    onToggle,
    onPress,
    variant = "contained", // 'contained', 'outlined', 'ghost'
    borderRadius = 8,
    // Colors
    //
    // A 'contained' panel is a plate, so it has to read as one. `colors.surface`
    // is the card an accordion already sits on — 1.00:1 in dark, 1.04:1 in light —
    // which made the variant indistinguishable from 'ghost'. `primaryBg` is the
    // palette's raised plate: 1.19:1 over the dark card (the overlay Material
    // uses for elevation) and the same near-white step in light.
    bgColor = colors.primaryBg,
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
    contentPadding = 16,
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

  // Internal mutable state — mirrors the props so updates don't mutate the originals
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

  // The header and its panel reference each other (`aria-controls` one way,
  // `aria-labelledby` back), so both need ids. Derived from the caller's `id`
  // when there is one, the way `Input` does it, so a re-render keeps the pairing.
  const baseId =
    typeof rest.id === "string" && rest.id
      ? rest.id
      : `fletbox-accordion-${++accordionIdSeed}`;
  const headerId = `${baseId}-header`;
  const panelId = `${baseId}-panel`;

  // DOM references populated during widget construction
  let contentWrapper = null;
  let contentInner = null;
  let titleBar = null;
  let titleElement = null;
  let iconElement = null;
  let resizeObserver = null;
  let isAnimating = false;

  // ========== UI UPDATE FUNCTIONS ==========

  /**
   * Synchronises all visual properties (colors, borders, icon, etc.) to the
   * current state without rebuilding the DOM. Called after any prop change.
   */
  const updateUI = () => {
    if (!titleElement || !iconElement || !titleBar || !contentInner) return;

    // Update title text only when it actually changed, to avoid unnecessary repaints
    if (titleElement.textContent !== currentTitle) {
      titleElement.textContent = currentTitle;
    }

    // The accent marks the open state through the title-bar tint; the title
    // itself keeps `titleColor`. Painting it with `primary` put #00A5FF words
    // on a 6% primary wash (2.4:1) in the light theme.
    titleElement.style.color = currentTitleColor;
    titleElement.style.fontSize = toREM(currentTitleSize);
    titleElement.style.fontWeight = currentTitleWeight;

    // Swap icon based on current expanded state. `Icon` renders its glyph as
    // TEXT (a material-icons ligature), so setting a `name` attribute changed
    // nothing and the chevron stayed on `chevron_right` forever.
    iconElement.textContent = isExpanded
      ? currentIconExpanded
      : currentIconCollapsed;
    iconElement.style.color = currentIconColor;
    iconElement.style.fontSize = toREM(currentIconSize);

    // Title bar cursor and opacity reflect the disabled state
    titleBar.style.cursor = currentDisabled ? "not-allowed" : "pointer";
    titleBar.style.opacity = currentDisabled ? "0.5" : "1";
    titleBar.style.padding = toREM(currentTitlePadding);

    // `update()` cannot re-run the factory for the header, so the state the
    // header announces lives here: a `disabled: true` update has to take the
    // hinge off the Tab path, and an `expanded` change has to be answered.
    titleBar.setAttribute("aria-expanded", String(isExpanded));
    titleBar.setAttribute("aria-disabled", String(Boolean(currentDisabled)));
    titleBar.tabIndex = currentDisabled ? -1 : 0;

    // Tint the title bar background slightly when expanded (contained only)
    if (currentVariant === "contained") {
      titleBar.style.backgroundColor = isExpanded
        ? `${currentExpandedColor}10`
        : "transparent";
    } else {
      titleBar.style.backgroundColor = "transparent";
    }

    // The header's hairline is the only thing that says "this row is a panel".
    // The default 'contained' variant paints `colors.surface`, which measures
    // 1.00:1 against a dark card and 1.04:1 against a light one, `elevation`
    // starts at 0 and the border belongs to 'outlined' — so a shut accordion used
    // to be a sentence with a chevron on it, and nothing marked it as pressable.
    // The line belongs to the header, not to the gap below it: it is there open
    // or shut, so it never doubles when the content appears.
    titleBar.style.borderBottom = currentDivider
      ? `1px solid ${currentDividerColor}`
      : "none";
    contentInner.style.borderTop = "none";

    // Apply border according to priority: explicit > outlined variant > none
    if (currentBorder) {
      container.style.border = currentBorder;
    } else if (currentVariant === "outlined") {
      container.style.border = `${currentBorderWidth}px solid ${currentBorderColor}`;
    } else {
      container.style.border = "none";
    }

    // Background is only painted in 'contained' mode
    if (currentVariant === "contained") {
      container.style.backgroundColor = currentBgColor;
    } else {
      container.style.backgroundColor = "transparent";
    }

    container.style.borderRadius = toREM(currentBorderRadius);
    container.style.overflow = "hidden";

    // The framework's depth scale, not a local copy of it (src/tools/shadow.js).
    if (currentElevation > 0) {
      container.style.boxShadow =
        SHADOW_LEVELS[currentElevation] || SHADOW_LEVELS[2];
    } else {
      container.style.boxShadow = "none";
    }

    contentInner.style.padding = toREM(currentContentPadding);
  };

  // ========== HEIGHT ANIMATION ==========

  /**
   * Accurately measures the natural height of the content by cloning it into
   * the DOM off-screen. This avoids the 0-height problem when the element is
   * hidden (display: none) at measurement time.
   *
   * @returns {number} The pixel height the content would occupy when visible.
   */
  const getContentHeight = () => {
    if (!contentInner) return 0;
    // Clone off-screen to measure true height regardless of current visibility
    const clone = contentInner.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.visibility = "hidden";
    clone.style.display = "block";
    clone.style.height = "auto";
    clone.style.padding = toREM(currentContentPadding);
    document.body.appendChild(clone);
    const height = clone.offsetHeight;
    document.body.removeChild(clone);
    return height;
  };

  /**
   * Sets the wrapper height, optionally skipping the CSS transition.
   *
   * @param {string} height - CSS height value (e.g. "250px" or "auto").
   * @param {boolean} [instant=false] - When true, skips the transition entirely.
   */
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

  /**
   * Expands the accordion with an animated height transition.
   * No-ops if already expanded or currently animating.
   *
   * @param {boolean} [triggerCallback=true] - Whether to fire the `onToggle` callback.
   */
  const expand = (triggerCallback = true) => {
    if (currentDisabled || isAnimating) return;
    if (isExpanded) return;

    isAnimating = true;
    isExpanded = true;
    // The disclosure state is answered at the press, not when the height
    // animation lands: `updateUI` runs at the end of the transition, and a reader
    // told "collapsed" while the panel is already opening is told a lie.
    titleBar.setAttribute("aria-expanded", "true");

    // Make the content visible before measuring it
    contentWrapper.style.display = "block";
    contentInner.style.display = "block";

    // Force a reflow so the browser registers the block display before we animate
    void contentWrapper.offsetHeight;

    const targetHeight = getContentHeight() + "px";

    // Animate from 0 → measured height → "auto" (to stay responsive to content changes)
    setHeight("0px");
    setTimeout(() => {
      setHeight(targetHeight);
      setTimeout(() => {
        setHeight("auto", true);
        contentWrapper.style.overflow = "visible";
        isAnimating = false;
        const expandCb = onToggle || onPress;
        if (triggerCallback && expandCb) expandCb(true);
        updateUI();
      }, currentAnimationDuration);
    }, 10);
  };

  /**
   * Collapses the accordion with an animated height transition.
   * No-ops if already collapsed or currently animating.
   *
   * @param {boolean} [triggerCallback=true] - Whether to fire the `onToggle` callback.
   */
  const collapse = (triggerCallback = true) => {
    if (currentDisabled || isAnimating) return;
    if (!isExpanded) return;

    isAnimating = true;
    isExpanded = false;
    // Same as `expand`: the disclosure answers for the state the press caused,
    // not for the height the transition has not finished animating.
    titleBar.setAttribute("aria-expanded", "false");

    // Pin the height to a pixel value first — "auto" cannot be animated
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
        const collapseCb = onToggle || onPress;
        if (triggerCallback && collapseCb) collapseCb(false);
        updateUI();
      }, currentAnimationDuration);
    }, 10);
  };

  /**
   * Toggles between expanded and collapsed states.
   * No-ops when disabled or mid-animation.
   */
  const toggle = () => {
    if (currentDisabled || isAnimating) return;
    if (isExpanded) collapse();
    else expand();
  };

  // ========== RESIZE OBSERVER ==========

  /**
   * Attaches a ResizeObserver to the inner content element so that if its
   * height changes (e.g. dynamic children added), the wrapper height is updated
   * to match without requiring a manual re-render.
   */
  const setupResizeObserver = () => {
    if (!contentInner || !animate) return;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        if (isExpanded && contentWrapper && !isAnimating) {
          const newHeight = getContentHeight() + "px";
          // Only adjust when the height is a fixed pixel value (not "auto")
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
    widgetName: "Accordion",
    width: "100%",
    overflow: "hidden",
    ...rest,
  });

  // Title text element
  titleElement = Text({
    text: currentTitle,
    size: currentTitleSize,
    weight: currentTitleWeight,
    color: isExpanded ? currentExpandedColor : currentTitleColor,
    flex: 1,
  });

  // Chevron/expand icon
  iconElement = Icon({
    name: isExpanded ? currentIconExpanded : currentIconCollapsed,
    size: currentIconSize,
    color: currentIconColor,
    transition: animate
      ? `transform ${currentAnimationDuration}ms ease`
      : "none",
  });

  // Clickable title bar that contains the text and icon
  titleBar = Row({
    // The press is a prop, not an assignment made after `Row()` has returned:
    // the engine reads `widget.onclick` while the widget is built, and a header
    // wired afterwards is a hinge only a mouse can operate.
    onPress: () => toggle(),
    role: "button",
    id: headerId,
    // A disclosure has to say which way it opens. Without `aria-expanded` a reader
    // hears the same words for a closed section and an open one.
    "aria-expanded": String(isExpanded),
    "aria-controls": panelId,
    "aria-disabled": String(Boolean(currentDisabled)),
    tabIndex: currentDisabled ? -1 : 0,
    // A header spans the whole card; the 2% press scale would move the title and
    // the chevron with it.
    disableTransform: true,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: currentTitlePadding,
    cursor: currentDisabled ? "not-allowed" : "pointer",
    opacity: currentDisabled ? 0.5 : 1,
    backgroundColor:
      isExpanded && currentVariant === "contained"
        ? `${currentExpandedColor}10`
        : "transparent",
    children: [titleElement, iconElement],
  });

  // Outer wrapper whose height is animated — starts hidden when collapsed
  contentWrapper = WidgetFactory({
    tag: "div",
    id: panelId,
    // The panel is a landmark a reader can jump to from the header; `aria-labelledby`
    // is what names it, since the title lives in the button rather than in a heading.
    role: "region",
    "aria-labelledby": headerId,
    overflow: "hidden",
    transition: animate
      ? `height ${currentAnimationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
      : "none",
    height: isExpanded ? "auto" : "0",
    display: isExpanded ? "block" : "none",
  });

  // Inner container holds the actual slot content; not animated directly
  contentInner = Container({
    padding: currentContentPadding,
    borderTop:
      currentDivider && isExpanded
        ? `1px solid ${currentDividerColor}`
        : "none",
    children: currentChildren,
  });

  contentWrapper.appendChild(contentInner);
  container.appendChild(titleBar);
  container.appendChild(contentWrapper);

  // Sync all styles with current state
  updateUI();

  // Start watching for content size changes
  setupResizeObserver();

  // ========== PUBLIC API ==========

  /**
   * Programmatically sets the expanded state.
   *
   * @param {boolean} exp - `true` to expand, `false` to collapse.
   * @param {boolean} [triggerCallback=true] - Whether to fire the `onToggle` callback.
   */
  const setExpanded = (exp, triggerCallback = true) => {
    if (exp === isExpanded) return;
    if (exp) expand(triggerCallback);
    else collapse(triggerCallback);
  };

  /**
   * Updates one or more props without rebuilding the component.
   * Only the fields present in `newProps` are applied; others are unchanged.
   *
   * @param {Partial<Object>} newProps - The subset of props to update.
   */
  const update = (newProps) => {
    let needsUIUpdate = false;

    if (newProps.title !== undefined && newProps.title !== currentTitle) {
      currentTitle = newProps.title;
      needsUIUpdate = true;
    }
    if (newProps.children !== undefined) {
      currentChildren = newProps.children;
      // Replace the slot content in place
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
      // If currently expanded, recalculate the wrapper height to fit new content
      if (isExpanded && animate && !isAnimating) {
        const newHeight = getContentHeight() + "px";
        if (contentWrapper.style.height !== "auto") {
          setHeight(newHeight);
          setTimeout(() => setHeight("auto", true), currentAnimationDuration);
        }
      }
    }
    if (newProps.disabled !== undefined && newProps.disabled !== currentDisabled) {
      currentDisabled = newProps.disabled;
      needsUIUpdate = true;
    }
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
      contentInner.style.padding = toREM(currentContentPadding);
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

  // Reactive property accessors so callers can use `accordion.expanded = true`
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
  composeUpdate(container, ACCORDION_PROP_KEYS, update);

  // ========== CLEANUP ==========

  /**
   * Disconnects the ResizeObserver and propagates cleanup to child widgets.
   * Registered through `onUnmount` so it runs on every teardown path.
   */
  container.onUnmount(() => {
    if (resizeObserver) resizeObserver.disconnect();
    if (contentWrapper && contentWrapper._cleanup) contentWrapper._cleanup();
  });

  return container;
};

export default Accordion;
