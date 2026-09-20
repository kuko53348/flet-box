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

/**
 * Main widget factory. Creates a fully functional DOM widget with reactivity,
 * lifecycle hooks, prop processing, and child management.
 *
 * Accepts either a tag string or a config object (with an optional `tag` key).
 * When both `child` and `children` are provided, `children` takes precedence.
 *
 * @param {string|Object} tag - HTML tag name (e.g. `'div'`) or a config object
 *   whose `tag` property specifies the element type. Defaults to `'div'` when
 *   the value is not a string.
 * @param {Object} [customProps={}] - Additional props merged on top of any
 *   props already present in a config object passed as `tag`.
 * @returns {HTMLElement} The constructed widget element, extended with reactive
 *   accessors, lifecycle hooks, and `update` / `getProps` methods.
 */
export function WidgetFactory(tag, customProps = {}) {
  // ============================================================
  // 1. NORMALIZE TAG AND PROPS
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
  // 2. NORMALIZE child/children IN INITIAL PROPS
  // ============================================================
  // When both are present, prefer `children` (expected behavior).
  if (
    finalProps.child !== undefined &&
    finalProps.children !== undefined
  ) {
    delete finalProps.child;
  }

  // ============================================================
  // 3. CREATE BASE WIDGET
  // ============================================================
  const widget = createWidget(finalTag, {});
  widget._widgetName = finalTag.charAt(0).toUpperCase() + finalTag.slice(1);
  widget._updating = false;
  widget._events = [];

  makeParentable(widget);
  addLifecycle(widget);

  widget._originalProps = { ...finalProps };

  // ============================================================
  // 4. APPLY INITIAL PROPS
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
  // 5. update METHOD WITH NORMALIZATION
  // ============================================================
  let updateDepth = 0;
  const MAX_UPDATE_DEPTH = 10;

  /**
   * Updates the widget with new props. Merges the new props into the stored
   * original props and re-applies styles, attributes, children, and effects.
   *
   * Prevents infinite loops via a recursion depth guard (`MAX_UPDATE_DEPTH`).
   * When both `child` and `children` are passed, `children` wins (same rule as
   * the constructor).
   *
   * @param {Object} [newProps={}] - Partial or full prop set to apply.
   * @returns {HTMLElement} The widget itself (for chaining).
   */
  widget.update = (newProps = {}) => {
    if (updateDepth >= MAX_UPDATE_DEPTH) {
      console.warn("⚠️ [WidgetFactory] Max update depth reached, skipping");
      return widget;
    }

    updateDepth++;
    try {
      // Normalize: never allow child AND children simultaneously
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

  /**
   * Returns a shallow copy of the widget's current stored props.
   *
   * @returns {Object} Copy of `_originalProps`.
   */
  widget.getProps = () => ({ ...widget._originalProps });

  // ============================================================
  // 6. REACTIVITY
  // ============================================================
  makeReactive(widget, (changedProps) => {
    widget.update(changedProps);
  });

  return widget;
}

export default WidgetFactory;
