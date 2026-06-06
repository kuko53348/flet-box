// widgets/Chip.js
import { WidgetFactory } from '../widget-factory/index.js';
import { Row } from './Row.js';
import { Text } from './Text.js';
import { Icon } from './Icon.js';
import { colors } from '../utils/themes.js';

export const Chip = (props) => {
    const {
        label,
        icon,
        onPress,
        onDelete,
        variant = 'filled',
        color = colors.primary,
        textColor,
        borderColor,
        borderRadius = 32,
        padding = '4px 12px',
        gap = 4,
        size = 12,
        elevation = 0,
        ...rest
    } = props;

    // Determine colors based on variant
    let bgColor, txtColor, brdColor;
    
    if (variant === 'outlined') {
        bgColor = 'transparent';
        txtColor = textColor || color;
        brdColor = borderColor || color;
    } else {
        bgColor = color;
        txtColor = textColor || '#fff';
        brdColor = 'transparent';
    }

    const children = [];

    // Left icon (optional)
    if (icon) {
        children.push(Icon({
            name: icon,
            size: size,
            color: txtColor
        }));
    }

    // Chip text
    children.push(Text({
        text: label,
        size: size,
        color: txtColor,
        weight: '500'
    }));

    // Delete button (optional)
    if (onDelete) {
        const closeIcon = Icon({
            name: 'close',
            size: size - 2,
            color: txtColor,
            style: { cursor: 'pointer' },
            onclick: (e) => {
                e.stopPropagation();
                onDelete();
            }
        });
        children.push(closeIcon);
    }

    // Chip content using Row
    const chipContent = Row({
        alignItems: 'center',
        gap: gap,
        backgroundColor: bgColor,
        border: variant === 'outlined' ? `1px solid ${brdColor}` : 'none',
        borderRadius: borderRadius,
        padding: padding,
        width: 'fit-content',
        minWidth: 'auto',
        boxShadow: elevation > 0 ? `0 ${elevation}px ${elevation * 2}px rgba(0,0,0,0.1)` : 'none',
        children: children,
        ...rest
    });

    // Main chip using WidgetFactory
    const chip = WidgetFactory({
        display: 'inline-block',
        cursor: onPress ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        child: chipContent,
        onclick: onPress,
        ...rest
    });

    // Interactive effects (hover, press) - WidgetFactory already handles some
    // We add custom hover effects for variant-specific behavior
    if (onPress) {
        chip.addEventListener('mouseenter', () => {
            if (variant === 'filled') {
                chip.style.opacity = '0.85';
            } else if (chipContent) {
                chipContent.style.backgroundColor = `${color}10`;
            }
        });
        chip.addEventListener('mouseleave', () => {
            if (variant === 'filled') {
                chip.style.opacity = '1';
            } else if (chipContent) {
                chipContent.style.backgroundColor = 'transparent';
            }
        });
    }

    return chip;
};

export default Chip;
