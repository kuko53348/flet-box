// src/tools/useState.js
import { saveRam, getRam, subscribeRam } from "../services/RamStore.js";

// Store callbacks for each state key
const subscribers = new Map();

// 🔥 Store widgets by state key for automatic updates
const widgetsByKey = new Map();

// Global render function (set by runApp)
let globalRender = null;
let renderTimeout = null;

/**
 * Sets the global render function used to trigger re-renders when state changes.
 * Called by `runApp` to register the application's root render callback.
 *
 * @param {Function} renderFn - The root render function to invoke on state change.
 * @returns {void}
 */
export const setGlobalRender = (renderFn) => {
  globalRender = renderFn;
};

/**
 * Schedules a debounced global re-render to prevent multiple renders firing in
 * rapid succession within the same synchronous execution frame.
 *
 * @returns {void}
 */
const triggerRender = () => {
  if (renderTimeout) clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    if (globalRender) globalRender();
  }, 0);
};

/**
 * Registers a widget instance so it receives automatic prop updates whenever
 * the state value associated with `key` changes.
 *
 * @param {string} key - The state key to watch.
 * @param {Object} widget - The widget instance that exposes an `update` method.
 * @param {string} propName - The prop name on the widget to update with the new value.
 * @returns {void}
 */
export const registerWidget = (key, widget, propName) => {
  if (!widgetsByKey.has(key)) {
    widgetsByKey.set(key, new Set());
  }
  widgetsByKey.get(key).add({ widget, propName });

  // Set initial value if the state already exists
  const currentValue = getRam(key);
  if (currentValue !== undefined && widget && widget.update) {
    widget.update({ [propName]: currentValue });
  }

  // Patch the widget's cleanup to also remove it from the registry when destroyed
  const originalCleanup = widget._cleanup;
  widget._cleanup = () => {
    const widgets = widgetsByKey.get(key);
    if (widgets) {
      for (const item of widgets) {
        if (item.widget === widget) {
          widgets.delete(item);
          break;
        }
      }
    }
    if (originalCleanup) originalCleanup();
  };
};

/**
 * Removes a specific widget from the automatic-update registry for a given key.
 *
 * @param {string} key - The state key the widget was registered under.
 * @param {Object} widget - The widget instance to unregister.
 * @returns {void}
 */
export const unregisterWidget = (key, widget) => {
  const widgets = widgetsByKey.get(key);
  if (widgets) {
    for (const item of widgets) {
      if (item.widget === widget) {
        widgets.delete(item);
        break;
      }
    }
  }
};

/**
 * React-style state hook backed by the persistent RamStore.
 *
 * Creates (or reuses) a keyed state value that survives re-renders.
 * Returns a reactive value object, a setter, and a subscribe function.
 *
 * @param {string} key - Unique key used to store and retrieve the state value.
 * @param {*|Function} initialState - Initial value, or a factory function that returns it.
 * @param {Object|null} [widget=null] - Optional widget to auto-update when state changes.
 * @param {string|null} [propName=null] - The prop name on the widget to receive the new value.
 * @returns {[Object, Function, Function]} Tuple of [reactiveValue, setState, subscribe].
 *
 * @example
 * const [count, setCount, onCount] = useState('counter', 0);
 * setCount(count + 1);
 * onCount((newVal) => console.log('Counter changed to', newVal));
 */
