// // core/assignProps.js
// import { setStyles } from "./tools.js";
//
// export const assignProps = (widget, props) => {
//   if (!props) return widget;
//
//   // 1. Styles
//   if (props.style) {
//     setStyles(widget, props.style);
//   }
//
//   // 2. Text
//   if (props.textContent !== undefined) {
//     if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
//       widget.value = props.textContent;
//     } else {
//       widget.textContent = props.textContent;
//     }
//   }
//
//   // 3. Events (clean old listeners)
//   if (widget._events) {
//     widget._events.forEach(({ event, handler }) => {
//       widget.removeEventListener(event, handler);
//     });
//   }
//   widget._events = [];
//
//   if (props.events) {
//     Object.entries(props.events).forEach(([event, handler]) => {
//       if (event === "click") {
//         widget.onclick = handler;
//       } else {
//         widget.addEventListener(event, handler);
//         widget._events.push({ event, handler });
//       }
//     });
//   }
//
//   // 4. Attributes
//   if (props.attributes) {
//     Object.entries(props.attributes).forEach(([key, value]) => {
//       if (key === "className" || key === "class") {
//         widget.className = value;
//       } else {
//         widget.setAttribute(key, value);
//       }
//     });
//   }
//
//   return widget;
// };
// core/assignProps.js
// core/assignProps.js - VERSIÓN COMPLETA CON TODAS LAS SPECIALS

// import { setStyles } from "./tools.js";
//
// export const assignProps = (widget, props) => {
//   if (!props) return widget;
//
//   if (widget._updating) return widget;
//   widget._updating = true;
//
//   try {
//     // 1. Styles
//     if (props.style) {
//       setStyles(widget, props.style);
//     }
//
//     // 2. Text
//     if (props.textContent !== undefined) {
//       if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
//         if (widget.value !== props.textContent) {
//           widget.value = props.textContent;
//         }
//       } else {
//         if (widget.textContent !== props.textContent) {
//           widget.textContent = props.textContent;
//         }
//       }
//     }
//
//     // 3. Events
//     if (widget._events) {
//       widget._events.forEach(({ event, handler }) => {
//         widget.removeEventListener(event, handler);
//       });
//     }
//     widget._events = [];
//
//     if (props.events) {
//       Object.entries(props.events).forEach(([event, handler]) => {
//         if (event === "click") {
//           widget.onclick = handler;
//         } else {
//           widget.addEventListener(event, handler);
//           widget._events.push({ event, handler });
//         }
//       });
//     }
//
//     // 4. Attributes
//     if (props.attributes) {
//       Object.entries(props.attributes).forEach(([key, value]) => {
//         if (key === "className" || key === "class") {
//           widget.className = value;
//         } else {
//           widget.setAttribute(key, value);
//         }
//       });
//     }
//
//     // ============================================================
//     // ✅ 5. MANEJAR PROPS ESPECIALES (special)
//     // ============================================================
//     if (props.special) {
//       // --- Value (para inputs) ---
//       if (props.special.value !== undefined) {
//         if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
//           if (widget.value !== props.special.value) {
//             widget.value = props.special.value;
//           }
//         }
//       }
//
//       // --- Variant ---
//       if (props.special.variant !== undefined) {
//         widget.dataset.variant = props.special.variant;
//       }
//
//       // --- Margin Vertical ---
//       if (props.special.marginVertical !== undefined) {
//         const value = props.special.marginVertical;
//         if (typeof value === "number") {
//           widget.style.marginTop = value + "px";
//           widget.style.marginBottom = value + "px";
//         } else {
//           widget.style.marginTop = value;
//           widget.style.marginBottom = value;
//         }
//       }
//
//       // --- Margin Horizontal ---
//       if (props.special.marginHorizontal !== undefined) {
//         const value = props.special.marginHorizontal;
//         if (typeof value === "number") {
//           widget.style.marginLeft = value + "px";
//           widget.style.marginRight = value + "px";
//         } else {
//           widget.style.marginLeft = value;
//           widget.style.marginRight = value;
//         }
//       }
//
//       // --- Padding Vertical ---
//       if (props.special.paddingVertical !== undefined) {
//         const value = props.special.paddingVertical;
//         if (typeof value === "number") {
//           widget.style.paddingTop = value + "px";
//           widget.style.paddingBottom = value + "px";
//         } else {
//           widget.style.paddingTop = value;
//           widget.style.paddingBottom = value;
//         }
//       }
//
//       // --- Padding Horizontal ---
//       if (props.special.paddingHorizontal !== undefined) {
//         const value = props.special.paddingHorizontal;
//         if (typeof value === "number") {
//           widget.style.paddingLeft = value + "px";
//           widget.style.paddingRight = value + "px";
//         } else {
//           widget.style.paddingLeft = value;
//           widget.style.paddingRight = value;
//         }
//       }
//     }
//   } finally {
//     widget._updating = false;
//   }
//
//   return widget;
// };
// core/assignProps.js
import { setStyles } from "./tools.js";

