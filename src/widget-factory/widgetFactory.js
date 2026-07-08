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

export function WidgetFactory(tag, customProps = {}) {
  // ✅ Normalización de tag
  let finalTag = tag;
  let finalProps = customProps;

  if (typeof tag === "object" && tag !== null) {
    if (tag.tag) {
      finalTag = tag.tag;
      finalProps = { ...tag, ...customProps };
      delete finalProps.tag;
    } else {
      console.warn(
        "⚠️ WidgetFactory: tag is object without .tag, using 'div'",
        tag,
      );
      finalTag = "div";
      finalProps = { ...tag, ...customProps };
    }
  }

  if (typeof finalTag !== "string") {
    console.warn(
      "⚠️ WidgetFactory: tag is not a string, using 'div'",
      finalTag,
    );
    finalTag = "div";
  }

  // ✅ Crear widget base
  const widget = createWidget(finalTag, {});
  widget._widgetName = finalTag.charAt(0).toUpperCase() + finalTag.slice(1);

  // ✅ Inicializar flag de actualización
  widget._updating = false;

  makeParentable(widget);
  addLifecycle(widget);

  widget._originalProps = { ...finalProps };
  widget._events = [];

  // ✅ Procesar props iniciales
  const initialProps = processProps(finalProps, finalTag);
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

  // ✅ Método update con flag
  widget.update = (newProps = {}) => {
    if (widget._updating) return widget;
    widget._updating = true;

    try {
      const merged = { ...widget._originalProps, ...newProps };
      widget._originalProps = merged;

      const processed = processProps(merged, finalTag);
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
    } finally {
      widget._updating = false;
    }

    return widget;
  };

  widget.getProps = () => ({ ...widget._originalProps });

  // ✅ Reactividad con verificación del flag
  makeReactive(widget, (changedProps) => {
    if (!widget._updating) {
      widget.update(changedProps);
    }
  });

  return widget;
}
