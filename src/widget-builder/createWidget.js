// // widget-builder/createWidget.js
// import { translateProps } from './translateProps.js';
// import { makeParentable } from './parentable.js';
// import { assignProps } from './assignProps.js';
// import { addChildren } from './children.js';
// import { applyEffects } from './effects.js';
// import { stackPosition } from '../utils/stackPosition.js';
// import { setupEvents } from './events.js';
// import { addLifecycle } from './lifecycle.js';
// import { makeReactive } from './reactivity.js';
//
// export const createWidget = (tag, baseStyles = {}) => (props = {}) => {
//     const element = document.createElement(tag);
//     element._props = { ...props };
//
//     // Get widget name for better error messages
//     const widgetName = tag.charAt(0).toUpperCase() + tag.slice(1);
//
//     stackPosition(element, element._props);
//     Object.assign(element.style, baseStyles);
//
//     // Pass widget name to translator
//     const translated = translateProps(props, widgetName);
//     makeParentable(element);
//
//     assignProps(element, translated);
//     setupEvents(element, translated);
//     applyEffects(element);
//     addChildren(element, translated);
//     addLifecycle(element);
//
//     // Update method - also pass widget name
//     element.update = (newProps = {}) => {
//         Object.assign(element._props, newProps);
//         const newTranslated = translateProps(newProps, widgetName);
//         assignProps(element, newTranslated);
//         if (newProps.child !== undefined || newProps.children !== undefined) {
//             element._child = newProps.child || newProps.children;
//             addChildren(element, newTranslated);
//         }
//     };
//
//     // Add reactivity
//     makeReactive(element, (changedProps) => element.update(changedProps));
//
//     return element;
// };

// widget-builder/createWidget.js
import { makeParentable } from './parentable.js';
import { assignProps } from './assignProps.js';
import { addChildren } from './children.js';
import { applyEffects } from './effects.js';
import { stackPosition } from '../utils/stackPosition.js';
import { addLifecycle } from './lifecycle.js';
import { makeReactive } from './reactivity.js';

/**
 * Crea un widget DOM.
 * @param {string} tag - Etiqueta HTML (div, span, input, etc.)
 * @param {Object} baseStyles - Estilos base aplicados al elemento.
 * @param {Function} translateFn - Función opcional para traducir props (shorthands → CSS/atributos). Si no se provee, las props se usan tal cual.
 * @returns {Function} (props) => widget
 */
export const createWidget = (tag, baseStyles = {}, translateFn = null) => (rawProps = {}) => {
    const element = document.createElement(tag);
    element._props = { ...rawProps };

    // Aplicar estilos base
    Object.assign(element.style, baseStyles);

    // Posición para Stack
    stackPosition(element, element._props);

    makeParentable(element);

    // Función que aplica props (con traducción si translateFn está presente)
    const applyProps = (propsToApply) => {
        // 1. Traducir si hay traductor
        const finalProps = translateFn ? translateFn(propsToApply, tag) : propsToApply;

        // 2. Asignar al DOM y a estilos
        assignProps(element, finalProps);
        addChildren(element, finalProps);
    };

    // Aplicar props iniciales
    applyProps(rawProps);

    // Efectos (hover, press)
    applyEffects(element);
    addLifecycle(element);

    // Método público update
    // createWidget.js (fragmento relevante)
    element.update = (newRawProps = {}) => {
        Object.assign(element._props, newRawProps);
        applyProps(newRawProps);
        // Reaplicar efectos por si cambió onclick
        applyEffects(element);
    };

    // Reactividad (setters)
    makeReactive(element, (changedProps) => {
        element.update(changedProps);
    });

    return element;
};
