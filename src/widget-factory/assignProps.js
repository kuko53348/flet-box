// core/assignProps.js
import { setStyles } from "./tools.js";

export const assignProps = (widget, props) => {
  if (!props) return widget;

  // 1. Styles
  if (props.style) {
    setStyles(widget, props.style);
  }

  // 2. Text
  if (props.textContent !== undefined) {
    widget.textContent = props.textContent;
  }

  // 3. Events (clean old listeners)
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

  // 4. Attributes
  if (props.attributes) {
    Object.entries(props.attributes).forEach(([key, value]) => {
      if (key === "className" || key === "class") {
        widget.className = value;
      } else {
        widget.setAttribute(key, value);
      }
    });
  }

  return widget;
};
