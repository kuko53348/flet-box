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
  // ============================================================
  // 1. NORMALIZAR TAG Y PROPS
  // ============================================================
  let finalTag = tag;
  let finalProps = customProps;

  if (typeof tag === "object" && tag !== null) {
    if (tag.tag) {
      finalTag = tag.tag;
      finalProps = { ...tag, ...customProps };
      delete finalProps.tag;
    } else {
      finalTag = "div";
      finalProps = { ...tag, ...customProps };
    }
  }

  if (typeof finalTag !== "string") {
    finalTag = "div";
  }

  // ============================================================
  // 2. NORMALIZAR child/children EN PROPS INICIALES
  // ============================================================
  // ✅ Si vienen ambos, preferir children (comportamiento esperado)
  if (
    finalProps.child !== undefined &&
    finalProps.children !== undefined
  ) {
    delete finalProps.child;
  }

  // ============================================================
  // 3. CREAR WIDGET BASE
  // ============================================================
  const widget = createWidget(finalTag, {});
  widget._widgetName = finalTag.charAt(0).toUpperCase() + finalTag.slice(1);
  widget._updating = false;
  widget._events = [];

  makeParentable(widget);
  addLifecycle(widget);

  widget._originalProps = { ...finalProps };

  // ============================================================
  // 4. APLICAR PROPS INICIALES
  // ============================================================
  const initialProps = processProps(finalProps, finalTag);
  assignProps(widget, initialProps);
  stackPosition(widget, finalProps);

  if (finalProps.child !== undefined) {
    addChildren(widget, finalProps.child);
  }
  if (finalProps.children !== undefined) {
    addChildren(widget, finalProps.children);
  }

  applyEffects(widget);

  if (finalProps.ref && typeof finalProps.ref === "function") {
    finalProps.ref(widget);
  }

  // ============================================================
  // 5. MÉTODO update CON NORMALIZACIÓN
  // ============================================================
  let updateDepth = 0;
  const MAX_UPDATE_DEPTH = 10;

  widget.update = (newProps = {}) => {
    if (updateDepth >= MAX_UPDATE_DEPTH) {
      console.warn("⚠️ [WidgetFactory] Max update depth reached, skipping");
      return widget;
    }

    updateDepth++;
    try {
      // ✅ Normalizar: nunca child Y children simultáneamente
      const normalized = { ...newProps };
      const hasChild = "child" in normalized;
      const hasChildren = "children" in normalized;

      if (hasChild || hasChildren) {
        delete widget._originalProps.child;
        delete widget._originalProps.children;
        if (hasChildren) delete normalized.child;
        else if (hasChild) delete normalized.children;
      }

      const merged = { ...widget._originalProps, ...normalized };
      widget._originalProps = merged;

      const processed = processProps(merged, finalTag);
      assignProps(widget, processed);
      stackPosition(widget, merged);

      if (hasChild || hasChildren) {
        removePropChildren(widget);
        if (hasChild) addChildren(widget, newProps.child);
        if (hasChildren) addChildren(widget, newProps.children);
      }

      applyEffects(widget);

      if (newProps.ref && typeof newProps.ref === "function") {
        newProps.ref(widget);
      }
    } finally {
      updateDepth--;
    }

    return widget;
  };

  widget.getProps = () => ({ ...widget._originalProps });

  // ============================================================
  // 6. REACTIVIDAD
  // ============================================================
  makeReactive(widget, (changedProps) => {
    widget.update(changedProps);
  });

  return widget;
}

export default WidgetFactory;