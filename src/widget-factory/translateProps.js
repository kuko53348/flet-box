/**
 * TRANSLATE PROPS - Traduce props custom a props DOM
 */

// Map: custom → DOM
export const propMap = {
  // Dimensions
  w: "width",
  h: "height",
  minW: "minWidth",
  maxW: "maxWidth",
  minH: "minHeight",
  maxH: "maxHeight",
  size: "fontSize",

  // Spacing
  p: "padding",
  m: "margin",
  pt: "paddingTop",
  pr: "paddingRight",
  pb: "paddingBottom",
  pl: "paddingLeft",
  mt: "marginTop",
  mr: "marginRight",
  mb: "marginBottom",
  ml: "marginLeft",
  px: "paddingHorizontal", // handled separately
  py: "paddingVertical", // handled separately
  mx: "marginHorizontal", // handled separately
  my: "marginVertical", // handled separately

  // Position
  pos: "position",
  z: "zIndex",

  // Borders
  gradient: "background",
  rounded: "borderRadius",
  borderW: "borderWidth",
  borderC: "borderColor",
  borderS: "borderStyle",

  // Colors
  bgColor: "backgroundColor",
  textColor: "color",
  bg: "background",

  // ========== CONTENT (text content) ==========
  text: "textContent",
  label: "textContent",
  buttonText: "textContent",
  title: "textContent",
  caption: "textContent",
  description: "textContent",
  message: "textContent",

  // Text styles
  weight: "fontWeight",
  lineH: "lineHeight",
  letterSpace: "letterSpacing",
  textAlign: "textAlign",

  // Flexbox
  direction: "flexDirection",
  justify: "justifyContent",
  align: "alignItems",
  wrap: "flexWrap",

  // Effects
  shadow: "boxShadow",

  // Events
  onPress: "onclick",
  onClick: "onclick",
  onDoublePress: "ondblclick",
  onHover: "onmouseenter",
  onHoverEnd: "onmouseleave",
  onFocus: "onfocus",
  onBlur: "onblur",
  onChange: "onchange",
  onInput: "oninput",
};

// export function translateProps(props) {
//   const result = {};
//
//   for (const [key, value] of Object.entries(props)) {
//     // Si existe en el mapa, usa el nombre DOM, sino mantiene el original
//     const domKey = propMap[key] || key;
//     result[domKey] = value;
//   }
//
//   return result;
// }
