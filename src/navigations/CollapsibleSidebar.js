/:/ navigations/CollapsibleSideBar.js
:import { WidgetFactory } from '../widget-factory/index.js';
import { Container } from '../widgets/Container.js';
import { Column } from '../widgets/Column.js';
import { Icon } from '../widgets/Icon.js';
import { useState } from '../tools/useState.js';
import { colors } from '../utils/themes.js';

export const CollapsibleSideBar = ({ 
    children, 
    expanded = true, 
    widthExpanded = 260, 
    widthCollapsed = 60,
    iconSize = 24,
    onToggle,
    bgColor = colors.surface,
    borderRight = `1px solid ${colors.border}`,
    showTooltip = false,
    tooltipDelay = 500,
    ...rest 
}) => {
    const [isExpanded, setIsExpanded] = useState('collapsible-sidebar', expanded);
    
    const toggle = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        if (onToggle) onToggle(newState);
    };
    
    const currentWidth = isExpanded ? widthExpanded : widthCollapsed;
    
    // Botón toggle usando WidgetFactory para garantizar eventos
    const toggleButton = WidgetFactory({
        tag: 'div',
        style: {
            padding: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease',
            borderRadius: '8px',
            margin: '4px 8px'
        },
        onclick: toggle,
        child: Icon({ 
            name: isExpanded ? 'chevron_left' : 'chevron_right', 
            size: iconSize,
            color: colors.textSecondary
        })
    });
    
    // Añadir efectos hover/press manualmente
    toggleButton.addEventListener('mouseenter', () => {
        toggleButton.style.backgroundColor = colors.gray100;
    });
    toggleButton.addEventListener('mouseleave', () => {
        toggleButton.style.backgroundColor = 'transparent';
    });
    toggleButton.addEventListener('mousedown', () => {
        toggleButton.style.transform = 'scale(0.95)';
    });
    toggleButton.addEventListener('mouseup', () => {
        toggleButton.style.transform = 'scale(1)';
    });
    
    const contentWrapper = Container({
        flex: 1,
        width: '100%',
        opacity: isExpanded ? 1 : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: isExpanded ? 'auto' : 'none',
        overflow: 'auto',
        child: children
    });
    
    const sidebarContainer = Container({
        width: currentWidth,
        height: '100%',
        backgroundColor: bgColor,
        borderRight: borderRight,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        flexShrink: 0,
        ...rest,
        child: Column({
            height: '100%',
            children: [toggleButton, contentWrapper]
        })
    });
    
    // Método público para obtener el ancho actual (útil para Scaffold)
    sidebarContainer.getCurrentWidth = () => currentWidth;
    sidebarContainer.isExpanded = () => isExpanded;
    
    return sidebarContainer;
};

export default CollapsibleSideBar;
