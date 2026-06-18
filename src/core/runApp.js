// core/runApp.js
import { stopWebRefresh } from "../utils/stopWebRefresh.js";
import { initRouter } from "../navigations/Router.js"; // ← IMPORTANTE: añadir esta línea
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

  // Si preventRefresh es true (por defecto), deshabilitamos los refrescos
  // if (preventRefresh) {
  //     stopWebRefresh();
  // }

  let currentMainContainer = null;
  let currentUnsubscribe = null;

  setGlobalRender(() => {
    renderApp();
  });

  const renderApp = () => {
    if (currentMainContainer && currentMainContainer.parentNode) {
      if (currentMainContainer._cleanup) currentMainContainer._cleanup();
      currentMainContainer.remove();
    }
    if (currentUnsubscribe) {
      currentUnsubscribe();
      currentUnsubscribe = null;
    }

    const appContent = typeof App === "function" ? App() : App;

    const mainContainer = Container({
      margin: 0,
      padding: 0,
      width: "100vw", // ← 100% del viewport
      minHeight: "100vh", // ← 100% del viewport
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

  applySystemTheme();
  watchSystemTheme();

  root.style.margin = "0";
  root.style.padding = "0";
  root.style.width = "100vw"; // ← 100% del viewport
  root.style.minHeight = "100vh"; // ← 100% del viewport
  root.style.display = "flex";
  root.style.flexDirection = "column";
  root.style.backgroundColor = colors.background;
  root.style.color = colors.text;
  root.style.transition = "background-color 0.3s ease, color 0.3s ease";
  root.innerHTML = "";

  // 🔥 INICIALIZAR ROUTER si se proporcionan rutas
  if (routes) {
    initRouter(routes);
  }

  renderApp();

  const unsubscribeTheme = subscribeTheme(() => {
    root.style.backgroundColor = colors.background;
    root.style.color = colors.text;
    renderApp();
  });

  const originalCleanup = currentMainContainer?._cleanup;
  if (currentMainContainer) {
    currentMainContainer._cleanup = () => {
      if (unsubscribeTheme) unsubscribeTheme();
      if (originalCleanup) originalCleanup();
    };
  }
};

// Resto de funciones auxiliares (insertBy, prependBy, etc.) se mantienen igual
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