export const useState = (key, initialState, widget = null, propName = null) => {
  // Initialize the state in RamStore if it does not exist yet
  let currentValue = getRam(key);
  if (currentValue === undefined || currentValue === null) {
    currentValue =
      typeof initialState === "function" ? initialState() : initialState;
    saveRam(key, currentValue);
  }

  // Set up a single RamStore subscriber per key
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());

    // Listen to RamStore changes for this key
    const unsubscribe = subscribeRam((changedKey, newValue, oldValue) => {
      if (changedKey === key) {
        // 🔥 Push the new value to all registered widgets for this key
        const widgets = widgetsByKey.get(key);
        if (widgets) {
          widgets.forEach(({ widget, propName }) => {
            if (widget && widget.update) {
              widget.update({ [propName]: newValue });
            }
          });
        }

        // Notify all subscriber callbacks
        const callbacks = subscribers.get(key);
        callbacks.forEach((callback) => callback(newValue, oldValue));

        // Trigger a global re-render
        triggerRender();
      }
    });

    // Track the unsubscribe handle for hot-reload cleanup
    if (!window._useStateCleanups) window._useStateCleanups = [];
    window._useStateCleanups.push(unsubscribe);
  }

  // 🔥 Register the widget for automatic updates if one was provided
  if (widget && propName) {
    registerWidget(key, widget, propName);
  }

  /**
   * Updates the state value. Accepts either a new value directly or an updater
   * function that receives the current value and returns the next value.
   *
   * @param {*|Function} newValueOrUpdater - New value or `(prevValue) => nextValue` updater.
   * @returns {void}
   */
  const setState = (newValueOrUpdater) => {
    const oldValue = currentValue;
    let newValue;

    if (typeof newValueOrUpdater === "function") {
      newValue = newValueOrUpdater(oldValue);
    } else {
      newValue = newValueOrUpdater;
    }

    if (oldValue !== newValue) {
      currentValue = newValue;
      saveRam(key, currentValue);
    }
  };

  /**
   * Subscribes a callback to state changes for this key.
   *
   * @param {Function} callback - Called with `(newValue, oldValue)` on every change.
   * @returns {Function} Unsubscribe function.
   */
  const subscribe = (callback) => {
    if (!subscribers.has(key)) {
      subscribers.set(key, new Set());
    }
    subscribers.get(key).add(callback);
    return () => {
      if (subscribers.has(key)) {
        subscribers.get(key).delete(callback);
      }
    };
  };

  // 🔥 Create a reactive value object so WidgetFactory can detect state bindings automatically
  const reactiveValue = {
    _isReactive: true,
    _stateKey: key,
    _value: currentValue,
    valueOf() {
      return this._value;
    },
    toString() {
      return String(this._value);
    },
  };

  // Return an array matching React's useState pattern: [value, setter, subscriber]
  return [reactiveValue, setState, subscribe];
};

/**
 * Watches a state key and invokes the callback whenever its value changes.
 * Useful for side effects that should not trigger a full re-render.
 *
 * @param {string} key - The state key to watch.
 * @param {Function} callback - Called with `(newValue, oldValue)` on every change.
 * @returns {Function} Unsubscribe function.
 */
export const useWatchState = (key, callback) => {
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());
  }
  subscribers.get(key).add(callback);
  return () => subscribers.get(key).delete(callback);
};

/**
 * Cleans up all state subscriptions, widget registrations, and pending render
 * timers. Should be called during hot-reload to reset the module to a clean state.
 *
 * @returns {void}
 */
export const cleanupUseState = () => {
  if (window._useStateCleanups) {
    window._useStateCleanups.forEach((cleanup) => {
      if (typeof cleanup === "function") cleanup();
    });
    window._useStateCleanups = [];
  }
  subscribers.clear();
  widgetsByKey.clear();
  globalRender = null;
  if (renderTimeout) clearTimeout(renderTimeout);
};

/**
 * Returns diagnostic statistics about the current state of the useState module.
 * Useful for debugging subscription leaks or widget registration issues.
 *
 * @returns {{ subscribersCount: number, widgetsCount: number, globalRender: boolean }}
 */
export const getUseStateStats = () => {
  return {
    subscribersCount: subscribers.size,
    widgetsCount: widgetsByKey.size,
    globalRender: !!globalRender,
  };
};

// Re-export RamStore functions under convenience aliases
export {
  saveRam as saveState,
  getRam as getState,
  subscribeRam as subscribeState,
};
