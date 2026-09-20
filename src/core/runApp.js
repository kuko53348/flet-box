// core/runApp.js
import { stopWebRefresh } from "../utils/stopWebRefresh.js";
import { initRouter } from "../navigations/Router.js"; // ← IMPORTANT: add this line
import {
  applySystemTheme,
  watchSystemTheme,
  colors,
  subscribeTheme,
} from "../utils/themes.js";
import { Container } from "../widgets/Container.js";
import { setGlobalRender } from "../tools/useState.js";

/**
 * Mounts a FletBox application into the DOM and manages its full lifecycle.
 *
 * Sets up the root container, applies the system theme, initialises the router
 * (when routes are provided), and subscribes to theme changes so the app
 * re-renders automatically whenever the user switches between light/dark mode.
 *
 * @param {Function|HTMLElement} App - The root component factory function, or a
 *   pre-built HTMLElement to mount directly.
 * @param {string} [rootId="root"] - The id of the DOM element that will host
 *   the application.
 * @param {boolean} [preventRefresh=true] - When true, browser-level page refresh
 *   is suppressed (feature currently disabled but kept for API compatibility).
 * @param {Object|null} [routes=null] - Route map passed to `initRouter`. When
 *   null, no router is initialised.
 * @returns {{ destroy: Function }} A handle with a `destroy()` method that
 *   tears down the app cleanly (unsubscribes theme listeners, removes DOM nodes).
 */
export const runApp = (
  App,
  rootId = "root",
  preventRefresh = true,
  routes = null,
) => {
  const root = document.getElementById(rootId);
  if (!root) return;

  // If preventRefresh is true (default), we disable refreshes
  // if (preventRefresh) {
  //     stopWebRefresh();
  // }

  let currentMainContainer = null;
  let unsubscribeTheme = null;
  let unwatchSystemTheme = null;

  /**
   * Recursively releases the resources of the entire widget tree before
   * rebuilding it.
   *
   * The core `_cleanup` method is NOT recursive and the MutationObserver does
   * not invoke it, so without this sweep each re-render (setState / theme
   * change) would leak listeners, rAF handles, and timers from descendant
   * widgets. It also fires `onUnmount` handlers (Slider/ListView release
   * there) before each widget's own `_cleanup`.
   *
   * @param {HTMLElement|null} rootEl - The root element of the tree to tear down.
   */
  const teardownTree = (rootEl) => {
    if (!rootEl) return;
    const walk = (el) => {
      const kids = el.children ? Array.from(el.children) : [];
      for (const kid of kids) walk(kid);
      if (Array.isArray(el._unmountFns) && el._unmountFns.length) {
        const fns = el._unmountFns;
        el._unmountFns = [];
        for (const fn of fns) {
          try {
            fn(el);
          } catch (_) {}
        }
      }
      if (typeof el._cleanup === "function") {
        try {
          el._cleanup();
        } catch (_) {}
      }
    };
    walk(rootEl);
  };

  /**
   * Builds the application tree and appends it to the root DOM node.
   *
   * Tears down the previous container (if any) before creating the new one so
   * that every re-render starts from a clean state.
   */
  const renderApp = () => {
    if (currentMainContainer) {
      teardownTree(currentMainContainer);
      if (currentMainContainer.parentNode) currentMainContainer.remove();
      currentMainContainer = null;
    }

    const appContent = typeof App === "function" ? App() : App;

    const mainContainer = Container({
      margin: 0,
      padding: 0,
      width: "100vw", // ← 100% of the viewport
      minHeight: "100vh", // ← 100% of the viewport
      display: "flex",
      flexDirection: "column",
      backgroundColor: colors.background,
      color: colors.text,
      transition: "background-color 0.3s ease, color 0.3s ease",
      child: appContent,
    });

    root.appendChild(mainContainer);
    if (mainContainer.triggerMount) mainContainer.triggerMount();
    currentMainContainer = mainContainer;
  };

  // Register renderApp as the global re-render callback so that setState calls
  // anywhere in the tree can trigger a full rebuild.
  setGlobalRender(() => {
    renderApp();
  });

  applySystemTheme();
  unwatchSystemTheme = watchSystemTheme();

  root.style.margin = "0";
  root.style.padding = "0";
  root.style.width = "100vw"; // ← 100% of the viewport
  root.style.minHeight = "100vh"; // ← 100% of the viewport
  root.style.display = "flex";
  root.style.flexDirection = "column";
  root.style.backgroundColor = colors.background;
  root.style.color = colors.text;
  root.style.transition = "background-color 0.3s ease, color 0.3s ease";

  // Release any previous tree (e.g. from a prior runApp call or HMR) before clearing.
  Array.from(root.children).forEach((child) => teardownTree(child));
  root.innerHTML = "";

  // 🔥 INITIALIZE ROUTER if routes are provided
  if (routes) {
    initRouter(routes);
  }

  renderApp();

  // The theme subscription lives in runApp's scope (NOT attached to a
  // transient container), because renderApp() rebuilds the container on every
  // change. If it were attached to the first container it would auto-cancel
  // after a single use.
  unsubscribeTheme = subscribeTheme(() => {
    root.style.backgroundColor = colors.background;
    root.style.color = colors.text;
    renderApp();
  });

  // Teardown handle — lets callers unmount the app cleanly.
  return {
    /**
     * Unmounts the application: cancels theme subscriptions, stops the system
     * theme watcher, and removes the container from the DOM.
     */
    destroy: () => {
      if (unsubscribeTheme) {
        unsubscribeTheme();
        unsubscribeTheme = null;
      }
      if (unwatchSystemTheme) {
        unwatchSystemTheme();
        unwatchSystemTheme = null;
      }
      if (currentMainContainer) {
        teardownTree(currentMainContainer);
        if (currentMainContainer.parentNode) currentMainContainer.remove();
        currentMainContainer = null;
      }
    },
  };
};

