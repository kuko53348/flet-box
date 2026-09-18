// components/flet-box/utils/navigation.js

/**
 * Añade capacidades de navegación completa a un widget:
 * - parent (subir)
 * - children (bajar, por índice)
 * - findById (búsqueda por id)
 * - siblings (hermanos)
 * - tree (vista de árbol)
 * - path (ruta completa hasta la raíz)
 */

const navigated = new WeakSet();

export const addNavigation = (widget) => {
  if (!widget || navigated.has(widget)) return widget;
  navigated.add(widget);

  // ========================================================================
  // 1. PARENT (ya lo tienes en parentable, lo incluimos aquí también)
  // ========================================================================
  if (!widget.hasOwnProperty("parent")) {
    let _parent = null;
    Object.defineProperty(widget, "parent", {
      get: () => _parent,
      set: (p) => {
        _parent = p;
      },
      enumerable: true,
      configurable: true,
    });
  }

  // ========================================================================
  // 2. CHILDREN (array de hijos directos)
  // ========================================================================
  if (!widget._children) {
    widget._children = [];
  }

  Object.defineProperty(widget, "children", {
    get: () => widget._children,
    set: (arr) => {
      widget._children = arr;
    },
    enumerable: true,
    configurable: true,
  });

  // ========================================================================
  // 3. FIRST CHILD / LAST CHILD (atajos)
  // ========================================================================
  Object.defineProperty(widget, "firstChild", {
    get: () => widget._children[0] || null,
    enumerable: true,
  });

  Object.defineProperty(widget, "lastChild", {
    get: () => widget._children[widget._children.length - 1] || null,
    enumerable: true,
  });

  // ========================================================================
  // 4. SIBLINGS (hermanos, sin incluirse a sí mismo)
  // ========================================================================
  Object.defineProperty(widget, "siblings", {
    get: () => {
      if (!widget.parent || !widget.parent._children) return [];
      return widget.parent._children.filter((c) => c !== widget);
    },
    enumerable: true,
  });

  // ========================================================================
  // 5. NEXT SIBLING / PREV SIBLING
  // ========================================================================
  Object.defineProperty(widget, "nextSibling", {
    get: () => {
      if (!widget.parent) return null;
      const idx = widget.parent._children.indexOf(widget);
      return widget.parent._children[idx + 1] || null;
    },
    enumerable: true,
  });

  Object.defineProperty(widget, "prevSibling", {
    get: () => {
      if (!widget.parent) return null;
      const idx = widget.parent._children.indexOf(widget);
      return widget.parent._children[idx - 1] || null;
    },
    enumerable: true,
  });

  // ========================================================================
  // 6. INDEX (posición entre hermanos)
  // ========================================================================
  Object.defineProperty(widget, "index", {
    get: () => {
      if (!widget.parent) return -1;
      return widget.parent._children.indexOf(widget);
    },
    enumerable: true,
  });

  // ========================================================================
  // 7. ROOT (subir hasta la raíz)
  // ========================================================================
  Object.defineProperty(widget, "root", {
    get: () => {
      let current = widget;
      while (current.parent) {
        current = current.parent;
      }
      return current;
    },
    enumerable: true,
  });

  // ========================================================================
  // 8. PATH (ruta desde la raíz hasta el widget)
  // ========================================================================
  Object.defineProperty(widget, "path", {
    get: () => {
      const path = [];
      let current = widget;
      while (current) {
        path.unshift({
          name: current._widgetName || current.tagName?.toLowerCase(),
          id: current.id || null,
          index: current.index,
        });
        current = current.parent;
      }
      return path;
    },
    enumerable: true,
  });

  // ========================================================================
  // 9. DEPTH (profundidad en el árbol)
  // ========================================================================
  Object.defineProperty(widget, "depth", {
    get: () => {
      let depth = 0;
      let current = widget.parent;
      while (current) {
        depth++;
        current = current.parent;
      }
      return depth;
    },
    enumerable: true,
  });

  // ========================================================================
  // 10. findById (búsqueda hacia abajo por id)
  // ========================================================================
  widget.findById = function (id) {
    if (this.id === id) return this;
    for (const child of this._children || []) {
      if (child.findById) {
        const found = child.findById(id);
        if (found) return found;
      }
    }
    return null;
  };

  // ========================================================================
  // 11. findAll (búsqueda hacia abajo por nombre de widget)
  // ========================================================================
  widget.findAll = function (widgetName) {
    const results = [];
    if (this._widgetName === widgetName) results.push(this);
    for (const child of this._children || []) {
      if (child.findAll) {
        results.push(...child.findAll(widgetName));
      }
    }
    return results;
  };

  // ========================================================================
  // 12. TREE (vista de árbol para debug)
  // ========================================================================
  widget._generateTree = function (indent = 0, isLast = true, prefix = "") {
    const connector = indent === 0 ? "" : isLast ? "└── " : "├── ";
    const continuation = indent === 0 ? "" : isLast ? "    " : "│   ";

    const name = this._widgetName || this.tagName?.toLowerCase() || "widget";
    const id = this.id ? ` #${this.id}` : "";
    const props = this._getTreeProps ? this._getTreeProps() : "";

    let tree = `${prefix}${connector}${name}${id}${props}\n`;

    if (this._children && this._children.length > 0) {
      this._children.forEach((child, index) => {
        const childIsLast = index === this._children.length - 1;
        if (child._generateTree) {
          tree += child._generateTree(
            indent + 1,
            childIsLast,
            prefix + continuation,
          );
        }
      });
    }

    return tree;
  };

  Object.defineProperty(widget, "tree", {
    get: () => widget._generateTree(),
    enumerable: true,
  });

  // ========================================================================
  // 13. _getTreeProps (sobrescribible por cada widget para mostrar props)
  // ========================================================================
  widget._getTreeProps = function () {
    const name = this._widgetName || "";
    const propsMap = {
      Text: () => (this.textContent ? ` [${this.textContent}]` : ""),
      Image: () => (this.src ? ` [${this.src.split("/").pop()}]` : ""),
      Container: () => "",
      GestureDetector: () => "",
    };
    return propsMap[name] ? propsMap[name]() : "";
  };

  return widget;
};
