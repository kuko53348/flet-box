/**
 * TRANSLATE PROPS - Converts shorthand to CSS properties
 * @module widget-builder/translateProps
 */

import { toREM, remProps } from './utils.js';

// ========== PROPS VALIDATOR ==========
// Only enabled in development mode
const VALIDATION_ENABLED = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

// Check if string is a pure number (no units)
const isPureNumberString = (str) => {
    return /^\d+(\.\d+)?$/.test(str);
};

// Check if string is a valid CSS value with units
const isValidCSSValue = (str) => {
    return /^(auto|none|inherit|initial|unset|0|\d+(\.\d+)?(px|rem|em|%|vw|vh|vmin|vmax)?)$/i.test(str);
};

// Props that must be numbers
const NUMERIC_PROPS = new Set([
    'width', 'height', 'minW', 'maxW', 'minH', 'maxH',
    'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'padding', 'margin', 'gap', 'borderRadius', 'zIndex', 'opacity',
    'top', 'right', 'bottom', 'left', 'flex', 'flexGrow', 'flexShrink',
    'size', 'fontSize', 'lineH', 'lineHeight', 'letterSpace', 'letterSpacing',
    'rounded', 'borderW', 'borderWidth', 'elevation', 'duration', 'delay',
    'tabIndex', 'colspan', 'rowspan', 'min', 'max', 'step', 'order',
    'maxLength'
]);

// Props that must be functions
const EVENT_PROPS = new Set([
    'onPress', 'onClick', 'onDoublePress', 'onDoubleClick', 'onRightClick',
    'onHover', 'onHoverEnd', 'onMouseEnter', 'onMouseLeave',
    'onFocus', 'onBlur', 'onChange', 'onInput', 'onScroll',
    'onKeyDown', 'onKeyUp', 'onKeyPress', 'onLoad', 'onError',
    'onSubmit', 'onReset', 'onTouchStart', 'onTouchMove', 'onTouchEnd'
]);

// Props that must be strings
const STRING_PROPS = new Set([
    'id', 'className', 'class', 'name', 'type', 'href', 'target',
    'src', 'alt', 'placeholder', 'title', 'lang', 'dir', 'role',
    'download', 'rel', 'accept', 'pattern', 'autoComplete', 'ariaLabel',
    'text', 'value', 'label', 'buttonText', 'caption', 'description', 'message',
    'validation', 'customPattern'
]);

// Props that must be booleans
const BOOLEAN_PROPS = new Set([
    'disabled', 'readOnly', 'required', 'checked', 'selected',
    'hidden', 'draggable', 'spellCheck', 'multiple', 'autoFocus',
    'wrap', 'infinite', 'showArrows', 'showDots', 'showLabels', 'showValue',
    'showValidationMessage', 'showValidationIcon'
]);

// Valid CSS properties (for unknown prop warnings)
const VALID_CSS_PROPS = new Set([
    'display', 'flexDirection', 'justifyContent', 'alignItems', 'alignSelf',
    'flexWrap', 'flexBasis', 'position', 'inset', 'zIndex', 'overflow',
    'backgroundColor', 'color', 'border', 'borderWidth', 'borderColor',
    'borderStyle', 'borderRadius', 'boxShadow', 'textAlign', 'textDecoration',
    'textTransform', 'whiteSpace', 'wordBreak', 'overflowWrap', 'cursor',
    'transform', 'transition', 'animation', 'background', 'backgroundImage',
    'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'opacity'
]);

// Warning helper
const warn = (prop, expected, received, widgetName = 'Widget') => {
    if (!VALIDATION_ENABLED) return;
    console.warn(
        `⚠️ [${widgetName}] Prop "${prop}" should be ${expected}, received: ${received}`
    );
};

