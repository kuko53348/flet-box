/**
 * @file Image.js
 * @description Thin `<img>` wrapper that forwards all props to the factory.
 */
import { WidgetFactory } from "../widget-factory/index.js";

export const Image = (props) => {
  // `fit` is now a proper style prop in translateProps (→ object-fit), so it
  // flows through the factory like any other CSS property. Only `circular`
  // needs special handling — it maps to borderRadius 50%.
  const { circular, ...rest } = props || {};
  return WidgetFactory({
    tag: "img",
    widgetName: "Image",
    ...(circular ? { borderRadius: "50%" } : null),
    ...rest,
  });
};

export default Image;