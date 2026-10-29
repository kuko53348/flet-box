// core/widgetFactory.js
import { createWidget } from "./createWidget.js";
import { makeParentable } from "./makeParentable.js";
import { addLifecycle } from "./lifecycle.js";
import { applyEffects } from "./effects.js";
import { makeReactive } from "./reactivity.js";
import { processProps } from "./processProps.js";
import { assignProps } from "./assignProps.js";
import { stackPosition } from "./stackPosition.js";
import { addChildren, takePropChildren } from "./addChildren.js";
import { reactiveKeyOf } from "./reactiveValue.js";
import { registerWidget } from "../tools/useState.js";
import {
  FAILURE_ATTR,
  clearFailure,
  paintFailure,
  renderFailure,
  reportFailure,
} from "../utils/errorBoundary.js";

/**
 * Auto-binds reactive props to their state key.
 *
 * A prop whose value is a live reactive (what `useState` returns) carries the key
 * it came from, so the factory can subscribe this widget to that key. A later
 * change then updates **only this widget** instead of rebuilding the whole app —
 * which is what makes the plain
 * `const [color, setColor] = useState("color", "red"); Widget({ bgColor: color })`
 * syntax surgical.
 *
 * @param {HTMLElement} widget - The widget being built or updated.
 * @param {Object} props - The props to scan.
 * @returns {void}
 */
const bindReactiveProps = (widget, props) => {
  for (const [prop, value] of Object.entries(props || {})) {
    const key = reactiveKeyOf(value);
    if (key) registerWidget(key, widget, prop);
  }
};

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

  // ------------------------------------------------------------
  // Reserved prop: `widgetName`
  // ------------------------------------------------------------
  // Labels the widget with its real FletBox name (e.g. "QRCode", "Button")
  // instead of the capitalized HTML tag. Consumed by Inspector, navigation
  // helpers and warnings; it never reaches the DOM. When omitted it falls
  // back to the capitalized tag, so bare factory calls keep working.
  //
  // NOTE: the key is `widgetName`, not `name`, because `name` is a legitimate
  // public prop of Icon/Avatar (Icon({ name: "add" })).
  let explicitName = null;
  if (finalProps && typeof finalProps === "object" && "widgetName" in finalProps) {
    if (typeof finalProps.widgetName === "string" && finalProps.widgetName) {
      explicitName = finalProps.widgetName;
    }
    finalProps = { ...finalProps };
    delete finalProps.widgetName;
  }
  const widgetName =
    explicitName || finalTag.charAt(0).toUpperCase() + finalTag.slice(1);

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
  const widget = createWidget(finalTag);
  widget._widgetName = widgetName;
  widget._updating = false;
  widget._events = [];

  makeParentable(widget);
  addLifecycle(widget);

  widget._originalProps = { ...finalProps };

  // ============================================================
  // 4. APPLY INITIAL PROPS
  // ============================================================
  // A throw inside a widget must not take the screen with it. The widget
  // paints a placeholder in its own place — the rest of the tree keeps
  // working — and the error is reported with this widget's name.
  try {
    const initialProps = processProps(finalProps, finalTag, widgetName);
    assignProps(widget, initialProps);
    bindReactiveProps(widget, finalProps);
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
  } catch (error) {
    renderFailure(widget, error, { widgetName, phase: "render" });
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
      // A previous failure painted a placeholder. This update may be the retry
      // that fixes it, so the placeholder goes before the real content comes
      // back.
      const hadFailure = Boolean(widget._failureBox);
      clearFailure(widget);

      // Normalize: never allow child AND children simultaneously
      const normalized = { ...newProps };
      // Reserved: `widgetName` labels the widget for Inspector and must never
      // persist in props. It may re-label the widget on update, nothing more.
      if ("widgetName" in normalized) {
        const nextName = normalized.widgetName;
        if (typeof nextName === "string" && nextName) widget._widgetName = nextName;
        delete normalized.widgetName;
      }
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

      const processed = processProps(merged, finalTag, widgetName);
      assignProps(widget, processed);
      // Only the incoming keys can introduce a new binding; the ones present at
      // construction were registered then.
      bindReactiveProps(widget, normalized);
      stackPosition(widget, merged);

      if (hasChild || hasChildren) {
        // The old content comes out first, but it is kept: if attaching the new
        // content throws, the widget goes back to what it had instead of being
        // left empty.
        const previous = takePropChildren(widget);
        try {
          if (hasChild) addChildren(widget, newProps.child);
          if (hasChildren) addChildren(widget, newProps.children);
        } catch (error) {
          addChildren(widget, previous);
          throw error;
        }
      } else if (hadFailure) {
        // The build failed before the children were attached, so this update is
        // the retry: they go in now.
        if (merged.child !== undefined) addChildren(widget, merged.child);
        if (merged.children !== undefined) addChildren(widget, merged.children);
      }

      applyEffects(widget);

      if (newProps.ref && typeof newProps.ref === "function") {
        newProps.ref(widget);
      }
    } catch (error) {
      // The widget keeps the content it had: a failed refresh is stale, not
      // empty, and the screen must not blank over it.
      const failure = reportFailure(error, { widgetName, phase: "update" });
      widget.setAttribute(FAILURE_ATTR, "update");
      // A widget with nothing in it is a hole; one that says it failed is not.
      if (!widget.firstChild) {
        paintFailure(widget, failure, { widgetName, phase: "update" });
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