// Validate and fix prop value
const validateProp = (key, value, widgetName) => {
    if (value === undefined || value === null) return value;
    
    // 1. Validate numeric props (with CSS value support)
    if (NUMERIC_PROPS.has(key)) {
        if (typeof value === 'number') {
            return value;
        }
        
        if (typeof value === 'string') {
            if (isPureNumberString(value)) {
                warn(key, 'a number (use number directly, not string)', typeof value, widgetName);
                return parseFloat(value);
            } else if (isValidCSSValue(value)) {
                return value;
            } else {
                warn(key, 'a number or valid CSS value (%, px, rem, vw, auto)', typeof value, widgetName);
                return undefined;
            }
        }
        
        warn(key, 'a number or valid CSS value', typeof value, widgetName);
        return undefined;
    }
    
    // 2. Validate event props
    if (EVENT_PROPS.has(key)) {
        if (typeof value !== 'function') {
            warn(key, 'a function', typeof value, widgetName);
            return undefined;
        }
        return value;
    }
    
    // 3. Validate string props
    if (STRING_PROPS.has(key)) {
        if (typeof value !== 'string' && typeof value !== 'number') {
            warn(key, 'a string', typeof value, widgetName);
            return String(value);
        }
        return value;
    }
    
    // 4. Validate boolean props
    if (BOOLEAN_PROPS.has(key)) {
        if (typeof value !== 'boolean') {
            warn(key, 'a boolean', typeof value, widgetName);
            return Boolean(value);
        }
        return value;
    }
    
    // 5. Warning for unknown props (development only)
    if (VALIDATION_ENABLED && !VALID_CSS_PROPS.has(key) && !propMap[key]) {
        console.warn(
            `⚠️ [${widgetName}] Unknown prop: "${key}". Check for typos.`
        );
    }
    
    return value;
};

