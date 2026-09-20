// src/tools/ref.js
//
// Usage:
//   const display = ref();
//   Text({ ref: display });
//   display.update({ text: 'Goodbye' });

/**
 * Creates a ref function that can be attached to a widget via its `ref` prop.
 *
 * When the framework assigns a widget instance to the ref, the ref function:
 * 1. Stores the widget instance internally.
 * 2. Copies all of the widget's methods directly onto the ref function so they
 *    can be called as `display.someMethod()` without going through `.get()`.
 * 3. Exposes non-function properties via `Object.defineProperty` getters/setters
 *    so reads and writes are forwarded to the live widget.
 *
 * @returns {Function} A ref function with an additional `.update(props)` method.
 *
 * @example
 * const display = ref();
 * Text({ ref: display });           // framework assigns the widget
 * display.update({ text: 'Hello' }); // directly updates the widget prop
 */
export const ref = () => {
  let _widget = null;

  /**
   * Called by the framework with the widget instance when the widget is mounted.
   * Also callable manually to point the ref at a different widget.
   *
   * @param {Object|null} widget - The widget instance to bind.
   * @returns {Object|null} The same widget, for convenience.
   */
  const refFn = (widget) => {
    _widget = widget;

    // Mirror all methods and properties from the widget onto the ref function
    // so callers can use `display.method()` directly
    if (widget) {
      Object.keys(widget).forEach((key) => {
        if (typeof widget[key] === "function") {
          refFn[key] = widget[key].bind(widget);
        } else {
          Object.defineProperty(refFn, key, {
            get: () => widget[key],
            set: (v) => {
              widget[key] = v;
            },
            configurable: true,
          });
        }
      });
    }
    return widget;
  };

  /**
   * Calls the bound widget's `update` method with the given props, if the widget
   * is mounted and supports updates.
   *
   * @param {Object} props - Props to pass to `widget.update(props)`.
   * @returns {void}
   */
  refFn.update = (props) => {
    if (_widget && _widget.update) _widget.update(props);
  };

  return refFn;
};
