// core/widgetFactory.js
import { createWidget } from "./createWidget.js";
import { makeParentable } from "./makeParentable.js";
import { addLifecycle } from "./lifecycle.js";
import { applyEffects } from "./effects.js";
import { makeReactive } from "./reactivity.js";
import { processProps } from "./processProps.js";
import { assignProps } from "./assignProps.js";
import { stackPosition } from "./stackPosition.js";
import { addChildren, removePropChildren } from "./addChildren.js";

export function WidgetFactory(tag, customProps = {}, baseStyles = {}) {
  // ✅ NORMALIZE TAG (compatible with both forms)
  let finalTag = tag;
  let finalProps = customProps;

  // If tag is an object (form: { tag: 'div', ... })
  if (typeof tag === "object" && tag !== null) {
    if (tag.tag) {
      finalTag = tag.tag;
      finalProps = { ...tag, ...customProps };
      delete finalProps.tag;
    } else {
      // If object without tag, use 'div'
      console.warn(
        "⚠️ WidgetFactory: tag is object without .tag, using 'div'",
        tag,
      );
      finalTag = "div";
      finalProps = { ...tag, ...customProps };
    }
  }

  // ✅ Ensure tag is a string
  if (typeof finalTag !== "string") {
    console.warn(
      "⚠️ WidgetFactory: tag is not a string, using 'div'",
      finalTag,
    );
    finalTag = "div";
  }

  // ✅ Create widget
  const widget = createWidget(finalTag, {});

  // ✅ Add _widgetName for Inspector
  widget._widgetName = finalTag.charAt(0).toUpperCase() + finalTag.slice(1);

  makeParentable(widget);
  addLifecycle(widget);

  widget._originalProps = { ...finalProps };
  widget._events = [];

  if (Object.keys(baseStyles).length > 0) {
    assignProps(widget, { style: baseStyles });
  }

  const initialProps = processProps(finalProps);
  assignProps(widget, initialProps);
  stackPosition(widget, finalProps);

  if (finalProps.child) {
    addChildren(widget, finalProps.child);
  }

  if (finalProps.children) {
    addChildren(widget, finalProps.children);
  }

  applyEffects(widget);

  if (finalProps.ref && typeof finalProps.ref === "function") {
    finalProps.ref(widget);
  }

  widget.update = (newProps = {}) => {
    const merged = { ...widget._originalProps, ...newProps };
    widget._originalProps = merged;
    const processed = processProps(merged);
    assignProps(widget, processed);
    stackPosition(widget, merged);

    if (newProps.child !== undefined || newProps.children !== undefined) {
      removePropChildren(widget);

      if (newProps.child !== undefined) {
        addChildren(widget, newProps.child);
      }

      if (newProps.children !== undefined) {
        addChildren(widget, newProps.children);
      }
    }

    applyEffects(widget);

    if (newProps.ref && typeof newProps.ref === "function") {
      newProps.ref(widget);
    }

    return widget;
  };

  widget.getProps = () => ({ ...widget._originalProps });

  makeReactive(widget, (changedProps) => {
    widget.update(changedProps);
  });

  return widget;
}