/**
 * Appends a widget to the end of a root DOM element and triggers its mount
 * lifecycle.
 *
 * @param {HTMLElement} widget - The widget element to insert.
 * @param {string} [rootId="root"] - The id of the container element.
 * @returns {HTMLElement} The same widget that was passed in.
 */
export const insertBy = (widget, rootId = "root") => {
  const root = document.getElementById(rootId);
  if (root && widget instanceof HTMLElement) {
    root.appendChild(widget);
    if (widget.triggerMount) widget.triggerMount();
  }
  return widget;
};

/**
 * Prepends a widget to the beginning of a root DOM element and triggers its
 * mount lifecycle.
 *
 * @param {HTMLElement} widget - The widget element to prepend.
 * @param {string} [rootId="root"] - The id of the container element.
 * @returns {HTMLElement} The same widget that was passed in.
 */
export const prependBy = (widget, rootId = "root") => {
  const root = document.getElementById(rootId);
  if (root && widget instanceof HTMLElement) {
    root.insertBefore(widget, root.firstChild);
    if (widget.triggerMount) widget.triggerMount();
  }
  return widget;
};

/**
 * Inserts a widget immediately before a target element and triggers its mount
 * lifecycle.
 *
 * @param {HTMLElement} widget - The widget element to insert.
 * @param {string} targetId - The id of the reference element.
 * @returns {HTMLElement} The same widget that was passed in.
 */
export const insertBefore = (widget, targetId) => {
  const target = document.getElementById(targetId);
  if (target && target.parentNode && widget instanceof HTMLElement) {
    target.parentNode.insertBefore(widget, target);
    if (widget.triggerMount) widget.triggerMount();
  }
  return widget;
};

/**
 * Inserts a widget immediately after a target element and triggers its mount
 * lifecycle.
 *
 * @param {HTMLElement} widget - The widget element to insert.
 * @param {string} targetId - The id of the reference element.
 * @returns {HTMLElement} The same widget that was passed in.
 */
export const insertAfter = (widget, targetId) => {
  const target = document.getElementById(targetId);
  if (target && target.parentNode && widget instanceof HTMLElement) {
    target.parentNode.insertBefore(widget, target.nextSibling);
    if (widget.triggerMount) widget.triggerMount();
  }
  return widget;
};

/**
 * Replaces a target element with a widget and triggers its mount lifecycle.
 *
 * @param {HTMLElement} widget - The widget element to insert in place of the target.
 * @param {string} targetId - The id of the element to be replaced.
 * @returns {HTMLElement} The same widget that was passed in.
 */
export const replaceBy = (widget, targetId) => {
  const target = document.getElementById(targetId);
  if (target && target.parentNode && widget instanceof HTMLElement) {
    target.parentNode.replaceChild(widget, target);
    if (widget.triggerMount) widget.triggerMount();
  }
  return widget;
};

/**
 * Clones a widget into multiple root elements and triggers the mount lifecycle
 * on each clone.
 *
 * @param {HTMLElement} widget - The widget to clone and mount.
 * @param {string[]} rootIds - An array of element ids to mount the widget into.
 * @returns {HTMLElement} The original (un-cloned) widget.
 */
export const mountAll = (widget, rootIds) => {
  rootIds.forEach((id) => {
    const root = document.getElementById(id);
    if (root && widget instanceof HTMLElement) {
      const clone = widget.cloneNode(true);
      root.appendChild(clone);
      if (clone.triggerMount) clone.triggerMount();
    }
  });
  return widget;
};

/**
 * Creates a router-based application instance without immediately rendering a
 * component tree.
 *
 * Useful when the entry point is entirely route-driven and there is no single
 * top-level component to pass to `runApp`.
 *
 * @param {Object} routes - Route map passed to `initRouter`.
 * @param {Object} [options={}] - Configuration options.
 * @param {string} [options.rootId="root"] - The id of the host DOM element.
 * @param {Function|HTMLElement|null} [options.fallback=null] - An optional
 *   element (or factory) to render while the router resolves the first route.
 * @returns {{ start: Function, destroy: Function }} An object with `start()` to
 *   bootstrap the app and `destroy()` to tear it down.
 */
export const createApp = (routes, options = {}) => {
  const { rootId = "root", fallback = null } = options;

  const root = document.getElementById(rootId);
  if (root) {
    root.style.margin = "0";
    root.style.padding = "0";
    root.style.width = "100%";
    root.style.minHeight = "100vh";
    root.style.display = "flex";
    root.style.flexDirection = "column";
  }

  return {
    /**
     * Bootstraps the application: applies the system theme, starts the theme
     * watcher, initialises the router, and renders the fallback element (if any).
     */
    start: () => {
      applySystemTheme();
      watchSystemTheme();
      initRouter(routes);
      const root = document.getElementById(rootId);
      if (root && fallback) {
        root.innerHTML = "";
        const fallbackEl =
          typeof fallback === "function" ? fallback() : fallback;
        if (fallbackEl instanceof HTMLElement) root.appendChild(fallbackEl);
      }
    },
    /**
     * Clears the root element, effectively unmounting the application.
     */
    destroy: () => {
      const root = document.getElementById(rootId);
      if (root) root.innerHTML = "";
    },
  };
};

export default runApp;
