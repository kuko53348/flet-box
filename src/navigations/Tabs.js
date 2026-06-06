// navigations/Tabs.js - Slider con texto visible
import { createWidget } from '../widget-builder/index.js';
import { colors } from '../utils/themes.js';
import { Container } from '../widgets/Container.js';
import { Row } from '../widgets/Row.js';
import { Text } from '../widgets/Text.js';
import { Icon } from '../widgets/Icon.js';

export const Tabs = (props) => {
    const {
        tabs = [],
        children = [],
        activeIndex = 0,
        onChange,
        variant = 'underline',
        size = 'medium',
        color = colors.primary,
        textColor = colors.text,
        activeTextColor = colors.white,
        bgColor = colors.gray100,
        buttonColor =colors.secondary,
        alignment = 'left',
        fullWidth = true,
        showDivider = true,
        dividerColor = colors.border,
        showIcon = false,
        iconPosition = 'left',
        iconSize = 18,
        badges = [],
        ...rest
    } = props;

    let currentIndex = activeIndex;
    let sliderIndicator = null;

    const sizes = {
        small: { p: '6px 12px', f: 12, g: 4, i: 14, cp: 12, h: 32 },
        medium: { p: '8px 16px', f: 14, g: 8, i: 18, cp: 16, h: 40 },
        large: { p: '12px 20px', f: 16, g: 10, i: 22, cp: 20, h: 48 }
    };
    const sz = sizes[size] || sizes.medium;

    const getLabel = (t) => typeof t === 'object' ? (t.label || t.title) : String(t);
    const getIcon = (t) => typeof t === 'object' ? (t.icon || null) : null;
    const getBadge = (i) => badges[i] || (tabs[i]?.badge || null);

    const container = Container({
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        style: { 
          ...rest.style 
        },
        ...rest
    });

    // Tab bar - contenedor con fondo y borderRadius
    const tabBar = Container({
            position: 'relative',
            backgroundColor: variant === 'slider' ? bgColor : (variant === 'filled' ? bgColor : 'transparent'),
            borderBottom: variant === 'underline' && showDivider ? `1px solid ${dividerColor}` : 'none',
            borderRadius: variant === 'slider' ? 24 : (variant === 'pills' ? 20 : 0),
            padding: variant === 'slider' ? '4px' : 0,
            flexShrink: 0
    });

    // Tabs wrapper
    const tabsWrapper = Row({
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: variant === 'pills' ? 4 : 0,
        position: 'relative',
        flexWrap: 'nowrap',
        width: fullWidth ? '100%' : 'auto',
        backgroundColor: variant === 'slider' ? bgColor : 'transparent',
        borderRadius: variant === 'slider' ? 24 : 0,
        padding: variant === 'slider' ? '4px' : 0
    });

    const tabButtons = [];

    tabs.forEach((tab, idx) => {
        const label = getLabel(tab);
        const icon = getIcon(tab);
        const badge = getBadge(idx);
        const isActive = currentIndex === idx;

        const content = [];
        if (showIcon && icon && iconPosition === 'left') content.push(Icon({ name: icon, size: iconSize || sz.i, color: isActive ? activeTextColor : textColor }));
        if (label) content.push(Text({ value: label, size: sz.f, color: isActive ? activeTextColor : textColor, fontWeight: isActive ? '500' : '400' }));
        if (badge) content.push(
          Container({ 
              backgroundColor: colors.danger, 
              borderRadius: 10,
              padding: '2px 6px', 
              marginLeft: 4,
            child: Text({ value: String(badge), size: 10, color: '#fff' }) }));

        // Botón con fondo transparente, el color lo da el slider
        const btn = Container({
            borderRadius: variant === 'slider' ? 20 : (variant === 'pills' ? 20 : 0),
            backgroundColor: 'transparent',  // ← fondo transparente
            color: isActive ? activeTextColor : textColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sz.g,
            padding: sz.p,
            cursor: 'pointer',
            transition: 'all 0.2s',
            flex: fullWidth ? 1 : '0 0 auto',
            whiteSpace: 'nowrap',
            minHeight: sz.h - (variant === 'slider' ? 8 : 0),
            style: {
                zIndex: 2,
            },
            child: Row({ 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 4, 
              children: content
            })
        });

        btn.onclick = () => {
            if (currentIndex !== idx) {
                currentIndex = idx;
                updateActiveTab(idx);
                onChange?.(idx);
            }
        };

        tabButtons.push(btn);
        tabsWrapper.appendChild(btn);
    });

    // Slider indicator (detrás del texto)
    if (variant === 'slider') {
        sliderIndicator = createWidget('div')({
            position: 'absolute',
            top: '4px',
            left: '4px',
            height: 'calc(100% - 8px)',
            backgroundColor: buttonColor,
            borderRadius: 20,
            transition: 'transform 0.3s ease, width 0.3s ease',
            style: {
                zIndex: 1  // ← detrás del texto (zIndex menor que los botones)
            }
        });
        tabsWrapper.appendChild(sliderIndicator);
    }

    tabBar.appendChild(tabsWrapper);
    container.appendChild(tabBar);

    // Content container
    const contentContainer = Container({
          display: 'flex',
          padding: `${sz.cp}px 0`, width: '100%', overflow: 'auto' 
    });
    container.appendChild(contentContainer);

    const updateContent = () => {
        while (contentContainer.firstChild) contentContainer.removeChild(contentContainer.firstChild);
        const active = children[currentIndex];
        if (active instanceof HTMLElement) contentContainer.appendChild(active);
    };

    const updateActiveTab = (idx) => {
        // Update text and icon colors only (background handled by slider)
        tabButtons.forEach((btn, i) => {
            const isActive = i === idx;
            btn.style.color = isActive ? activeTextColor : textColor;
            
            const text = btn.querySelector('span:not(.material-icons)');
            if (text) {
                text.style.color = isActive ? activeTextColor : textColor;
                text.style.fontWeight = isActive ? '500' : '400';
            }
            const iconEl = btn.querySelector('.material-icons');
            if (iconEl) {
                iconEl.style.color = isActive ? activeTextColor : textColor;
            }
        });

        // Update slider indicator position
        if (sliderIndicator && tabButtons[idx]) {
            const btn = tabButtons[idx];
            const btnRect = btn.getBoundingClientRect();
            const wrapperRect = tabsWrapper.getBoundingClientRect();
            sliderIndicator.style.width = `${btnRect.width}px`;
            sliderIndicator.style.transform = `translateX(${btnRect.left - wrapperRect.left}px)`;
        }

        updateContent();
    };

    setTimeout(() => updateActiveTab(currentIndex), 16);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (sliderIndicator && tabButtons[currentIndex]) {
                const btn = tabButtons[currentIndex];
                const btnRect = btn.getBoundingClientRect();
                const wrapperRect = tabsWrapper.getBoundingClientRect();
                sliderIndicator.style.width = `${btnRect.width}px`;
                sliderIndicator.style.transform = `translateX(${btnRect.left - wrapperRect.left}px)`;
            }
        }, 100);
    });

    Object.defineProperty(container, 'activeIndex', {
        get: () => currentIndex,
        set: (idx) => {
            if (idx >= 0 && idx < tabs.length && currentIndex !== idx) {
                currentIndex = idx;
                updateActiveTab(idx);
                onChange?.(idx);
            }
        }
    });
    container.setActiveTab = (idx) => { container.activeIndex = idx; };

    return container;
};

export default Tabs;