// ========== PROPS MAP ==========
const propMap = {
    // ========== SHORTHANDS ==========
    'p': 'padding',
    'm': 'margin',
    'w': 'width',
    'h': 'height',
    'minW': 'minWidth',
    'maxW': 'maxWidth',
    'minH': 'minHeight',
    'maxH': 'maxHeight',
    'pos': 'position',
    'z': 'zIndex',
    
    // ========== BORDERS ==========
    'border': 'border',
    'borderW': 'borderWidth',
    'borderC': 'borderColor',
    'borderS': 'borderStyle',
    'rounded': 'borderRadius',
    'roundedTop': 'borderTopLeftRadius',
    'roundedTopLeft': 'borderTopLeftRadius',
    'roundedTopRight': 'borderTopRightRadius',
    'roundedBottom': 'borderBottomLeftRadius',
    'roundedBottomLeft': 'borderBottomLeftRadius',
    'roundedBottomRight': 'borderBottomRightRadius',
    'roundedLeft': 'borderTopLeftRadius',
    'roundedRight': 'borderTopRightRadius',
    
    // ========== BACKGROUND ==========
    'bg': 'background',
    'bgColor': 'backgroundColor',
    'bgImage': 'backgroundImage',
    'bgSize': 'backgroundSize',
    'bgPosition': 'backgroundPosition',
    'bgRepeat': 'backgroundRepeat',
    'gradient': 'backgroundImage',
    
    // ========== TEXT & FONTS ==========
    'size': 'fontSize',
    'weight': 'fontWeight',
    'lineH': 'lineHeight',
    'letterSpace': 'letterSpacing',
    'textColor': 'color',
    'textAlign': 'textAlign',
    'textDecoration': 'textDecoration',
    'textTransform': 'textTransform',
    'whiteSpace': 'whiteSpace',
    'wordBreak': 'wordBreak',
    'overflowWrap': 'overflowWrap',
    
    // ========== CONTENT ==========
    'value': 'textContent',
    'text': 'textContent',
    'label': 'textContent',
    'buttonText': 'textContent',
    'title': 'textContent',
    'caption': 'textContent',
    'description': 'textContent',
    'message': 'textContent',
    
    // ========== FLEXBOX ==========
    'direction': 'flexDirection',
    'justify': 'justifyContent',
    'align': 'alignItems',
    'wrap': 'flexWrap',
    'flex': 'flex',
    'flexGrow': 'flexGrow',
    'flexShrink': 'flexShrink',
    'flexBasis': 'flexBasis',
    'alignSelf': 'alignSelf',
    'alignContent': 'alignContent',
    'justifySelf': 'justifySelf',
    'justifyItems': 'justifyItems',
    'order': 'order',
    
    // ========== GRID ==========
    'gridCols': 'gridTemplateColumns',
    'gridRows': 'gridTemplateRows',
    'colSpan': 'gridColumn',
    'rowSpan': 'gridRow',
    'gridGap': 'gap',
    'gridColumnGap': 'columnGap',
    'gridRowGap': 'rowGap',
    
    // ========== POSITIONING ==========
    'top': 'top',
    'right': 'right',
    'bottom': 'bottom',
    'left': 'left',
    'inset': 'inset',
    
    // ========== SPACING & SIZING ==========
    'paddingTop': 'paddingTop',
    'paddingRight': 'paddingRight',
    'paddingBottom': 'paddingBottom',
    'paddingLeft': 'paddingLeft',
    'marginTop': 'marginTop',
    'marginRight': 'marginRight',
    'marginBottom': 'marginBottom',
    'marginLeft': 'marginLeft',
    
    // ========== EFFECTS ==========
    'shadow': 'boxShadow',
    'shadowColor': 'boxShadow',
    'shadowRadius': 'boxShadow',
    'shadowOffset': 'boxShadow',
    'opacity': 'opacity',
    'transform': 'transform',
    'scale': 'transform',
    'rotate': 'transform',
    'translate': 'transform',
    
    // ========== ANIMATIONS ==========
    'animate': 'animation',
    'transition': 'transition',
    'duration': 'transitionDuration',
    'timing': 'transitionTimingFunction',
    'delay': 'transitionDelay',
    'animationName': 'animationName',
    'animationDuration': 'animationDuration',
    'animationTiming': 'animationTimingFunction',
    'animationDelay': 'animationDelay',
    'animationIteration': 'animationIterationCount',
    'animationDirection': 'animationDirection',
    
    // ========== EVENTS ==========
    'onPress': 'onclick',
    'onClick': 'onclick',
    'onDoublePress': 'ondblclick',
    'onDoubleClick': 'ondblclick',
    'onRightClick': 'oncontextmenu',
    'onContextMenu': 'oncontextmenu',
    'onHover': 'onmouseenter',
    'onHoverEnd': 'onmouseleave',
    'onMouseEnter': 'onmouseenter',
    'onMouseLeave': 'onmouseleave',
    'onFocus': 'onfocus',
    'onBlur': 'onblur',
    'onChange': 'onchange',
    'onInput': 'oninput',
    'onScroll': 'onscroll',
    'onKeyDown': 'onkeydown',
    'onKeyUp': 'onkeyup',
    'onKeyPress': 'onkeypress',
    'onMouseDown': 'onmousedown',
    'onMouseUp': 'onmouseup',
    'onMouseMove': 'onmousemove',
    'onTouchStart': 'ontouchstart',
    'onTouchMove': 'ontouchmove',
    'onTouchEnd': 'ontouchend',
    'onSubmit': 'onsubmit',
    'onReset': 'onreset',
    'onLoad': 'onload',
    'onError': 'onerror',
    
    // ========== DOM ATTRIBUTES ==========
    'id': 'id',
    'className': 'className',
    'class': 'className',
    'name': 'name',
    'href': 'href',
    'target': 'target',
    'type': 'type',
    'src': 'src',
    'alt': 'alt',
    'disabled': 'disabled',
    'readOnly': 'readOnly',
    'required': 'required',
    'checked': 'checked',
    'selected': 'selected',
    'placeholder': 'placeholder',
    'role': 'role',
    'lang': 'lang',
    'dir': 'dir',
    'tabIndex': 'tabIndex',
    'draggable': 'draggable',
    'hidden': 'hidden',
    'download': 'download',
    'rel': 'rel',
    'accept': 'accept',
    'multiple': 'multiple',
    'pattern': 'pattern',
    'min': 'min',
    'max': 'max',
    'step': 'step',
    'autoComplete': 'autoComplete',
    'autoFocus': 'autoFocus',
    'spellCheck': 'spellCheck',
    
    // ========== ARIA & DATA ==========
    'ariaLabel': 'aria-label',
    'ariaHidden': 'aria-hidden',
    'ariaExpanded': 'aria-expanded',
    'ariaSelected': 'aria-selected',
    'ariaChecked': 'aria-checked',
    'data': 'data',
    
    // ========== VALIDATION PROPS (keep as is, no transformation) ==========
    'validation': 'validation',
    'customPattern': 'customPattern',
    'maxLength': 'maxLength',
    'required': 'required',
    'showValidationMessage': 'showValidationMessage',
    'showValidationIcon': 'showValidationIcon',
    'onValidated': 'onValidated'
};

