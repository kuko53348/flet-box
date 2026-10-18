// core/translateProps.js
import { warnUnknownProp, setPropNames } from "./warnings.js";

/**
 * CENTRAL PROP DATABASE
 *
 * Pure data — no processing logic here.
 *
 * Each entry:
 *   prop      : custom name used in widgets (e.g., 'w', 'p', 'onClick')
 *   domProp   : corresponding DOM property or CSS property
 *   type      : 'style' | 'attribute' | 'event' | 'text' | 'special'
 *   unit      : (optional) 'rem' | 'px' | 'none' – style props only
 *   reactive  : (optional) true – whether the prop is reactive
 *   targets   : (optional) list of CSS DOM props a shorthand expands to
 *
 * Props typed as `special` are consumed by widget implementations via
 * `composeUpdate` / `_originalProps`. They are registered here so that:
 *   • `processProps` classifies them without warning
 *   • `assignProps` ignores them (no matching case in `applySpecial`)
 *   • the widget receives them intact for its own rendering logic
 */

export const ALL_PROPS = [
  // ============================================================
  // DIMENSIONS
  // ============================================================
  { prop: "w", domProp: "width", type: "style", unit: "rem", reactive: true },
  { prop: "width", domProp: "width", type: "style", unit: "rem", reactive: true },
  { prop: "h", domProp: "height", type: "style", unit: "rem", reactive: true },
  { prop: "height", domProp: "height", type: "style", unit: "rem", reactive: true },
  { prop: "minW", domProp: "minWidth", type: "style", unit: "rem", reactive: true },
  { prop: "minWidth", domProp: "minWidth", type: "style", unit: "rem", reactive: true },
  { prop: "maxW", domProp: "maxWidth", type: "style", unit: "rem", reactive: true },
  { prop: "maxWidth", domProp: "maxWidth", type: "style", unit: "rem", reactive: true },
  { prop: "minH", domProp: "minHeight", type: "style", unit: "rem", reactive: true },
  { prop: "minHeight", domProp: "minHeight", type: "style", unit: "rem", reactive: true },
  { prop: "maxH", domProp: "maxHeight", type: "style", unit: "rem", reactive: true },
  { prop: "maxHeight", domProp: "maxHeight", type: "style", unit: "rem", reactive: true },

  // ============================================================
  // SPACING
  // ============================================================
  { prop: "p", domProp: "padding", type: "style", unit: "rem", reactive: true },
  { prop: "padding", domProp: "padding", type: "style", unit: "rem", reactive: true },
  { prop: "m", domProp: "margin", type: "style", unit: "rem", reactive: true },
  { prop: "margin", domProp: "margin", type: "style", unit: "rem", reactive: true },
  { prop: "pt", domProp: "paddingTop", type: "style", unit: "rem", reactive: true },
  { prop: "paddingTop", domProp: "paddingTop", type: "style", unit: "rem", reactive: true },
  { prop: "pr", domProp: "paddingRight", type: "style", unit: "rem", reactive: true },
  { prop: "paddingRight", domProp: "paddingRight", type: "style", unit: "rem", reactive: true },
  { prop: "pb", domProp: "paddingBottom", type: "style", unit: "rem", reactive: true },
  { prop: "paddingBottom", domProp: "paddingBottom", type: "style", unit: "rem", reactive: true },
  { prop: "pl", domProp: "paddingLeft", type: "style", unit: "rem", reactive: true },
  { prop: "paddingLeft", domProp: "paddingLeft", type: "style", unit: "rem", reactive: true },
  { prop: "mt", domProp: "marginTop", type: "style", unit: "rem", reactive: true },
  { prop: "marginTop", domProp: "marginTop", type: "style", unit: "rem", reactive: true },
  { prop: "mr", domProp: "marginRight", type: "style", unit: "rem", reactive: true },
  { prop: "marginRight", domProp: "marginRight", type: "style", unit: "rem", reactive: true },
  { prop: "mb", domProp: "marginBottom", type: "style", unit: "rem", reactive: true },
  { prop: "marginBottom", domProp: "marginBottom", type: "style", unit: "rem", reactive: true },
  { prop: "ml", domProp: "marginLeft", type: "style", unit: "rem", reactive: true },
  { prop: "marginLeft", domProp: "marginLeft", type: "style", unit: "rem", reactive: true },
  { prop: "px", domProp: "paddingLeft", type: "style", unit: "rem", reactive: true, targets: ["paddingLeft", "paddingRight"] },
  { prop: "py", domProp: "paddingTop", type: "style", unit: "rem", reactive: true, targets: ["paddingTop", "paddingBottom"] },
  { prop: "mx", domProp: "marginLeft", type: "style", unit: "rem", reactive: true, targets: ["marginLeft", "marginRight"] },
  { prop: "my", domProp: "marginTop", type: "style", unit: "rem", reactive: true, targets: ["marginTop", "marginBottom"] },
  { prop: "gap", domProp: "gap", type: "style", unit: "rem", reactive: true },
  { prop: "marginVertical", domProp: "marginTop", type: "style", unit: "rem", reactive: true, targets: ["marginTop", "marginBottom"] },
  { prop: "marginHorizontal", domProp: "marginLeft", type: "style", unit: "rem", reactive: true, targets: ["marginLeft", "marginRight"] },
  { prop: "paddingVertical", domProp: "paddingTop", type: "style", unit: "rem", reactive: true, targets: ["paddingTop", "paddingBottom"] },
  { prop: "paddingHorizontal", domProp: "paddingLeft", type: "style", unit: "rem", reactive: true, targets: ["paddingLeft", "paddingRight"] },

  // ============================================================
  // POSITION
  // ============================================================
  { prop: "pos", domProp: "position", type: "style", unit: "none", reactive: true },
  { prop: "position", domProp: "position", type: "style", unit: "none", reactive: true },
  { prop: "z", domProp: "zIndex", type: "style", unit: "none", reactive: true },
  { prop: "zIndex", domProp: "zIndex", type: "style", unit: "none", reactive: true },
  { prop: "top", domProp: "top", type: "style", unit: "rem", reactive: true },
  { prop: "right", domProp: "right", type: "style", unit: "rem", reactive: true },
  { prop: "bottom", domProp: "bottom", type: "style", unit: "rem", reactive: true },
  { prop: "left", domProp: "left", type: "style", unit: "rem", reactive: true },
  { prop: "inset", domProp: "inset", type: "style", unit: "rem", reactive: true },

  // ============================================================
  // COLORS
  // ============================================================
  { prop: "bg", domProp: "backgroundColor", type: "style", unit: "none", reactive: true },
  { prop: "bgColor", domProp: "backgroundColor", type: "style", unit: "none", reactive: true },
  { prop: "backgroundColor", domProp: "backgroundColor", type: "style", unit: "none", reactive: true },
  { prop: "textColor", domProp: "color", type: "style", unit: "none", reactive: true },
  { prop: "color", domProp: "color", type: "style", unit: "none", reactive: true },
  { prop: "opacity", domProp: "opacity", type: "style", unit: "none", reactive: true },

  // ============================================================
  // TEXT & TYPOGRAPHY
  // ============================================================
  { prop: "text", domProp: "textContent", type: "text", reactive: true },
  { prop: "label", domProp: "textContent", type: "text", reactive: true },
  { prop: "title", domProp: "textContent", type: "text", reactive: true },
  { prop: "caption", domProp: "textContent", type: "text", reactive: true },
  { prop: "description", domProp: "textContent", type: "text", reactive: true },
  { prop: "message", domProp: "textContent", type: "text", reactive: true },
  { prop: "buttonText", domProp: "textContent", type: "text", reactive: true },
  { prop: "subtitle", domProp: "textContent", type: "text", reactive: true },
  { prop: "textContent", domProp: "textContent", type: "text", reactive: false },

  { prop: "size", domProp: "fontSize", type: "style", unit: "rem", reactive: true },
  { prop: "fontSize", domProp: "fontSize", type: "style", unit: "rem", reactive: true },
  { prop: "weight", domProp: "fontWeight", type: "style", unit: "none", reactive: true },
  { prop: "fontWeight", domProp: "fontWeight", type: "style", unit: "none", reactive: true },
  { prop: "align", domProp: "textAlign", type: "style", unit: "none", reactive: true },
  { prop: "textAlign", domProp: "textAlign", type: "style", unit: "none", reactive: true },
  { prop: "lineH", domProp: "lineHeight", type: "style", unit: "none", reactive: true },
  { prop: "lineHeight", domProp: "lineHeight", type: "style", unit: "none", reactive: true },
  { prop: "letterSpace", domProp: "letterSpacing", type: "style", unit: "rem", reactive: true },
  { prop: "letterSpacing", domProp: "letterSpacing", type: "style", unit: "rem", reactive: true },
  { prop: "decoration", domProp: "textDecoration", type: "style", unit: "none", reactive: true },
  { prop: "textDecoration", domProp: "textDecoration", type: "style", unit: "none", reactive: true },
  { prop: "textTransform", domProp: "textTransform", type: "style", unit: "none", reactive: true },
  { prop: "whiteSpace", domProp: "whiteSpace", type: "style", unit: "none", reactive: true },
  { prop: "wordBreak", domProp: "wordBreak", type: "style", unit: "none", reactive: true },
  { prop: "fontFamily", domProp: "fontFamily", type: "style", unit: "none", reactive: true },
  { prop: "textOverflow", domProp: "textOverflow", type: "style", unit: "none", reactive: true },

  // ============================================================
  // FLEXBOX
  // ============================================================
  { prop: "direction", domProp: "flexDirection", type: "style", unit: "none", reactive: true },
  { prop: "flexDirection", domProp: "flexDirection", type: "style", unit: "none", reactive: true },
  { prop: "justify", domProp: "justifyContent", type: "style", unit: "none", reactive: true },
  { prop: "justifyContent", domProp: "justifyContent", type: "style", unit: "none", reactive: true },
  { prop: "alignItems", domProp: "alignItems", type: "style", unit: "none", reactive: true },
  { prop: "wrap", domProp: "flexWrap", type: "style", unit: "none", reactive: true },
  { prop: "flexWrap", domProp: "flexWrap", type: "style", unit: "none", reactive: true },
  { prop: "flex", domProp: "flex", type: "style", unit: "none", reactive: true },
  { prop: "flexGrow", domProp: "flexGrow", type: "style", unit: "none", reactive: true },
  { prop: "flexShrink", domProp: "flexShrink", type: "style", unit: "none", reactive: true },
  { prop: "flexBasis", domProp: "flexBasis", type: "style", unit: "rem", reactive: true },

  // ============================================================
  // BORDERS & RADIUS
  // ============================================================
  { prop: "rounded", domProp: "borderRadius", type: "style", unit: "rem", reactive: true },
  { prop: "borderRadius", domProp: "borderRadius", type: "style", unit: "rem", reactive: true },
  { prop: "border", domProp: "border", type: "style", unit: "none", reactive: true },
  { prop: "borderColor", domProp: "borderColor", type: "style", unit: "none", reactive: true },
  { prop: "borderWidth", domProp: "borderWidth", type: "style", unit: "px", reactive: true },
  { prop: "borderStyle", domProp: "borderStyle", type: "style", unit: "none", reactive: true },
  { prop: "borderTop", domProp: "borderTop", type: "style", unit: "none", reactive: true },
  { prop: "borderBottom", domProp: "borderBottom", type: "style", unit: "none", reactive: true },
  { prop: "borderLeft", domProp: "borderLeft", type: "style", unit: "none", reactive: true },
  { prop: "borderRight", domProp: "borderRight", type: "style", unit: "none", reactive: true },
  { prop: "roundedTop", domProp: "borderTopLeftRadius", type: "style", unit: "rem", reactive: true, targets: ["borderTopLeftRadius", "borderTopRightRadius"] },
  { prop: "roundedBottom", domProp: "borderBottomLeftRadius", type: "style", unit: "rem", reactive: true, targets: ["borderBottomLeftRadius", "borderBottomRightRadius"] },
  { prop: "roundedLeft", domProp: "borderTopLeftRadius", type: "style", unit: "rem", reactive: true, targets: ["borderTopLeftRadius", "borderBottomLeftRadius"] },
  { prop: "roundedRight", domProp: "borderTopRightRadius", type: "style", unit: "rem", reactive: true, targets: ["borderTopRightRadius", "borderBottomRightRadius"] },

  // Aliases simétricos (usados en only_controls: Image({ borderRadiusTop: 20 }))
  { prop: "borderRadiusTop", domProp: "borderTopLeftRadius", type: "style", unit: "rem", reactive: true, targets: ["borderTopLeftRadius", "borderTopRightRadius"] },
  { prop: "borderRadiusBottom", domProp: "borderBottomLeftRadius", type: "style", unit: "rem", reactive: true, targets: ["borderBottomLeftRadius", "borderBottomRightRadius"] },
  { prop: "borderRadiusLeft", domProp: "borderTopLeftRadius", type: "style", unit: "rem", reactive: true, targets: ["borderTopLeftRadius", "borderBottomLeftRadius"] },
  { prop: "borderRadiusRight", domProp: "borderTopRightRadius", type: "style", unit: "rem", reactive: true, targets: ["borderTopRightRadius", "borderBottomRightRadius"] },

  // Single-corner radii. The shorthands above fan out over two corners, so a
  // widget that needs one corner only (Drawer rounds the side facing the body)
  // writes the CSS corner names directly.
  { prop: "borderTopLeftRadius", domProp: "borderTopLeftRadius", type: "style", unit: "rem", reactive: true },
  { prop: "borderTopRightRadius", domProp: "borderTopRightRadius", type: "style", unit: "rem", reactive: true },
  { prop: "borderBottomLeftRadius", domProp: "borderBottomLeftRadius", type: "style", unit: "rem", reactive: true },
  { prop: "borderBottomRightRadius", domProp: "borderBottomRightRadius", type: "style", unit: "rem", reactive: true },

  // ============================================================
  // SHADOWS
  // ============================================================
  { prop: "shadow", domProp: "boxShadow", type: "style", unit: "none", reactive: true },
  { prop: "boxShadow", domProp: "boxShadow", type: "style", unit: "none", reactive: true },
  { prop: "elevation", domProp: "boxShadow", type: "style", unit: "none", reactive: true },

  // ============================================================
  // DISPLAY & LAYOUT
  // ============================================================
  { prop: "display", domProp: "display", type: "style", unit: "none", reactive: true },
  { prop: "overflow", domProp: "overflow", type: "style", unit: "none", reactive: true },
  { prop: "overflowX", domProp: "overflowX", type: "style", unit: "none", reactive: true },
  { prop: "overflowY", domProp: "overflowY", type: "style", unit: "none", reactive: true },
  { prop: "boxSizing", domProp: "boxSizing", type: "style", unit: "none", reactive: true },
  { prop: "cursor", domProp: "cursor", type: "style", unit: "none", reactive: true },
  { prop: "visibility", domProp: "visibility", type: "style", unit: "none", reactive: true },
  { prop: "pointerEvents", domProp: "pointerEvents", type: "style", unit: "none", reactive: true },
  { prop: "userSelect", domProp: "userSelect", type: "style", unit: "none", reactive: true },
  { prop: "touchAction", domProp: "touchAction", type: "style", unit: "none", reactive: true },
  // Hints the compositor about the property an animation will change. It is a
  // render optimisation, never assigned by hand after mount, so it is not
  // reactive and costs no accessor on every widget.
  { prop: "willChange", domProp: "willChange", type: "style", unit: "none", reactive: false },

  // ============================================================
  // BACKGROUND
  // ============================================================
  { prop: "gradient", domProp: "background", type: "style", unit: "none", reactive: true },
  { prop: "bgImage", domProp: "backgroundImage", type: "style", unit: "none", reactive: true },
  { prop: "bgSize", domProp: "backgroundSize", type: "style", unit: "none", reactive: true },
  { prop: "bgPosition", domProp: "backgroundPosition", type: "style", unit: "none", reactive: true },
  { prop: "bgRepeat", domProp: "backgroundRepeat", type: "style", unit: "none", reactive: true },

  // ============================================================
  // ANIMATIONS & TRANSITIONS
  // ============================================================
  { prop: "transition", domProp: "transition", type: "style", unit: "none", reactive: true },
  { prop: "animation", domProp: "animation", type: "style", unit: "none", reactive: true },
  { prop: "transform", domProp: "transform", type: "style", unit: "none", reactive: true },

  // ============================================================
  // HTML ATTRIBUTES
  // ============================================================
  { prop: "id", domProp: "id", type: "attribute" },
  { prop: "className", domProp: "className", type: "attribute" },
  { prop: "class", domProp: "className", type: "attribute" },
  { prop: "name", domProp: "name", type: "attribute" },
  { prop: "type", domProp: "type", type: "attribute" },
  { prop: "href", domProp: "href", type: "attribute" },
  { prop: "src", domProp: "src", type: "attribute" },
  { prop: "alt", domProp: "alt", type: "attribute" },
  { prop: "disabled", domProp: "disabled", type: "attribute" },
  { prop: "readOnly", domProp: "readOnly", type: "attribute" },
  { prop: "readonly", domProp: "readOnly", type: "attribute" },
  { prop: "required", domProp: "required", type: "attribute" },
  { prop: "checked", domProp: "checked", type: "attribute" },
  { prop: "selected", domProp: "selected", type: "attribute" },
  { prop: "placeholder", domProp: "placeholder", type: "attribute" },
  { prop: "min", domProp: "min", type: "attribute" },
  { prop: "max", domProp: "max", type: "attribute" },
  { prop: "step", domProp: "step", type: "attribute" },
  { prop: "pattern", domProp: "pattern", type: "attribute" },
  { prop: "role", domProp: "role", type: "attribute" },
  { prop: "lang", domProp: "lang", type: "attribute" },
  { prop: "dir", domProp: "dir", type: "attribute" },
  { prop: "tabIndex", domProp: "tabIndex", type: "attribute" },
  { prop: "draggable", domProp: "draggable", type: "attribute" },
  { prop: "hidden", domProp: "hidden", type: "attribute" },
  { prop: "for", domProp: "htmlFor", type: "attribute" },
  { prop: "htmlFor", domProp: "htmlFor", type: "attribute" },
  { prop: "autofocus", domProp: "autofocus", type: "attribute" },
  { prop: "autocomplete", domProp: "autocomplete", type: "attribute" },
  { prop: "spellcheck", domProp: "spellcheck", type: "attribute" },
  { prop: "inputmode", domProp: "inputMode", type: "attribute" },

  // ============================================================
  // EVENTS (standard DOM events)
  // ============================================================
  { prop: "onPress", domProp: "click", type: "event" },
  { prop: "onClick", domProp: "click", type: "event" },
  { prop: "onclick", domProp: "click", type: "event" },
  { prop: "onDoublePress", domProp: "dblclick", type: "event" },
  { prop: "onRightClick", domProp: "contextmenu", type: "event" },
  { prop: "onHover", domProp: "mouseenter", type: "event" },
  { prop: "onHoverEnd", domProp: "mouseleave", type: "event" },
  { prop: "onFocus", domProp: "focus", type: "event" },
  { prop: "onBlur", domProp: "blur", type: "event" },
  { prop: "onChange", domProp: "change", type: "event" },
  { prop: "onInput", domProp: "input", type: "event" },
  { prop: "onScroll", domProp: "scroll", type: "event" },
  { prop: "onKeyDown", domProp: "keydown", type: "event" },
  { prop: "onKeyUp", domProp: "keyup", type: "event" },
  { prop: "onKeyPress", domProp: "keypress", type: "event" },
  { prop: "onMouseDown", domProp: "mousedown", type: "event" },
  { prop: "onMouseUp", domProp: "mouseup", type: "event" },
  { prop: "onMouseMove", domProp: "mousemove", type: "event" },
  { prop: "onTouchStart", domProp: "touchstart", type: "event" },
  { prop: "onTouchMove", domProp: "touchmove", type: "event" },
  { prop: "onTouchEnd", domProp: "touchend", type: "event" },

  // ============================================================
  // CORE SPECIALS
  // ============================================================
  { prop: "value", domProp: "value", type: "special", reactive: true },
  { prop: "variant", domProp: "variant", type: "special", reactive: true },
  { prop: "ref", domProp: "ref", type: "special" },
  { prop: "child", domProp: "child", type: "special" },
  { prop: "children", domProp: "children", type: "special" },
  { prop: "disableTransform", domProp: "disableTransform", type: "special" },
  { prop: "data", domProp: "data", type: "special" },

  // Stack positioning helpers (consumed by stackPosition.js)
  { prop: "start", domProp: "start", type: "special" },
  { prop: "end", domProp: "end", type: "special" },
  { prop: "centerX", domProp: "centerX", type: "special" },
  { prop: "centerY", domProp: "centerY", type: "special" },
  { prop: "center", domProp: "center", type: "special" },
  { prop: "fullWidth", domProp: "fullWidth", type: "special" },
  { prop: "fullHeight", domProp: "fullHeight", type: "special" },
  { prop: "full", domProp: "full", type: "special" },

  // ============================================================
  // WIDGET-CONSUMED SPECIALS
  // ============================================================
  // Props read by widgets from `_originalProps` and applied through their own
  // `applyWidgetProps` (via `composeUpdate`). They never touch the DOM
  // directly and never emit "unknown prop" warnings.

  // ---- Text ----
  { prop: "italic", domProp: "italic", type: "special" },
  { prop: "styles", domProp: "styles", type: "special" },

  // ---- AppBar / Accordion ----
  { prop: "titleColor", domProp: "titleColor", type: "special" },
  { prop: "titleSize", domProp: "titleSize", type: "special" },
  { prop: "titleWeight", domProp: "titleWeight", type: "special" },
  { prop: "expandedColor", domProp: "expandedColor", type: "special" },
  { prop: "iconCollapsed", domProp: "iconCollapsed", type: "special" },
  { prop: "iconExpanded", domProp: "iconExpanded", type: "special" },
  { prop: "titlePadding", domProp: "titlePadding", type: "special" },
  { prop: "contentPadding", domProp: "contentPadding", type: "special" },
  { prop: "headerBgColor", domProp: "headerBgColor", type: "special" },
  { prop: "headerTextColor", domProp: "headerTextColor", type: "special" },
  { prop: "contentElevation", domProp: "contentElevation", type: "special" },
  { prop: "headerBorder", domProp: "headerBorder", type: "special" },
  { prop: "headerPadding", domProp: "headerPadding", type: "special" },
  { prop: "footerBgColor", domProp: "footerBgColor", type: "special" },
  { prop: "footerBorder", domProp: "footerBorder", type: "special" },
  { prop: "footerPadding", domProp: "footerPadding", type: "special" },
  { prop: "headerElevation", domProp: "headerElevation", type: "special" },
  { prop: "footerElevation", domProp: "footerElevation", type: "special" },

  // ---- AppBar structure ----
  { prop: "leading", domProp: "leading", type: "special" },
  { prop: "actions", domProp: "actions", type: "special" },
  { prop: "showBackButton", domProp: "showBackButton", type: "special" },
  { prop: "backButtonRoute", domProp: "backButtonRoute", type: "special" },
  { prop: "onBackPress", domProp: "onBackPress", type: "special" },
  { prop: "centerTitle", domProp: "centerTitle", type: "special" },
  { prop: "sticky", domProp: "sticky", type: "special" },
  { prop: "hideOnScroll", domProp: "hideOnScroll", type: "special" },
  { prop: "scrollThreshold", domProp: "scrollThreshold", type: "special" },

  // ---- Tabs ----
  { prop: "tabs", domProp: "tabs", type: "special" },
  { prop: "activeIndex", domProp: "activeIndex", type: "special" },
  { prop: "showDivider", domProp: "showDivider", type: "special" },
  { prop: "dividerColor", domProp: "dividerColor", type: "special" },
  { prop: "showIcon", domProp: "showIcon", type: "special" },
  { prop: "iconPosition", domProp: "iconPosition", type: "special" },
  { prop: "iconSize", domProp: "iconSize", type: "special" },
  { prop: "badges", domProp: "badges", type: "special" },
  { prop: "alignment", domProp: "alignment", type: "special" },
  { prop: "activeTextColor", domProp: "activeTextColor", type: "special" },
  { prop: "buttonColor", domProp: "buttonColor", type: "special" },

  // ---- Tooltip ----
  { prop: "showArrow", domProp: "showArrow", type: "special" },
  { prop: "arrowSize", domProp: "arrowSize", type: "special" },
  { prop: "delay", domProp: "delay", type: "special" },
  { prop: "animationDuration", domProp: "animationDuration", type: "special" },
  { prop: "offset", domProp: "offset", type: "special" },

  // ---- Input / Dropdown ----
  { prop: "error", domProp: "error", type: "special" },
  { prop: "validation", domProp: "validation", type: "special" },
  { prop: "customPattern", domProp: "customPattern", type: "special" },
  { prop: "maxLength", domProp: "maxLength", type: "special" },
  { prop: "passwordToggle", domProp: "passwordToggle", type: "special" },
  { prop: "showValidationMessage", domProp: "showValidationMessage", type: "special" },
  { prop: "showValidationIcon", domProp: "showValidationIcon", type: "special" },
  { prop: "iconLeft", domProp: "iconLeft", type: "special" },
  { prop: "iconRight", domProp: "iconRight", type: "special" },
  { prop: "iconTop", domProp: "iconTop", type: "special" },
  { prop: "iconBottom", domProp: "iconBottom", type: "special" },
  { prop: "options", domProp: "options", type: "special" },
  { prop: "optionHoverColor", domProp: "optionHoverColor", type: "special" },
  { prop: "portal", domProp: "portal", type: "special" },
  { prop: "clearable", domProp: "clearable", type: "special" },
  { prop: "onValidated", domProp: "onValidated", type: "special" },
  { prop: "onEnter", domProp: "onEnter", type: "special" },

  // ---- Slider / Rating ----
  { prop: "thumbSize", domProp: "thumbSize", type: "special" },
  { prop: "thumbColor", domProp: "thumbColor", type: "special" },
  { prop: "trackColor", domProp: "trackColor", type: "special" },
  { prop: "marks", domProp: "marks", type: "special" },
  { prop: "showMarks", domProp: "showMarks", type: "special" },
  { prop: "inverted", domProp: "inverted", type: "special" },
  { prop: "valuePrefix", domProp: "valuePrefix", type: "special" },
  { prop: "valueSuffix", domProp: "valueSuffix", type: "special" },
  { prop: "allowHalf", domProp: "allowHalf", type: "special" },
  { prop: "iconActive", domProp: "iconActive", type: "special" },
  { prop: "iconInactive", domProp: "iconInactive", type: "special" },
  { prop: "iconHalf", domProp: "iconHalf", type: "special" },
  { prop: "activeColor", domProp: "activeColor", type: "special" },
  { prop: "inactiveColor", domProp: "inactiveColor", type: "special" },
  { prop: "onChangeEnd", domProp: "onChangeEnd", type: "special" },

  // ---- Shared callbacks ----
  { prop: "onCheck", domProp: "onCheck", type: "special" },
  { prop: "onToggle", domProp: "onToggle", type: "special" },
  { prop: "onSelect", domProp: "onSelect", type: "special" },
  { prop: "onDelete", domProp: "onDelete", type: "special" },
  { prop: "onLongPress", domProp: "onLongPress", type: "special" },

  // ---- Modal / BottomSheet / AlertDialog / SnackBar ----
  { prop: "content", domProp: "content", type: "special" },
  { prop: "confirmText", domProp: "confirmText", type: "special" },
  { prop: "cancelText", domProp: "cancelText", type: "special" },
  { prop: "showCancel", domProp: "showCancel", type: "special" },
  { prop: "closeOnOverlayClick", domProp: "closeOnOverlayClick", type: "special" },
  { prop: "closeOnEsc", domProp: "closeOnEsc", type: "special" },
  { prop: "showCloseButton", domProp: "showCloseButton", type: "special" },
  { prop: "overlayColor", domProp: "overlayColor", type: "special" },
  { prop: "contentBgColor", domProp: "contentBgColor", type: "special" },
  { prop: "onOpen", domProp: "onOpen", type: "special" },
  { prop: "onClose", domProp: "onClose", type: "special" },
  { prop: "onConfirm", domProp: "onConfirm", type: "special" },
  { prop: "onCancel", domProp: "onCancel", type: "special" },
  { prop: "showDragHandle", domProp: "showDragHandle", type: "special" },
  { prop: "closeOnDragDown", domProp: "closeOnDragDown", type: "special" },
  { prop: "dragHandleColor", domProp: "dragHandleColor", type: "special" },
  { prop: "actionPadding", domProp: "actionPadding", type: "special" },
  { prop: "headerBorderColor", domProp: "headerBorderColor", type: "special" },
  { prop: "actionBorderColor", domProp: "actionBorderColor", type: "special" },
  { prop: "dragHandlePadding", domProp: "dragHandlePadding", type: "special" },
  { prop: "dragHandleWidth", domProp: "dragHandleWidth", type: "special" },
  { prop: "dragHandleHeight", domProp: "dragHandleHeight", type: "special" },
  { prop: "overlayZIndex", domProp: "overlayZIndex", type: "special" },
  { prop: "action", domProp: "action", type: "special" },
  { prop: "actionColor", domProp: "actionColor", type: "special" },
  { prop: "onAction", domProp: "onAction", type: "special" },
  { prop: "dismissible", domProp: "dismissible", type: "special" },
  { prop: "onShow", domProp: "onShow", type: "special" },

  // ---- Scaffold / AdaptiveScaffold / Drawer ----
  { prop: "appBar", domProp: "appBar", type: "special" },
  { prop: "body", domProp: "body", type: "special" },
  { prop: "footer", domProp: "footer", type: "special" },
  { prop: "header", domProp: "header", type: "special" },
  { prop: "bottomBar", domProp: "bottomBar", type: "special" },
  { prop: "drawer", domProp: "drawer", type: "special" },
  { prop: "fab", domProp: "fab", type: "special" },
  { prop: "leftNavBar", domProp: "leftNavBar", type: "special" },
  { prop: "rightNavBar", domProp: "rightNavBar", type: "special" },
  { prop: "leftNavBarWidth", domProp: "leftNavBarWidth", type: "special" },
  { prop: "rightNavBarWidth", domProp: "rightNavBarWidth", type: "special" },
  { prop: "navSideBar", domProp: "navSideBar", type: "special" },
  { prop: "navSideBarWidth", domProp: "navSideBarWidth", type: "special" },
  { prop: "navSideBarPosition", domProp: "navSideBarPosition", type: "special" },
  { prop: "routes", domProp: "routes", type: "special" },
  { prop: "closeDrawerOnNavigate", domProp: "closeDrawerOnNavigate", type: "special" },
  { prop: "forceMobile", domProp: "forceMobile", type: "special" },
  { prop: "forceDesktop", domProp: "forceDesktop", type: "special" },
  { prop: "blur", domProp: "blur", type: "special" },
  { prop: "blurIntensity", domProp: "blurIntensity", type: "special" },
  { prop: "useRouter", domProp: "useRouter", type: "special" },
  { prop: "items", domProp: "items", type: "special" },
  { prop: "currentIndex", domProp: "currentIndex", type: "special" },
  { prop: "onTabChange", domProp: "onTabChange", type: "special" },
  { prop: "selectedColor", domProp: "selectedColor", type: "special" },
  { prop: "unselectedColor", domProp: "unselectedColor", type: "special" },
  { prop: "showLabels", domProp: "showLabels", type: "special" },

  // ---- DrawerItem / CollapsibleSideBar ----
  { prop: "route", domProp: "route", type: "special" },
  { prop: "trailingIcon", domProp: "trailingIcon", type: "special" },
  { prop: "hintColor", domProp: "hintColor", type: "special" },
  { prop: "trailingIconColor", domProp: "trailingIconColor", type: "special" },
  { prop: "iconColor", domProp: "iconColor", type: "special" },
  { prop: "closeOnPress", domProp: "closeOnPress", type: "special" },
  { prop: "expanded", domProp: "expanded", type: "special" },
  { prop: "widthExpanded", domProp: "widthExpanded", type: "special" },
  { prop: "widthCollapsed", domProp: "widthCollapsed", type: "special" },
  { prop: "showTooltip", domProp: "showTooltip", type: "special" },
  { prop: "tooltipDelay", domProp: "tooltipDelay", type: "special" },

  // ---- ListView / GridView ----
  { prop: "renderItem", domProp: "renderItem", type: "special" },
  { prop: "itemSize", domProp: "itemSize", type: "special" },
  { prop: "itemHeight", domProp: "itemHeight", type: "special" },
  { prop: "orientation", domProp: "orientation", type: "special" },
  { prop: "onEndReached", domProp: "onEndReached", type: "special" },
  { prop: "onEndReachedThreshold", domProp: "onEndReachedThreshold", type: "special" },
  { prop: "onRefresh", domProp: "onRefresh", type: "special" },
  { prop: "refreshing", domProp: "refreshing", type: "special" },
  { prop: "ListHeaderComponent", domProp: "ListHeaderComponent", type: "special" },
  { prop: "ListFooterComponent", domProp: "ListFooterComponent", type: "special" },
  { prop: "ListEmptyComponent", domProp: "ListEmptyComponent", type: "special" },
  { prop: "showsScrollIndicator", domProp: "showsScrollIndicator", type: "special" },
  { prop: "bufferSize", domProp: "bufferSize", type: "special" },
  { prop: "expand", domProp: "expand", type: "special" },
  { prop: "spacing", domProp: "spacing", type: "special" },
  { prop: "columns", domProp: "columns", type: "special" },
  { prop: "wrapItems", domProp: "wrapItems", type: "special" },
  { prop: "crossAxisCount", domProp: "crossAxisCount", type: "special" },

  // ---- DataTable ----
  { prop: "rows", domProp: "rows", type: "special" },
  { prop: "striped", domProp: "striped", type: "special" },
  { prop: "hoverable", domProp: "hoverable", type: "special" },
  { prop: "bordered", domProp: "bordered", type: "special" },
  { prop: "onRowClick", domProp: "onRowClick", type: "special" },
  { prop: "headerFontWeight", domProp: "headerFontWeight", type: "special" },
  { prop: "headerFontSize", domProp: "headerFontSize", type: "special" },
  { prop: "rowBgColor", domProp: "rowBgColor", type: "special" },
  { prop: "rowTextColor", domProp: "rowTextColor", type: "special" },
  { prop: "rowFontSize", domProp: "rowFontSize", type: "special" },
  { prop: "stripedRowBgColor", domProp: "stripedRowBgColor", type: "special" },
  { prop: "hoverRowBgColor", domProp: "hoverRowBgColor", type: "special" },
  { prop: "cellPadding", domProp: "cellPadding", type: "special" },
  { prop: "headerCellPadding", domProp: "headerCellPadding", type: "special" },

  // ---- Chart ----
  { prop: "labels", domProp: "labels", type: "special" },
  { prop: "barColor", domProp: "barColor", type: "special" },
  { prop: "lineColor", domProp: "lineColor", type: "special" },
  { prop: "areaColor", domProp: "areaColor", type: "special" },
  { prop: "smooth", domProp: "smooth", type: "special" },
  { prop: "areaGradient", domProp: "areaGradient", type: "special" },
  { prop: "areaGradientColors", domProp: "areaGradientColors", type: "special" },
  { prop: "axisColor", domProp: "axisColor", type: "special" },
  { prop: "yAxisColor", domProp: "yAxisColor", type: "special" },
  { prop: "showGrid", domProp: "showGrid", type: "special" },
  { prop: "showLabels", domProp: "showLabels", type: "special" },
  { prop: "showValues", domProp: "showValues", type: "special" },
  { prop: "candleWidth", domProp: "candleWidth", type: "special" },
  { prop: "candleSpacing", domProp: "candleSpacing", type: "special" },
  { prop: "candleUpColor", domProp: "candleUpColor", type: "special" },
  { prop: "candleDownColor", domProp: "candleDownColor", type: "special" },

  // ---- Stepper ----
  { prop: "steps", domProp: "steps", type: "special" },
  { prop: "activeStep", domProp: "activeStep", type: "special" },
  { prop: "onStepChange", domProp: "onStepChange", type: "special" },
  { prop: "showNavigation", domProp: "showNavigation", type: "special" },
  { prop: "nextLabel", domProp: "nextLabel", type: "special" },
  { prop: "backLabel", domProp: "backLabel", type: "special" },
  { prop: "finishLabel", domProp: "finishLabel", type: "special" },
  { prop: "onFinish", domProp: "onFinish", type: "special" },

  // ---- Pagination ----
  { prop: "totalItems", domProp: "totalItems", type: "special" },
  { prop: "pageSize", domProp: "pageSize", type: "special" },
  { prop: "currentPage", domProp: "currentPage", type: "special" },
  { prop: "onPageChange", domProp: "onPageChange", type: "special" },
  { prop: "showFirstLast", domProp: "showFirstLast", type: "special" },
  { prop: "showPrevNext", domProp: "showPrevNext", type: "special" },
  { prop: "maxButtons", domProp: "maxButtons", type: "special" },
  { prop: "showTotal", domProp: "showTotal", type: "special" },

  // ---- TreeView ----
  { prop: "nodes", domProp: "nodes", type: "special" },
  { prop: "expandedNodes", domProp: "expandedNodes", type: "special" },
  { prop: "indent", domProp: "indent", type: "special" },
  { prop: "showIcons", domProp: "showIcons", type: "special" },
  { prop: "folderIcon", domProp: "folderIcon", type: "special" },
  { prop: "folderOpenIcon", domProp: "folderOpenIcon", type: "special" },
  { prop: "fileIcon", domProp: "fileIcon", type: "special" },
  { prop: "expandIcon", domProp: "expandIcon", type: "special" },
  { prop: "collapseIcon", domProp: "collapseIcon", type: "special" },
  { prop: "defaultExpanded", domProp: "defaultExpanded", type: "special" },
  { prop: "selectable", domProp: "selectable", type: "special" },
  { prop: "selectedNodeId", domProp: "selectedNodeId", type: "special" },
  { prop: "hoverBgColor", domProp: "hoverBgColor", type: "special" },
  { prop: "selectedBgColor", domProp: "selectedBgColor", type: "special" },
  { prop: "selectedTextColor", domProp: "selectedTextColor", type: "special" },
  { prop: "folderIconColor", domProp: "folderIconColor", type: "special" },
  { prop: "nodePadding", domProp: "nodePadding", type: "special" },
  { prop: "nodeGap", domProp: "nodeGap", type: "special" },
  { prop: "childrenGap", domProp: "childrenGap", type: "special" },

  // ---- AnimatedBox / AnimatedText / Parallax ----
  { prop: "animations", domProp: "animations", type: "special" },
  { prop: "timing", domProp: "timing", type: "special" },
  { prop: "fillMode", domProp: "fillMode", type: "special" },
  { prop: "sameTime", domProp: "sameTime", type: "special" },
  { prop: "delayBetween", domProp: "delayBetween", type: "special" },
  { prop: "effect", domProp: "effect", type: "special" },
  { prop: "from", domProp: "from", type: "special" },
  { prop: "to", domProp: "to", type: "special" },
  { prop: "duration", domProp: "duration", type: "special" },
  { prop: "reverse", domProp: "reverse", type: "special" },
  { prop: "loop", domProp: "loop", type: "special" },
  { prop: "maxOffset", domProp: "maxOffset", type: "special" },
  { prop: "onParallaxMove", domProp: "onParallaxMove", type: "special" },
  { prop: "easing", domProp: "easing", type: "special" },

  // ---- CodeViewer ----
  { prop: "code", domProp: "code", type: "special" },
  { prop: "showHeader", domProp: "showHeader", type: "special" },
  { prop: "showLineNumbers", domProp: "showLineNumbers", type: "special" },
  { prop: "startingLineNumber", domProp: "startingLineNumber", type: "special" },
  { prop: "lineNumberWidth", domProp: "lineNumberWidth", type: "special" },
  { prop: "lineNumberColor", domProp: "lineNumberColor", type: "special" },
  { prop: "language", domProp: "language", type: "special" },

  // ---- Carousel ----
  { prop: "autoPlay", domProp: "autoPlay", type: "special" },
  { prop: "interval", domProp: "interval", type: "special" },
  { prop: "showArrows", domProp: "showArrows", type: "special" },
  { prop: "showDots", domProp: "showDots", type: "special" },
  { prop: "infinite", domProp: "infinite", type: "special" },
  { prop: "dotColor", domProp: "dotColor", type: "special" },
  { prop: "dotActiveColor", domProp: "dotActiveColor", type: "special" },
  { prop: "dotSize", domProp: "dotSize", type: "special" },
  { prop: "dotActiveSize", domProp: "dotActiveSize", type: "special" },
  { prop: "buttonBgColor", domProp: "buttonBgColor", type: "special" },
  { prop: "buttonIconColor", domProp: "buttonIconColor", type: "special" },
  { prop: "buttonSize", domProp: "buttonSize", type: "special" },
  { prop: "buttonIconSize", domProp: "buttonIconSize", type: "special" },
  { prop: "onIndexChange", domProp: "onIndexChange", type: "special" },

  // ---- Video / Audio ----
  { prop: "autoplay", domProp: "autoplay", type: "special" },
  { prop: "controls", domProp: "controls", type: "special" },
  { prop: "muted", domProp: "muted", type: "special" },
  { prop: "poster", domProp: "poster", type: "special" },
  { prop: "volume", domProp: "volume", type: "special" },
  { prop: "onLoad", domProp: "onLoad", type: "special" },
  { prop: "onError", domProp: "onError", type: "special" },
  { prop: "onPlay", domProp: "onPlay", type: "special" },
  { prop: "onPause", domProp: "onPause", type: "special" },
  { prop: "onEnd", domProp: "onEnd", type: "special" },
  { prop: "onTimeUpdate", domProp: "onTimeUpdate", type: "special" },
  { prop: "onProgress", domProp: "onProgress", type: "special" },

  // ---- DraggBox / DroppBox ----
  { prop: "acceptGroups", domProp: "acceptGroups", type: "special" },
  { prop: "onDrop", domProp: "onDrop", type: "special" },
  { prop: "onDragStart", domProp: "onDragStart", type: "special" },
  { prop: "onDragEnd", domProp: "onDragEnd", type: "special" },
  { prop: "onDragEnter", domProp: "onDragEnter", type: "special" },
  { prop: "onDragLeave", domProp: "onDragLeave", type: "special" },
  { prop: "onDragOver", domProp: "onDragOver", type: "special" },
  { prop: "group", domProp: "group", type: "special" },
  { prop: "cloneOnDrag", domProp: "cloneOnDrag", type: "special" },
  { prop: "dragImage", domProp: "dragImage", type: "special" },
  { prop: "dragOverlayColor", domProp: "dragOverlayColor", type: "special" },
  { prop: "dragBorderColor", domProp: "dragBorderColor", type: "special" },
  { prop: "activeBgColor", domProp: "activeBgColor", type: "special" },
  { prop: "activeBorderColor", domProp: "activeBorderColor", type: "special" },
  { prop: "activeBorderWidth", domProp: "activeBorderWidth", type: "special" },
  { prop: "activeBorderStyle", domProp: "activeBorderStyle", type: "special" },
  { prop: "activeShadow", domProp: "activeShadow", type: "special" },
  { prop: "validBgColor", domProp: "validBgColor", type: "special" },
  { prop: "validBorderColor", domProp: "validBorderColor", type: "special" },
  { prop: "invalidBgColor", domProp: "invalidBgColor", type: "special" },
  { prop: "invalidBorderColor", domProp: "invalidBorderColor", type: "special" },
  { prop: "showFeedback", domProp: "showFeedback", type: "special" },
  { prop: "transitionDuration", domProp: "transitionDuration", type: "special" },
  { prop: "transitionTiming", domProp: "transitionTiming", type: "special" },

  // ---- Progress / Circular / Skeleton ----
  { prop: "strokeWidth", domProp: "strokeWidth", type: "special" },
  { prop: "progress", domProp: "progress", type: "special" },
  { prop: "showValue", domProp: "showValue", type: "special" },
  { prop: "valueColor", domProp: "valueColor", type: "special" },
  { prop: "valueSize", domProp: "valueSize", type: "special" },
  { prop: "valuePosition", domProp: "valuePosition", type: "special" },
  { prop: "valueFormat", domProp: "valueFormat", type: "special" },
  { prop: "valueDecimals", domProp: "valueDecimals", type: "special" },
  { prop: "labelColor", domProp: "labelColor", type: "special" },
  { prop: "labelSize", domProp: "labelSize", type: "special" },
  { prop: "lineCap", domProp: "lineCap", type: "special" },
  { prop: "animate", domProp: "animate", type: "special" },
  { prop: "indeterminate", domProp: "indeterminate", type: "special" },
  { prop: "animatedStripes", domProp: "animatedStripes", type: "special" },
  { prop: "stripeColor", domProp: "stripeColor", type: "special" },
  { prop: "shadowBlur", domProp: "shadowBlur", type: "special" },
  { prop: "shadowColor", domProp: "shadowColor", type: "special" },
  { prop: "glow", domProp: "glow", type: "special" },
  { prop: "glowColor", domProp: "glowColor", type: "special" },
  { prop: "innerStrokeWidth", domProp: "innerStrokeWidth", type: "special" },
  { prop: "innerColor", domProp: "innerColor", type: "special" },
  { prop: "centerContent", domProp: "centerContent", type: "special" },
  { prop: "cornerRadius", domProp: "cornerRadius", type: "special" },
  { prop: "tooltip", domProp: "tooltip", type: "special" },
  { prop: "subtitleColor", domProp: "subtitleColor", type: "special" },
  { prop: "subtitleSize", domProp: "subtitleSize", type: "special" },
  { prop: "markers", domProp: "markers", type: "special" },
  { prop: "onComplete", domProp: "onComplete", type: "special" },
  { prop: "count", domProp: "count", type: "special" },
  { prop: "highlightColor", domProp: "highlightColor", type: "special" },
  { prop: "shimmerColor", domProp: "shimmerColor", type: "special" },
  { prop: "pulseDuration", domProp: "pulseDuration", type: "special" },
  { prop: "waveDuration", domProp: "waveDuration", type: "special" },

  // ---- Avatar / Badge / Icon / Chip ----
  { prop: "icon", domProp: "icon", type: "special" },
  { prop: "shape", domProp: "shape", type: "special" },
  { prop: "online", domProp: "online", type: "special" },
  { prop: "badge", domProp: "badge", type: "special" },
  { prop: "badgeColor", domProp: "badgeColor", type: "special" },
  { prop: "showZero", domProp: "showZero", type: "special" },

  // ---- ListTile / FAB ----
  { prop: "leftItem", domProp: "leftItem", type: "special" },
  { prop: "rightItem", domProp: "rightItem", type: "special" },
  { prop: "divider", domProp: "divider", type: "special" },
  { prop: "hoverColor", domProp: "hoverColor", type: "special" },
  { prop: "mini", domProp: "mini", type: "special" },
  { prop: "extended", domProp: "extended", type: "special" },
  { prop: "foregroundColor", domProp: "foregroundColor", type: "special" },

  // ---- Divider ----
  { prop: "thickness", domProp: "thickness", type: "special" },

  // ---- Markdown ----
  { prop: "linkColor", domProp: "linkColor", type: "special" },
  { prop: "linkHoverColor", domProp: "linkHoverColor", type: "special" },
  { prop: "linkUnderline", domProp: "linkUnderline", type: "special" },
  { prop: "codeBgColor", domProp: "codeBgColor", type: "special" },
  { prop: "codeColor", domProp: "codeColor", type: "special" },
  { prop: "codeFontSize", domProp: "codeFontSize", type: "special" },
  { prop: "preBgColor", domProp: "preBgColor", type: "special" },
  { prop: "preBorderRadius", domProp: "preBorderRadius", type: "special" },
  { prop: "blockquoteBorderColor", domProp: "blockquoteBorderColor", type: "special" },
  { prop: "headingColor", domProp: "headingColor", type: "special" },
  { prop: "allowDangerousHtml", domProp: "allowDangerousHtml", type: "special" },

  // ---- InstallButton ----
  { prop: "downloadable", domProp: "downloadable", type: "special" },
  { prop: "downloadFileName", domProp: "downloadFileName", type: "special" },
  { prop: "onInstalled", domProp: "onInstalled", type: "special" },

  // ---- MatrixRain ----
  { prop: "chars", domProp: "chars", type: "special" },
  { prop: "speed", domProp: "speed", type: "special" },
  { prop: "fadeAmount", domProp: "fadeAmount", type: "special" },
  { prop: "resetProbability", domProp: "resetProbability", type: "special" },
  { prop: "useDynamicColor", domProp: "useDynamicColor", type: "special" },

  // ---- QRCode ----
  { prop: "fgColor", domProp: "fgColor", type: "special" },
  { prop: "errorCorrection", domProp: "errorCorrection", type: "special" },

  // ---- Image fit ----
  { prop: "fit", domProp: "objectFit", type: "style", unit: "none", reactive: true },
  { prop: "objectFit", domProp: "objectFit", type: "style", unit: "none", reactive: true },
  // ---- Search ----
  { prop: "searchable", domProp: "searchable", type: "special" },
  { prop: "searchPlaceholder", domProp: "searchPlaceholder", type: "special" },

  // ============================================================
  // WIDGET-OWNED PROPS (audit pass)
  // ============================================================
  // Every prop below is read by the named widget's own code. They were missing
  // from the database, so any wrapper that forwards them through `...rest`
  // produced an "unknown prop" warning and an invalid inline style.

  // ---- AppBar ----
  { prop: "actionsGap", domProp: "actionsGap", type: "special" },

  // ---- Card ----
  { prop: "showBorder", domProp: "showBorder", type: "special" },

  // ---- Carousel ----
  { prop: "buttonTop", domProp: "buttonTop", type: "special" },

  // ---- CircularBar ----
  { prop: "customValueFormatter", domProp: "customValueFormatter", type: "special" },
  { prop: "gradientAngle", domProp: "gradientAngle", type: "special" },

  // ---- CircularChart ----
  { prop: "startAngle", domProp: "startAngle", type: "special" },
  { prop: "endAngle", domProp: "endAngle", type: "special" },
  { prop: "innerRadius", domProp: "innerRadius", type: "special" },
  { prop: "semiCircle", domProp: "semiCircle", type: "special" },
  { prop: "defaultColors", domProp: "defaultColors", type: "special" },
  { prop: "sliceBorderColor", domProp: "sliceBorderColor", type: "special" },
  { prop: "sliceBorderWidth", domProp: "sliceBorderWidth", type: "special" },

  // ---- Image ----
  // Rounds the element into a circle; it is not `borderRadius` because the
  // widget must keep any explicit radius the caller also passed.
  { prop: "circular", domProp: "circular", type: "special" },

  // ---- Input ----
  { prop: "onIconPress", domProp: "onIconPress", type: "special" },

  // ---- ListTile ----
  // Extra props forwarded to the `Text` widgets of each row slot.
  { prop: "titleProps", domProp: "titleProps", type: "special" },
  { prop: "subtitleProps", domProp: "subtitleProps", type: "special" },
  { prop: "descriptionProps", domProp: "descriptionProps", type: "special" },

  // ---- Scaffold / routing ----
  { prop: "basePath", domProp: "basePath", type: "special" },

  // ---- Slider ----
  // Legacy alias of `onPress`, still honoured by the widget.
  { prop: "onChanged", domProp: "onChanged", type: "special" },

  // ---- Markdown ----
  { prop: "source", domProp: "source", type: "special" },
  { prop: "headingMargin", domProp: "headingMargin", type: "special" },
  { prop: "codeFontFamily", domProp: "codeFontFamily", type: "special" },
  { prop: "codeBorderRadius", domProp: "codeBorderRadius", type: "special" },
  { prop: "codePadding", domProp: "codePadding", type: "special" },
  { prop: "prePadding", domProp: "prePadding", type: "special" },
  { prop: "preMargin", domProp: "preMargin", type: "special" },
  { prop: "blockquoteColor", domProp: "blockquoteColor", type: "special" },
  { prop: "blockquoteBorderWidth", domProp: "blockquoteBorderWidth", type: "special" },
  { prop: "blockquotePadding", domProp: "blockquotePadding", type: "special" },
  { prop: "blockquoteMargin", domProp: "blockquoteMargin", type: "special" },
  { prop: "tableBorderColor", domProp: "tableBorderColor", type: "special" },
  { prop: "tableCellPadding", domProp: "tableCellPadding", type: "special" },
  { prop: "tableHeaderBgColor", domProp: "tableHeaderBgColor", type: "special" },
  { prop: "listMargin", domProp: "listMargin", type: "special" },
  { prop: "listPadding", domProp: "listPadding", type: "special" },
  { prop: "listItemMargin", domProp: "listItemMargin", type: "special" },
  { prop: "imageMaxWidth", domProp: "imageMaxWidth", type: "special" },
  { prop: "imageBorderRadius", domProp: "imageBorderRadius", type: "special" },

  // ---- AdMob ----
  { prop: "adId", domProp: "adId", type: "special" },
  { prop: "interstitialId", domProp: "interstitialId", type: "special" },
  { prop: "rewardedId", domProp: "rewardedId", type: "special" },
  { prop: "isTesting", domProp: "isTesting", type: "special" },
  { prop: "autoShow", domProp: "autoShow", type: "special" },
  { prop: "autoInitialize", domProp: "autoInitialize", type: "special" },
  { prop: "plugin", domProp: "plugin", type: "special" },
  { prop: "onLoaded", domProp: "onLoaded", type: "special" },
  { prop: "onFailed", domProp: "onFailed", type: "special" },
  { prop: "onDismissed", domProp: "onDismissed", type: "special" },

  // ---- AdSense ----
  { prop: "client", domProp: "client", type: "special" },
  { prop: "slot", domProp: "slot", type: "special" },
  { prop: "format", domProp: "format", type: "special" },
  { prop: "responsive", domProp: "responsive", type: "special" },
  { prop: "test", domProp: "test", type: "special" },
];

