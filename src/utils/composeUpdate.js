/**
 * @file composeUpdate.js
 * @description
 * Composes a widget's own prop-application logic with the factory's reactive
 * `update` instead of overwriting it.
 *
 * Widgets such as Accordion, Slider and Dropdown keep widget state (currentValue,
 * currentOptions, …) in a closure and need a bespoke `update` to apply it. The
 * naive implementation `container.update = update` destroys the factory's update,
 * which re-applies styles, events, effects and children — so generic calls like
 * `slider.update({ opacity: .5 })` silently stopped working.
 *
 * `composeUpdate` splits every `update(newProps)` call in two:
 *  - keys owned by the widget (the `widgetPropKeys` set) → `applyWidgetProps`
 *  - everything else → the factory's original `update`
 *
 * Widget-owned keys are also stripped from `_originalProps`, because the factory
 * merges them back on every update: a stale construction-time value (say
 * `border: "1px solid red"`) would be re-applied as a style and silently clobber
 * a later widget-level change of the same prop.
 *
 * @module composeUpdate
 */

/**
 * Wires `container.update` so widget props and factory props coexist.
 *
 * @param {HTMLElement} container - The widget root returned by `WidgetFactory`.
 * @param {Iterable<string>} widgetPropKeys - Prop names owned by the widget.
 *   These are routed to `applyWidgetProps` and never reach the factory.
 * @param {function(Object): void} applyWidgetProps - The widget's own prop
 *   application logic. It receives only widget-owned keys and may ignore keys it
 *   does not handle (preserving each widget's existing behavior).
 * @returns {HTMLElement} The same container, for chaining.
 */
export function composeUpdate(container, widgetPropKeys, applyWidgetProps) {
  const widgetKeys = new Set(widgetPropKeys);
  const factoryUpdate = container.update;

  // The factory re-processes `_originalProps` on every update; widget-owned keys
  // must not live there or they would be re-applied as styles/attributes from
  // their construction-time values.
  if (container._originalProps) {
    for (const key of widgetKeys) delete container._originalProps[key];
  }

  container.update = (newProps = {}) => {
    const widgetProps = {};
    const factoryProps = {};
    for (const key of Object.keys(newProps)) {
      if (widgetKeys.has(key)) widgetProps[key] = newProps[key];
      else factoryProps[key] = newProps[key];
    }

    applyWidgetProps(widgetProps);

    if (Object.keys(factoryProps).length > 0) factoryUpdate(factoryProps);

    return container;
  };

  return container;
}

export default composeUpdate;