// ========== EXPORTS ==========
export const originalToTranslated = {
    'value': 'textContent',
    'text': 'textContent',
    'label': 'textContent',
    'buttonText': 'textContent',
    'title': 'textContent',
    'caption': 'textContent',
    'description': 'textContent',
    'message': 'textContent',
    'textColor': 'color',
    'bgColor': 'backgroundColor',
    'rounded': 'borderRadius',
    'shadow': 'boxShadow',
    'onPress': 'onclick',
    'onClick': 'onclick',
    'onDoublePress': 'ondblclick',
    'onRightClick': 'oncontextmenu',
    'justify': 'justifyContent',
    'align': 'alignItems'
};

export const reactiveProps = [
    'textContent', 'value', 'text', 'label', 'buttonText', 'title', 'caption', 'description', 'message',
    'color', 'textColor', 'backgroundColor', 'bgColor',
    'borderRadius', 'rounded', 'boxShadow', 'shadow', 'border', 'borderColor', 'borderWidth', 'borderStyle',
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'padding', 'margin', 'gap', 'flex',
    'top', 'right', 'bottom', 'left', 'position', 'zIndex',
    'disabled', 'checked', 'selected', 'expanded', 'readOnly', 'required',
    'src', 'alt',
    'id', 'className', 'name', 'placeholder', 'type', 'href', 'target',
    'onclick', 'ondblclick', 'onmouseenter', 'onmouseleave', 'onfocus', 'onblur', 'onchange', 'oninput'
];

// ========== MAIN TRANSLATOR WITH VALIDATION ==========
export const createTranslator = (map, widgetName = 'Widget') => (props) => {
    let result = {};
    
    for (const [key, value] of Object.entries(props)) {
        // Validate the prop
        const validatedValue = validateProp(key, value, widgetName);
        if (validatedValue === undefined && value !== undefined) {
            continue; // Skip invalid props
        }
        
        // PADDING shorthands
        if (key === 'paddingHorizontal') {
            result.paddingLeft = validatedValue;
            result.paddingRight = validatedValue;
        }
        else if (key === 'paddingVertical') {
            result.paddingTop = validatedValue;
            result.paddingBottom = validatedValue;
        }
        // MARGIN shorthands
        else if (key === 'marginHorizontal') {
            result.marginLeft = validatedValue;
            result.marginRight = validatedValue;
        }
        else if (key === 'marginVertical') {
            result.marginTop = validatedValue;
            result.marginBottom = validatedValue;
        }
        // BORDER RADIUS shorthands
        else if (key === 'roundedTop') {
            result.borderTopLeftRadius = validatedValue;
            result.borderTopRightRadius = validatedValue;
        }
        else if (key === 'roundedBottom') {
            result.borderBottomLeftRadius = validatedValue;
            result.borderBottomRightRadius = validatedValue;
        }
        else if (key === 'roundedLeft') {
            result.borderTopLeftRadius = validatedValue;
            result.borderBottomLeftRadius = validatedValue;
        }
        else if (key === 'roundedRight') {
            result.borderTopRightRadius = validatedValue;
            result.borderBottomRightRadius = validatedValue;
        }
        // TRANSFORM shorthands
        else if (key === 'scale') {
            result.transform = `scale(${validatedValue})`;
        }
        else if (key === 'rotate') {
            result.transform = `rotate(${validatedValue}deg)`;
        }
        else if (key === 'translate') {
            if (typeof validatedValue === 'number') {
                result.transform = `translate(${validatedValue}px, ${validatedValue}px)`;
            } else if (Array.isArray(validatedValue)) {
                result.transform = `translate(${validatedValue[0]}px, ${validatedValue[1]}px)`;
            }
        }
        // Default mapping
        else {
            const mappedKey = map[key] || key;
            result[mappedKey] = validatedValue;
        }
    }
    
    // Convert numbers to rem
    remProps.forEach(prop => {
        if (typeof result[prop] === 'number') {
            result[prop] = toREM(result[prop]);
        }
    });
    
    return result;
};

// Default export with widget name support
export const translateProps = (props, widgetName = 'Widget') => {
    return createTranslator(propMap, widgetName)(props);
};

export default translateProps;