// ============================================================
// DERIVED MAPS
// ============================================================
export const PROP_MAP = Object.fromEntries(ALL_PROPS.map((p) => [p.prop, p]));

export const DOM_PROP_MAP = Object.fromEntries(
  ALL_PROPS.map((p) => [p.domProp, p]),
);

export const STYLE_PROPS = ALL_PROPS.filter((p) => p.type === "style").map((p) => p.prop);
export const ATTRIBUTE_PROPS = ALL_PROPS.filter((p) => p.type === "attribute").map((p) => p.prop);
export const EVENT_PROPS = ALL_PROPS.filter((p) => p.type === "event").map((p) => p.prop);
export const TEXT_PROPS = ALL_PROPS.filter((p) => p.type === "text").map((p) => p.prop);
export const REACTIVE_PROPS = ALL_PROPS.filter((p) => p.reactive).map((p) => p.prop);

export const UNIT_MAP = Object.fromEntries(
  ALL_PROPS.filter((p) => p.type === "style" && p.unit).map((p) => [p.domProp, p.unit]),
);

export const ATTRIBUTE_DOM_SET = new Set(
  ALL_PROPS.filter((p) => p.type === "attribute").map((p) => p.domProp),
);

export const EVENT_DOM_SET = new Set(
  ALL_PROPS.filter((p) => p.type === "event").map((p) => p.domProp),
);

