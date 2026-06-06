// widgets/Row.js
import { WidgetFactory } from '../widget-factory/index.js';

export const Row = (props) => {
    const { style = {}, ...rest } = props;
    
    return WidgetFactory({
        display: 'flex',
        flexDirection: 'row',
        boxSizing: 'border-box',
        maxWidth: '100%',
        height: 'auto',
        style: {
            ...style,
            boxSizing: 'border-box'
        },
        ...rest
    });
};

export default Row;
