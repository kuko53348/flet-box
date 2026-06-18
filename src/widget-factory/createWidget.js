// core/createWidget.js
import { setStyles } from "./tools.js";

export const createWidget = (tag, props) => {
  // ✅ Validate that tag is a string
  let finalTag = tag;
  if (typeof finalTag !== "string") {
    console.warn("⚠️ createWidget: tag is not a string, using 'div'", finalTag);
    finalTag = "div";
  }

  const widget = document.createElement(finalTag);
  widget._events = [];

  // ✅ Apply styles
  if (props.style && Object.keys(props.style).length > 0) {
    setStyles(widget, props.style);
  }

  // ✅ Apply text
  if (props.textContent) {
    widget.textContent = props.textContent;
  }

  // ✅ Apply events
  if (props.events) {
    Object.entries(props.events).forEach(([event, handler]) => {
      widget.addEventListener(event, handler);
    });
  }

  // ✅ Apply attributes
  if (props.attributes) {
    Object.entries(props.attributes).forEach(([key, value]) => {
      widget.setAttribute(key, value);
    });
  }

  return widget;
};
