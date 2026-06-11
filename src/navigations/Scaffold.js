// navigations/Scaffold.js
// navigations/Scaffold.js
import { WidgetFactory } from '../widget-factory/index.js';
// import { createWidget } from '../widget-builder/index.js';
import { colors } from '../utils/themes.js';
import { initRouter, getCurrentRoute, subscribe } from './Router.js';

export const Scaffold = (props) => {
    const {
        appBar: originalAppBar,
        body,
        bottomBar: originalBottomBar,
        fab: originalFab,
        drawer,
        routes,                    // ← Prop para el router
        backgroundColor = colors.background,
        ...rest
    } = props;

    let routesConfig = null;
    let isRouterMode = false;
    let unsubscribe = null;

    // 🔥 DETECTAR MODO ROUTER (prioridad: routes > body)
    if (routes && typeof routes === 'object' && Object.keys(routes).length > 0) {
        routesConfig = routes;
        isRouterMode = true;
    } else if (body && typeof body === 'object' && !(body instanceof HTMLElement) && !body.nodeType) {
        routesConfig = body;
        isRouterMode = true;
    }

    // 🔥 INICIALIZAR ROUTER con la URL actual del navegador
    if (isRouterMode && routesConfig) {
        const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
        initRouter(routesConfig, currentUrl);
    }

    const toElement = (item) => {
        if (!item) return null;
        if (item instanceof HTMLElement) return item;
        if (typeof item === 'function') return item();
        return item;
    };

    const container = WidgetFactory({
        tag: 'div',
        style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100vh',
            backgroundColor: backgroundColor,
            position: 'relative',
            overflow: 'hidden',
            ...rest.style
        },
        ...rest
    });

    let appBarContainer = null;
    let bodyContainer = null;
    let bottomBarContainer = null;
    let fabContainer = null;
    let currentAppBar = null;
    let currentBottomBar = null;
    let currentFab = null;

    const makeFullSize = (widget) => {
        if (widget && widget.style) {
            widget.style.flex = '1';
            widget.style.width = '100%';
            widget.style.display = 'flex';
            widget.style.flexDirection = 'column';
            widget.style.minHeight = '0';
        }
        return widget;
    };

    const updateAppBar = (newAppBarConfig) => {
        if (!appBarContainer) return;
        while (appBarContainer.firstChild) appBarContainer.removeChild(appBarContainer.firstChild);
        
        if (newAppBarConfig === false) {
            appBarContainer.style.display = 'none';
            return;
        }
        appBarContainer.style.display = 'block';
        
        let widgetToShow = null;
        if (newAppBarConfig === true || newAppBarConfig === undefined) {
            widgetToShow = toElement(originalAppBar);
        } else {
            widgetToShow = toElement(newAppBarConfig);
        }
        
        if (widgetToShow) {
            appBarContainer.appendChild(widgetToShow);
            currentAppBar = widgetToShow;
            if (drawer && container._drawer) {
                const menuIcon = widgetToShow.querySelector('.material-icons');
                if (menuIcon && menuIcon.textContent === 'menu') {
                    const oldClick = menuIcon.onclick;
                    menuIcon.onclick = (e) => {
                        if (oldClick) oldClick(e);
                        if (container._drawer.open) container._drawer.open();
                        else if (container._drawer.toggle) container._drawer.toggle();
                    };
                }
            }
        }
    };

    const updateBottomBar = (newBottomBarConfig) => {
        if (!bottomBarContainer) return;
        while (bottomBarContainer.firstChild) bottomBarContainer.removeChild(bottomBarContainer.firstChild);
        
        if (newBottomBarConfig === false) {
            bottomBarContainer.style.display = 'none';
            return;
        }
        bottomBarContainer.style.display = 'block';
        
        let widgetToShow = null;
        if (newBottomBarConfig === true || newBottomBarConfig === undefined) {
            widgetToShow = toElement(originalBottomBar);
        } else {
            widgetToShow = toElement(newBottomBarConfig);
        }
        
        if (widgetToShow) {
            bottomBarContainer.appendChild(widgetToShow);
            currentBottomBar = widgetToShow;
        }
    };

    const updateFab = (newFabConfig) => {
        if (!fabContainer) return;
        while (fabContainer.firstChild) fabContainer.removeChild(fabContainer.firstChild);
        
        if (newFabConfig === false) {
            fabContainer.style.display = 'none';
            return;
        }
        fabContainer.style.display = 'block';
        
        let widgetToShow = null;
        if (newFabConfig === true || newFabConfig === undefined) {
            widgetToShow = toElement(originalFab);
        } else {
            widgetToShow = toElement(newFabConfig);
        }
        
        if (widgetToShow) {
            fabContainer.appendChild(widgetToShow);
            currentFab = widgetToShow;
        }
    };

    // 🔥 ACTUALIZAR BODY (CORAZÓN DEL ROUTER)
    const updateBody = () => {
        if (!bodyContainer) return;
        while (bodyContainer.firstChild) bodyContainer.removeChild(bodyContainer.firstChild);

        if (isRouterMode) {
            const routeConfig = getCurrentRoute();
            let route = routeConfig;
            let appBarConfig = true;
            let bottomBarConfig = true;
            let fabConfig = true;

            if (routeConfig && typeof routeConfig === 'object' && !(routeConfig instanceof HTMLElement)) {
                route = routeConfig.body || routeConfig;
                appBarConfig = routeConfig.appBar !== undefined ? routeConfig.appBar : true;
                bottomBarConfig = routeConfig.bottomBar !== undefined ? routeConfig.bottomBar : true;
                fabConfig = routeConfig.fab !== undefined ? routeConfig.fab : true;
            }

            const bodyWidget = makeFullSize(toElement(route));
            if (bodyWidget) bodyContainer.appendChild(bodyWidget);
            
            updateAppBar(appBarConfig);
            updateBottomBar(bottomBarConfig);
            updateFab(fabConfig);
        } else if (body) {
            const bodyWidget = makeFullSize(toElement(body));
            if (bodyWidget) bodyContainer.appendChild(bodyWidget);
        }
    };

    // 🔥 CONSTRUIR ESTRUCTURA
    const buildStructure = () => {
        while (container.firstChild) container.removeChild(container.firstChild);

        appBarContainer = document.createElement('div');
        appBarContainer.style.flexShrink = '0';
        container.appendChild(appBarContainer);

        bodyContainer = document.createElement('div');
        bodyContainer.style.flex = '1 1 auto';
        bodyContainer.style.minHeight = '0';
        bodyContainer.style.display = 'flex';
        bodyContainer.style.flexDirection = 'column';
        bodyContainer.style.overflow = 'auto';
        container.appendChild(bodyContainer);

        bottomBarContainer = document.createElement('div');
        bottomBarContainer.style.flexShrink = '0';
        container.appendChild(bottomBarContainer);

        fabContainer = document.createElement('div');
        fabContainer.style.position = 'absolute';
        fabContainer.style.bottom = '16px';
        fabContainer.style.right = '16px';
        fabContainer.style.zIndex = '10';
        container.appendChild(fabContainer);

        if (drawer) {
            const drawerInstance = toElement(drawer);
            if (drawerInstance) {
                container._drawer = drawerInstance;
                container.openDrawer = () => drawerInstance.open?.() ?? drawerInstance.toggle?.();
                container.closeDrawer = () => drawerInstance.close?.() ?? drawerInstance.toggle?.();
            }
        }

        updateBody();
    };

    // 🔥 SUSCRIBIRSE A CAMBIOS DE RUTA
    if (isRouterMode) {
        unsubscribe = subscribe(() => {
            updateBody();
        });
    }

    buildStructure();

    // 🔥 LIMPIEZA
    container._cleanup = () => {
        if (unsubscribe) unsubscribe();
        if (container._drawer?.parentNode) {
            container._drawer.parentNode.removeChild(container._drawer);
        }
    };

    return container;
};

export default Scaffold;
