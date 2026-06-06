// widgets/Rating.js
import { WidgetFactory } from '../widget-factory/index.js';
import { Row } from './Row.js';
import { Text } from './Text.js';
import { Icon } from './Icon.js';
import { colors, subscribeTheme } from '../utils/themes.js';

export const Rating = (props) => {
    const {
        value = 0,
        max = 5,
        onChange,
        readOnly = false,
        size = 20,
        activeColor: propActiveColor,
        inactiveColor: propInactiveColor,
        iconActive = 'star',
        iconInactive = 'star_border',
        iconHalf = 'star_half',
        gap = 2,
        allowHalf = false,
        showValue = false,
        valueColor = colors.textSecondary,
        valueSize,
        ...rest
    } = props;

    let activeColor = propActiveColor !== undefined ? propActiveColor : colors.warning;
    let inactiveColor = propInactiveColor !== undefined ? propInactiveColor : colors.border;
    let currentValue = Math.min(Math.max(value, 0), max);
    let starElements = [];
    let valueTextRef = null;
    let unsubscribeTheme = null;

    const updateStars = () => {
        starElements.forEach((star, index) => {
            const starNumber = index + 1;
            const icon = star.child;
            
            if (starNumber <= currentValue) {
                icon.name = iconActive;
                icon.color = activeColor;
            } else if (allowHalf && starNumber - 0.5 === currentValue) {
                icon.name = iconHalf;
                icon.color = activeColor;
            } else {
                icon.name = iconInactive;
                icon.color = inactiveColor;
            }
        });
        
        if (valueTextRef && showValue) {
            valueTextRef.text = currentValue.toFixed(1);
        }
    };

    const setValue = (newValue) => {
        if (readOnly) return;
        currentValue = Math.min(Math.max(newValue, 0), max);
        updateStars();
        if (onChange) onChange(currentValue);
    };

    // Create star widgets
    for (let i = 0; i < max; i++) {
        const starNumber = i + 1;
        const isFull = starNumber <= currentValue;
        const isHalf = allowHalf && !isFull && (starNumber - 0.5) === currentValue;
        
        const icon = Icon({
            name: isFull ? iconActive : (isHalf ? iconHalf : iconInactive),
            size: size,
            color: isFull || isHalf ? activeColor : inactiveColor
        });

        const star = WidgetFactory({
            display: 'inline-flex',
            cursor: readOnly ? 'default' : 'pointer',
            transition: 'transform 0.1s ease',
            child: icon
        });
        
        if (!readOnly) {
            star.onmouseenter = () => {
                star.style.transform = 'scale(1.15)';
                for (let j = 0; j <= i; j++) {
                    const prevIcon = starElements[j]?.child;
                    if (prevIcon) {
                        prevIcon.name = iconActive;
                        prevIcon.color = activeColor;
                    }
                }
                for (let j = i + 1; j < max; j++) {
                    const nextIcon = starElements[j]?.child;
                    if (nextIcon) {
                        nextIcon.name = iconInactive;
                        nextIcon.color = inactiveColor;
                    }
                }
            };
            
            star.onmouseleave = () => {
                star.style.transform = 'scale(1)';
                updateStars();
            };
            
            star.onclick = () => {
                let newValue = starNumber;
                if (allowHalf) {
                    if (currentValue === starNumber) {
                        newValue = starNumber - 0.5;
                    } else if (currentValue === starNumber - 0.5) {
                        newValue = starNumber;
                    } else {
                        newValue = starNumber;
                    }
                }
                setValue(newValue);
            };
        }
        
        starElements.push(star);
    }

    // Stars container
    const starsContainer = Row({
        alignItems: 'center',
        gap: gap,
        flexWrap: 'wrap',
        children: starElements
    });

    // Build rating widget
    const children = [starsContainer];
    
    if (showValue) {
        const valueText = Text({
            text: currentValue.toFixed(1),
            size: valueSize || size * 0.7,
            color: valueColor,
            weight: 'bold',
            minWidth: '40px',
            textAlign: 'center'
        });
        valueTextRef = valueText;
        children.push(valueText);
    }

    const ratingContainer = WidgetFactory({
        display: 'inline-flex',
        alignItems: 'center',
        gap: gap * 2,
        children: children,
        ...rest
    });

    // Theme subscription
    if (propActiveColor === undefined || propInactiveColor === undefined) {
        unsubscribeTheme = subscribeTheme(() => {
            if (propActiveColor === undefined) activeColor = colors.warning;
            if (propInactiveColor === undefined) inactiveColor = colors.border;
            updateStars();
        });
    }

    // Cleanup
    const originalCleanup = ratingContainer._cleanup;
    ratingContainer._cleanup = () => {
        if (unsubscribeTheme) unsubscribeTheme();
        if (originalCleanup) originalCleanup();
    };

    // Public methods
    ratingContainer.setValue = setValue;
    ratingContainer.getValue = () => currentValue;
    ratingContainer.updateStars = updateStars;

    Object.defineProperty(ratingContainer, 'value', {
        get: () => currentValue,
        set: (newValue) => setValue(newValue),
        enumerable: true
    });

    return ratingContainer;
};

export default Rating;
