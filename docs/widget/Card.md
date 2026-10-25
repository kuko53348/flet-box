# Card

A rounded, optionally elevated surface that groups related content into a single tappable unit.

## When to use it

Use it to present a self-contained block such as a summary, product, or stat.

## Quick start

```javascript
import { Card, Text } from "flet-box";

const card = Card({
  child: Text({ text: "Hello" }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `child` | `Widget` | A single child widget. Alias: `children` for a list. |
| `children` | `Widget[]` | An array of child widgets. Alias: `child` for a single child. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `showBorder` | `boolean` | Controls whether the border is shown. |
| `borderWidth` | `number` | Width of the border. |
| `borderStyle` | `'solid' \| 'dashed' \| 'dotted'` | The `borderStyle` value for the widget. |
| `borderColor` | `Color` | Color used for the border. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |

### Common props

Every widget also accepts these shared props — see [common props](COMMON_PROPS.md) for the full rules and aliases.

| Prop | Type | Description |
| --- | --- | --- |
| `full` | `boolean` | Stretches the widget to fill its parent on both axes in stack mode. |
| `fullHeight` | `boolean` | Stretches the widget to the full height of its parent in stack mode. |
| `fullWidth` | `boolean` | Stretches the widget to the full width of its parent. |
| `center` | `boolean` | Centres the widget on both axes in stack mode. |
| `centerY` | `boolean` | Centres the widget vertically in stack mode. |
| `centerX` | `boolean` | Centres the widget horizontally in stack mode. |
| `zIndex` | `number` | Stacking order: a widget with a higher value paints above lower ones. |
| `z` | `number` | Alias of `zIndex`. |
| `end` | `Size` | Logical alias of `right`, used by the stack placement shorthands. |
| `start` | `Size` | Logical alias of `left`, used by the stack placement shorthands. |
| `inset` | `Size` | Shorthand for the four edge offsets (`top`/`right`/`bottom`/`left`). |
| `left` | `Size` | Offset from the left edge. A number is pixels; a string uses any CSS unit. |
| `bottom` | `Size` | Offset from the bottom edge. A number is pixels; a string uses any CSS unit. |
| `right` | `Size` | Offset from the right edge. A number is pixels; a string uses any CSS unit. |
| `top` | `Size` | Offset from the top edge. A number is pixels; a string uses any CSS unit. |
| `pos` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | Alias of `position`. |
| `position` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | CSS `position` value, or `stack` for centered stacking. |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `Size` | Overall size preset or pixel value, depending on the widget. |
| `flex` | `number` | Flex grow/shrink/basis shorthand for a flex child. |
| `minWidth` | `Size` | Minimum width the widget may shrink to. |
| `maxWidth` | `Size` | Maximum width the widget may grow to. |
| `minHeight` | `Size` | Minimum height the widget may shrink to. |
| `maxHeight` | `Size` | Maximum height the widget may grow to. |
| `border` | `string` | The `border` value for the widget. |
| `borderTop` | `string` | The `borderTop` value for the widget. |
| `borderBottom` | `string` | The `borderBottom` value for the widget. |
| `borderLeft` | `string` | The `borderLeft` value for the widget. |
| `borderRight` | `string` | The `borderRight` value for the widget. |
| `cursor` | `string` | The `cursor` value for the widget. |
| `display` | `string` | CSS `display` value for the container. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `marginTop` | `Size` | The `marginTop` value for the widget. |
| `marginRight` | `Size` | The `marginRight` value for the widget. |
| `marginBottom` | `Size` | The `marginBottom` value for the widget. |
| `marginLeft` | `Size` | The `marginLeft` value for the widget. |
| `mt` | `Size` | The `mt` value for the widget. |
| `mr` | `Size` | The `mr` value for the widget. |
| `mb` | `Size` | The `mb` value for the widget. |
| `ml` | `Size` | The `ml` value for the widget. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `filter` | `string` | Raw CSS `filter` value applied to the widget itself, e.g. `blur(4px)`. |
| `backdropFilter` | `string` | Raw CSS `backdrop-filter` value: what sits behind the widget is blurred through it, which is what makes a translucent card frosted glass. |
| `maskImage` | `string` | Raw CSS `mask-image` value, used to fade a widget out at its edges instead of cutting it. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(widget: Widget) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `onclick` | `(widget: Widget) => void` | The `onclick` value for the widget. |
| `alignSelf` | `AlignSelf` | Overrides the parent's `alignItems` for this child alone (CSS `align-self`). Alias: `selfAlign`. |
| `selfAlign` | `AlignSelf` | Alias of `alignSelf`. |
| `id` | `string` | DOM `id` for the rendered element. |
| `className` | `string` | CSS class names applied to the rendered element. |
| `ref` | `(widget: Widget) => void` | Callback that receives the underlying DOM node. |
| `disableTransform` | `boolean` | Disables the default press/scale transform animation. |

## Examples

### Everyday

```javascript
import { Card, Text } from "flet-box";

const card = Card({
  elevation: 2,
  padding: 16,
  borderRadius: 12,
  child: Text({ text: "Today's summary" }),
});
```

### Full

```javascript
import { Card, Text } from "flet-box";

const card = Card({
  elevation: 3,
  padding: 20,
  borderRadius: 16,
  showBorder: true,
  borderColor: "#e2e8f0",
  borderWidth: 1,
  onPress: () => console.log("open report"),
  children: [
    Text({ text: "Weekly report", weight: "bold" }),
    Text({ text: "Revenue is up 12% this week." }),
  ],
});
```

## Tips

- Keep elevation subtle (1-3) so stacked cards do not look noisy.
- Set showBorder: true for a flat look, or use elevation for a raised surface.

## Accessibility

- When onPress is set the whole card becomes a button; make its heading describe the action.

## Behavior

- Accepts either child for one widget or children for a stacked column of content.
- onPress fires for clicks anywhere inside the card surface.

## Related widgets

- [Container](Container.md)
- [ListTile](ListTile.md)
- [Button](Button.md)

---

## Continue reading

- **Previous:** [ThemePicker](ThemePicker.md)
- **Next:** [Divider](Divider.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (1 of 8).
