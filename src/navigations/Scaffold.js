// navigations/Scaffold.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { initRouter, getCurrentRoute, subscribe } from "./Router.js";

/**
 * @typedef {Object} ScaffoldProps
 * @property {HTMLElement|Function} [appBar] - Top app bar widget or factory function.
 * @property {HTMLElement|Function|Object} [body] - Main content widget, factory function, or route map object.
 * @property {HTMLElement|Function} [bottomBar] - Bottom navigation bar widget or factory function.
 * @property {HTMLElement|Function} [fab] - Floating action button widget or factory function.
 * @property {Object} [drawer] - Drawer instance (created via the Drawer component).
 * @property {HTMLElement|Function} [leftNavBar] - Persistent left sidebar widget or factory function.
 * @property {number} [leftNavBarWidth=260] - Width of the left sidebar in pixels.
 * @property {HTMLElement|Function} [rightNavBar] - Persistent right sidebar widget or factory function.
 * @property {number} [rightNavBarWidth=260] - Width of the right sidebar in pixels.
 * @property {HTMLElement|Function} [navSideBar] - Legacy alias for leftNavBar (deprecated).
 * @property {number} [navSideBarWidth=260] - Legacy alias for leftNavBarWidth (deprecated).
 * @property {"left"|"right"} [navSideBarPosition="left"] - Legacy: which side navSideBar renders on.
 * @property {Object} [routes] - Route map object for router mode (path → component).
 * @property {string} [backgroundColor] - Background color of the scaffold shell.
 * @property {boolean} [closeDrawerOnNavigate=false] - Whether to close the drawer automatically on route change.
 */

/**
 * Scaffold is the top-level layout shell for a page or screen.
 *
 * It composes an optional AppBar, a scrollable body area, a bottom bar,
 * a floating action button, and optional persistent sidebars. It also
 * integrates with the Router module: when `routes` (or a route-map `body`)
 * is provided it initialises the router and re-renders the body on every
 * navigation event, optionally toggling per-route visibility of the AppBar,
 * bottom bar, FAB, and sidebars.
 *
 * @param {ScaffoldProps} props
 * @returns {HTMLElement} The scaffold container element, augmented with
 *   imperative control methods:
 *   - `openDrawer()` / `closeDrawer()` — programmatically show/hide the drawer.
 *   - `updateLeftNavBar(cfg)` / `updateRightNavBar(cfg)` — replace sidebar content.
 *   - `setLeftNavBarWidth(w)` / `setRightNavBarWidth(w)` — resize a sidebar at runtime.
 */
