// src/tools/useState.js
import { saveRam, getRam, subscribeRam } from "../services/RamStore.js";
import {
  createReactiveValue,
  isStructuralRead,
  resetStructuralReads,
} from "../widget-factory/reactiveValue.js";

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

let ramDispatcherReady = false;

/**
 * Installs **one** RamStore subscriber that dispatches to the widgets and
 * callbacks registered for the key that actually changed.
 *
 * RamStore walks a flat subscriber array on every `saveRam`, so registering one
 * subscriber per key made a single state change cost O(number of keys) — with
 * every callback immediately rejecting the key. One dispatcher makes the lookup
 * O(1), and the work proportional to what the key really has bound.
 *
 * @returns {void}
 */
const ensureRamDispatcher = () => {
  if (ramDispatcherReady) return;
  ramDispatcherReady = true;

  const unsubscribe = subscribeRam((changedKey, newValue, oldValue) => {
    const callbacks = subscribers.get(changedKey);
    // A key nobody ever passed to `useState` has no listeners: ignore it.
    if (!callbacks) return;

    // 1. Surgical update: patch only the widgets bound to this key.
    const bound = widgetsByKey.get(changedKey);
    let handled = 0;
    if (bound) {
      bound.forEach((propNames, widget) => {
        if (!widget || typeof widget.update !== "function") return;
        propNames.forEach((propName) => {
          widget.update({ [propName]: newValue });
          handled++;
        });
      });
    }

    // 2. Notify the manual subscribers.
    callbacks.forEach((callback) => callback(newValue, oldValue));

    // 3. Re-render the app when nothing was bound, or when the last render pass
    // also read this key structurally (a template literal, a conditional, a
    // list): the surgical patch above cannot change what the component computes.
    if (handled === 0 || isStructuralRead(changedKey)) triggerRender();
  });

  if (typeof window !== "undefined") {
    if (!window._useStateCleanups) window._useStateCleanups = [];
    window._useStateCleanups.push(unsubscribe);
  }
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
  // Two levels — key -> widget -> prop names — so looking a widget up is O(1).
  // A flat Set with a linear scan made registering N widgets on the same key
  // O(N^2): 1,600 widgets on one key cost ~44 ms.
  let perWidget = widgetsByKey.get(key);
  if (!perWidget) {
    perWidget = new Map();
    widgetsByKey.set(key, perWidget);
  }
  let propNames = perWidget.get(widget);
  if (!propNames) {
    propNames = new Set();
    perWidget.set(widget, propNames);
  }
  // Idempotent: rebuilding the same widget position must not stack duplicates.
  const already = propNames.has(propName);
  propNames.add(propName);

  // Push the current value straight away when the widget can already take it.
  // (During construction `update` does not exist yet — the value has just been
  // applied by the factory, so there is nothing to push.)
  const currentValue = getRam(key);
  if (currentValue !== undefined && widget && widget.update) {
    widget.update({ [propName]: currentValue });
  }

  if (already) return;

  // Release the binding through `onUnmount`, which the framework fires on BOTH
  // teardown paths. Patching `_cleanup` (the previous approach) leaked: the
  // lifecycle observer never calls `_cleanup`, so a widget removed without a full
  // app rebuild stayed registered forever and kept receiving updates.
  const release = () => {
    const perWidget = widgetsByKey.get(key);
    const props = perWidget && perWidget.get(widget);
    if (!props) return;
    props.delete(propName);
    if (props.size === 0) perWidget.delete(widget);
    if (perWidget.size === 0) widgetsByKey.delete(key);
  };

  // The factory installs lifecycle hooks before it binds reactive props, so a
  // widget reaching this point always owns `onUnmount`.
  widget.onUnmount(release);
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
  const existing = getRam(key);
  if (existing === undefined || existing === null) {
    saveRam(
      key,
      typeof initialState === "function" ? initialState() : initialState,
    );
  }

  // Register the key so the shared dispatcher knows it has listeners. Previously
  // every key installed its OWN RamStore subscriber, and RamStore notifies all of
  // them on every save — so one state change cost O(number of keys), each callback
  // rejecting the key immediately. One dispatcher makes it O(1) + the work for the
  // key that actually changed.
  if (!subscribers.has(key)) subscribers.set(key, new Set());
  ensureRamDispatcher();

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
    // Read the store rather than a value captured when the hook ran: a setter
    // kept across renders would otherwise compare against a stale `oldValue` and
    // skip the dispatch when an external `saveState` had already moved the key to
    // the value being set — leaving the store, the widgets and the callbacks
    // disagreeing about what the state is.
    const oldValue = getRam(key);
    const newValue =
      typeof newValueOrUpdater === "function"
        ? newValueOrUpdater(oldValue)
        : newValueOrUpdater;

    if (oldValue !== newValue) saveRam(key, newValue);
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
      subscribers.get(key)?.delete(callback);
    };
  };

  // 🔥 A LIVE reactive value: reads the store on every access (so it never goes
  // stale) and carries the key, so WidgetFactory can auto-bind any prop it is
  // passed to. That binding is what makes a state change update **only the widget
  // that uses it** instead of rebuilding the app.
  const reactiveValue = createReactiveValue(() => getRam(key), key);

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
  return () => {
    subscribers.get(key)?.delete(callback);
  };
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
  resetStructuralReads();
  // The dispatcher was unsubscribed above, so a later call must reinstall it.
  ramDispatcherReady = false;
  globalRender = null;
  if (renderTimeout) clearTimeout(renderTimeout);
};

/**
 * Returns diagnostic statistics about the current state of the useState module.
 * Useful for debugging subscription leaks or widget registration issues.
 *
 * @returns {{ stateKeys: number, boundWidgets: number, watchers: number, globalRender: boolean }}
 */
export const getUseStateStats = () => {
  // `widgetsByKey` maps key -> widget -> prop names, so its size is the number of
  // watched *keys*, not of widgets. Count one per widget.
  let boundWidgets = 0;
  let watchers = 0;
  widgetsByKey.forEach((perWidget) => {
    boundWidgets += perWidget.size;
  });
  subscribers.forEach((callbacks) => {
    watchers += callbacks.size;
  });
  return {
    stateKeys: subscribers.size,
    boundWidgets,
    watchers,
    globalRender: !!globalRender,
  };
};

// Re-export RamStore functions under convenience aliases
export {
  saveRam as saveState,
  getRam as getState,
  subscribeRam as subscribeState,
};
