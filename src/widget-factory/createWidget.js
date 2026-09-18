// core/createWidget.js

export const createWidget = (tag, props) => {
  // ✅ Validate that tag is a string
  let finalTag = tag;
  if (typeof finalTag !== "string") {
    console.warn("⚠️ createWidget: tag is not a string, using 'div'", finalTag);
    finalTag = "div";
  }

  const widget = document.createElement(finalTag);
  widget._events = [];

  return widget;
};