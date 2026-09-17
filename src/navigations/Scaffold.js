// navigations/Scaffold.js - Fixed (no cierra el drawer automáticamente)
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { initRouter, getCurrentRoute, subscribe } from "./Router.js";

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
    closeDrawerOnNavigate = false, // NUEVA: false por defecto (no cerrar al navegar)
    ...rest
  } = props;

  let routesConfig = null;
  let isRouterMode = false;
  let unsubscribe = null;
  let drawerInstance = null; // guardamos la instancia del drawer

  // Router detection
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

  if (isRouterMode && routesConfig) {
    const currentUrl =
      typeof window !== "undefined" ? window.location.pathname : "/";
    initRouter(routesConfig, currentUrl);
  }

  // Normalize legacy navSideBar
  let finalLeftNavBar = leftNavBar;
  let finalRightNavBar = rightNavBar;
  if (navSideBar && !leftNavBar && !rightNavBar) {
    if (navSideBarPosition === "right") {
      finalRightNavBar = navSideBar;
    } else {
      finalLeftNavBar = navSideBar;
    }
  }

  const toElement = (item) => {
    if (!item) return null;
    if (item instanceof HTMLElement) return item;
    if (typeof item === "function") return item();
    return item;
  };

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

  let appBarContainer = null;
  let bottomBarContainer = null;
  let fabContainer = null;
  let leftNavBarContainer = null;
  let rightNavBarContainer = null;
  let mainContentContainer = null;

  let currentAppBar = null;
  let currentBottomBar = null;
  let currentFab = null;

  const clearContainer = (target) => {
    if (!target) return;
    while (target.firstChild) {
      const child = target.firstChild;
      if (typeof child._cleanup === "function") child._cleanup();
      target.removeChild(child);
    }
  };

  const makeFullSize = (widget) => {
    if (widget && widget.style) {
      widget.style.flex = "1"; // ← Esto debería funcionar
      widget.style.width = "100%";
      widget.style.display = "flex";
      widget.style.flexDirection = "column";
      widget.style.minHeight = "0";
    }
    return widget;
  };

  // Update functions
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
      if (drawer && drawerInstance) {
        const menuIcon = widget.querySelector(".material-icons");
        if (menuIcon && menuIcon.textContent === "menu") {
          const oldClick = menuIcon.onclick;
          menuIcon.onclick = (e) => {
            e.stopPropagation(); // evita propagación que pueda cerrar el drawer
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

  const updateLeftBar = (cfg) => {
    if (!leftNavBarContainer) return;
    clearContainer(leftNavBarContainer);
    if (cfg === false) {
      leftNavBarContainer.style.display = "none";
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

      // Cerrar el drawer al navegar solo si la opción está activada
      if (closeDrawerOnNavigate && drawerInstance && drawerInstance.close) {
        drawerInstance.close();
      }
    } else if (body) {
      const bodyWidget = makeFullSize(toElement(body));
      if (bodyWidget) mainContentContainer.appendChild(bodyWidget);
    }
  };

  const buildStructure = () => {
    while (container.firstChild) container.removeChild(container.firstChild);

    appBarContainer = document.createElement("div");
    appBarContainer.style.flexShrink = "0";
    container.appendChild(appBarContainer);

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
      leftNavBarContainer.style.display = "none";
      mainArea.appendChild(leftNavBarContainer);
    }

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

    bottomBarContainer = document.createElement("div");
    bottomBarContainer.style.flexShrink = "0";
    container.appendChild(bottomBarContainer);

    fabContainer = document.createElement("div");
    fabContainer.style.position = "absolute";
    fabContainer.style.bottom = "16px";
    fabContainer.style.right = "16px";
    fabContainer.style.zIndex = "10";
    container.appendChild(fabContainer);

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

  if (isRouterMode) {
    unsubscribe = subscribe(() => {
      updateBody();
    });
  }

  buildStructure();

  container._cleanup = () => {
    if (unsubscribe) unsubscribe();
    clearContainer(appBarContainer);
    clearContainer(mainContentContainer);
    clearContainer(bottomBarContainer);
    clearContainer(fabContainer);
    clearContainer(leftNavBarContainer);
    clearContainer(rightNavBarContainer);
    if (container._drawer?.parentNode)
      container._drawer.parentNode.removeChild(container._drawer);
  };

  container.updateLeftNavBar = updateLeftBar;
  container.updateRightNavBar = updateRightBar;
  container.setLeftNavBarWidth = (w) => {
    if (leftNavBarContainer)
      leftNavBarContainer.style.width = typeof w === "number" ? `${w}px` : w;
  };
  container.setRightNavBarWidth = (w) => {
    if (rightNavBarContainer)
      rightNavBarContainer.style.width = typeof w === "number" ? `${w}px` : w;
  };

  return container;
};

export default Scaffold;
