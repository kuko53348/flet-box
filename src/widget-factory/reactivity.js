// core/reactivity.js

// ============================================================
// 📋 LIST OF REACTIVE PROPS
// ============================================================

export const REACTIVE_PROPS = [
  // Content
  "text",
  "label",
  "buttonText",
  "title",
  "value",
  "placeholder",
  "expand",

  // Colors & Backgrounds
  "color",
  "bg",
  "bgColor",
  "backgroundColor",
  "opacity",
  "gradient",
  "bgImage",
  "backgroundImage",
  "bgSize",
  "backgroundSize",
  "bgPosition",
  "backgroundPosition",
  "bgRepeat",
  "backgroundRepeat",

  // Fonts & Text
  "size",
  "fontSize",
  "weight",
  "fontWeight",
  "lineH",
  "lineHeight",
  "letterSpace",
  "letterSpacing",
  "textAlign",
  "textDecoration",
  "textColor",

  // Dimensions
  "width",
  "height",
  "minW",
  "minWidth",
  "maxW",
  "maxWidth",
  "minH",
  "minHeight",
  "maxH",
  "maxHeight",

  // Spacing
  "padding",
  "margin",
  "gap",
  "p",
  "m",
  "paddingHorizontal",
  "paddingVertical",
  "marginHorizontal",
  "marginVertical",

  // Borders & Shadows
  "rounded",
  "borderRadius",
  "roundedTop",
  "roundedBottom",
  "roundedLeft",
  "roundedRight",
  "roundedTopLeft",
  "roundedTopRight",
  "roundedBottomLeft",
  "roundedBottomRight",
  "border",
  "borderColor",
  "borderWidth",
  "borderStyle",
  "shadow",
  "boxShadow",

  // Position
  "top",
  "right",
  "bottom",
  "left",
  "z",
  "zIndex",
  "pos",
  "position",

  // Flexbox
  "align",
  "alignItems",
  "justify",
  "justifyContent",
  "direction",
  "flexDirection",
  "wrap",
  "flexWrap",
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",

  // Grid
  "gridCols",
  "gridTemplateColumns",
  "gridRows",
  "gridTemplateRows",
  "colSpan",
  "gridColumn",
  "rowSpan",
  "gridRow",

  // States
  "disabled",
  "checked",
  "selected",
  "expanded",
  "readOnly",
  "required",

  // Events
  "onPress",
  "onClick",
  "onDoublePress",
  "onRightClick",
  "onHover",
  "onHoverEnd",
  "onFocus",
  "onBlur",
  "onChange",
  "onInput",
  "onScroll",

  // Animations
  "animate",
  "animation",
  "transition",
  "duration",
  "timing",
  "delay",

  // Image & Icon
  "src",
  "alt",
  "icon",
  "name",

  // DOM Attributes
  "id",
  "className",
  "class",
  "name",
  "href",
  "target",
  "type",
  "disabled",
  "readOnly",
  "required",
  "checked",
  "selected",
  "role",
  "title",
  "lang",
  "dir",
  "tabIndex",
  "draggable",
  "hidden",

  // Data attributes
  "data",
];

// ============================================================
// 🔥 MAIN FUNCTION: makeReactive
// ============================================================

/**
 * Makes a widget reactive: allows assigning properties directly
 * (e.g., widget.text = 'new') and automatically translates and updates the DOM.
 * @param {HTMLElement} widget - The widget to make reactive.
 * @param {Function} updateFn - Function that receives an object with changed properties.
 */
export const makeReactive = (widget, updateFn) => {
  REACTIVE_PROPS.forEach((prop) => {
    Object.defineProperty(widget, prop, {
      get() {
        return widget._originalProps ? widget._originalProps[prop] : undefined;
      },
      set(newValue) {
        const current = widget._originalProps
          ? widget._originalProps[prop]
          : undefined;
        if (current !== newValue) {
          updateFn({ [prop]: newValue });
        }
      },
      enumerable: true,
      configurable: true,
    });
  });
  return widget;
};

export default { makeReactive, REACTIVE_PROPS };
