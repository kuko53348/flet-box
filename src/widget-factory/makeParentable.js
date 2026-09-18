// core/makeParentable.js
import { reregister } from "./lifecycle.js";

export const makeParentable = (widget) => {
  let _parent = null;
  widget._children = [];
  widget._isWidget = true;  // ✅ Branding

  Object.defineProperty(widget, "parent", {
    get: () => _parent,
    set: (p) => { _parent = p; },
    enumerable: true,
    configurable: true,
  });

  const originalAppend = widget.appendChild;
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

  widget.getChildren = () => [...widget._children];

  const originalRemoveChild = widget.removeChild;
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