// core/reactivity.js
import { REACTIVE_PROPS } from "./translateProps.js";

// Tags donde width/height son IDL attributes nativos con semántica propia
// (tamaño intrínseco, aspect-ratio, etc). Sobreescribirlos con defineProperty
// rompería ese comportamiento nativo, así que en estos tags NO se sombrean.
const REPLACED_ELEMENT_TAGS = new Set([
  "img",
  "canvas",
  "video",
  "iframe",
  "embed",
  "object",
  "source",
]);

// Props que NUNCA deben sombrearse con un accessor propio porque el navegador
// mantiene estado vivo y controlado por el usuario sobre ellas (p. ej. lo que
// se está tecleando en un input). Sombrear "value" desconecta widget.value
// del valor real mostrado en pantalla.
const NEVER_SHADOW = new Set(["value"]);

export const makeReactive = (widget, updateFn) => {
  const tag = widget.tagName ? widget.tagName.toLowerCase() : "";

  REACTIVE_PROPS.forEach((prop) => {
    if (NEVER_SHADOW.has(prop)) return;

    if (
      (prop === "width" || prop === "height") &&
      REPLACED_ELEMENT_TAGS.has(tag)
    ) {
      return;
    }

    Object.defineProperty(widget, prop, {
      get() {
        return widget._originalProps ? widget._originalProps[prop] : undefined;
      },
      set(newValue) {
        if (!widget._originalProps) return;
        const current = widget._originalProps[prop];
        if (current === newValue) return;

        widget._originalProps[prop] = newValue;
        updateFn({ [prop]: newValue });
      },
      enumerable: true,
      configurable: true,
    });
  });

  if (tag === "input" || tag === "textarea" || tag === "select") {
    const syncValueFromDOM = () => {
      if (widget._originalProps) {
        widget._originalProps.value = widget.value;
      }
    };
    widget.addEventListener("input", syncValueFromDOM);
    widget.addEventListener("change", syncValueFromDOM);
  }

  return widget;
};

export default { makeReactive, REACTIVE_PROPS };