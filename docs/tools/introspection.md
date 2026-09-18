# Widget introspection

## Overview
Inspect any widget instance: read its received props, resolve one prop, or get a string dump. This is the engine behind the [Inspector](../widget/Inspector.md) widget.

## When to use
- Debug what props a widget actually received at runtime.
- Build dev tools that show widget state.
- Export or serialize widget configs.

## Import

```javascript
import { getWidgetProps, getWidgetProp, stringifyWidgetProps } from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `getWidgetProps` | `getWidgetProps(widget)` | `Record<string, any>` | The props the widget was built with. |
| `getWidgetProp` | `getWidgetProp(widget, propName)` | `any` | One prop value. |
| `stringifyWidgetProps` | `stringifyWidgetProps(widget)` | `string` | Props as a readable string. |

## Examples

### Everyday example

```javascript
import { getWidgetProps } from "flet-box";

const button = Button({ text: "Save", onPress: save });
console.log(getWidgetProps(button));
// { text: "Save", onPress: save }
```

### Full example

```javascript
import { Text, getWidgetProp, stringifyWidgetProps } from "flet-box";

const label = Text({ text: "Hello", size: 24 });

getWidgetProp(label, "size"); // 24
console.log(stringifyWidgetProps(label));
```

## Notes

- `getWidgetProps` returns what was passed at build time (before defaults are expanded).
- These helpers are used by `printWidgetCode` and `inspectWidget` to reconstruct source-like descriptions of widgets.
- Widgets expose an `update(props)` method and prop accessors; introspection is read-only and never mutates the widget.

## Related pages
- [Visual effects](visual-effects.md) — previous chapter.
- [Input validation](validation.md) — next chapter.
- [Inspector widget](../widget/Inspector.md).

---

## Continue reading

- **Previous:** [Visual effects](visual-effects.md)
- **Next:** [Input validation](validation.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (10 of 12).