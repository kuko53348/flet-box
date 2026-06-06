// // widget-builder/assignProps.js
// // widget-builder/assignProps.js
// const SKIP_PROPS = ['children', 'child'];
// const RESERVED_PROPS = new Set([
//     'innerHTML', 'outerHTML', 'appendChild', 'removeChild', 'cloneNode',
//     'setAttribute', 'getAttribute', 'addEventListener', 'removeEventListener'
// ]);
//
// export const assignProps = (widget, props) => {
//     const { style: customStyle, ...otherProps } = props;
//
//     // Separar las props seguras (las que no son reservadas ni saltadas)
//     const safeProps = {};
//     for (const [key, value] of Object.entries(otherProps)) {
//         if (SKIP_PROPS.includes(key)) continue;
//         if (RESERVED_PROPS.has(key)) continue;
//         safeProps[key] = value;
//     }
//
//     // 1. Asignar props al DOM (incluye eventos, id, className, etc.)
//     Object.assign(widget, safeProps);
//
//     // 2. Asignar TODAS las props también al estilo (como hacías antes)
//     // Esto hace que width, height, gap, etc. se apliquen como CSS
//     Object.assign(widget.style, safeProps.style || safeProps);
//
//     // 3. Si hay estilo explícito (prop 'style'), tiene prioridad
//     if (customStyle && typeof customStyle === 'object') {
//         Object.assign(widget.style, customStyle);
//     }
//
//     return widget;
// };
//
// export default assignProps;
// assignProps.js - versión simplificada
// const SKIP_PROPS = ['children', 'child'];
// const DOM_PROPS = new Set([
//     // Eventos (ya traducidos por translateProps)
//     'onclick', 'ondblclick', 'oncontextmenu',
//     'onmouseenter', 'onmouseleave', 'onfocus', 'onblur',
//     'onchange', 'oninput', 'onscroll',
//
//     // Atributos DOM comunes
//     'id', 'className', 'class', 'name',
//     'value', 'checked', 'selected', 'disabled', 'readOnly', 'required',
//     'href', 'target', 'src', 'alt',
//     'textContent', 'innerText',
//     'title', 'lang', 'dir', 'tabIndex', 'draggable', 'hidden',
//
//     // Data attributes y aria
//     'role'
// ]);
//
// export const assignProps = (widget, props) => {
//     const { style: customStyle, ...otherProps } = props;
//
//     for (const [key, value] of Object.entries(otherProps)) {
//         if (SKIP_PROPS.includes(key)) continue;
//
//         // Si es prop DOM → asignar directamente al elemento
//         if (DOM_PROPS.has(key)) {
//             widget[key] = value;
//         }
//         // Si es evento (on*) pero no está en DOM_PROPS → también al DOM
//         else if (key.startsWith('on') && typeof value === 'function') {
//             widget[key] = value;
//         }
//         // TODO lo demás → CSS
//         else {
//             widget.style[key] = typeof value === 'number' ? `${value}px` : value;
//         }
//     }
//
//     // style explícito tiene prioridad (compatibilidad React)
//     if (customStyle && typeof customStyle === 'object') {
//         Object.assign(widget.style, customStyle);
//     }
//
//     return widget;
// };
// assignProps.js - versión corregida
// widget-builder/assignProps.js
const SKIP_PROPS = ['children', 'child'];
const DOM_PROPS = new Set([
    'onclick', 'ondblclick', 'oncontextmenu',
    'onmouseenter', 'onmouseleave', 'onfocus', 'onblur',
    'onchange', 'oninput', 'onscroll',
    'id', 'className', 'class', 'name',
    'value', 'checked', 'selected', 'disabled', 'readOnly', 'required',
    'href', 'target', 'src', 'alt',
    'textContent', 'innerText',
    'title', 'lang', 'dir', 'tabIndex', 'draggable', 'hidden',
    'role',
    // 🔥 AÑADIDOS PARA INPUTS
    'type', 'placeholder', 'inputmode', 'autocomplete', 'pattern', 'min', 'max', 'step'
]);

export const assignProps = (widget, props) => {
    const { style: customStyle, ...otherProps } = props;
    
    for (const [key, value] of Object.entries(otherProps)) {
        if (SKIP_PROPS.includes(key)) continue;
        
        if (key === 'style') {
            Object.assign(widget.style, value);
            continue;
        }
        
        if (DOM_PROPS.has(key)) {
            widget[key] = value;
        }
        else if (key.startsWith('on') && typeof value === 'function') {
            widget[key] = value;
        }
        else {
            widget.style[key] = typeof value === 'number' ? `${value}px` : value;
        }
    }
    
    if (customStyle && typeof customStyle === 'object') {
        Object.assign(widget.style, customStyle);
    }
    
    return widget;
};
