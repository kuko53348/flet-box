// core/reactivity.js
import { REACTIVE_PROPS } from "./translateProps.js";

/**
 * Makes a widget reactive: allows assigning properties directly
 * (e.g., widget.text = 'new') and automatically updates the DOM.
 */
export const makeReactive = (widget, updateFn) => {
  REACTIVE_PROPS.forEach((prop) => {
    Object.defineProperty(widget, prop, {
      get() {
        return widget._originalProps ? widget._originalProps[prop] : undefined;
      },
      set(newValue) {
        const current = widget._originalProps
          ? widget._originalProps[prop]
          : undefined;
        if (current !== newValue) {
          updateFn({ [prop]: newValue });
        }
      },
      enumerable: true,
      configurable: true,
    });
  });
  return widget;
};

export default { makeReactive, REACTIVE_PROPS };