export const TEXT_PROP_SET = new Set(TEXT_PROPS);

// ============================================================
// LOOKUP FUNCTION WITH WARNING
// ============================================================
setPropNames(Object.keys(PROP_MAP));

/**
 * Prop-name prefixes the engine applies as HTML attributes without a database
 * entry, because the set of valid names is defined by HTML, not by FletBox.
 *
 * @type {string[]}
 */
export const PASSTHROUGH_PREFIXES = ["data-", "aria-"];

/**
 * Looks up a prop definition by its custom name.
 * Returns `null` and emits `warnUnknownProp` when unregistered.
 *
 * `data-*` and `aria-*` are a documented passthrough convention, not database
 * entries: `processProps()` routes them straight onto HTML attributes because
 * their names are open-ended and cannot be enumerated. Asking for a warning
 * here would flag correct code, so these names resolve to `null` silently.
 */
export function getPropDefinition(propName, context = {}) {
  const def = PROP_MAP[propName];
  if (!def) {
    if (!PASSTHROUGH_PREFIXES.some((prefix) => propName.startsWith(prefix))) {
      warnUnknownProp(propName, context);
    }
    return null;
  }
  return def;
}

export default {
  ALL_PROPS,
  PROP_MAP,
  DOM_PROP_MAP,
  STYLE_PROPS,
  ATTRIBUTE_PROPS,
  EVENT_PROPS,
  TEXT_PROPS,
  REACTIVE_PROPS,
  UNIT_MAP,
  ATTRIBUTE_DOM_SET,
  EVENT_DOM_SET,
  TEXT_PROP_SET,
  getPropDefinition,
};