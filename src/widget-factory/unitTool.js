/**
 * UNIT TOOL - Classifies all DOM numeric props
 */
// unitTool.js

export const SPECIAL_ATTRIBUTES = new Set([
  // Atributos HTML estándar (sin propiedades CSS)
  "id",
  "className",
  "class",
  "name",
  "type",
  "href",
  "src",
  "alt",
  "disabled",
  "readOnly",
  "required",
  "checked",
  "selected",
  "placeholder",
  "value",
  "min",
  "max",
  "step",
  "pattern",
  "autocomplete",
  "inputmode",
  "role",
  "title",
  "lang",
  "dir",
  "tabIndex",
  "draggable",
  "hidden",
  "for",
  "htmlFor",
  "accept",
  "acceptCharset",
  "accessKey",
  "action",
  "allow",
  "allowFullScreen",
  "allowPaymentRequest",
  "allowTransparency",
  "as",
  "async",
  "autoCapitalize",
  "autoComplete",
  "autoFocus",
  "autoPlay",
  "capture",
  "challenge",
  "charSet",
  "cite",
  "classID",
  "colSpan",
  "cols",
  "content",
  "contentEditable",
  "contextMenu",
  "controls",
  "coords",
  "crossOrigin",
  "dateTime",
  "default",
  "defer",
  "download",
  "encType",
  "form",
  "formAction",
  "formEncType",
  "formMethod",
  "formNoValidate",
  "formTarget",
  "headers",
  "high",
  "hrefLang",
  "httpEquiv",
  "integrity",
  "is",
  "itemID",
  "itemProp",
  "itemRef",
  "itemScope",
  "itemType",
  "keyParams",
  "keyType",
  "kind",
  "label",
  "list",
  "loop",
  "low",
  "manifest",
  "maxLength",
  "media",
  "mediaGroup",
  "method",
  "minLength",
  "multiple",
  "muted",
  "noValidate",
  "open",
  "optimum",
  "playsInline",
  "poster",
  "preload",
  "radioGroup",
  "rel",
  "reversed",
  "rowSpan",
  "rows",
  "sandbox",
  "scope",
  "scoped",
  "seamless",
  "shape",
  "sizes", // ✅ atributo para <link> y <img srcset>
  "slot",
  "span", // ✅ atributo para <col> y <colgroup>
  "spellCheck",
  "srcDoc",
  "srcLang",
  "srcSet",
  "start",
  "summary",
  "target",
  "useMap",
  "wmode",
  "wrap",
]);

// ============================================================
// ✅ REM PROPS (measurements, responsive)
// ============================================================
export const REM_PROPS = new Set([
  // Dimensions
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",

  // Padding
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",

  // Margin
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",

  // Position
  "top",
  "right",
  "bottom",
  "left",
  "inset",

  // Text
  "fontSize",
  "letterSpacing",
  "wordSpacing",
  "textIndent",

  // Layout
  "gap",
  "rowGap",
  "columnGap",

  // Scroll
  "scrollMargin",
  "scrollPadding",
  "scrollMarginTop",
  "scrollMarginRight",
  "scrollMarginBottom",
  "scrollMarginLeft",
  "scrollPaddingTop",
  "scrollPaddingRight",
  "scrollPaddingBottom",
  "scrollPaddingLeft",

  // Border Radius (go to REM)
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",

  // Grid
  "gridGap",
  "gridRowGap",
  "gridColumnGap",

  // Flex
  "flexBasis",

  // Transform (measurements)
  "translateX",
  "translateY",
  "translateZ",

  // Other measurements
  "backgroundSize",
  "backgroundPositionX",
  "backgroundPositionY",
  "perspective",
  "perspectiveOrigin",
  "columnGap",
  "columnWidth",
  "outlineOffset",
]);

// ============================================================
// ❌ PX PROPS (borders, fine details, fixed values)
// ============================================================
export const PX_PROPS = new Set([
  // Border widths (fine details)
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "outlineWidth",

  // Border image
  "borderImageWidth",
  "borderImageOutset",

  // Border spacing (table)
  "borderSpacing",
]);

// ============================================================
// 🔢 NO UNIT PROPS (pure numbers, not measurements)
// ============================================================
export const NO_UNIT_PROPS = new Set([
  // Z-index
  "zIndex",

  // Opacity
  "opacity",

  // Flexbox
  "flex", // ← AGREGADO
  "flexGrow",
  "flexShrink",
  "order",

  // Grid
  "gridRow",
  "gridColumn",
  "gridRowStart",
  "gridRowEnd",
  "gridColumnStart",
  "gridColumnEnd",

  // Text
  "fontWeight",
  "lineHeight",

  // Transform (rotations, scales)
  "scale",
  "scaleX",
  "scaleY",
  "scaleZ",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",

  // Animation
  "animationIterationCount",

  // Columns
  "columnCount",

  // Print
  "orphans",
  "widows",

  // Counters
  "counterIncrement",
  "counterReset",

  // Other
  "tabSize",
]);

