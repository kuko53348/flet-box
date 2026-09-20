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

  // Recursively releases the resources of the whole tree before rebuilding it.
  // The core `_cleanup` is NOT recursive and the MutationObserver does not invoke it,
  // so without this sweep each re-render (setState / theme change) would leak
  // the listeners/rAF/timers of the descendants. It also fires the
  // onUnmount handlers (Slider/ListView release there) before each widget's `_cleanup`.
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

  // Release any previous tree (e.g. from a prior runApp / HMR) before clearing.
  Array.from(root.children).forEach((child) => teardownTree(child));
  root.innerHTML = "";

  // 🔥 INITIALIZE ROUTER if routes are provided
  if (routes) {
    initRouter(routes);
  }

  renderApp();

  // The theme subscription lives in runApp's scope (NOT attached to a
  // transient container), because renderApp() rebuilds the container on every
  // change; if it were attached to the first container, it would auto-cancel after one use.
  unsubscribeTheme = subscribeTheme(() => {
    root.style.backgroundColor = colors.background;
    root.style.color = colors.text;
    renderApp();
  });

  // Teardown handle to unmount the app cleanly.
  return {
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

// Remaining helper functions (insertBy, prependBy, etc.) stay the same
export const insertBy = (widget, rootId = "root") => {
  const root = document.getElementById(rootId);
  if (root && widget instanceof HTMLElement) {
    root.appendChild(widget);
    if (widget.triggerMount) widget.triggerMount();
  }
  return widget;
};

export const prependBy = (widget, rootId = "root") => {
  const root = document.getElementById(rootId);
  if (root && widget instanceof HTMLElement) {
    root.insertBefore(widget, root.firstChild);
    if (widget.triggerMount) widget.triggerMount();
  }
  return widget;
};

export const insertBefore = (widget, targetId) => {
  const target = document.getElementById(targetId);
  if (target && target.parentNode && widget instanceof HTMLElement) {
    target.parentNode.insertBefore(widget, target);
    if (widget.triggerMount) widget.triggerMount();
  }
  return widget;
};

export const insertAfter = (widget, targetId) => {
  const target = document.getElementById(targetId);
  if (target && target.parentNode && widget instanceof HTMLElement) {
    target.parentNode.insertBefore(widget, target.nextSibling);
    if (widget.triggerMount) widget.triggerMount();
  }
  return widget;
};

export const replaceBy = (widget, targetId) => {
  const target = document.getElementById(targetId);
  if (target && target.parentNode && widget instanceof HTMLElement) {
    target.parentNode.replaceChild(widget, target);
    if (widget.triggerMount) widget.triggerMount();
  }
  return widget;
};

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
    destroy: () => {
      const root = document.getElementById(rootId);
      if (root) root.innerHTML = "";
    },
  };
};

export default runApp;
