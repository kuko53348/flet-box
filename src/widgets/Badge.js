// widgets/Badge.js
import { WidgetFactory } from '../widget-factory/index.js';
import { Stack } from './Stack.js';
import { Text } from './Text.js';
import { colors, subscribeTheme } from '../utils/themes.js';

export const Badge = (props) => {
    const {
        value,
        child,
        bgColor,
        color = colors.text,
        size = 20,
        position = 'top-right',
        borderWidth = 2,
        borderColor = colors.surface,
        showZero = false,
        max = 99,
        offset = 0,
        ...rest
    } = props;

    // Color de fondo
    const finalBgColor = bgColor || color || colors.danger;
    
    let unsubscribeTheme = null;

    // Verificar si debe mostrar el badge
    const hasValue = value !== undefined && value !== null && value !== '';
    const showBadge = hasValue && (showZero || (typeof value === 'number' ? value > 0 : value !== ''));

    if (!showBadge) {
        return child || null;
    }

    // Formatear valor
    let displayValue = value;
    if (typeof value === 'number' && max && value > max) {
        displayValue = `${max}+`;
    }

    // Posiciones
    const positions = {
        'top-right': { top: -offset, right: -offset, transform: 'translate(25%, -25%)' },
        'top-left': { top: -offset, left: -offset, transform: 'translate(-25%, -25%)' },
        'bottom-right': { bottom: -offset, right: -offset, transform: 'translate(25%, 25%)' },
        'bottom-left': { bottom: -offset, left: -offset, transform: 'translate(-25%, 25%)' }
    };

    const pos = positions[position] || positions['top-right'];

    // Badge element usando WidgetFactory con centrado correcto
    const badgeElement = WidgetFactory({
        position: 'absolute',
        top: pos.top,
        right: pos.right,
        bottom: pos.bottom,
        left: pos.left,
        transform: pos.transform,
        backgroundColor: finalBgColor,
        borderRadius: size,
        minWidth: size,
        height: size,
        padding: size > 20 ? `0 ${size / 3}px` : 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: borderWidth,
        borderColor: borderColor,
        zIndex: 1,
        boxSizing: 'border-box', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        child: Text({
            text: String(displayValue),
            size: size * 0.55,
            color: color,
            weight: 'bold',
            align: 'center',
            lineHeight: 1
        })
    });

    // Tema dinámico
    if (!bgColor && !color) {
        unsubscribeTheme = subscribeTheme(() => {
            badgeElement.style.backgroundColor = colors.danger;
        });
    }

    // Validar child
    const validChild = child instanceof HTMLElement ? child : null;

    if (!validChild) {
        console.warn('Badge: child must be an HTMLElement');
        if (unsubscribeTheme) unsubscribeTheme();
        return badgeElement;
    }

    // Stack wrapper
    const badgeStack = Stack({
        position: 'relative',
        display: 'inline-block',
        style: { position: 'relative', display: 'inline-block' },
        children: [validChild, badgeElement],
        ...rest
    });

    // Cleanup
    const originalCleanup = badgeStack._cleanup;
    badgeStack._cleanup = () => {
        if (unsubscribeTheme) unsubscribeTheme();
        if (originalCleanup) originalCleanup();
    };

    // Método para actualizar valor
    badgeStack.updateValue = (newValue) => {
        let newDisplayValue = newValue;
        if (typeof newValue === 'number' && max && newValue > max) {
            newDisplayValue = `${max}+`;
        }
        const textElement = badgeElement.querySelector('span:not(.material-icons)');
        if (textElement) {
            textElement.textContent = String(newDisplayValue);
        }
        const shouldShow = newValue && (showZero || (typeof newValue === 'number' ? newValue > 0 : newValue !== ''));
        badgeElement.style.display = shouldShow ? 'flex' : 'none';
    };

    return badgeStack;
};

export default Badge;
