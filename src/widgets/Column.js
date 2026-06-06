// widgets/Column.js
import { WidgetFactory } from '../widget-factory/index.js';

export const Column = (props) => {
    const { style = {}, ...rest } = props;
    
    return WidgetFactory({
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        maxWidth: '100%',
        height: 'auto',
        // align: 'center',
        // justify: 'center',
        style: {
            ...style,
            boxSizing: 'border-box'
        },
        ...rest
    });
};

export default Column;
