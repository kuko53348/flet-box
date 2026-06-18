// core/addChildren.js

/**
 * Adds children to a widget (supports child, children, strings, and arrays)
 * @param {HTMLElement} parent - The parent widget
 * @param {*} children - Single child or array of children
 * @param {Object} options - Options { markAsProp: true/false }
 * @returns {HTMLElement} The parent widget
 *
 * @example
 * addChildren(div, createFactory('p', { text: 'Hello' }));
 * addChildren(div, ['Hello', createFactory('span', { text: 'World' })]);
 * addChildren(div, 'Simple text');
 */
export const addChildren = (parent, children, options = {}) => {
  if (!children) return parent;

  const { markAsProp = true } = options;
  const items = Array.isArray(children) ? children : [children];

  items.forEach((child) => {
    let node = child;

    // Si es string → nodo de texto
    if (typeof child === "string") {
      node = document.createTextNode(child);
    }

    // Si es HTMLElement → asignar parent
    if (node instanceof HTMLElement) {
      if (node.parent !== undefined) {
        node.parent = parent;
      }
      if (!parent._children.includes(node)) {
        parent._children.push(node);
      }
      // Marcar como hijo de prop
      if (markAsProp) {
        node._isPropChild = true;
      }
    }

    parent.appendChild(node);
  });

  return parent;
};

/**
 * Removes all children that were added as props (child/children)
 * @param {HTMLElement} parent - The parent widget
 * @returns {HTMLElement} The parent widget
 */
export const removePropChildren = (parent) => {
  const toRemove = [];

  for (const child of parent.children) {
    if (child._isPropChild) {
      toRemove.push(child);
    }
  }

  toRemove.forEach((child) => {
    parent.removeChild(child);
    const index = parent._children.indexOf(child);
    if (index !== -1) {
      parent._children.splice(index, 1);
    }
  });

  return parent;
};

/**
 * Clears all children from a widget
 * @param {HTMLElement} parent - The parent widget
 * @returns {HTMLElement} The parent widget
 */
export const clearChildren = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  parent._children = [];
  return parent;
};

export default { addChildren, removePropChildren, clearChildren };
