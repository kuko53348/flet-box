// widgets/Button.js - Complete icon support (left, right, top, bottom, or multiple)
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';
import { Text } from './Text.js';
import { Icon } from './Icon.js';

export const Button = (props) => {
    const {
        text,
        iconLeft,
        iconRight,
        iconTop,
        iconBottom,
        icon,
        iconPosition = 'left',
        variant = 'filled',
        bgColor,
        gradient,
        color,
        size = 'medium',
        fullWidth = false,
        borderRadius = 24,
        elevation = 2,
        padding,
        margin,
        onPress,
        disabled = false,
        ...rest
    } = props;

    const sizes = {
        small: { padding: '6px 12px', fontSize: 12, gap: 6, iconSize: 16 },
        medium: { padding: '10px 20px', fontSize: 14, gap: 8, iconSize: 20 },
        large: { padding: '14px 28px', fontSize: 16, gap: 10, iconSize: 24 }
    };
    const sz = sizes[size] || sizes.medium;

    const shadows = {
        0: 'none',
        1: '0 1px 3px rgba(0,0,0,0.12)',
        2: '0 3px 6px rgba(0,0,0,0.16)',
        3: '0 6px 12px rgba(0,0,0,0.2)',
        4: '0 10px 20px rgba(0,0,0,0.25)',
        5: '0 15px 30px rgba(0,0,0,0.3)'
    };

    const getBackground = () => {
        if (disabled) return colors.gray300;
        if (variant === 'filled') {
            if (gradient) return gradient;
            return bgColor || colors.primary;
        }
        return 'transparent';
    };

    const getTextColor = () => {
        if (disabled) return colors.textDisabled;
        if (variant === 'filled') return color || '#fff';
        if (variant === 'outlined') return color || bgColor || colors.primary;
        return color || bgColor || colors.primary;
    };

    const getBorder = () => {
        if (disabled) return `1px solid ${colors.gray300}`;
        if (variant === 'outlined') {
            const borderColor = color || bgColor || colors.primary;
            return `2px solid ${borderColor}`;
        }
        if (variant === 'text') return 'none';
        return `1px solid ${colors.border}`;
    };

    const backgroundFinal = getBackground();
    const textColorFinal = getTextColor();
    const borderFinal = getBorder();

    let finalPadding = padding || sz.padding;
    if (typeof finalPadding === 'number') finalPadding = `${finalPadding}px`;

    const makeIcon = (iconName, customSize) => {
        if (!iconName) return null;
        return Icon({ 
            name: iconName, 
            size: customSize || sz.iconSize, 
            color: textColorFinal,
            display: 'inline-flex'
        });
    };

    // Build content based on all possible icons
    const children = [];
    
    // Add top icon (if any)
    const topIconEl = makeIcon(iconTop || (icon && iconPosition === 'top' ? icon : null));
    if (topIconEl) children.push(topIconEl);
    
    // Create middle row container for left + text + right
    const middleRow = [];
    
    // Add left icon
    const leftIconEl = makeIcon(iconLeft || (icon && iconPosition === 'left' ? icon : null));
    if (leftIconEl) middleRow.push(leftIconEl);
    
    // Add text
    if (text) {
        middleRow.push(Text({ text, color: textColorFinal, size: sz.fontSize }));
    }
    
    // Add right icon
    const rightIconEl = makeIcon(iconRight || (icon && iconPosition === 'right' ? icon : null));
    if (rightIconEl) middleRow.push(rightIconEl);
    
    // Add middle row if it has any content
    if (middleRow.length > 0) {
        const middleContainer = WidgetFactory({
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sz.gap,
            child: middleRow
        });
        children.push(middleContainer);
    }
    
    // Add bottom icon
    const bottomIconEl = makeIcon(iconBottom || (icon && iconPosition === 'bottom' ? icon : null));
    if (bottomIconEl) children.push(bottomIconEl);
    
    // Fallback: if no icons and no text, but icon prop exists
    if (children.length === 0 && icon) {
        children.push(makeIcon(icon));
    }

    // Determine layout direction based on presence of top/bottom icons
    let flexDirection = 'column';
    let display = 'inline-flex';
    
    // If there are top/bottom icons, use column layout
    if (topIconEl || bottomIconEl) {
        flexDirection = 'column';
        display = 'inline-flex';
    } else {
        flexDirection = 'row';
        display = 'inline-flex';
    }

    // Build button
    const button = WidgetFactory({
        tag: 'button',
        display: display,
        flexDirection: flexDirection,
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        padding: finalPadding,
        margin: margin,
        borderRadius: borderRadius,
        width: fullWidth ? '100%' : 'auto',
        gradient: gradient,
        backgroundColor: backgroundFinal,
        border: borderFinal,
        color: textColorFinal,
        boxShadow: shadows[elevation] || shadows[0],
        fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        onclick: disabled ? null : onPress,
        child: children.length === 1 ? children[0] : children,
        ...rest
    });

    if (fullWidth) {
        button.style.boxSizing = 'border-box';
    } else {
        button.style.flexShrink = '0';
    }

    if (button.setAttribute) {
        button.setAttribute('type', 'button');
    }

    return button;
};

export default Button;
