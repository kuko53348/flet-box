// navigations/BottomNavigation.js - VERSIÓN CORREGIDA
import { WidgetFactory } from '../widget-factory/index.js';
// import { createWidget } from '../widget-builder/index.js';
import { Container } from '../widgets/Container.js';
import { Text } from '../widgets/Text.js';
import { Icon } from '../widgets/Icon.js';
import { colors } from '../utils/themes.js';
import { getCurrentPath, subscribe, goTo } from './Router.js';

export const BottomNavigation = (props) => {
    const {
        items = [],
        currentIndex = 0,
        onTabChange,
        backgroundColor = colors.surface,
        selectedColor = colors.primary,
        unselectedColor = colors.textSecondary,
        showLabels = true,
        iconSize = 24,
        height = 65,
        margin = 0,
        marginTop = 0,
        marginBottom = 0,
        marginLeft = 0,
        marginRight = 0,
        borderRadius = 0,
        padding = 0,
        shadow = true,
        elevation = 2,
        useRouter = true,
        ...rest
    } = props;

    let activeIndex = currentIndex;
    const buttons = [];
    let unsubscribe = null;
    let isRouterSynced = false;

    const finalMarginTop = marginTop || margin;
    const finalMarginBottom = marginBottom || margin;
    const finalMarginLeft = marginLeft || margin;
    const finalMarginRight = marginRight || margin;
    const finalBorderRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
    const finalPadding = typeof padding === 'number' ? `${padding}px` : padding;

    const shadows = {
        0: 'none',
        1: '0 1px 3px rgba(0,0,0,0.12)',
        2: '0 3px 6px rgba(0,0,0,0.16)',
        3: '0 6px 12px rgba(0,0,0,0.2)',
        4: '0 10px 20px rgba(0,0,0,0.25)',
        5: '0 15px 30px rgba(0,0,0,0.3)'
    };
    const boxShadow = shadow === true ? shadows[elevation] : (shadow || 'none');

    const container = WidgetFactory({
        tag: 'nav',
        display: 'flex',
        width: `calc(100% - ${finalMarginLeft}px - ${finalMarginRight}px)`,
        height: height,
        backgroundColor: backgroundColor,
        borderRadius: finalBorderRadius,
        marginTop: finalMarginTop,
        marginBottom: finalMarginBottom,
        marginLeft: finalMarginLeft,
        marginRight: finalMarginRight,
        padding: finalPadding,
        boxShadow: boxShadow,
        flexShrink: 0,
        style: {
            ...rest.style
        },
        ...rest
    });

    const updateActive = (index) => {
        buttons.forEach((btnData, i) => {
            const isActive = i === index;
            const icon = btnData.btn.querySelector('.material-icons');
            const label = btnData.btn.querySelector('.bottom-nav-label');
            if (icon) icon.style.color = isActive ? selectedColor : unselectedColor;
            if (label) {
                label.style.color = isActive ? selectedColor : unselectedColor;
                label.style.fontWeight = isActive ? '500' : '400';
            }
        });
        if (onTabChange) onTabChange(index);
    };

    const updateColorsFromRouter = () => {
        if (!useRouter) return;
        
        const currentPath = getCurrentPath();
        
        buttons.forEach((btnData, idx) => {
            const isSelected = btnData.route === currentPath;
            const color = isSelected ? selectedColor : unselectedColor;
            
            if (btnData.icon) btnData.icon.style.color = color;
            if (btnData.labelWidget) {
                btnData.labelWidget.style.color = color;
                btnData.labelWidget.style.fontWeight = isSelected ? '500' : '400';
            }
            
            if (isSelected) activeIndex = idx;
        });
        
        if (onTabChange) onTabChange(activeIndex);
    };

    items.forEach((item, idx) => {
        const itemRoute = item.route || `/${item.label?.toLowerCase()}`;
        
        let isActive = activeIndex === idx;
        if (useRouter && !isRouterSynced) {
            const currentPath = getCurrentPath();
            isActive = itemRoute === currentPath;
            if (isActive) activeIndex = idx;
        }
        
        const btn = Container({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: '8px 0',
            backgroundColor: 'transparent',
            onclick: () => {
                if (useRouter) {
                    goTo(itemRoute);
                    if (item.onPress) item.onPress();
                } else {
                    if (activeIndex !== idx) {
                        activeIndex = idx;
                        updateActive(idx);
                        if (item.onPress) item.onPress();
                    }
                }
            }
        });

        const icon = Icon({ 
            name: item.icon, 
            size: iconSize, 
            color: isActive ? selectedColor : unselectedColor 
        });
        btn.appendChild(icon);

        let labelWidget = null;
        if (showLabels && item.label) {
            labelWidget = Text({
                value: item.label,
                size: 11,
                color: isActive ? selectedColor : unselectedColor,
                fontWeight: isActive ? '500' : '400',
                className: 'bottom-nav-label'
            });
            btn.appendChild(labelWidget);
        }

        buttons.push({ 
            btn, 
            route: itemRoute, 
            icon, 
            labelWidget  // ← guardamos el widget de texto
        });
        container.appendChild(btn);
    });

    if (useRouter) {
        unsubscribe = subscribe(() => {
            updateColorsFromRouter();
        });
        updateColorsFromRouter();
        isRouterSynced = true;
    }

    container.setActiveIndex = (index) => {
        if (!useRouter) {
            if (index >= 0 && index < items.length && activeIndex !== index) {
                activeIndex = index;
                updateActive(index);
                if (items[index].onPress) items[index].onPress();
            }
        } else {
            const route = items[index]?.route || `/${items[index]?.label?.toLowerCase()}`;
            if (route) goTo(route);
        }
    };

    container.getActiveIndex = () => activeIndex;
    container.getCurrentRoute = () => {
        if (!useRouter) return null;
        return getCurrentPath();
    };

    container._cleanup = () => {
        if (unsubscribe) unsubscribe();
    };

    return container;
};

export default BottomNavigation;
