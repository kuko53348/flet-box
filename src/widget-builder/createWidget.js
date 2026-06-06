// widget-builder/createWidget.js
import { translateProps } from './translateProps.js';
import { makeParentable } from './parentable.js';
import { assignProps } from './assignProps.js';
import { addChildren } from './children.js';
import { applyEffects } from './effects.js';
import { stackPosition } from '../utils/stackPosition.js';
import { setupEvents } from './events.js';
import { addLifecycle } from './lifecycle.js';
import { makeReactive } from './reactivity.js';

export const createWidget = (tag, baseStyles = {}) => (props = {}) => {
    const element = document.createElement(tag);
    element._props = { ...props };
    
    // Get widget name for better error messages
    const widgetName = tag.charAt(0).toUpperCase() + tag.slice(1);

    stackPosition(element, element._props);
    Object.assign(element.style, baseStyles);

    // Pass widget name to translator
    const translated = translateProps(props, widgetName);
    makeParentable(element);

    assignProps(element, translated);
    setupEvents(element, translated);
    applyEffects(element);
    addChildren(element, translated);
    addLifecycle(element);

    // Update method - also pass widget name
    element.update = (newProps = {}) => {
        Object.assign(element._props, newProps);
        const newTranslated = translateProps(newProps, widgetName);
        assignProps(element, newTranslated);
        if (newProps.child !== undefined || newProps.children !== undefined) {
            element._child = newProps.child || newProps.children;
            addChildren(element, newTranslated);
        }
    };

    // Add reactivity
    makeReactive(element, (changedProps) => element.update(changedProps));

    return element;
};