// ============================================================
// 📝 STRING PROPS (not numeric, kept as is)
// ============================================================
export const STRING_PROPS = new Set([
  // Colors
  "color",
  "backgroundColor",
  "borderColor",
  "outlineColor",
  "textDecorationColor",
  "caretColor",
  "accentColor",

  // Background
  "background",
  "backgroundImage",
  "backgroundRepeat",
  "backgroundAttachment",
  "backgroundOrigin",
  "backgroundClip",
  "backgroundBlendMode",

  // Display & Position
  "display",
  "position",
  "float",
  "clear",

  // Flexbox
  "flexDirection",
  "flexWrap",
  "alignContent",
  "alignItems",
  "alignSelf",
  "justifyContent",
  "justifyItems",
  "justifySelf",
  "placeContent",
  "placeItems",
  "placeSelf",

  // Grid
  "gridTemplateColumns",
  "gridTemplateRows",
  "gridTemplateAreas",
  "gridAutoColumns",
  "gridAutoRows",
  "gridAutoFlow",

  // Text
  "fontFamily",
  "fontStyle",
  "fontVariant",
  "fontStretch",
  "textAlign",
  "textTransform",
  "textDecoration",
  "textDecorationLine",
  "textDecorationStyle",
  "textOverflow",
  "textShadow",

  // Border
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderStyle",
  "borderTopStyle",
  "borderRightStyle",
  "borderBottomStyle",
  "borderLeftStyle",
  "borderImage",
  "borderImageSource",
  "borderImageSlice",
  "borderImageRepeat",

  // Outline
  "outline",
  "outlineStyle",
  "outlineColor",

  // Shadows
  "boxShadow",
  "textShadow",

  // Transform
  "transform",
  "transformStyle",
  "transformBox",

  // Transition
  "transition",
  "transitionProperty",
  "transitionTimingFunction",
  "transitionDelay",
  "transitionDuration",

  // Animation
  "animation",
  "animationName",
  "animationTimingFunction",
  "animationDelay",
  "animationDuration",
  "animationDirection",
  "animationFillMode",
  "animationPlayState",

  // Overflow
  "overflow",
  "overflowX",
  "overflowY",

  // Visibility
  "visibility",
  "cursor",
  "pointerEvents",
  "userSelect",

  // List
  "listStyle",
  "listStyleType",
  "listStylePosition",
  "listStyleImage",

  // Table
  "tableLayout",
  "borderCollapse",
  "captionSide",
  "emptyCells",

  // Content
  "content",
  "quotes",

  // Other
  "appearance",
  "boxSizing",
  "resize",
  "verticalAlign",
  "whiteSpace",
  "wordBreak",
  "wordWrap",
  "hyphens",
  "textRendering",
  "fontSmoothing",
  "backfaceVisibility",
  "perspective",
  "isolation",
  "mixBlendMode",
  "willChange",
  "touchAction",
  "scrollBehavior",
]);
//
// // ============================================================
// // 🔥 CLEAN STYLES - Applies correct units to numeric props
// // ============================================================
// export const cleanStyles = (styles) => {
//   const result = {};
//
//   for (const [key, value] of Object.entries(styles)) {
//     // ✅ If array, convert to string with px
//     if (Array.isArray(value)) {
//       result[key] = value
//         .map((v) => (typeof v === "number" ? `${v}px` : v))
//         .join(" ");
//       continue;
//     }
//
//     // 🔢 If number, apply correct unit
//     if (typeof value === "number") {
//       // ✅ REM (responsive measurements)
//       if (REM_PROPS.has(key)) {
//         result[key] = `${value / 16}rem`;
//       }
//       // ❌ PX (borders, fine details)
//       else if (PX_PROPS.has(key)) {
//         result[key] = `${value}px`;
//       }
//       // 🔢 NO UNIT (pure numbers)
//       else if (NO_UNIT_PROPS.has(key)) {
//         result[key] = value;
//       }
//       // ⚠️ Default → PX
//       else {
//         result[key] = `${value}px`;
//       }
//     }
//     // 📝 Strings → keep as is
//     else {
//       result[key] = value;
//     }
//   }
//
//   return result;
// };
//
// // ============================================================
// // 🧹 CLEAN PROPS - Separates props by type
// // ============================================================
// export function cleanProps(domProps) {
//   const style = {};
//   let textContent = null;
//   const events = {};
//   const attributes = {};
//
//   for (const [key, value] of Object.entries(domProps)) {
//     // 📝 Text content
//     if (key === "style") continue;
//     if (key === "textContent" || key === "text" || key === "label") {
//       textContent = value;
//       continue;
//     }
//
//     // 🎯 Events (start with "on")
//     if (key.startsWith("on") && typeof value === "function") {
//       const eventName = key.slice(2).toLowerCase();
//       events[eventName] = value;
//       continue;
//     }
//
//     // 🏷️ Special attributes
//     if (
//       [
//         "className",
//         "id",
//         "class",
//         "name",
//         "type",
//         "href",
//         "src",
//         "alt",
//       ].includes(key)
//     ) {
//       attributes[key] = value;
//       continue;
//     }
//
//     // 🎨 Everything else is styles
//     style[key] = value;
//   }
//
//   return { style, textContent, events, attributes };
// }
