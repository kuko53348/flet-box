// core/addChildren.js

/**
 * Tracks which child nodes were appended via props (`child` / `children`).
 * Using a WeakSet (external to the nodes) works with any Node type, including
 * plain Text nodes, which cannot carry extra properties.
 *
 * @type {WeakSet<Node>}
 */
const PROP_CHILDREN = new WeakSet();

/**
 * Appends one or more children to a parent widget.
 *
 * Accepts a single child or an array of children. Each item may be:
 * - A DOM Node (appended directly).
 * - A string or number (converted to a TextNode).
 * - `null`, `undefined`, or `false` (skipped silently).
 *
 * When `markAsProp` is `true` (the default), every appended node is recorded
 * in `PROP_CHILDREN` so that `removePropChildren` can selectively remove only
 * those nodes later.
 *
 * @param {HTMLElement} parent - The parent widget to append children to.
 * @param {Node|string|number|Array|null|undefined|false} children - Child or
 *   array of children to append.
 * @param {Object} [options={}] - Options.
 * @param {boolean} [options.markAsProp=true] - Whether to mark appended nodes
 *   as prop-managed so they can be cleaned up by `removePropChildren`.
 * @returns {HTMLElement} The parent widget (for chaining).
 */
export const addChildren = (parent, children, options = {}) => {
  if (!children && children !== 0) return parent;

  const { markAsProp = true } = options;
  const items = Array.isArray(children) ? children : [children];

  items.forEach((child) => {
    if (child === null || child === undefined || child === false) return;

    let node = child;
    if (typeof child === "string" || typeof child === "number") {
      node = document.createTextNode(String(child));
    }

    if (markAsProp) {
      PROP_CHILDREN.add(node);
    }

    parent.appendChild(node);
  });

  return parent;
};

/**
 * Removes all children that were previously appended via props (i.e. tracked in
 * `PROP_CHILDREN`).
 *
 * Handles two cases:
 * 1. **Normal path** – the node is still a direct child of `parent`. The
 *    overridden `removeChild` is used, which also updates `_children`.
 * 2. **Fallback path** – the node was moved to a different parent (e.g. by
 *    drag-and-drop). `_children` is updated manually and the widget's `parent`
 *    reference is cleared.
 *
 * In both cases the node is removed from `PROP_CHILDREN` to allow future
 * garbage collection.
 *
 * @param {HTMLElement} parent - The parent widget whose prop-children should be
 *   removed.
 * @returns {HTMLElement} The parent widget (for chaining).
 */
export const removePropChildren = (parent) => {
  const toRemove = Array.from(parent.childNodes).filter((child) =>
    PROP_CHILDREN.has(child)
  );

  toRemove.forEach((child) => {
    if (child.parentNode === parent) {
      // Normal path: removeChild override also cleans up _children.
      parent.removeChild(child);
    } else {
      // Fallback: node was moved; manually clean up _children.
      const idx = parent._children.indexOf(child);
      if (idx !== -1) parent._children.splice(idx, 1);
      if (child._isWidget) child.parent = null;
    }
    PROP_CHILDREN.delete(child);
  });

  return parent;
};

/**
 * Removes ALL children from a parent widget, regardless of whether they were
 * appended via props or programmatically.
 *
 * Resets `_children` to an empty array and clears every node from
 * `PROP_CHILDREN` as it is removed.
 *
 * @param {HTMLElement} parent - The parent widget to clear.
 * @returns {HTMLElement} The parent widget (for chaining).
 */
export const clearChildren = (parent) => {
  while (parent.firstChild) {
    PROP_CHILDREN.delete(parent.firstChild);
    parent.removeChild(parent.firstChild);
  }
  parent._children = [];
  return parent;
};

export default { addChildren, removePropChildren, clearChildren };