export const Scaffold = (props) => {
  const {
    appBar: originalAppBar,
    body,
    bottomBar: originalBottomBar,
    fab: originalFab,
    drawer,
    leftNavBar,
    leftNavBarWidth = 260,
    rightNavBar,
    rightNavBarWidth = 260,
    navSideBar, // legacy support
    navSideBarWidth = 260,
    navSideBarPosition = "left",
    routes,
    backgroundColor = colors.background,
    closeDrawerOnNavigate = false,
    ...rest
  } = props;

  let routesConfig = null;
  let isRouterMode = false;
  let unsubscribe = null;
  let drawerInstance = null;

  // Determine whether to operate in router mode.
  // Router mode is active when an explicit routes map or a plain-object body
  // (treated as a route map) is supplied.
  if (routes && typeof routes === "object" && Object.keys(routes).length > 0) {
    routesConfig = routes;
    isRouterMode = true;
  } else if (
    body &&
    typeof body === "object" &&
    !(body instanceof HTMLElement) &&
    !body.nodeType
  ) {
    routesConfig = body;
    isRouterMode = true;
  }

  // Bootstrap the router with the current browser URL so deep-links work
  // on first load without redirecting to "/".
  if (isRouterMode && routesConfig) {
    const currentUrl =
      typeof window !== "undefined" ? window.location.pathname : "/";
    initRouter(routesConfig, currentUrl);
  }

  // Resolve the legacy navSideBar prop to the appropriate side.
  let finalLeftNavBar = leftNavBar;
  let finalRightNavBar = rightNavBar;
  if (navSideBar && !leftNavBar && !rightNavBar) {
    if (navSideBarPosition === "right") {
      finalRightNavBar = navSideBar;
    } else {
      finalLeftNavBar = navSideBar;
    }
  }

  /**
   * Normalises a prop value to an HTMLElement.
   * Accepts an HTMLElement directly, a factory function, or null/undefined.
   *
   * @param {HTMLElement|Function|null} item
   * @returns {HTMLElement|null}
   */
  const toElement = (item) => {
    if (!item) return null;
    if (item instanceof HTMLElement) return item;
    if (typeof item === "function") return item();
    return item;
  };

  // Root container: full-viewport flex column that holds all layout zones.
  const container = WidgetFactory({
    tag: "div",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100vh",
    backgroundColor: backgroundColor,
    position: "relative",
    overflow: "hidden",
    ...rest.style,
    ...rest,
  });

  // Slot references — populated during buildStructure().
  let appBarContainer = null;
  let bottomBarContainer = null;
  let fabContainer = null;
  let leftNavBarContainer = null;
  let rightNavBarContainer = null;
  let mainContentContainer = null;

  let currentAppBar = null;

  /**
   * Removes all direct children from a container, calling their `_cleanup`
   * hook first to release subscriptions and event listeners.
   *
   * @param {HTMLElement|null} target
   */
  const clearContainer = (target) => {
    if (!target) return;
    while (target.firstChild) {
      const child = target.firstChild;
      if (typeof child._cleanup === "function") child._cleanup();
      target.removeChild(child);
    }
  };

  /**
   * Forces a widget to fill the available space inside the body area.
   * Necessary because body children must stretch to the flex container.
   *
   * @param {HTMLElement} widget
   * @returns {HTMLElement}
   */
  const makeFullSize = (widget) => {
    if (widget && widget.style) {
      widget.style.flex = "1";
      widget.style.width = "100%";
      widget.style.display = "flex";
      widget.style.flexDirection = "column";
      widget.style.minHeight = "0";
    }
    return widget;
  };

  /**
   * Replaces the content of the AppBar slot.
   * Pass `false` to hide the AppBar entirely; pass `true`/`undefined` to
   * render the original AppBar; pass an element/function to render a custom one.
   * Also wires the drawer open() to the AppBar's menu icon when a drawer is present.
   *
   * @param {boolean|HTMLElement|Function|undefined} cfg
   */
  const updateAppBar = (cfg) => {
    if (!appBarContainer) return;
    clearContainer(appBarContainer);
    if (cfg === false) {
      appBarContainer.style.display = "none";
      return;
    }
    appBarContainer.style.display = "block";
    const widget =
      cfg === true || cfg === undefined
        ? toElement(originalAppBar)
        : toElement(cfg);
    if (widget) {
      appBarContainer.appendChild(widget);
      currentAppBar = widget;
      // Auto-wire the first Material Icons "menu" icon to open the drawer,
      // so callers don't need to pass an explicit onPress handler.
      if (drawer && drawerInstance) {
        const menuIcon = widget.querySelector(".material-icons");
        if (menuIcon && menuIcon.textContent === "menu") {
          const oldClick = menuIcon.onclick;
          menuIcon.onclick = (e) => {
            e.stopPropagation();
            if (oldClick) oldClick(e);
            if (
              drawerInstance.open &&
              typeof drawerInstance.open === "function"
            ) {
              drawerInstance.open();
            } else if (drawerInstance.toggle) {
              drawerInstance.toggle();
            }
          };
        }
      }
    }
  };

  /**
   * Replaces the content of the bottom bar slot.
   * Pass `false` to hide it; `true`/`undefined` renders the original bottomBar prop.
   *
   * @param {boolean|HTMLElement|Function|undefined} cfg
   */
  const updateBottomBar = (cfg) => {
    if (!bottomBarContainer) return;
    clearContainer(bottomBarContainer);
    if (cfg === false) {
      bottomBarContainer.style.display = "none";
      return;
    }
    bottomBarContainer.style.display = "block";
    const widget =
      cfg === true || cfg === undefined
        ? toElement(originalBottomBar)
        : toElement(cfg);
    if (widget) bottomBarContainer.appendChild(widget);
  };

  /**
   * Replaces the content of the FAB slot.
   * Pass `false` to hide it; `true`/`undefined` renders the original fab prop.
   *
   * @param {boolean|HTMLElement|Function|undefined} cfg
   */
  const updateFab = (cfg) => {
    if (!fabContainer) return;
    clearContainer(fabContainer);
    if (cfg === false) {
      fabContainer.style.display = "none";
      return;
    }
    fabContainer.style.display = "block";
    const widget =
      cfg === true || cfg === undefined
        ? toElement(originalFab)
        : toElement(cfg);
    if (widget) fabContainer.appendChild(widget);
  };

  /**
   * Replaces the content of the left sidebar slot.
   * When a sidebar is shown, the main content area is narrowed accordingly.
   *
   * @param {boolean|HTMLElement|Function|undefined} cfg
   */
  const updateLeftBar = (cfg) => {
    if (!leftNavBarContainer) return;
    clearContainer(leftNavBarContainer);
    if (cfg === false) {
      leftNavBarContainer.style.display = "none";
      // Restore full width to the main content area.
      if (mainContentContainer) mainContentContainer.style.width = "";
      return;
    }
    leftNavBarContainer.style.display = "block";
    const widget =
      cfg === true || cfg === undefined
        ? toElement(finalLeftNavBar)
        : toElement(cfg);
    if (widget) {
      leftNavBarContainer.appendChild(widget);
      if (mainContentContainer)
        mainContentContainer.style.width = `calc(100% - ${leftNavBarWidth}px)`;
    }
  };

  /**
   * Replaces the content of the right sidebar slot.
   *
   * @param {boolean|HTMLElement|Function|undefined} cfg
   */
  const updateRightBar = (cfg) => {
    if (!rightNavBarContainer) return;
    clearContainer(rightNavBarContainer);
    if (cfg === false) {
      rightNavBarContainer.style.display = "none";
      return;
    }
    rightNavBarContainer.style.display = "block";
    const widget =
      cfg === true || cfg === undefined
        ? toElement(finalRightNavBar)
        : toElement(cfg);
    if (widget) rightNavBarContainer.appendChild(widget);
  };

  /**
   * Re-renders the body area for the current route (router mode) or static body.
   * In router mode, also updates the AppBar, bottom bar, FAB, and sidebars
   * according to per-route visibility configuration.
   */
  const updateBody = () => {
    if (!mainContentContainer) return;
    clearContainer(mainContentContainer);

    if (isRouterMode) {
      const routeConfig = getCurrentRoute();
      let route = routeConfig;
      let appBarCfg = true;
      let bottomBarCfg = true;
      let fabCfg = true;
      let leftBarCfg = true;
      let rightBarCfg = true;

      // A route entry can be a plain component or a config object with
      // per-route visibility overrides for shell zones.
      if (
        routeConfig &&
        typeof routeConfig === "object" &&
        !(routeConfig instanceof HTMLElement)
      ) {
        route = routeConfig.body || routeConfig;
        appBarCfg =
          routeConfig.appBar !== undefined ? routeConfig.appBar : true;
        bottomBarCfg =
          routeConfig.bottomBar !== undefined ? routeConfig.bottomBar : true;
        fabCfg = routeConfig.fab !== undefined ? routeConfig.fab : true;
        leftBarCfg =
          routeConfig.leftNavBar !== undefined ? routeConfig.leftNavBar : true;
        rightBarCfg =
          routeConfig.rightNavBar !== undefined
            ? routeConfig.rightNavBar
            : true;
      }

      const bodyWidget = makeFullSize(toElement(route));
      if (bodyWidget) mainContentContainer.appendChild(bodyWidget);
      updateAppBar(appBarCfg);
      updateBottomBar(bottomBarCfg);
      updateFab(fabCfg);
      updateLeftBar(leftBarCfg);
      updateRightBar(rightBarCfg);

      // Auto-close the drawer after navigation to avoid leaving it open
      // on the next page — only when the caller opts in via closeDrawerOnNavigate.
      if (closeDrawerOnNavigate && drawerInstance && drawerInstance.close) {
        drawerInstance.close();
      }
    } else if (body) {
      const bodyWidget = makeFullSize(toElement(body));
      if (bodyWidget) mainContentContainer.appendChild(bodyWidget);
    }
  };

  /**
   * Builds the full DOM structure of the scaffold from scratch.
   * Called once on creation. Also attaches the drawer instance to the container
   * so external code can call container.openDrawer() / container.closeDrawer().
   */
  const buildStructure = () => {
    while (container.firstChild) container.removeChild(container.firstChild);

    // AppBar zone — pinned at the top, does not scroll.
    appBarContainer = document.createElement("div");
    appBarContainer.style.flexShrink = "0";
    container.appendChild(appBarContainer);

    // Middle row — contains optional sidebars and the scrollable body.
    const mainArea = document.createElement("div");
    mainArea.style.display = "flex";
    mainArea.style.flex = "1";
    mainArea.style.flexDirection = "row";
    mainArea.style.overflow = "hidden";
    mainArea.style.minHeight = "0";
    container.appendChild(mainArea);

    if (finalLeftNavBar) {
      leftNavBarContainer = document.createElement("div");
      leftNavBarContainer.style.width = `${leftNavBarWidth}px`;
      leftNavBarContainer.style.flexShrink = "0";
      leftNavBarContainer.style.overflow = "auto";
      leftNavBarContainer.style.height = "100%";
      // Hidden by default; updateLeftBar(true) makes it visible.
      leftNavBarContainer.style.display = "none";
      mainArea.appendChild(leftNavBarContainer);
    }

    // Main content area — takes remaining horizontal space.
    mainContentContainer = document.createElement("div");
    mainContentContainer.style.flex = "1";
    mainContentContainer.style.display = "flex";
    mainContentContainer.style.flexDirection = "column";
    mainContentContainer.style.overflow = "auto";
    mainContentContainer.style.minHeight = "0";
    mainArea.appendChild(mainContentContainer);

    if (finalRightNavBar) {
      rightNavBarContainer = document.createElement("div");
      rightNavBarContainer.style.width = `${rightNavBarWidth}px`;
      rightNavBarContainer.style.flexShrink = "0";
      rightNavBarContainer.style.overflow = "auto";
      rightNavBarContainer.style.height = "100%";
      rightNavBarContainer.style.display = "none";
      mainArea.appendChild(rightNavBarContainer);
    }

    // Bottom bar zone — pinned at the bottom, does not scroll.
    bottomBarContainer = document.createElement("div");
    bottomBarContainer.style.flexShrink = "0";
    container.appendChild(bottomBarContainer);

    // FAB slot — absolutely positioned so it floats above content.
    fabContainer = document.createElement("div");
    fabContainer.style.position = "absolute";
    fabContainer.style.bottom = "16px";
    fabContainer.style.right = "16px";
    fabContainer.style.zIndex = "10";
    container.appendChild(fabContainer);

    // Attach the drawer instance and expose open/close helpers on the container.
    if (drawer) {
      drawerInstance = toElement(drawer);
      if (drawerInstance) {
        container._drawer = drawerInstance;
        container.openDrawer = () =>
          drawerInstance.open?.() ?? drawerInstance.toggle?.();
        container.closeDrawer = () =>
          drawerInstance.close?.() ?? drawerInstance.toggle?.();
      }
    }

    if (finalLeftNavBar) updateLeftBar(true);
    if (finalRightNavBar) updateRightBar(true);
    updateBody();
  };

  // Subscribe to router changes so the body re-renders on navigation.
  if (isRouterMode) {
    unsubscribe = subscribe(() => {
      updateBody();
    });
  }

  buildStructure();

  // Automatic garbage collection via MutationObserver:
  // When any child node is removed from the tree, call its _cleanup hook
  // (and the hooks of its descendants) to release event listeners and
  // router subscriptions without requiring manual teardown at call sites.
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        // Run cleanup on the removed node itself.
        if (typeof node._cleanup === "function") {
          node._cleanup();
        }
        // Recursively clean up any descendant widgets that carry a cleanup hook.
        if (node.querySelectorAll) {
          const children = node.querySelectorAll("*");
          children.forEach((child) => {
            if (typeof child._cleanup === "function") {
              child._cleanup();
            }
          });
        }
      });
    });
  });

  // Watch the entire scaffold subtree for removed nodes.
  observer.observe(container, { childList: true, subtree: true });

  const originalCleanup = container._cleanup;
  container._cleanup = () => {
    // Stop the MutationObserver when the scaffold itself is destroyed.
    observer.disconnect();
    if (unsubscribe) unsubscribe();
    clearContainer(appBarContainer);
    clearContainer(mainContentContainer);
    clearContainer(bottomBarContainer);
    clearContainer(fabContainer);
    clearContainer(leftNavBarContainer);
    clearContainer(rightNavBarContainer);
    if (container._drawer?.parentNode)
      container._drawer.parentNode.removeChild(container._drawer);
    if (originalCleanup) originalCleanup();
  };

  /**
   * Programmatically replace the left sidebar content at runtime.
   * Accepts the same values as the internal `updateLeftBar` helper.
   *
   * @param {boolean|HTMLElement|Function} cfg
   */
  container.updateLeftNavBar = updateLeftBar;

  /**
   * Programmatically replace the right sidebar content at runtime.
   *
   * @param {boolean|HTMLElement|Function} cfg
   */
  container.updateRightNavBar = updateRightBar;

  /**
   * Resize the left sidebar at runtime without rebuilding the scaffold.
   *
   * @param {number|string} w - New width (number = pixels, string = CSS value).
   */
  container.setLeftNavBarWidth = (w) => {
    if (leftNavBarContainer)
      leftNavBarContainer.style.width = typeof w === "number" ? `${w}px` : w;
  };

  /**
   * Resize the right sidebar at runtime without rebuilding the scaffold.
   *
   * @param {number|string} w - New width (number = pixels, string = CSS value).
   */
  container.setRightNavBarWidth = (w) => {
    if (rightNavBarContainer)
      rightNavBarContainer.style.width = typeof w === "number" ? `${w}px` : w;
  };

  return container;
};

export default Scaffold;
