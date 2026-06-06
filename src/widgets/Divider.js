// widgets/Divider.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';

export const Divider = (props) => {
    const {
        color = colors.border,
        thickness = 1,
        margin = 16,
        orientation = 'horizontal',
        ...rest
    } = props;

    const isHorizontal = orientation === 'horizontal';

    return WidgetFactory({
        height: isHorizontal ? thickness : 'auto',
        width: isHorizontal ? 'auto' : thickness,
        backgroundColor: color,
        margin: isHorizontal ? `${margin}px 0` : `0 ${margin}px`,
        flexShrink: 0,
        ...rest
    });
};

export default Divider;
