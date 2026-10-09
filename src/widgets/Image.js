/**
 * @file Image.js
 * @description Thin `<img>` wrapper that forwards all props to the factory.
 */
import { WidgetFactory } from "../widget-factory/index.js";

export const Image = (props) => {
  return WidgetFactory({
    tag: "img",
    widgetName: "Image",
    ...props,
  });
};

export default Image;