// ✅ Función para extraer el valor real de una prop reactiva
const getValue = (val) => {
  if (val && typeof val === "object" && val._isReactive === true) {
    return val._value !== undefined ? val._value : val.valueOf();
  }
  return val;
};

export const assignProps = (widget, props) => {
  if (!props) return widget;

  if (widget._updating) return widget;
  widget._updating = true;

  try {
    // 1. Styles
    if (props.style) {
      setStyles(widget, props.style);
    }

    // 2. Text (con extracción de valor reactivo)
    if (props.textContent !== undefined) {
      const textValue = getValue(props.textContent);
      if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
        if (widget.value !== textValue) {
          widget.value = textValue;
        }
      } else {
        if (widget.textContent !== textValue) {
          widget.textContent = textValue;
        }
      }
    }

    // 3. Events
    if (widget._events) {
      widget._events.forEach(({ event, handler }) => {
        widget.removeEventListener(event, handler);
      });
    }
    widget._events = [];

    if (props.events) {
      Object.entries(props.events).forEach(([event, handler]) => {
        if (event === "click") {
          widget.onclick = handler;
        } else {
          widget.addEventListener(event, handler);
          widget._events.push({ event, handler });
        }
      });
    }

    // 4. Attributes (con extracción de valor reactivo)
    if (props.attributes) {
      Object.entries(props.attributes).forEach(([key, value]) => {
        const finalValue = getValue(value);
        if (key === "className" || key === "class") {
          widget.className = finalValue;
        } else {
          widget.setAttribute(key, finalValue);
        }
      });
    }

    // 5. Manejar props especiales (special)
    if (props.special) {
      // --- Value (para inputs) ---
      if (props.special.value !== undefined) {
        const finalValue = getValue(props.special.value);
        if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
          if (widget.value !== finalValue) {
            widget.value = finalValue;
          }
        }
      }

      // --- Variant ---
      if (props.special.variant !== undefined) {
        widget.dataset.variant = getValue(props.special.variant);
      }

      // --- Margin Vertical ---
      if (props.special.marginVertical !== undefined) {
        const value = getValue(props.special.marginVertical);
        if (typeof value === "number") {
          widget.style.marginTop = value + "px";
          widget.style.marginBottom = value + "px";
        } else {
          widget.style.marginTop = value;
          widget.style.marginBottom = value;
        }
      }

      // --- Margin Horizontal ---
      if (props.special.marginHorizontal !== undefined) {
        const value = getValue(props.special.marginHorizontal);
        if (typeof value === "number") {
          widget.style.marginLeft = value + "px";
          widget.style.marginRight = value + "px";
        } else {
          widget.style.marginLeft = value;
          widget.style.marginRight = value;
        }
      }

      // --- Padding Vertical ---
      if (props.special.paddingVertical !== undefined) {
        const value = getValue(props.special.paddingVertical);
        if (typeof value === "number") {
          widget.style.paddingTop = value + "px";
          widget.style.paddingBottom = value + "px";
        } else {
          widget.style.paddingTop = value;
          widget.style.paddingBottom = value;
        }
      }

      // --- Padding Horizontal ---
      if (props.special.paddingHorizontal !== undefined) {
        const value = getValue(props.special.paddingHorizontal);
        if (typeof value === "number") {
          widget.style.paddingLeft = value + "px";
          widget.style.paddingRight = value + "px";
        } else {
          widget.style.paddingLeft = value;
          widget.style.paddingRight = value;
        }
      }
    }
  } finally {
    widget._updating = false;
  }

  return widget;
};
