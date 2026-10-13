/**
 * @file Image.js
 * @description Thin `<img>` wrapper that forwards all props to the factory.
 */
import { WidgetFactory } from "../widget-factory/index.js";

export const Image = (props) => {
  // `fit` and `circular` are documented Image props with no entry in the prop
  // database, so forwarding them raw only produced an "unknown prop" warning
  // while images stayed stretched (`object-fit: fill`) and square. Map them onto
  // real CSS. `...rest` comes last so an explicit `borderRadius` still wins.
  const { fit, circular, ...rest } = props || {};
  return WidgetFactory({
    tag: "img",
    widgetName: "Image",
    ...(fit !== undefined ? { objectFit: fit } : null),
    ...(circular ? { borderRadius: "50%" } : null),
    ...rest,
  });
};

export default Image;
