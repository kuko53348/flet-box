/**
 * TRANSLATE PROPS - Converts shorthand to CSS properties
 * @module widget-builder/translateProps
 */

import { toREM, remProps } from './utils.js';

const pxProps = new Set([
    'fontSize', 'size',
    'borderRadius', 'borderWidth',
    'top', 'right', 'bottom', 'left', 'inset',
    'letterSpacing', 'wordSpacing', 'textIndent',
    'translateX', 'translateY', 'translateZ'
]);

// Shorthand to CSS property mapping
const propMap = {
    // Dimensions
    'w': 'width',
    'h': 'height',
    'minW': 'minWidth',
    'maxW': 'maxWidth',
    'minH': 'minHeight',
    'maxH': 'maxHeight',
    'size': 'fontSize',
    
    // Spacing
    'p': 'padding',
    'm': 'margin',
    'pt': 'paddingTop',
    'pr': 'paddingRight',
    'pb': 'paddingBottom',
    'pl': 'paddingLeft',
    'mt': 'marginTop',
    'mr': 'marginRight',
    'mb': 'marginBottom',
    'ml': 'marginLeft',
    'px': 'paddingHorizontal',   // handled separately
    'py': 'paddingVertical',     // handled separately
    'mx': 'marginHorizontal',    // handled separately
    'my': 'marginVertical',      // handled separately
    
    // Position
    'pos': 'position',
    'z': 'zIndex',
    
    // Borders
    'gradient': 'background',
    'rounded': 'borderRadius',
    'borderW': 'borderWidth',
    'borderC': 'borderColor',
    'borderS': 'borderStyle',
    
    // Colors
    'bgColor': 'backgroundColor',
    'textColor': 'color',
    'bg': 'background',
    
    // ========== CONTENT (text content) ==========
    'text': 'textContent',
    'label': 'textContent',
    'buttonText': 'textContent',
    'title': 'textContent',
    'caption': 'textContent',
    'description': 'textContent',
    'message': 'textContent',
    
    // Text styles
    'weight': 'fontWeight',
    'lineH': 'lineHeight',
    'letterSpace': 'letterSpacing',
    'textAlign': 'textAlign',
    
    // Flexbox
    'direction': 'flexDirection',
    'justify': 'justifyContent',
    'align': 'alignItems',
    'wrap': 'flexWrap',
    
    // Effects
    'shadow': 'boxShadow',
    
    // Events
    'onPress': 'onclick',
    'onClick': 'onclick',
    'onDoublePress': 'ondblclick',
    'onHover': 'onmouseenter',
    'onHoverEnd': 'onmouseleave',
    'onFocus': 'onfocus',
    'onBlur': 'onblur',
    'onChange': 'onchange',
    'onInput': 'oninput'
};

// Props that should NOT be transformed (passed as-is to DOM)
const PASSTHROUGH_PROPS = new Set([
    'id', 'className', 'class', 'name', 'type', 'href', 'target',
    'src', 'alt', 'placeholder', 'value', 'disabled', 'readOnly',
    'required', 'checked', 'selected', 'role', 'inputmode', 'autocomplete',
    'pattern', 'min', 'max', 'step', 'maxLength', 'validation', 'customPattern',
    'showValidationMessage', 'showValidationIcon', 'onValidated'
]);

// Props that are CSS properties
const CSS_PROPS = new Set([
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'backgroundColor', 'color', 'borderRadius', 'border', 'borderWidth',
    'borderColor', 'borderStyle', 'boxShadow', 'opacity', 'display',
    'flexDirection', 'justifyContent', 'alignItems', 'gap', 'position',
    'top', 'right', 'bottom', 'left', 'zIndex', 'cursor', 'overflow',
    'fontSize', 'fontWeight', 'lineHeight', 'textAlign', 'transform',
    'transition', 'animation', 'background', 'backgroundImage',
    'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'objectFit'
]);

export const translateProps = (props, widgetName = 'Widget') => {
    const result = {};
    
    for (const [key, value] of Object.entries(props)) {
        // Skip invalid values
        if (value === undefined || value === null) continue;
        
        // 🔥 PRIMERO: Verificar si es un shorthand que necesita mapeo
        if (propMap[key]) {
            const mappedKey = propMap[key];
            result[mappedKey] = value;
            continue;
        }
        
        // Handle special shorthands
        if (key === 'paddingHorizontal') {
            result.paddingLeft = value;
            result.paddingRight = value;
        }
        else if (key === 'paddingVertical') {
            result.paddingTop = value;
            result.paddingBottom = value;
        }
        else if (key === 'marginHorizontal') {
            result.marginLeft = value;
            result.marginRight = value;
        }
        else if (key === 'marginVertical') {
            result.marginTop = value;
            result.marginBottom = value;
        }
        else if (key === 'roundedTop') {
            result.borderTopLeftRadius = value;
            result.borderTopRightRadius = value;
        }
        else if (key === 'roundedBottom') {
            result.borderBottomLeftRadius = value;
            result.borderBottomRightRadius = value;
        }
        else if (key === 'roundedLeft') {
            result.borderTopLeftRadius = value;
            result.borderBottomLeftRadius = value;
        }
        else if (key === 'roundedRight') {
            result.borderTopRightRadius = value;
            result.borderBottomRightRadius = value;
        }
        else if (key === 'scale') {
            result.transform = `scale(${value})`;
        }
        else if (key === 'rotate') {
            result.transform = `rotate(${value}deg)`;
        }
        else if (key === 'translate') {
            if (typeof value === 'number') {
                result.transform = `translate(${value}px, ${value}px)`;
            } else if (Array.isArray(value)) {
                result.transform = `translate(${value[0]}px, ${value[1]}px)`;
            }
        }
        else {
            // Keep original key
            result[key] = value;
        }
    }

    remProps.forEach(prop => {
        if (typeof result[prop] === 'number') {
            if (pxProps.has(prop)) {
                result[prop] = `${result[prop]}px`;  // → px
                // console.log(` ===> ${result[prop]}`)
            } else {
                result[prop] = toREM(result[prop]);  // → rem
            }
        }
    });

    
    // 🔥 LOG PARA DEPURAR (eliminar después)
    // if (result.textContent) {
    //     console.log('✅ translateProps: textContent =', result.textContent);
    // }
    
    return result;
};

export default translateProps;
