/**
 * @file lifecycle.js
 * @description
 * Lifecycle management for widgets via a shared MutationObserver.
 *
 * A single global observer watches `document.body` for DOM mutations and
 * triggers mount / unmount callbacks on all registered widgets. Widgets are
 * automatically pruned from the registry when they are permanently removed from
 * the DOM, preventing memory leaks.
 *
 * Exported API:
 * - `addLifecycle(widget)` – attaches lifecycle hooks to a widget.
 * - `reregister(widget)` – re-adds a previously pruned (never-mounted) widget.
 * - `_debugRegistrySize()` – internal diagnostic helper (not part of public API).
 */

const registeredWidgets = new Set();
let globalObserver = null;

/**
 * Internal diagnostic hook (not part of the public API).
 * Allows tests to assert that the registry is pruned correctly and has no leaks.
 *
 * @returns {number} Current number of widgets in the lifecycle registry.
 */
export const _debugRegistrySize = () => registeredWidgets.size;

/**
 * Disconnects the global MutationObserver when there are no more widgets to
 * observe. Called after every registry deletion to avoid idle overhead.
 *
 * @returns {void}
 */
const stopObserverIfIdle = () => {
  if (registeredWidgets.size === 0 && globalObserver) {
    globalObserver.disconnect();
    globalObserver = null;
  }
};

/**
 * Iterates over all registered widgets and fires mount or unmount callbacks
 * based on each widget's current connection state.
 *
 * Pruning strategy:
 * - A widget that is disconnected after being mounted is unmarked and its
 *   unmount callbacks are fired. A `setTimeout(0)` defers the actual registry
 *   deletion so synchronous reparenting (e.g. drag-and-drop) does not
 *   accidentally unregister a widget that is immediately re-attached.
 * - A widget that was created but never mounted and is still disconnected
 *   (`_orphanScheduled`) is removed from the registry after one tick without
 *   clearing its handlers, allowing a late `appendChild` to re-mount it via
 *   `reregister`.
 *
 * @returns {void}
 */
const checkAllStates = () => {
  registeredWidgets.forEach((widget) => {
    const isConnected = document.body.contains(widget);
    if (isConnected && !widget._mounted) {
      widget._mounted = true;
      widget._orphanScheduled = false;
      widget._mountFns.forEach((fn) => fn(widget));
    } else if (!isConnected && widget._mounted) {
      widget._mounted = false;
      widget._unmountFns.forEach((fn) => fn(widget));

      // Prune: if the widget is still disconnected after this tick, its lifecycle
      // is complete. Remove it from the registry to avoid O(n) sweeps and leaks.
      // The setTimeout lets synchronous reparenting (drag & drop) complete first.
      setTimeout(() => {
        if (!document.body.contains(widget)) {
          registeredWidgets.delete(widget);
          widget._mountFns = [];
          widget._unmountFns = [];
          stopObserverIfIdle();
        }
      }, 0);
    } else if (!isConnected && !widget._mounted && !widget._orphanScheduled) {
      // Orphan prune: widget was created but never mounted and is still
      // disconnected. Remove it from the registry without clearing handlers so
      // that a late appendChild → reregister can still mount it.
      widget._orphanScheduled = true;
      setTimeout(() => {
        widget._orphanScheduled = false;
        if (!widget._mounted && !document.body.contains(widget)) {
          registeredWidgets.delete(widget);
          stopObserverIfIdle();
        }
      }, 0);
    }
  });
};

/**
 * Starts the global MutationObserver if it is not already running.
 * Observes `document.body` for child-list mutations at any depth.
 *
 * @returns {void}
 */
const ensureObserver = () => {
  if (!globalObserver && typeof MutationObserver !== "undefined" && document.body) {
    globalObserver = new MutationObserver(checkAllStates);
    globalObserver.observe(document.body, { childList: true, subtree: true });
  }
};

/**
 * Attaches lifecycle hooks to a widget and registers it with the global
 * MutationObserver.
 *
 * After this call the widget exposes:
 * - `onMount(fn)` – registers a callback fired when the widget is inserted into
 *   the live DOM.
 * - `onUnmount(fn)` – registers a callback fired when the widget is removed from
 *   the live DOM.
 * - `triggerMount()` – synchronously fires mount callbacks if the widget is
 *   already connected (useful when called right after `appendChild`). The
 *   observer will not duplicate the call because `_mounted` is set to `true`.
 * - `_cleanup()` – removes the widget from the registry and disconnects the
 *   observer if the registry becomes empty.
 *
 * @param {HTMLElement} widget - The widget to attach lifecycle hooks to.
 * @returns {HTMLElement} The same widget (for chaining).
 */
export const addLifecycle = (widget) => {
  widget._mountFns = [];
  widget._unmountFns = [];
  widget._mounted = false;

  widget.onMount = (fn) => typeof fn === "function" && widget._mountFns.push(fn);
  widget.onUnmount = (fn) => typeof fn === "function" && widget._unmountFns.push(fn);

  /**
   * Synchronously fires mount callbacks when the widget is already in the DOM.
   * `runApp` / `insertBy` call this immediately after appending the widget so
   * consumers get the mount event without waiting for the observer's next tick.
   * The observer does not duplicate the call because `_mounted` is already `true`.
   *
   * @returns {HTMLElement} The widget itself (for chaining).
   */
  widget.triggerMount = () => {
    if (!widget._mounted && document.body.contains(widget)) {
      widget._mounted = true;
      widget._mountFns.forEach((fn) => fn(widget));
    }
    return widget;
  };

  ensureObserver();
  registeredWidgets.add(widget);
  queueMicrotask(checkAllStates);

  /**
   * Removes the widget from the lifecycle registry and stops the observer if
   * the registry becomes empty. Clears all mount and unmount callbacks.
   *
   * @returns {void}
   */
  widget._cleanup = () => {
    registeredWidgets.delete(widget);
    stopObserverIfIdle();
    widget._mountFns = [];
    widget._unmountFns = [];
  };

  return widget;
};

/**
 * Re-registers a previously pruned (never-mounted) widget into the lifecycle
 * registry. Intended to be called when a widget that was built before being
 * appended to the DOM is finally attached via `appendChild`.
 *
 * No-ops when the widget is already mounted or already in the registry.
 *
 * @param {HTMLElement} widget - The widget to re-register.
 * @returns {void}
 */
export const reregister = (widget) => {
  if (!widget || widget._mounted) return;
  if (registeredWidgets.has(widget)) return;
  widget._orphanScheduled = false;
  ensureObserver();
  registeredWidgets.add(widget);
  queueMicrotask(checkAllStates);
};
