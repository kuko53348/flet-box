// core/makeParentable.js
import { reregister } from "./lifecycle.js";

/**
 * Extends a widget with parent–child relationship tracking.
 *
 * After this call the widget gains:
 * - `_children` – live array of direct child nodes (both widget and non-widget).
 * - `_isWidget` – branding flag used by other modules to identify flet-box widgets.
 * - `parent` – a managed accessor backed by a private variable. Readable from
 *   anywhere; written automatically by the overridden `appendChild` and
 *   `removeChild`.
 * - `appendChild(child)` – overrides the native method to track `_children`,
 *   set `child.parent`, and re-register orphaned child widgets with the
 *   lifecycle system.
 * - `removeChild(child)` – overrides the native method to splice `_children`
 *   and clear `child.parent`.
 * - `getChildren()` – returns a shallow copy of `_children`.
 *
 * @param {HTMLElement} widget - The DOM element to extend with parent tracking.
 * @returns {HTMLElement} The same widget (for chaining).
 */
export const makeParentable = (widget) => {
  let _parent = null;
  widget._children = [];
  widget._isWidget = true;  // Branding flag to identify flet-box widgets

  Object.defineProperty(widget, "parent", {
    get: () => _parent,
    set: (p) => { _parent = p; },
    enumerable: true,
    configurable: true,
  });

  const originalAppend = widget.appendChild;

  /**
   * Overrides the native `appendChild` to:
   * 1. Set `child.parent` when the child is a widget.
   * 2. Re-register the child with the lifecycle observer if it was previously
   *    pruned as an orphan (built before being attached to the DOM).
   * 3. Track the child in `_children` (avoids duplicates).
   *
   * @param {Node} child - The node to append.
   * @returns {Node} The appended child (mirrors native behaviour).
   */
  widget.appendChild = function (child) {
    if (child && child._isWidget === true) {
      child.parent = this;
      reregister(child);
    }
    if (!this._children.includes(child)) {
      this._children.push(child);
    }
    return originalAppend.call(this, child);
  };

  /**
   * Returns a shallow copy of the widget's direct children array.
   *
   * @returns {Array<Node>} Snapshot of `_children`.
   */
  widget.getChildren = () => [...widget._children];

  const originalRemoveChild = widget.removeChild;

  /**
   * Overrides the native `removeChild` to:
   * 1. Splice the child out of `_children`.
   * 2. Clear `child.parent` when the child is a widget.
   *
   * @param {Node} child - The node to remove.
   * @returns {Node} The removed child (mirrors native behaviour).
   */
  widget.removeChild = function (child) {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      this._children.splice(index, 1);
      if (child && child._isWidget === true) {
        child.parent = null;
      }
    }
    return originalRemoveChild.call(this, child);
  };

  return widget;
};

export default makeParentable;
