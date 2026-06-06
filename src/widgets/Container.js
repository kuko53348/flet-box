// widgets/Container.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';

export const Container = (props) => {
    const { style = {}, ...rest } = props;
    const defaultOverflow = rest.height || rest.maxHeight ? 'auto' : 'visible';
    
    
    return WidgetFactory({
        bgColor: colors.surface,
        display: 'flex',
        flexDirection: 'column',
        // boxSizing: 'border-box',
        // maxWidth: '100%',
        // height: 'auto',
        
        // necessary know height an width
        overflow: 'auto', // cover all widgets
        style: {
            ...style,
            boxSizing: 'border-box'
        },
        ...rest
    });
};

export default Container;
