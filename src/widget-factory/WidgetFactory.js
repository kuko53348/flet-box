// src/widget-factory/WidgetFactory.js
import { createWidget } from '../widget-builder/index.js';
import { translateProps } from '../widget-builder/translateProps.js';

export const WidgetFactory = (props) => {
    const { tag = 'div', style: userStyle = {}, ...rest } = props;

    // El traductor se pasa una sola vez a createWidget
    const create = createWidget(tag, {}, translateProps);
    // Las props se pasan sin pre-traducir; createWidget aplicará translateProps
    const widget = create({ ...rest, style: userStyle });

    if (typeof rest.ref === 'function') {
        rest.ref(widget);
    }

    return widget;
};

export default WidgetFactory;
