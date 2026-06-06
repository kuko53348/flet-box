// widgets/Stack.js
import { WidgetFactory } from '../widget-factory/index.js';

export const Stack = (props) => {
    const { style = {}, ...rest } = props;
    
    return WidgetFactory({
        position: 'relative',
        display: 'block',
        boxSizing: 'border-box',
        style: {
            ...style,
            boxSizing: 'border-box'
        },
        ...rest
    });
};

export default Stack;
