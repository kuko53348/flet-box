// widgets/Dropdown.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';
import { Container } from './Container.js';
import { Row } from './Row.js';
import { Column } from './Column.js';
import { Text } from './Text.js';
import { Icon } from './Icon.js';

export const Dropdown = (props) => {
    const {
        options = [],
        value = null,
        onChange,
        placeholder = 'Select...',
        disabled = false,
        label,
        error = false,
        variant = 'outlined',
        size = 'medium',
        borderRadius = 8,
        color = colors.primary,
        bgColor = colors.surface,
        clearable = false,
        width = '100%',
        ...rest
    } = props;

    let isOpen = false;
    let selectedValue = value;
    let menuElement = null;

    const sizes = {
        small: { padding: '6px 12px', fontSize: 12 },
        medium: { padding: '8px 14px', fontSize: 14 },
        large: { padding: '12px 16px', fontSize: 16 }
    };
    const sz = sizes[size] || sizes.medium;

    const getLabel = (opt) => typeof opt === 'object' ? (opt.label || String(opt.value)) : String(opt);
    const getValue = (opt) => typeof opt === 'object' ? opt.value : opt;
    const getIcon = (opt) => typeof opt === 'object' ? (opt.icon || null) : null;

    const findSelected = () => options.find(opt => getValue(opt) === selectedValue);
    const selectedOption = findSelected();
    const displayText = selectedOption ? getLabel(selectedOption) : '';
    const displayIcon = selectedOption ? getIcon(selectedOption) : null;

    // Main container
    const container = Container({
        style: { position: 'relative', width: width },
        ...rest
    });

    // Label
    if (label) {
        const labelEl = WidgetFactory({
            tag: 'label',
            textContent: label,
            fontSize: '12px',
            color: error ? colors.danger : colors.textSecondary,
            marginBottom: '4px',
            display: 'block'
        });
        container.appendChild(labelEl);
    }

    // Left content
    const leftContent = [];
    if (displayIcon) leftContent.push(Text({ text: displayIcon, size: 16 }));
    leftContent.push(Text({
        text: displayText || placeholder,
        size: sz.fontSize,
        color: displayText ? colors.text : colors.textSecondary,
        style: { flex: 1 }
    }));

    // Right content
    const rightContent = [];
    if (clearable && selectedValue && !disabled) {
        const clearIcon = Icon({
            name: 'close',
            size: 16,
            style: { cursor: 'pointer' },
            onclick: (e) => {
                e.stopPropagation();
                selectedValue = null;
                onChange?.(null);
                updateDisplay();
                closeMenu();
            }
        });
        rightContent.push(clearIcon);
    }

    const arrowIcon = Icon({
        name: 'expand_more',
        size: 20,
        style: { transition: 'transform 0.2s' }
    });
    rightContent.push(arrowIcon);

    // Selector using Row
    const selector = Row({
        alignItems: 'center',
        justifyContent: 'space-between',
        style: {
            width: '100%',
            padding: sz.padding,
            backgroundColor: variant === 'filled' ? `${colors.surface}CC` : 'transparent',
            border: variant === 'outlined' ? `1px solid ${error ? colors.danger : colors.border}` : 'none',
            borderRadius: borderRadius + 'px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            boxSizing: 'border-box'
        },
        children: [
            Row({ alignItems: 'center', gap: 8, style: { flex: 1 }, children: leftContent }),
            Row({ alignItems: 'center', gap: 4, children: rightContent })
        ]
    });
    container.appendChild(selector);

    const updateDisplay = () => {
        const newSelected = findSelected();
        const newText = newSelected ? getLabel(newSelected) : '';
        const newIcon = newSelected ? getIcon(newSelected) : null;
        
        const leftRow = selector.children[0];
        while (leftRow.firstChild) leftRow.removeChild(leftRow.firstChild);
        if (newIcon) leftRow.appendChild(Text({ text: newIcon, size: 16 }));
        leftRow.appendChild(Text({
            text: newText || placeholder,
            size: sz.fontSize,
            color: newText ? colors.text : colors.textSecondary,
            style: { flex: 1 }
        }));
    };

    const closeMenu = () => {
        if (!isOpen) return;
        if (menuElement) {
            menuElement.remove();
            menuElement = null;
        }
        arrowIcon.style.transform = 'rotate(0deg)';
        isOpen = false;
    };

    const openMenu = () => {
        if (disabled || isOpen) return;
        isOpen = true;

        menuElement = Column({
            style: {
                position: 'absolute',
                zIndex: 1000,
                width: '100%',
                borderColor: props.borderColor || colors.border,
                backgroundColor: bgColor,
                borderRadius: borderRadius + 'px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                maxHeight: '250px',
                overflowY: 'auto',
                top: '100%',
                marginTop: '4px'
            }
        });

        options.forEach(opt => {
            const optValue = getValue(opt);
            const optLabel = getLabel(opt);
            const optIcon = getIcon(opt);
            const isSelected = (optValue === selectedValue);

            const leftOption = [];
            if (optIcon) leftOption.push(Text({ text: optIcon, size: 16 }));
            leftOption.push(Text({ text: optLabel, size: sz.fontSize, style: { flex: 1 } }));

            const optionItem = Row({
                style: {
                    padding: '10px 16px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? color + '15' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                },
                children: [
                    Row({ alignItems: 'center', gap: 8, style: { flex: 1 }, children: leftOption }),
                    isSelected ? Icon({ name: 'check', size: 16, color: color }) : null
                ].filter(Boolean)
            });

            optionItem.onmouseenter = () => optionItem.style.backgroundColor = colors.border;
            optionItem.onmouseleave = () => optionItem.style.backgroundColor = isSelected ? color + '15' : 'transparent';
            optionItem.onclick = () => {
                selectedValue = optValue;
                onChange?.(optValue);
                updateDisplay();
                closeMenu();
            };

            menuElement.appendChild(optionItem);
        });

        container.appendChild(menuElement);
        arrowIcon.style.transform = 'rotate(180deg)';

        setTimeout(() => {
            const onClickOutside = (e) => {
                if (!container.contains(e.target)) {
                    closeMenu();
                    document.removeEventListener('click', onClickOutside);
                }
            };
            document.addEventListener('click', onClickOutside);
        }, 0);
    };

    selector.onclick = () => isOpen ? closeMenu() : openMenu();

    Object.defineProperty(container, 'value', {
        get: () => selectedValue,
        set: (newVal) => {
            selectedValue = newVal;
            updateDisplay();
            closeMenu();
            onChange?.(newVal);
        }
    });

    container.open = openMenu;
    container.close = closeMenu;

    return container;
};

export default Dropdown;
