// core/assignProps.js
import { setStyles } from "./tools.js";

// ✅ Extrae el valor real si es una prop reactiva (incluso si es función)
const getValue = (val) => {
  if (typeof val === "function" && val._isReactive) {
    return val();
  }
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
    case "style":
      if (val && typeof val === "object" && !Array.isArray(val)) {
        setStyles(widget, val);
      }
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
  }
};

export const assignProps = (widget, props) => {
  if (!props) return widget;

  const wasUpdating = widget._updating;
  widget._updating = true;

  try {
    // ============================================================
    // 1. ESTILOS
    // ============================================================
    if (props.style && Object.keys(props.style).length > 0) {
      setStyles(widget, props.style);
    }

    // ============================================================
    // 2. TEXTO
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
    // 3. EVENTOS
    // ============================================================
    if (widget._events && widget._events.length > 0) {
      widget._events.forEach(({ event, handler }) => {
        widget.removeEventListener(event, handler);
      });
      widget._events = [];
    }
    
    widget.onclick = null;

    if (props.events && Object.keys(props.events).length > 0) {
      Object.entries(props.events).forEach(([event, handler]) => {
        if (typeof handler !== "function") return;
        if (event === "click") {
          widget.onclick = handler;
        } else {
          widget.addEventListener(event, handler);
          widget._events.push({ event, handler });
        }
      });
    }

    // ============================================================
    // 4. ATRIBUTOS
    // ============================================================
    if (props.attributes && Object.keys(props.attributes).length > 0) {
      Object.entries(props.attributes).forEach(([key, value]) => {
        const finalValue = getValue(value);
        try {
          if (key === "className" || key === "class") {
            widget.className = finalValue;
          } else if (
            key === "disabled" ||
            key === "checked" ||
            key === "selected"
          ) {
            widget[key] = Boolean(finalValue);
          } else {
            widget.setAttribute(key, finalValue);
          }
        } catch (e) {
          // Atributo inválido
        }
      });
    }

    // ============================================================
    // 5. SPECIALS
    // ============================================================
    if (props.special) {
      for (const [key, value] of Object.entries(props.special)) {
        applySpecial(widget, key, value);
      }
    }

    // ============================================================
    // 6. FALLBACK PARA PROPS PLANAS
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
        if (value === undefined || value === null) continue;

        if (key.startsWith("on") && typeof value === "function") {
          const eventName = key.slice(2).toLowerCase();
          if (eventName === "click") {
            widget.onclick = value;
          } else {
            widget.addEventListener(eventName, value);
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
          ].includes(key)
        ) {
          const finalValue = getValue(value);
          if (key === "className" || key === "class") {
            widget.className = finalValue;
          } else {
            try {
              widget.setAttribute(key, finalValue);
            } catch (e) {}
          }
        } else if (key === "text" || key === "label" || key === "caption") {
          const textValue = getValue(value);
          if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
            if (widget.value !== textValue) widget.value = textValue;
          } else {
            if (widget.textContent !== textValue) widget.textContent = textValue;
          }
        } else {
          const finalValue = getValue(value);
          const cssValue =
            typeof finalValue === "number" ? finalValue + "px" : finalValue;
          try {
            widget.style[key] = cssValue;
          } catch (e) {}
        }
      }
    }
  } catch (error) {
    console.error("❌ [assignProps] Error:", error);
  } finally {
    widget._updating = wasUpdating;
  }

  return widget;
};

export default assignProps;