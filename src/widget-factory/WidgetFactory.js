// src/widget-factory/WidgetFactory.js
import { createWidget } from '../widget-builder/index.js';
import { registerWidget } from '../tools/useState.js';

export const WidgetFactory = (props) => {
    const { style: userStyle = {}, ...rest } = props;
    
    // 🔥 DETECTAR VALORES REACTIVOS DE useState
    const reactiveBindings = [];
    const processedProps = { ...rest };
    
    // Recorrer todas las props para encontrar valores reactivos
    for (const [key, value] of Object.entries(rest)) {
        // Detectar si es un valor reactivo de useState
        if (value && typeof value === 'object' && value._isReactive === true) {
            reactiveBindings.push({ key, stateKey: value._stateKey });
            // Reemplazar con el valor actual para el widget
            processedProps[key] = value._value;
        }
    }
    
    const {
        // ========== CONTENT ==========
        child, children,
        
        // ========== DIMENSIONS ==========
        width, height, minWidth, minHeight, maxWidth, maxHeight,
        
        // ========== SPACING ==========
        padding, paddingTop, paddingRight, paddingBottom, paddingLeft,
        margin, marginTop, marginRight, marginBottom, marginLeft,
        
        // ========== COLORS & GRADIENTS ==========
        bgColor,
        gradient,           // ← NUEVO: soporte para gradiente
        color,
        
        // ========== BORDERS ==========
        borderRadius, borderTopLeftRadius, borderTopRightRadius,
        borderBottomLeftRadius, borderBottomRightRadius,
        border, borderWidth, borderColor, borderStyle = 'solid',
        
        // ========== SHADOWS ==========
        shadow, elevation,
        
        // ========== FLEXBOX ==========
        display, flexDirection, justifyContent, alignItems, alignSelf,
        flex, flexGrow, flexShrink, flexBasis, gap, wrap,
        
        // ========== POSITION ==========
        position, top, right, bottom, left, zIndex,
        
        // ========== EFFECTS ==========
        opacity, transform, transition, cursor,
        overflow,
        objectFit,
        
        // ========== TEXT ==========
        textAlign,
        fontSize, 
        
        // ========== EVENTS ==========
        onClick, onPress, onMouseEnter, onMouseLeave,
        
        // ========== DOM ==========
        id, className,
        
        // ========== REF ==========
        ref,
        
        // ========== SHORTHANDS ==========
        p, m, w, h, rounded, justify, align, direction,
        
        // ========== OTHER ==========
        ...otherProps
    } = processedProps;
    
    const buildStyleFromProps = () => {
        const styles = {};
        
        // Shorthands
        if (p !== undefined) styles.padding = typeof p === 'number' ? `${p}px` : p;
        if (m !== undefined) styles.margin = typeof m === 'number' ? `${m}px` : m;
        if (w !== undefined) styles.width = typeof w === 'number' ? `${w}px` : w;
        if (h !== undefined) styles.height = typeof h === 'number' ? `${h}px` : h;
        if (rounded !== undefined) styles.borderRadius = typeof rounded === 'number' ? `${rounded}px` : rounded;
        if (justify !== undefined) styles.justifyContent = justify;
        if (align !== undefined) styles.alignItems = align;
        if (direction !== undefined) styles.flexDirection = direction;
        
        // Dimensions
        if (width !== undefined) styles.width = typeof width === 'number' ? `${width}px` : width;
        if (height !== undefined) styles.height = typeof height === 'number' ? `${height}px` : height;
        if (minWidth !== undefined) styles.minWidth = typeof minWidth === 'number' ? `${minWidth}px` : minWidth;
        if (minHeight !== undefined) styles.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
        if (maxWidth !== undefined) styles.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
        if (maxHeight !== undefined) styles.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
        
        // Spacing
        if (padding !== undefined) styles.padding = typeof padding === 'number' ? `${padding}px` : padding;
        if (paddingTop !== undefined) styles.paddingTop = typeof paddingTop === 'number' ? `${paddingTop}px` : paddingTop;
        if (paddingRight !== undefined) styles.paddingRight = typeof paddingRight === 'number' ? `${paddingRight}px` : paddingRight;
        if (paddingBottom !== undefined) styles.paddingBottom = typeof paddingBottom === 'number' ? `${paddingBottom}px` : paddingBottom;
        if (paddingLeft !== undefined) styles.paddingLeft = typeof paddingLeft === 'number' ? `${paddingLeft}px` : paddingLeft;
        
        if (margin !== undefined) styles.margin = typeof margin === 'number' ? `${margin}px` : margin;
        if (marginTop !== undefined) styles.marginTop = typeof marginTop === 'number' ? `${marginTop}px` : marginTop;
        if (marginRight !== undefined) styles.marginRight = typeof marginRight === 'number' ? `${marginRight}px` : marginRight;
        if (marginBottom !== undefined) styles.marginBottom = typeof marginBottom === 'number' ? `${marginBottom}px` : marginBottom;
        if (marginLeft !== undefined) styles.marginLeft = typeof marginLeft === 'number' ? `${marginLeft}px` : marginLeft;
        
        // Colors & Gradients (gradient has priority over bgColor)
        if (gradient !== undefined) {
            styles.background = gradient;  // ← Gradiente usa 'background'
        } else if (bgColor !== undefined) {
            styles.backgroundColor = bgColor;
        }
        if (color !== undefined) styles.color = color;
        
        // Borders
        if (borderRadius !== undefined) styles.borderRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
        if (borderTopLeftRadius !== undefined) styles.borderTopLeftRadius = typeof borderTopLeftRadius === 'number' ? `${borderTopLeftRadius}px` : borderTopLeftRadius;
        if (borderTopRightRadius !== undefined) styles.borderTopRightRadius = typeof borderTopRightRadius === 'number' ? `${borderTopRightRadius}px` : borderTopRightRadius;
        if (borderBottomLeftRadius !== undefined) styles.borderBottomLeftRadius = typeof borderBottomLeftRadius === 'number' ? `${borderBottomLeftRadius}px` : borderBottomLeftRadius;
        if (borderBottomRightRadius !== undefined) styles.borderBottomRightRadius = typeof borderBottomRightRadius === 'number' ? `${borderBottomRightRadius}px` : borderBottomRightRadius;
        
        if (border !== undefined) {
            styles.border = border;
        } else if (borderWidth !== undefined || borderColor !== undefined) {
            styles.borderWidth = borderWidth !== undefined ? (typeof borderWidth === 'number' ? `${borderWidth}px` : borderWidth) : '1px';
            styles.borderStyle = borderStyle;
            if (borderColor !== undefined) styles.borderColor = borderColor;
        }
        
        // Shadows
        if (shadow !== undefined) {
            styles.boxShadow = shadow;
        } else if (elevation !== undefined) {
            const shadows = {
                0: 'none',
                1: '0 1px 3px rgba(0,0,0,0.12)',
                2: '0 3px 6px rgba(0,0,0,0.16)',
                3: '0 6px 12px rgba(0,0,0,0.2)',
                4: '0 10px 20px rgba(0,0,0,0.25)',
                5: '0 15px 30px rgba(0,0,0,0.3)'
            };
            styles.boxShadow = shadows[elevation] || shadows[2];
        }
        
        // Flexbox
        if (display !== undefined) styles.display = display;
        if (flexDirection !== undefined) styles.flexDirection = flexDirection;
        if (justifyContent !== undefined) styles.justifyContent = justifyContent;
        if (alignItems !== undefined) styles.alignItems = alignItems;
        if (alignSelf !== undefined) styles.alignSelf = alignSelf;
        if (flex !== undefined) styles.flex = flex;
        if (flexGrow !== undefined) styles.flexGrow = flexGrow;
        if (flexShrink !== undefined) styles.flexShrink = flexShrink;
        if (flexBasis !== undefined) styles.flexBasis = flexBasis;
        if (gap !== undefined) styles.gap = typeof gap === 'number' ? `${gap}px` : gap;
        if (wrap !== undefined) styles.flexWrap = 'wrap';
        
        // Position
        if (position !== undefined) styles.position = position;
        if (top !== undefined) styles.top = typeof top === 'number' ? `${top}px` : top;
        if (right !== undefined) styles.right = typeof right === 'number' ? `${right}px` : right;
        if (bottom !== undefined) styles.bottom = typeof bottom === 'number' ? `${bottom}px` : bottom;
        if (left !== undefined) styles.left = typeof left === 'number' ? `${left}px` : left;
        if (zIndex !== undefined) styles.zIndex = zIndex;
        
        // Effects
        if (opacity !== undefined) styles.opacity = opacity;
        if (transform !== undefined) styles.transform = transform;
        if (transition !== undefined) styles.transition = transition;
        if (cursor !== undefined) styles.cursor = cursor;
        if (overflow !== undefined) styles.overflow = overflow;
        if (objectFit !== undefined) styles.objectFit = objectFit;
        
        // Text
        if (textAlign !== undefined) styles.textAlign = textAlign;
        if (fontSize !== undefined) styles.fontSize = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
        
        return styles;
    };
    
    const finalStyle = { ...buildStyleFromProps(), ...userStyle };
    
    const hasEvents = onPress || onClick;
    const handleClick = (e) => {
        if (onPress) onPress(e);
        if (onClick) onClick(e);
    };
    
    const container = createWidget('div')({
        id, className,
        style: finalStyle,
        ...(hasEvents && { onclick: handleClick }),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        child: child || children,
        ...otherProps
    });
    
    // 🔥 REGISTRAR BINDINGS REACTIVOS
    if (reactiveBindings.length > 0) {
        reactiveBindings.forEach(({ key, stateKey }) => {
            registerWidget(stateKey, container, key);
        });
    }
    
    if (typeof ref === 'function') ref(container);
    
    return container;
};

export default WidgetFactory;
