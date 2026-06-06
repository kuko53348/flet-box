// widgets/Accordion.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';
import { Container } from './Container.js';
import { Row } from './Row.js';
import { Text } from './Text.js';
import { Icon } from './Icon.js';

export const Accordion = (props) => {
    const {
        title,
        children,
        expanded = false,
        onToggle,
        variant = 'contained',
        borderRadius = 8,
        titleColor = colors.text,
        titleSize = 14,
        titleWeight = '500',
        bgColor = colors.surface,
        expandedColor = colors.primary,
        iconCollapsed = 'chevron_right',
        iconExpanded = 'expand_more',
        iconColor = colors.textSecondary,
        iconSize = 20,
        divider = true,
        dividerColor = colors.border,
        disabled = false,
        animate = true,
        ...rest
    } = props;

    let isExpanded = expanded;
    let contentWrapper = null;
    let contentElement = null;

    // Main container
    const container = Container({
        style: {
            width: '100%',
            backgroundColor: variant === 'contained' ? bgColor : 'transparent',
            border: variant === 'outlined' ? `1px solid ${dividerColor}` : 'none',
            borderRadius: borderRadius + 'px',
            overflow: 'hidden'
        },
        ...rest
    });

    // Animation wrapper
    contentWrapper = WidgetFactory({
        tag: 'div',
        style: {
            overflow: 'hidden',
            transition: animate ? 'height 0.3s ease' : 'none',
            height: isExpanded ? 'auto' : '0'
        }
    });

    // Content
    contentElement = Container({
        style: {
            padding: '16px',
            borderTop: divider && isExpanded ? `1px solid ${dividerColor}` : 'none'
        },
        children: children
    });
    contentWrapper.appendChild(contentElement);

    // Title
    const titleElement = Text({
        text: title,
        size: titleSize,
        weight: titleWeight,
        color: isExpanded ? expandedColor : titleColor,
        style: { flex: 1 }
    });

    const iconElement = Icon({
        name: isExpanded ? iconExpanded : iconCollapsed,
        size: iconSize,
        color: iconColor,
        style: { transition: animate ? 'transform 0.3s ease' : 'none' }
    });

    const titleBar = Row({
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        style: {
            padding: '12px 16px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            backgroundColor: isExpanded && variant === 'contained' ? `${expandedColor}10` : 'transparent'
        },
        children: [titleElement, iconElement]
    });

    container.appendChild(titleBar);
    container.appendChild(contentWrapper);

    const toggle = () => {
        if (disabled) return;
        isExpanded = !isExpanded;

        // Update UI
        titleElement.color = isExpanded ? expandedColor : titleColor;
        iconElement.name = isExpanded ? iconExpanded : iconCollapsed;

        if (variant === 'contained') {
            titleBar.style.backgroundColor = isExpanded ? `${expandedColor}10` : 'transparent';
        }

        if (divider) {
            contentElement.style.borderTop = isExpanded ? `1px solid ${dividerColor}` : 'none';
        }

        if (animate) {
            if (isExpanded) {
                contentWrapper.style.height = contentElement.offsetHeight + 'px';
                setTimeout(() => {
                    contentWrapper.style.height = 'auto';
                }, 300);
            } else {
                contentWrapper.style.height = contentElement.offsetHeight + 'px';
                setTimeout(() => {
                    contentWrapper.style.height = '0';
                }, 10);
            }
        } else {
            contentWrapper.style.height = isExpanded ? 'auto' : '0';
        }

        if (onToggle) onToggle(isExpanded);
    };

    titleBar.onclick = toggle;

    // Initialize height
    setTimeout(() => {
        if (isExpanded) {
            contentWrapper.style.height = 'auto';
        } else {
            contentWrapper.style.height = '0';
        }
    }, 0);

    // Public methods
    const setExpanded = (exp, triggerCallback = true) => {
        if (isExpanded === exp) return;
        toggle();
        if (triggerCallback && onToggle) onToggle(isExpanded);
    };

    Object.defineProperty(container, 'expanded', {
        get: () => isExpanded,
        set: (val) => setExpanded(val)
    });

    container.setExpanded = setExpanded;
    container.toggle = toggle;

    return container;
};

export default Accordion;
