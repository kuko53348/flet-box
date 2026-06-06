// widgets/Image.js
import { WidgetFactory } from '../widget-factory/index.js';

export const Image = (props) => {
    return WidgetFactory({
        tag: 'img',
        ...props
    });
};

export default Image;
