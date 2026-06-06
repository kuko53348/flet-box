// widgets/Modal.js - Versión con widgets reutilizables
import { createWidget } from '../widget-builder/index.js';
import { colors } from '../utils/themes.js';
import { Container } from './Container.js';
import { Row } from './Row.js';
import { Column } from './Column.js';
import { Text } from './Text.js';
import { Icon } from './Icon.js';

// ========== WIDGETS REUTILIZABLES INTERNOS ==========

// ModalOverlay - reutilizable
const ModalOverlay = (props) => {
    const { closeOnOverlayClick, onClose } = props;
    
    return createWidget('div')({
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            visibility: 'hidden',
            transition: 'opacity 0.3s ease, visibility 0.3s ease'
        },
        onclick: () => {
            if (closeOnOverlayClick) onClose();
        }
    });
};

// ModalHeader - reutilizable
const ModalHeader = (props) => {
    const { title, showCloseButton, onClose } = props;
    
    const children = [];
    if (title) {
        children.push(
            Text({
                value: title,
                size: 18,
                weight: 'bold',
                color: colors.text,
                flex: 1 
            })
        );
    }
    if (showCloseButton) {
        const closeBtn = Icon({
            name: 'close',
            size: 22,
            color: colors.primary,
            cursor: 'pointer' 
        });
        closeBtn.onclick = onClose;
        children.push(closeBtn);
    }
    
    return children.length > 0 ? Row({
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: `1px solid ${colors.border}`,
        flexShrink: 0,
        children: children
    }) : null;
};

// ModalContent - reutilizable
const ModalContent = (props) => {
    const { content, padding } = props;
    
    const wrapper = createWidget('div')({
        style: {
            flex: 1,
            overflow: 'auto',
            padding: typeof padding === 'number' ? `${padding}px` : padding
        }
    });
    
    if (content) {
        if (content instanceof HTMLElement) {
            wrapper.appendChild(content);
        } else if (typeof content === 'string') {
            wrapper.appendChild(Text({ value: content }));
        }
    }
    
    return wrapper;
};

// ModalFooter - reutilizable
const ModalFooter = (props) => {
    const { actions } = props;
    
    return actions.length > 0 ? Row({
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        padding: '12px 20px',
        borderTop: `1px solid ${colors.border}`,
        flexShrink: 0,
        children: actions
    }) : null;
};

// ModalContainer - reutilizable
const ModalContainer = (props) => {
    const { width, minWidth, maxWidth, maxHeight, backgroundColor, borderRadius, children } = props;
    
    return createWidget('div')({
        style: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: backgroundColor,
            borderRadius: `${borderRadius}px`,
            border: `1px solid ${colors.border}`,
            width: typeof width === 'number' ? `${width}px` : width,
            minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
            maxWidth: maxWidth,
            maxHeight: maxHeight,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            transform: 'scale(0.9)',
            opacity: 0,
            transition: 'transform 0.3s ease, opacity 0.3s ease'
        },
        children: children
    });
};

// ========== MODAL PRINCIPAL ==========
export const Modal = (props) => {
    const {
        title,
        content,
        actions = [],
        closeOnOverlayClick = true,
        closeOnEsc = true,
        width = 400,
        minWidth = 300,
        maxWidth = '90%',
        maxHeight = '80vh',
        backgroundColor = colors.surface,
        borderRadius = 24,
        padding = 0,
        showCloseButton = true,
        onOpen,
        onClose,
        ...rest
    } = props;

    let isOpen = false;
    let overlay = null;
    let modalContainer = null;
    let containerRef = null;

    // Funciones del modal
    const handleClose = () => {
        if (!isOpen) return;
        isOpen = false;
        if (containerRef) {
            containerRef.style.transform = 'scale(0.9)';
            containerRef.style.opacity = '0';
        }
        if (overlay) overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay) overlay.style.visibility = 'hidden';
        }, 300);
        if (closeOnEsc) document.removeEventListener('keydown', handleKeyDown);
        if (onClose) onClose();
    };

    const handleOpen = () => {
        if (isOpen) return;
        isOpen = true;
        if (overlay) overlay.style.visibility = 'visible';
        if (overlay) overlay.style.opacity = '1';
        if (containerRef) {
            containerRef.style.transform = 'scale(1)';
            containerRef.style.opacity = '1';
        }
        if (onOpen) onOpen();
        if (closeOnEsc) document.addEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && isOpen) handleClose();
    };

    // Construir modal con widgets reutilizables
    const modalBody = ModalContainer({
        width,
        minWidth,
        maxWidth,
        maxHeight,
        backgroundColor,
        borderRadius,
        children: [
            ModalHeader({ title, showCloseButton, onClose: handleClose }),
            ModalContent({ content, padding }),
            ModalFooter({ actions })
        ].filter(Boolean)
    });

    containerRef = modalBody;

    overlay = ModalOverlay({ 
        closeOnOverlayClick, 
        onClose: handleClose 
    });
    
    overlay.appendChild(modalBody);
    document.body.appendChild(overlay);

    const modal = { 
        open: handleOpen, 
        close: handleClose, 
        toggle: () => isOpen ? handleClose() : handleOpen(),
        destroy: () => {
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (closeOnEsc) document.removeEventListener('keydown', handleKeyDown);
        }
    };
    
    return modal;
};

export default Modal;
