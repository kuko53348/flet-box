// widgets/SnackBar.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';

/**
 * SnackBar - Temporary notification that appears at bottom or top of screen
 */
export function SnackBar(options) {
    const {
        message,
        action,
        onAction,
        duration = 3000,
        type = 'normal',
        position = 'bottom',
        backgroundColor: customBgColor,
        textColor: customTextColor,
        actionColor: customActionColor,
        dismissible = false,
        
        // Additional styling props
        borderRadius = 8,
        padding = '12px 16px',
        margin = 16,
        elevation = 2,
        animationDuration = 300,
        zIndex = 10000,
        
        // Callbacks
        onShow,
        onClose
    } = options;

    // Theme color presets (using colors from theme)
    const presets = {
        normal: { bg: colors.gray800, text: '#ffffff', action: colors.primary },
        success: { bg: colors.success, text: '#ffffff', action: '#ffffff' },
        error: { bg: colors.danger, text: '#ffffff', action: '#ffffff' },
        warning: { bg: colors.warning, text: colors.gray900, action: colors.gray900 },
        info: { bg: colors.info, text: '#ffffff', action: '#ffffff' }
    };

    const preset = presets[type] || presets.normal;

    // User colors override preset
    const finalBg = customBgColor || preset.bg;
    const finalText = customTextColor || preset.text;
    const finalAction = customActionColor || preset.action;

    // Build snackbar container using WidgetFactory
    const snackbar = WidgetFactory({
        tag: 'div',
        position: 'fixed',
        left: `${margin}px`,
        right: `${margin}px`,
        [position]: `${margin}px`,
        backgroundColor: finalBg,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        padding: padding,
        zIndex: zIndex,
        boxShadow: elevation === 0 ? 'none' : `0 ${elevation}px ${elevation * 2}px rgba(0,0,0,0.15)`,
        opacity: 0,
        transform: position === 'bottom' ? `translateY(calc(100% + ${margin}px))` : `translateY(calc(-100% - ${margin}px))`,
        transition: `opacity ${animationDuration}ms ease, transform ${animationDuration}ms ease`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        fontSize: '14px',
        lineHeight: '1.4',
        color: finalText,
        fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    // Message text
    const messageElement = WidgetFactory({
        tag: 'span',
        flex: 1,
        textContent: message
    });
    snackbar.appendChild(messageElement);

    // Action button
    let actionElement = null;
    if (action) {
        actionElement = WidgetFactory({
            tag: 'button',
            backgroundColor: 'transparent',
            border: 'none',
            color: finalAction,
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '4px 8px',
            margin: '-4px -8px -4px 0',
            borderRadius: '4px',
            transition: 'opacity 0.2s ease',
            textContent: action,
            onclick: () => {
                if (onAction) onAction();
                close();
            }
        });
        
        // Hover effect
        actionElement.addEventListener('mouseenter', () => {
            actionElement.style.opacity = '0.8';
        });
        actionElement.addEventListener('mouseleave', () => {
            actionElement.style.opacity = '1';
        });
        
        snackbar.appendChild(actionElement);
    }

    // Close button (dismissible)
    if (dismissible && !action) {
        const closeBtn = WidgetFactory({
            tag: 'button',
            backgroundColor: 'transparent',
            border: 'none',
            color: finalText,
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px',
            margin: '-4px -8px -4px 4px',
            opacity: 0.7,
            transition: 'opacity 0.2s ease',
            textContent: '✕',
            onclick: close
        });
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.opacity = '1';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.opacity = '0.7';
        });
        
        snackbar.appendChild(closeBtn);
    }

    // Add to DOM
    document.body.appendChild(snackbar);

    // Force reflow
    snackbar.offsetHeight;

    // Entrance animation
    let timeoutId = null;

    const show = () => {
        requestAnimationFrame(() => {
            snackbar.style.opacity = '1';
            snackbar.style.transform = 'translateY(0)';
        });
        if (onShow) onShow();
    };

    const close = () => {
        if (timeoutId) clearTimeout(timeoutId);
        snackbar.style.opacity = '0';
        snackbar.style.transform = position === 'bottom' 
            ? `translateY(calc(100% + ${margin}px))` 
            : `translateY(calc(-100% - ${margin}px))`;
        setTimeout(() => {
            if (snackbar.parentNode) snackbar.parentNode.removeChild(snackbar);
            if (onClose) onClose();
        }, animationDuration);
    };

    // Start showing
    show();

    if (duration > 0) {
        timeoutId = setTimeout(close, duration);
    }

    // Return public API
    return { 
        close,
        show,
        getElement: () => snackbar
    };
}

export default SnackBar;
