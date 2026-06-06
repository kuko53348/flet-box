// widgets/Avatar.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';
import { Image } from './Image.js';
import { Icon } from './Icon.js';
import { Text } from './Text.js';

export const Avatar = (props) => {
    let {
        src,
        name,
        size = 40,
        shape = 'circle',
        bgColor = colors.primary,
        textColor = colors.text,
        icon,
        onPress,
        ...rest
    } = props;

    // Determine borderRadius based on shape
    let borderRadius = '50%';
    if (shape === 'rounded') borderRadius = `${size * 0.2}px`;
    if (shape === 'square') borderRadius = '0';

    // Get initials from full name
    const getInitials = (fullName) => {
        if (!fullName) return '?';
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Determine content based on src, icon, or name
    let content = null;
    if (src) {
        content = Image({
            src: src,
            width: '100%',
            height: '100%',
            fit: 'cover'
        });
    } else if (icon) {
        content = Icon({
            name: icon,
            size: size * 0.5,
            color: textColor
        });
    } else if (name) {
        const initials = getInitials(name);
        content = Text({
            text: initials,
            color: textColor,
            size: size * 0.4,
            weight: 'bold'
        });
    } else {
        content = Icon({
            name: 'person',
            size: size * 0.5,
            color: textColor
        });
    }

    // Create avatar using WidgetFactory
    const avatar = WidgetFactory({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        borderRadius: borderRadius,
        backgroundColor: bgColor,
        color: textColor,
        overflow: 'hidden',
        fontSize: typeof size === 'number' ? `${size * 0.4}px` : '16px',
        fontWeight: '500',
        userSelect: 'none',
        cursor: onPress ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
        child: content,
        onclick: onPress,
        ...rest
    });

    // Hover effects if onPress exists
    if (onPress) {
        avatar.addEventListener('mouseenter', () => {
            avatar.style.transform = 'scale(1.05)';
        });
        avatar.addEventListener('mouseleave', () => {
            avatar.style.transform = 'scale(1)';
        });
    }

    // Method to update avatar content dynamically
    avatar.updateContent = (newProps) => {
        // Update properties
        if (newProps.src !== undefined) src = newProps.src;
        if (newProps.name !== undefined) name = newProps.name;
        if (newProps.icon !== undefined) icon = newProps.icon;
        if (newProps.bgColor !== undefined) avatar.style.backgroundColor = newProps.bgColor;
        if (newProps.size !== undefined) {
            const newSize = newProps.size;
            avatar.style.width = typeof newSize === 'number' ? `${newSize}px` : newSize;
            avatar.style.height = typeof newSize === 'number' ? `${newSize}px` : newSize;
            avatar.style.fontSize = typeof newSize === 'number' ? `${newSize * 0.4}px` : '16px';
        }
        
        // Recreate content
        let newContent = null;
        if (newProps.src !== undefined || src !== undefined) {
            const finalSrc = newProps.src !== undefined ? newProps.src : src;
            newContent = Image({ src: finalSrc, width: '100%', height: '100%', fit: 'cover' });
        } else if (newProps.icon !== undefined || icon !== undefined) {
            const finalIcon = newProps.icon !== undefined ? newProps.icon : icon;
            const finalSize = newProps.size || size;
            newContent = Icon({ name: finalIcon, size: finalSize * 0.5, color: textColor });
        } else if (newProps.name !== undefined || name !== undefined) {
            const finalName = newProps.name !== undefined ? newProps.name : name;
            const initials = getInitials(finalName);
            const finalSize = newProps.size || size;
            newContent = Text({ text: initials, color: textColor, size: finalSize * 0.4, weight: 'bold' });
        } else {
            const finalSize = newProps.size || size;
            newContent = Icon({ name: 'person', size: finalSize * 0.5, color: textColor });
        }
        
        // Replace child
        while (avatar.firstChild) avatar.removeChild(avatar.firstChild);
        avatar.appendChild(newContent);
        avatar._child = newContent;
    };

    return avatar;
};

export default Avatar;
