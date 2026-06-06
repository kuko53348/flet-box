// widgets/BottomSheet.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';
import { Row } from './Row.js';
import { Column } from './Column.js';
import { Text } from './Text.js';
import { Icon } from './Icon.js';

export const BottomSheet = (props) => {
    const {
        content,
        title,
        actions = [],
        height = 'auto',
        maxHeight = '80%',
        showDragHandle = true,
        closeOnOverlayClick = true,
        closeOnDragDown = true,
        showCloseButton = true,
        backgroundColor = colors.surface,
        borderRadius = 24,
        onOpen,
        onClose,
        ...rest
    } = props;

    let isOpen = false;
    let overlay = null;
    let sheetContainer = null;
    let startY = 0;
    let currentY = 0;

    // Overlay using WidgetFactory
    overlay = WidgetFactory({
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9998,
        opacity: 0,
        visibility: 'hidden',
        transition: 'opacity 0.3s ease, visibility 0.3s ease',
        onclick: () => {
            if (closeOnOverlayClick) close();
        }
    });

    // Drag handle
    const dragHandle = showDragHandle ? WidgetFactory({
        display: 'flex',
        justifyContent: 'center',
        padding: '12px 0 8px 0',
        cursor: 'grab',
        child: WidgetFactory({
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2
        })
    }) : null;

    // Header
    const headerChildren = [];
    if (title) {
        headerChildren.push(Text({
            text: title,
            size: 18,
            weight: 'bold',
            color: colors.text,
            style: { flex: 1 }
        }));
    }
    if (showCloseButton) {
        const closeBtn = Icon({
            name: 'close',
            size: 22,
            color: colors.textSecondary,
            style: { cursor: 'pointer' }
        });
        closeBtn.onclick = () => close();
        headerChildren.push(closeBtn);
    }

    const header = (title || showCloseButton) ? Row({
        alignItems: 'center',
        justifyContent: 'space-between',
        style: {
            padding: '0 16px 8px 16px',
            borderBottom: title ? `1px solid ${colors.border}` : 'none'
        },
        children: headerChildren
    }) : null;

    // Actions
    const actionsElement = actions.length > 0 ? Row({
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        style: {
            padding: '12px 16px',
            borderTop: `1px solid ${colors.border}`,
            marginTop: 'auto'
        },
        children: actions
    }) : null;

    // Content
    const contentElement = WidgetFactory({
        flex: 1,
        padding: '0 16px',
        overflow: 'auto',
        child: content
    });

    // BottomSheet container using WidgetFactory
    sheetContainer = WidgetFactory({
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: backgroundColor,
        borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        transform: 'translateY(100%)',
        transition: 'transform 0.3s ease',
        maxHeight: maxHeight,
        height: height === 'auto' ? 'auto' : height,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        overflow: 'hidden'
    });

    // Body
    const sheetBody = Column({
        style: { height: '100%' },
        children: [dragHandle, header, contentElement, actionsElement].filter(Boolean)
    });

    sheetContainer.appendChild(sheetBody);
    overlay.appendChild(sheetContainer);
    document.body.appendChild(overlay);

    // Drag handlers (requires direct DOM manipulation)
    const onTouchStart = (e) => {
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        currentY = startY;
        sheetContainer.style.transition = 'none';
    };

    const onTouchMove = (e) => {
        if (!closeOnDragDown) return;
        const moveY = e.touches ? e.touches[0].clientY : e.clientY;
        const delta = moveY - startY;
        if (delta > 0) {
            currentY = moveY;
            const transform = delta;
            sheetContainer.style.transform = `translateY(${transform}px)`;
            const opacity = 1 - (delta / sheetContainer.offsetHeight);
            overlay.style.opacity = Math.max(0, Math.min(1, opacity));
        }
    };

    const onTouchEnd = () => {
        sheetContainer.style.transition = 'transform 0.3s ease';
        const delta = currentY - startY;
        if (delta > 100) {
            close();
        } else {
            sheetContainer.style.transform = 'translateY(0)';
            overlay.style.opacity = '1';
        }
        startY = 0;
        currentY = 0;
    };

    const open = () => {
        if (isOpen) return;
        isOpen = true;
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
        sheetContainer.style.transform = 'translateY(0)';
        if (onOpen) onOpen();
        document.addEventListener('keydown', handleKeyDown);
        
        if (closeOnDragDown && dragHandle) {
            dragHandle.addEventListener('mousedown', onTouchStart);
            dragHandle.addEventListener('mousemove', onTouchMove);
            dragHandle.addEventListener('mouseup', onTouchEnd);
            dragHandle.addEventListener('touchstart', onTouchStart);
            dragHandle.addEventListener('touchmove', onTouchMove);
            dragHandle.addEventListener('touchend', onTouchEnd);
        }
    };

    const close = () => {
        if (!isOpen) return;
        isOpen = false;
        sheetContainer.style.transform = 'translateY(100%)';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.visibility = 'hidden';
        }, 300);
        if (onClose) onClose();
        document.removeEventListener('keydown', handleKeyDown);
        
        if (closeOnDragDown && dragHandle) {
            dragHandle.removeEventListener('mousedown', onTouchStart);
            dragHandle.removeEventListener('mousemove', onTouchMove);
            dragHandle.removeEventListener('mouseup', onTouchEnd);
            dragHandle.removeEventListener('touchstart', onTouchStart);
            dragHandle.removeEventListener('touchmove', onTouchMove);
            dragHandle.removeEventListener('touchend', onTouchEnd);
        }
    };

    const toggle = () => {
        if (isOpen) close();
        else open();
    };

    const destroy = () => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.removeEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && isOpen) close();
    };

    const bottomSheet = { open, close, toggle, destroy };
    return bottomSheet;
};

export default BottomSheet;
