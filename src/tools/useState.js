// src/tools/useState.js
import { saveRam, getRam, subscribeRam } from "../services/RamStore.js";

// Store callbacks for each state key
const subscribers = new Map();

// 🔥 Store widgets by state key for automatic updates
const widgetsByKey = new Map();

// Global render function (set by runApp)
let globalRender = null;
let renderTimeout = null;

export const setGlobalRender = (renderFn) => {
  globalRender = renderFn;
};

// Debounced render to avoid multiple renders in rapid succession
const triggerRender = () => {
  if (renderTimeout) clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    if (globalRender) globalRender();
  }, 0);
};

// 🔥 Register a widget for automatic updates when state changes
export const registerWidget = (key, widget, propName) => {
  if (!widgetsByKey.has(key)) {
    widgetsByKey.set(key, new Set());
  }
  widgetsByKey.get(key).add({ widget, propName });

  // Set initial value if needed
  const currentValue = getRam(key);
  if (currentValue !== undefined && widget && widget.update) {
    widget.update({ [propName]: currentValue });
  }

  // Cleanup when widget is destroyed
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

// 🔥 Unregister a widget
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

export const useState = (key, initialState, widget = null, propName = null) => {
  // Initialize if not exists
  let currentValue = getRam(key);
  if (currentValue === undefined || currentValue === null) {
    currentValue =
      typeof initialState === "function" ? initialState() : initialState;
    saveRam(key, currentValue);
  }

  // Setup subscriber for this key only once
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());

    // Listen to RamStore changes
    const unsubscribe = subscribeRam((changedKey, newValue, oldValue) => {
      if (changedKey === key) {
        // 🔥 Update all registered widgets for this key
        const widgets = widgetsByKey.get(key);
        if (widgets) {
          widgets.forEach(({ widget, propName }) => {
            if (widget && widget.update) {
              widget.update({ [propName]: newValue });
            }
          });
        }

        // Notify all callbacks
        const callbacks = subscribers.get(key);
        callbacks.forEach((callback) => callback(newValue, oldValue));

        // Trigger global re-render
        triggerRender();
      }
    });

    // Store unsubscribe for cleanup
    if (!window._useStateCleanups) window._useStateCleanups = [];
    window._useStateCleanups.push(unsubscribe);
  }

  // 🔥 Register widget if provided
  if (widget && propName) {
    registerWidget(key, widget, propName);
  }

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

  // 🔥 Create reactive value object for automatic detection by WidgetFactory
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

  // Return array matching React's useState pattern
  return [reactiveValue, setState, subscribe];
};

export const useWatchState = (key, callback) => {
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());
  }
  subscribers.get(key).add(callback);
  return () => subscribers.get(key).delete(callback);
};

// Cleanup function for hot reload
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

// Get stats for debugging
export const getUseStateStats = () => {
  return {
    subscribersCount: subscribers.size,
    widgetsCount: widgetsByKey.size,
    globalRender: !!globalRender,
  };
};

// Re-export existing RamStore functions for convenience
export {
  saveRam as saveState,
  getRam as getState,
  subscribeRam as subscribeState,
};
