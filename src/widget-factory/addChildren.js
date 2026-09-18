// core/addChildren.js

// ✅ WeakSet externo: funciona con cualquier Node (incluyendo Text)
const PROP_CHILDREN = new WeakSet();

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

export const removePropChildren = (parent) => {
  const toRemove = Array.from(parent.childNodes).filter((child) =>
    PROP_CHILDREN.has(child)
  );

  toRemove.forEach((child) => {
    if (child.parentNode === parent) {
      // ✅ Camino normal: removeChild override limpia _children
      parent.removeChild(child);
    } else {
      // ✅ FALLBACK: nodo fue movido, limpiar _children manualmente
      const idx = parent._children.indexOf(child);
      if (idx !== -1) parent._children.splice(idx, 1);
      if (child._isWidget) child.parent = null;
    }
    PROP_CHILDREN.delete(child);
  });

  return parent;
};

export const clearChildren = (parent) => {
  while (parent.firstChild) {
    PROP_CHILDREN.delete(parent.firstChild);
    parent.removeChild(parent.firstChild);
  }
  parent._children = [];
  return parent;
};

export default { addChildren, removePropChildren, clearChildren };