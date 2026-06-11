// widgets/FloatingActionButton.js (o navigations/FloatingActionButton.js)
/**
 * FloatingActionButton Component
 * @module widgets/FloatingActionButton
 */

import { Container } from './Container.js';
import { Row } from './Row.js';
import { Text } from './Text.js';
import { Icon } from './Icon.js';
import { colors } from '../utils/themes.js';

export const FloatingActionButton = (props) => {
    const {
        icon = 'add',
        label,
        onPress,
        backgroundColor = colors.primary,
        foregroundColor = '#ffffff',
        elevation = 6,
        borderRadius = 48,
        padding= 12,
        mini = false,
        extended = false,
        disabled = false,
        ...rest
    } = props;

    const size = mini ? 40 : 56;
    const iconSize = mini ? 20 : 24;

    const children = [
        Icon({
            padding,
            borderRadius,
            name: icon,
            size: iconSize,
            color: foregroundColor
        })
    ];

    if (extended && label) {
        children.push(Text({
            value: label,
            size: 14,
            fontWeight: '500',
            color: foregroundColor
        }));
    }

    const button = Container({
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: extended ? 'auto' : size,
            height: size,
            borderRadius: extended ? 24 : '50%',
            backgroundColor: backgroundColor,
            color: foregroundColor,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            boxShadow: `0 ${elevation / 2}px ${elevation}px rgba(0,0,0,0.3)`,
            transition: 'all 0.2s ease',
            padding: extended ? '0 20px' : 0,
            ...rest.style
        },
        child: extended ? Row({ alignItems: 'center', gap: 8, children }) : children[0],
        ...rest
    });

    if (onPress && !disabled) {
        button.addEventListener('click', onPress);
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    }

    return button;
};

export default FloatingActionButton;
