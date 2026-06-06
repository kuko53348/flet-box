// src/navigations/Drawer.js - Versión con borderRadius correcto
import { Container } from '../widgets/Container.js';
import { Column } from '../widgets/Column.js';
import { dimensions } from '../tools/dimensions.js';
import { colors } from '../utils/themes.js';

let drawerInstance = null;
let isOpen = false;

export const Drawer = (props = {}) => {
    const { 
        header,
        body = [],
        footer,
        position = 'left',
        width = 280,
        onClose, 
        onOpen,
        blur = true,
        blurIntensity = 4,
        bgColor = colors?.surface || '#ffffff',
        elevation = 4,
        closeOnOverlayClick = true,
        closeOnEsc = true,
        borderRadius = 24,
        margin = 0,
        ...rest
    } = props;
    
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.top = '0';
    element.style.left = '0';
    element.style.width = `${dimensions.width}px`;
    element.style.height = `${dimensions.height}px`;
    element.style.zIndex = '10000';
    element.style.display = 'none';
    
    // Overlay con blur
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backdropFilter = blur ? `blur(${blurIntensity}px)` : 'none';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.3)';
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity = '0';
    
    // Drawer panel
    const drawerPanel = document.createElement('div');
    drawerPanel.style.position = 'absolute';
    drawerPanel.style.top = `${margin}px`;
    drawerPanel.style.bottom = `${margin}px`;
    drawerPanel.style.height = `calc(100% - ${margin * 2}px)`;
    drawerPanel.style.display = 'flex';
    drawerPanel.style.flexDirection = 'column';
    drawerPanel.style.backgroundColor = bgColor;
    drawerPanel.style.overflow = 'hidden';
    
    // ========== BORDER RADIUS CORRECTO según posición ==========
    if (position === 'left') {
        drawerPanel.style.left = `${margin}px`;
        drawerPanel.style.right = 'auto';
        // Esquinas derechas (top-right, bottom-right)
        drawerPanel.style.borderTopRightRadius = `${borderRadius}px`;
        drawerPanel.style.borderBottomRightRadius = `${borderRadius}px`;
        drawerPanel.style.borderTopLeftRadius = '0';
        drawerPanel.style.borderBottomLeftRadius = '0';
    } else {
        drawerPanel.style.right = `${margin}px`;
        drawerPanel.style.left = 'auto';
        // Esquinas izquierdas (top-left, bottom-left)
        drawerPanel.style.borderTopLeftRadius = `${borderRadius}px`;
        drawerPanel.style.borderBottomLeftRadius = `${borderRadius}px`;
        drawerPanel.style.borderTopRightRadius = '0';
        drawerPanel.style.borderBottomRightRadius = '0';
    }
    
    drawerPanel.style.width = typeof width === 'number' ? `${width}px` : width;
    drawerPanel.style.transform = position === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
    drawerPanel.style.transition = 'transform 0.3s ease-out';
    
    if (elevation > 0) {
        if (position === 'left') {
            drawerPanel.style.boxShadow = `${elevation}px 0 ${elevation * 2}px rgba(0,0,0,0.15)`;
        } else {
            drawerPanel.style.boxShadow = `-${elevation}px 0 ${elevation * 2}px rgba(0,0,0,0.15)`;
        }
    }
    
    // ========== CONSTRUIR CONTENIDO ==========
    const contentContainer = Column({
        style: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        },
        children: [
            header && Container({
                style: {
                    flexShrink: 0,
                    // Border radius solo en las esquinas superiores según posición
                    borderTopLeftRadius: position === 'right' ? `${borderRadius}px` : '0',
                    borderTopRightRadius: position === 'left' ? `${borderRadius}px` : '0',
                    overflow: 'hidden'
                },
                child: header
            }),
            
            body.length > 0 && Column({
                style: {
                    flex: 1,
                    overflow: 'auto',
                    backgroundColor: bgColor
                },
                children: body
            }),
            
            footer && Container({
                style: {
                    flexShrink: 0,
                    // Border radius solo en las esquinas inferiores según posición
                    borderBottomLeftRadius: position === 'right' ? `${borderRadius}px` : '0',
                    borderBottomRightRadius: position === 'left' ? `${borderRadius}px` : '0',
                    overflow: 'hidden'
                },
                child: footer
            })
        ].filter(Boolean)
    });
    
    drawerPanel.appendChild(contentContainer);
    element.appendChild(overlay);
    element.appendChild(drawerPanel);
    
    // ========== FUNCIONES ==========
    const handleKeyDown = (e) => {
        if (closeOnEsc && e.key === 'Escape' && isOpen) {
            close();
        }
    };
    
    const close = () => {
        if (!isOpen) return;
        isOpen = false;
        drawerPanel.style.transform = position === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
        overlay.style.opacity = '0';
        setTimeout(() => {
            element.style.display = 'none';
            if (onClose) onClose();
        }, 300);
        if (closeOnEsc) document.removeEventListener('keydown', handleKeyDown);
    };
    
    const open = () => {
        if (isOpen) return;
        isOpen = true;
        element.style.display = 'block';
        void element.offsetHeight;
        overlay.style.opacity = '1';
        drawerPanel.style.transform = 'translateX(0)';
        if (onOpen) onOpen();
        if (closeOnEsc) document.addEventListener('keydown', handleKeyDown);
    };
    
    const toggle = () => {
        if (isOpen) close();
        else open();
    };
    
    const destroy = () => {
        if (closeOnEsc) document.removeEventListener('keydown', handleKeyDown);
        if (element.parentNode) element.parentNode.removeChild(element);
    };
    
    if (closeOnOverlayClick) {
        overlay.addEventListener('click', close);
    }
    
    const handleResize = () => {
        element.style.width = `${dimensions.width}px`;
        element.style.height = `${dimensions.height}px`;
    };
    dimensions.addListener(handleResize);
    
    const instance = { open, close, toggle, destroy, element };
    drawerInstance = instance;
    document.body.appendChild(element);
    
    return instance;
};

// ========== FUNCIONES GLOBALES ==========
export const openDrawer = () => {
    if (drawerInstance) drawerInstance.open();
    else console.warn('Drawer not initialized');
};

export const closeDrawer = () => {
    if (drawerInstance) drawerInstance.close();
    else console.warn('Drawer not initialized');
};

export const toggleDrawer = () => {
    if (drawerInstance) drawerInstance.toggle();
    else console.warn('Drawer not initialized');
};

export const destroyDrawer = () => {
    if (drawerInstance) {
        drawerInstance.destroy();
        drawerInstance = null;
        isOpen = false;
    }
};

export default Drawer;
