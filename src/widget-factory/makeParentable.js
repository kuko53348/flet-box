// core/makeParentable.js
export const makeParentable = (widget) => {
  let _parent = null;
  widget._children = []; // ✅ Array of children

  // ✅ Parent property
  Object.defineProperty(widget, "parent", {
    get: () => _parent,
    set: (p) => {
      _parent = p;
    },
    enumerable: true,
    configurable: true,
  });

  // ✅ Override appendChild to maintain _children
  const originalAppend = widget.appendChild;
  widget.appendChild = function (child) {
    // If child has parent, assign it
    if (child.parent !== undefined) {
      child.parent = this;
    }
    // Add to children array
    if (!this._children.includes(child)) {
      this._children.push(child);
    }
    // Call original appendChild
    return originalAppend.call(this, child);
  };

  // ✅ Method to get children
  widget.getChildren = () => {
    return [...widget._children];
  };

  // ✅ Method to remove child
  const originalRemoveChild = widget.removeChild;
  widget.removeChild = function (child) {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      this._children.splice(index, 1);
      if (child.parent !== undefined) {
        child.parent = null;
      }
    }
    // Call original removeChild
    return originalRemoveChild.call(this, child);
  };

  return widget;
};

export default makeParentable;
