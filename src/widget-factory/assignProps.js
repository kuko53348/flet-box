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
// core/assignProps.js - Versión definitiva
// Combina: simplicidad + special + reactividad + manejo de errores + _updating sin bloqueo
import { setStyles } from "./tools.js";

// ✅ Extrae el valor real si es una prop reactiva (objeto con _isReactive)
const getValue = (val) => {
  if (val && typeof val === "object" && val._isReactive === true) {
    return val._value !== undefined ? val._value : val.valueOf();
  }
  return val;
};

// ✅ Aplica props especiales (shorthands)
const applySpecial = (widget, key, value) => {
  const val = getValue(value);
  const px = typeof val === "number" ? val + "px" : val;

  switch (key) {
    case "value":
      if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
        if (widget.value !== val) widget.value = val;
      }
      break;
    case "variant":
      widget.dataset.variant = val;
      break;
    case "marginVertical":
      widget.style.marginTop = px;
      widget.style.marginBottom = px;
      break;
    case "marginHorizontal":
      widget.style.marginLeft = px;
      widget.style.marginRight = px;
      break;
    case "paddingVertical":
      widget.style.paddingTop = px;
      widget.style.paddingBottom = px;
      break;
    case "paddingHorizontal":
      widget.style.paddingLeft = px;
      widget.style.paddingRight = px;
      break;
    // Puedes añadir más specials aquí
  }
};

export const assignProps = (widget, props) => {
  if (!props) return widget;

  // 🔒 Marcar como actualizando (sin bloquear)
  widget._updating = true;

  try {
    // ============================================================
    // 1. ESTILOS (desde props.style)
    // ============================================================
    if (props.style) {
      setStyles(widget, props.style);
    }

    // ============================================================
    // 2. TEXTO (desde props.textContent)
    // ============================================================
    if (props.textContent !== undefined) {
      const textValue = getValue(props.textContent);
      if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
        if (widget.value !== textValue) widget.value = textValue;
      } else {
        if (widget.textContent !== textValue) widget.textContent = textValue;
      }
    }

    // ============================================================
    // 3. EVENTOS (desde props.events)
    // ============================================================
    if (widget._events) {
      widget._events.forEach(({ event, handler }) => {
        widget.removeEventListener(event, handler);
      });
      widget._events = [];
    }

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

    // ============================================================
    // 4. ATRIBUTOS (desde props.attributes)
    // ============================================================
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

    // ============================================================
    // 5. PROPS ESPECIALES (desde props.special)
    // ============================================================
    if (props.special) {
      for (const [key, value] of Object.entries(props.special)) {
        applySpecial(widget, key, getValue(value));
      }
    }

    // ============================================================
    // 6. FALLBACK: Props planas no clasificadas
    //    (por si processProps no las capturó)
    // ============================================================
    const knownKeys = new Set([
      "style",
      "events",
      "attributes",
      "textContent",
      "special",
      "child",
      "children",
      "ref",
    ]);

    const extraKeys = Object.keys(props).filter((key) => !knownKeys.has(key));
    if (extraKeys.length > 0) {
      for (const key of extraKeys) {
        const value = props[key];
        // Si es evento plano (onClick, onPress)
        if (key.startsWith("on") && typeof value === "function") {
          const eventName = key.slice(2).toLowerCase();
          if (eventName === "click") {
            widget.onclick = value;
          } else {
            widget.addEventListener(eventName, value);
            if (!widget._events) widget._events = [];
            widget._events.push({ event: eventName, handler: value });
          }
        } else if (
          [
            "className",
            "class",
            "id",
            "type",
            "href",
            "src",
            "alt",
            "title",
            "role",
            "aria-label",
          ].includes(key)
        ) {
          // Atributos planos
          const finalValue = getValue(value);
          if (key === "className" || key === "class") {
            widget.className = finalValue;
          } else {
            widget.setAttribute(key, finalValue);
          }
        } else if (key === "text" || key === "label" || key === "caption") {
          // Texto plano (si no vino en textContent)
          const textValue = getValue(value);
          if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
            if (widget.value !== textValue) widget.value = textValue;
          } else {
            if (widget.textContent !== textValue)
              widget.textContent = textValue;
          }
        } else {
          // Cualquier otra prop → la tratamos como estilo
          const finalValue = getValue(value);
          const cssValue =
            typeof finalValue === "number" ? finalValue + "px" : finalValue;
          try {
            widget.style[key] = cssValue;
          } catch (_) {
            // Silencioso
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ [assignProps] Error:", error);
    throw error;
  } finally {
    // 🔓 Siempre liberar la bandera, incluso si hay error
    widget._updating = false;
  }

  return widget;
};

export default assignProps;
