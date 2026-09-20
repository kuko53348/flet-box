// core/translateProps.js
import { warnUnknownProp, setPropNames } from "./warnings.js";
/**
 * CENTRAL PROP DATABASE
 *
 * This file defines every prop that the system understands.
 * It is a pure data file – no processing logic here.
 *
 * Each entry:
 *   prop      : custom name used in widgets (e.g., 'w', 'p', 'onClick')
 *   domProp   : corresponding DOM property or CSS property
 *   type      : 'style' | 'attribute' | 'event' | 'text' | 'special'
 *   unit      : (optional) 'rem' | 'px' | 'none' – only for style props
 *   reactive  : (optional) true/false – whether the prop is reactive
 *   expand    : (optional) 'horizontal' | 'vertical' – for shorthands
 */

export const ALL_PROPS = [
  // ==================== DIMENSIONS ====================
  { prop: "w", domProp: "width", type: "style", unit: "rem", reactive: true },
  {
    prop: "width",
    domProp: "width",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  { prop: "h", domProp: "height", type: "style", unit: "rem", reactive: true },
  {
    prop: "height",
    domProp: "height",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "minW",
    domProp: "minWidth",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "minWidth",
    domProp: "minWidth",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "maxW",
    domProp: "maxWidth",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "maxWidth",
    domProp: "maxWidth",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "minH",
    domProp: "minHeight",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "minHeight",
    domProp: "minHeight",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "maxH",
    domProp: "maxHeight",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "maxHeight",
    domProp: "maxHeight",
    type: "style",
    unit: "rem",
    reactive: true,
  },

  // ==================== SPACING ====================
  { prop: "p", domProp: "padding", type: "style", unit: "rem", reactive: true },
  {
    prop: "padding",
    domProp: "padding",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  { prop: "m", domProp: "margin", type: "style", unit: "rem", reactive: true },
  {
    prop: "margin",
    domProp: "margin",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "pt",
    domProp: "paddingTop",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "paddingTop",
    domProp: "paddingTop",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "pr",
    domProp: "paddingRight",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "paddingRight",
    domProp: "paddingRight",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "pb",
    domProp: "paddingBottom",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "paddingBottom",
    domProp: "paddingBottom",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "pl",
    domProp: "paddingLeft",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "paddingLeft",
    domProp: "paddingLeft",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "mt",
    domProp: "marginTop",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "marginTop",
    domProp: "marginTop",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "mr",
    domProp: "marginRight",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "marginRight",
    domProp: "marginRight",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "mb",
    domProp: "marginBottom",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "marginBottom",
    domProp: "marginBottom",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "ml",
    domProp: "marginLeft",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "marginLeft",
    domProp: "marginLeft",
    type: "style",
    unit: "rem",
    reactive: true,
  },

  // Shorthands (expand)
  {
    prop: "px",
    domProp: "paddingLeft",
    type: "style",
    unit: "rem",
    reactive: true,
    expand: "horizontal",
  },
  {
    prop: "py",
    domProp: "paddingTop",
    type: "style",
    unit: "rem",
    reactive: true,
    expand: "vertical",
  },
  {
    prop: "mx",
    domProp: "marginLeft",
    type: "style",
    unit: "rem",
    reactive: true,
    expand: "horizontal",
  },
  {
    prop: "my",
    domProp: "marginTop",
    type: "style",
    unit: "rem",
    reactive: true,
    expand: "vertical",
  },
  { prop: "gap", domProp: "gap", type: "style", unit: "rem", reactive: true },

  // ==================== POSITION ====================
  {
    prop: "pos",
    domProp: "position",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "position",
    domProp: "position",
    type: "style",
    unit: "none",
    reactive: true,
  },
  { prop: "z", domProp: "zIndex", type: "style", unit: "none", reactive: true },
  {
    prop: "zIndex",
    domProp: "zIndex",
    type: "style",
    unit: "none",
    reactive: true,
  },
  { prop: "top", domProp: "top", type: "style", unit: "rem", reactive: true },
  {
    prop: "right",
    domProp: "right",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "bottom",
    domProp: "bottom",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  { prop: "left", domProp: "left", type: "style", unit: "rem", reactive: true },
  {
    prop: "inset",
    domProp: "inset",
    type: "style",
    unit: "rem",
    reactive: true,
  },

  // ==================== COLORS ====================
  {
    prop: "bg",
    domProp: "backgroundColor",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "bgColor",
    domProp: "backgroundColor",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "backgroundColor",
    domProp: "backgroundColor",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "textColor",
    domProp: "color",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "color",
    domProp: "color",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "opacity",
    domProp: "opacity",
    type: "style",
    unit: "none",
    reactive: true,
  },

  // ==================== TEXT & TYPOGRAPHY ====================
  { prop: "text", domProp: "textContent", type: "text", reactive: true },
  { prop: "label", domProp: "textContent", type: "text", reactive: true },
  { prop: "title", domProp: "textContent", type: "text", reactive: true },
  { prop: "caption", domProp: "textContent", type: "text", reactive: true },
  { prop: "description", domProp: "textContent", type: "text", reactive: true },
  {
    prop: "textContent",
    domProp: "textContent",
    type: "text",
    // Not reactive on purpose: a reactive accessor would shadow the native
    // DOM .textContent property (see reactivity.js NEVER_SHADOW).
    reactive: false,
  },
  { prop: "message", domProp: "textContent", type: "text", reactive: true },
  { prop: "buttonText", domProp: "textContent", type: "text", reactive: true },

  {
    prop: "size",
    domProp: "fontSize",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "fontSize",
    domProp: "fontSize",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "weight",
    domProp: "fontWeight",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "fontWeight",
    domProp: "fontWeight",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "textAlign",
    domProp: "textAlign",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "lineH",
    domProp: "lineHeight",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "lineHeight",
    domProp: "lineHeight",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "letterSpace",
    domProp: "letterSpacing",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "letterSpacing",
    domProp: "letterSpacing",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "textDecoration",
    domProp: "textDecoration",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "textTransform",
    domProp: "textTransform",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "whiteSpace",
    domProp: "whiteSpace",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "wordBreak",
    domProp: "wordBreak",
    type: "style",
    unit: "none",
    reactive: true,
  },

  // ==================== FLEXBOX ====================
  {
    prop: "direction",
    domProp: "flexDirection",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "flexDirection",
    domProp: "flexDirection",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "justify",
    domProp: "justifyContent",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "justifyContent",
    domProp: "justifyContent",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "align",
    domProp: "alignItems",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "alignItems",
    domProp: "alignItems",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "wrap",
    domProp: "flexWrap",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "flexWrap",
    domProp: "flexWrap",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "flex",
    domProp: "flex",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "flexGrow",
    domProp: "flexGrow",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "flexShrink",
    domProp: "flexShrink",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "flexBasis",
    domProp: "flexBasis",
    type: "style",
    unit: "rem",
    reactive: true,
  },

  // ==================== BORDERS & RADIUS ====================
  {
    prop: "rounded",
    domProp: "borderRadius",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "borderRadius",
    domProp: "borderRadius",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "border",
    domProp: "border",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "borderColor",
    domProp: "borderColor",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "borderWidth",
    domProp: "borderWidth",
    type: "style",
    unit: "px",
    reactive: true,
  },
  {
    prop: "borderStyle",
    domProp: "borderStyle",
    type: "style",
    unit: "none",
    reactive: true,
  },

  // Individual corners
  {
    prop: "roundedTop",
    domProp: "borderTopLeftRadius",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "roundedBottom",
    domProp: "borderBottomLeftRadius",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "roundedLeft",
    domProp: "borderTopLeftRadius",
    type: "style",
    unit: "rem",
    reactive: true,
  },
  {
    prop: "roundedRight",
    domProp: "borderTopRightRadius",
    type: "style",
    unit: "rem",
    reactive: true,
  },

  // ==================== SHADOWS ====================
  {
    prop: "shadow",
    domProp: "boxShadow",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "boxShadow",
    domProp: "boxShadow",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "elevation",
    domProp: "boxShadow",
    type: "style",
    unit: "none",
    reactive: true,
  }, // handled separately

  // ==================== DISPLAY & LAYOUT ====================
  {
    prop: "display",
    domProp: "display",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "overflow",
    domProp: "overflow",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "overflowX",
    domProp: "overflowX",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "overflowY",
    domProp: "overflowY",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "boxSizing",
    domProp: "boxSizing",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "cursor",
    domProp: "cursor",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "visibility",
    domProp: "visibility",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "pointerEvents",
    domProp: "pointerEvents",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "userSelect",
    domProp: "userSelect",
    type: "style",
    unit: "none",
    reactive: true,
  },

  // ==================== BACKGROUND ====================
  {
    prop: "gradient",
    domProp: "background",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "bgImage",
    domProp: "backgroundImage",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "bgSize",
    domProp: "backgroundSize",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "bgPosition",
    domProp: "backgroundPosition",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "bgRepeat",
    domProp: "backgroundRepeat",
    type: "style",
    unit: "none",
    reactive: true,
  },

  // ==================== ANIMATIONS & TRANSITIONS ====================
  {
    prop: "transition",
    domProp: "transition",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "animation",
    domProp: "animation",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "transform",
    domProp: "transform",
    type: "style",
    unit: "none",
    reactive: true,
  },

  // ==================== HTML ATTRIBUTES ====================
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

  // ==================== EVENTS ====================
  { prop: "onPress", domProp: "click", type: "event" },
  { prop: "onClick", domProp: "click", type: "event" },
  { prop: "onclick", domProp: "click", type: "event" }, // Lowercase alias
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

  // ==================== SPECIAL (handled elsewhere) ====================
  { prop: "ref", domProp: "ref", type: "special" },
  { prop: "child", domProp: "child", type: "special" },
  { prop: "children", domProp: "children", type: "special" },
  { prop: "style", domProp: "style", type: "special" },

  // ==================== ADDITIONAL SPECIALS (shorthands) ====================
  {
    prop: "value",
    domProp: "value",
    type: "special",
    reactive: true,
  },
  {
    prop: "variant",
    domProp: "variant",
    type: "special",
    reactive: true,
  },
  {
    prop: "marginVertical",
    domProp: "marginVertical",
    type: "special",
    reactive: true,
  },
  {
    prop: "marginHorizontal",
    domProp: "marginHorizontal",
    type: "special",
    reactive: true,
  },
  {
    prop: "paddingVertical",
    domProp: "paddingVertical",
    type: "special",
    reactive: true,
  },
  {
    prop: "paddingHorizontal",
    domProp: "paddingHorizontal",
    type: "special",
    reactive: true,
  },

  // ==================== EXTRA CSS (used by built-in widgets) ====================
  {
    prop: "fontFamily",
    domProp: "fontFamily",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "touchAction",
    domProp: "touchAction",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "textOverflow",
    domProp: "textOverflow",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "borderTop",
    domProp: "borderTop",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "borderBottom",
    domProp: "borderBottom",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "borderLeft",
    domProp: "borderLeft",
    type: "style",
    unit: "none",
    reactive: true,
  },
  {
    prop: "borderRight",
    domProp: "borderRight",
    type: "style",
    unit: "none",
    reactive: true,
  },

  // ==================== INTERNAL CONTROL FLAGS (no DOM output) ====================
  // Consumed by effects.js / widgets via _originalProps; never written to the DOM.
  { prop: "disableTransform", domProp: "disableTransform", type: "special" },
  { prop: "data", domProp: "data", type: "special" },
];

// ============================================================
// DERIVED MAPS
// ============================================================
/** Map: custom prop name → definition */
export const PROP_MAP = Object.fromEntries(ALL_PROPS.map((p) => [p.prop, p]));

/** Map: DOM property name → definition (useful for reverse lookups) */
export const DOM_PROP_MAP = Object.fromEntries(
  ALL_PROPS.map((p) => [p.domProp, p]),
);

/** List of all style props (custom names) */
export const STYLE_PROPS = ALL_PROPS.filter((p) => p.type === "style").map(
  (p) => p.prop,
);

/** List of all attribute props (custom names) */
export const ATTRIBUTE_PROPS = ALL_PROPS.filter(
  (p) => p.type === "attribute",
).map((p) => p.prop);

/** List of all event props (custom names) */
export const EVENT_PROPS = ALL_PROPS.filter((p) => p.type === "event").map(
  (p) => p.prop,
);

/** List of all text props (custom names) */
export const TEXT_PROPS = ALL_PROPS.filter((p) => p.type === "text").map(
  (p) => p.prop,
);

/** List of all reactive props (custom names) */
export const REACTIVE_PROPS = ALL_PROPS.filter((p) => p.reactive).map(
  (p) => p.prop,
);

/** Map: DOM prop → unit for style props */
export const UNIT_MAP = Object.fromEntries(
  ALL_PROPS.filter((p) => p.type === "style" && p.unit).map((p) => [
    p.domProp,
    p.unit,
  ]),
);

/** Set of attribute DOM names (for quick membership checks) */
export const ATTRIBUTE_DOM_SET = new Set(
  ALL_PROPS.filter((p) => p.type === "attribute").map((p) => p.domProp),
);

/** Set of event DOM names */
export const EVENT_DOM_SET = new Set(
  ALL_PROPS.filter((p) => p.type === "event").map((p) => p.domProp),
);

/** Set of text custom names */
export const TEXT_PROP_SET = new Set(TEXT_PROPS);

// ============================================================
// LOOKUP FUNCTION WITH WARNING
// ============================================================
setPropNames(Object.keys(PROP_MAP));

/**
 * Looks up a prop definition by its custom name.
 *
 * Returns `null` and emits a warning (via `warnUnknownProp`) when the prop is
 * not registered. The `context` object is forwarded to the warning function to
 * allow widget-name–aware messages.
 *
 * @param {string} propName - The custom prop name to look up (e.g. `'w'`, `'onClick'`).
 * @param {Object} [context={}] - Optional context for warning messages
 *   (e.g. `{ widgetName: 'Button' }`).
 * @returns {Object|null} The prop definition object from `ALL_PROPS`, or `null`
 *   when the prop is unknown.
 */
export function getPropDefinition(propName, context = {}) {
  const def = PROP_MAP[propName];
  if (!def) {
    warnUnknownProp(propName, context);
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
