// core/assignProps.js
import { setStyles } from "./tools.js";

export const assignProps = (widget, props) => {
  if (!props) return widget;

  // 1️⃣ Styles
  if (props.style) {
    setStyles(widget, props.style);
  }

  // 2️⃣ Text
  if (props.textContent !== undefined) {
    widget.textContent = props.textContent;
  }

  // 3️⃣ Events (clean old ones)
  if (widget._events) {
    widget._events.forEach(({ event, handler }) => {
      widget.removeEventListener(event, handler);
    });
  }
  widget._events = [];

  // 4️⃣ Add new events
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

  // 5️⃣ Attributes - CORREGIDO
  if (props.attributes) {
    Object.entries(props.attributes).forEach(([key, value]) => {
      // ✅ className se asigna directamente, no con setAttribute
      if (key === "className") {
        widget.className = value;
      } else if (key === "class") {
        widget.className = value;
      } else {
        widget.setAttribute(key, value);
      }
    });
  }

  return widget;
};

export default assignProps;
