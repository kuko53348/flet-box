// widgets/DroppBox.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';

export const DroppBox = (props) => {
    const {
        child,
        onDrop,
        onDragEnter,
        onDragLeave,
        onDragOver,
        acceptGroups = ['default'],
        disabled = false,
        
        // Normal styles
        bgColor = colors.surface,
        borderRadius = 12,
        borderWidth = 2,
        borderStyle = 'solid',
        borderColor = colors.border,
        shadow = 'none',
        padding = 16,
        
        // Active styles (when dragging over)
        activeBgColor = `${colors.primary}20`,
        activeBorderColor = colors.primary,
        activeBorderWidth = 2,
        activeBorderStyle = 'dashed',
        activeShadow = `0 4px 12px ${colors.primary}40`,
        
        // Valid/Invalid styles
        validBgColor = `${colors.success}20`,
        validBorderColor = colors.success,
        invalidBgColor = `${colors.danger}20`,
        invalidBorderColor = colors.danger,
        
        // Animation
        transitionDuration = '0.2s',
        transitionTiming = 'ease',
        
        // Feedback
        showFeedback = true,
        
        ...rest
    } = props;

    let isActive = false;
    let isValidTarget = false;

    const wrapper = WidgetFactory({
        tag: 'div',
        position: 'relative',
        transition: `all ${transitionDuration} ${transitionTiming}`,
        backgroundColor: bgColor,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        borderWidth: `${borderWidth}px`,
        borderStyle: borderStyle,
        borderColor: borderColor,
        boxShadow: shadow,
        padding: typeof padding === 'number' ? `${padding}px` : padding,
        child: child,
        ...rest
    });

    const getDragData = () => {
        if (window.__dragData) {
            return window.__dragData;
        }
        return null;
    };

    const isValidDrag = () => {
        const dragData = getDragData();
        if (!dragData) return false;
        return acceptGroups.includes(dragData.group);
    };

    const applyActiveStyles = () => {
        if (!showFeedback) return;
        
        isValidTarget = isValidDrag();
        
        if (isValidTarget) {
            wrapper.style.borderColor = validBorderColor;
            wrapper.style.backgroundColor = validBgColor;
            wrapper.style.borderStyle = activeBorderStyle;
        } else {
            wrapper.style.borderColor = invalidBorderColor;
            wrapper.style.backgroundColor = invalidBgColor;
            wrapper.style.borderStyle = activeBorderStyle;
        }
        
        wrapper.style.borderWidth = `${activeBorderWidth}px`;
        if (activeShadow) wrapper.style.boxShadow = activeShadow;
    };

    const removeActiveStyles = () => {
        wrapper.style.borderColor = borderColor;
        wrapper.style.borderWidth = `${borderWidth}px`;
        wrapper.style.borderStyle = borderStyle;
        wrapper.style.backgroundColor = bgColor;
        wrapper.style.boxShadow = shadow;
        isValidTarget = false;
    };

    wrapper.addEventListener('dragover', (e) => {
        if (disabled) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        if (onDragOver) onDragOver(e);
    });

    wrapper.addEventListener('dragenter', (e) => {
        if (disabled) return;
        e.preventDefault();
        
        if (isValidDrag() && !isActive) {
            isActive = true;
            applyActiveStyles();
            if (onDragEnter) onDragEnter(e);
        }
    });

    wrapper.addEventListener('dragleave', (e) => {
        if (disabled) return;
        e.preventDefault();
        
        if (isActive) {
            isActive = false;
            removeActiveStyles();
            if (onDragLeave) onDragLeave(e);
        }
    });

    wrapper.addEventListener('drop', (e) => {
        if (disabled) return;
        e.preventDefault();
        
        const dragData = getDragData();
        
        if (isActive) {
            isActive = false;
            removeActiveStyles();
        }
        
        if (!dragData || !acceptGroups.includes(dragData.group)) {
            return;
        }
        
        if (onDrop) onDrop(dragData.data, dragData.group, e);
        
        window.__dragData = null;
    });

    return wrapper;
};

export default DroppBox;
