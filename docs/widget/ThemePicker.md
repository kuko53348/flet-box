# ThemePicker

A row of two-tone squares, one per accent family, that picks the color the screen paints its buttons, icons and plates with.

## When to use it

Use it wherever the reader is allowed to choose the app's color — a settings screen or a preferences sheet. It picks the accent, not the theme: light and dark stay the reader's own decision.

## Quick start

```javascript
import { ThemePicker } from "flet-box";

const accents = ThemePicker({});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `accents` | `Accent[]` | The families on offer, as `listAccents()` returns them: `{ id, label, light, dark }`. Defaults to every registered family — an app that ships one brand color filters the list rather than registering fewer. |
| `size` | `number` | Edge of one swatch, in framework units. Defaults to 40 — the tap minimum — and the tick badge scales with it. |
| `showLabels` | `boolean` | Print each family's name under its swatch. Off by default, because the two-tone square is the answer and twelve captions is a color survey. |
| `label` | `string` | Accessible name of the color group. Nothing is painted from it; a screen reader announces the row as one question with this wording. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onChange` | `(id: string) => void` | Called with the chosen family id after the accent has already been applied to the screen, so the app only has to remember the choice. |

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
| `size` | `Size` | Edge of one swatch, in framework units. Defaults to 40 — the tap minimum — and the tick badge scales with it. |
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
import { ThemePicker } from "flet-box";

const accentRow = ThemePicker({
  size: 48,
  showLabels: true,
  onChange: (id) => console.log("accent:", id),
});
```

### Full

```javascript
import { BottomSheet, Column, Text, ThemePicker, color, filter, includes, listAccents } from "flet-box";

const preferences = BottomSheet({
  content: Column({
    gap: 16,
    children: [
      Text({ text: "Accent color", size: 18, fontWeight: 600 }),
      ThemePicker({
        accents: listAccents().filter((a) => ["teal", "blue", "rose", "orange"].includes(a.id)),
        size: 44,
        showLabels: true,
        label: "Choose the color of the app",
        onChange: (id) => console.log("picked:", id),
      }),
    ],
  }),
});
```

## Tips

- The tap is not decoration: it calls `setAccent(id)`, which repaints every widget already on screen and stores the choice, so the next visit opens the same color.
- An app sets its own brand at boot with `applyAccentPreference(id)`, never with `setAccent`: the first leaves the picker blank on a reader's first visit, the second answers for them before they have chosen.
- Twelve squares is a color survey; four is a decision. Cut the list to what the brand allows with `accents: listAccents().filter((a) => [...].includes(a.id))`.
- Each half of a square is the same hue in one theme: the upper-left is what it wears on a light page, the lower-right what it wears on a dark one. Only one of the two is on screen at a time, and showing both is what makes the choice safe.

## Accessibility

- The row is a `radiogroup` named by `label` and every square is a `radio` that carries its family's name and `aria-checked`, so the answer is read and not only seen. Tab reaches the squares and Enter or Space picks one.
- The selected state is the page's own ink plus a tick badge, never color alone; an empty square rims in the same 3:1 gray a `Checkbox` uses for an unchecked box.

## Behavior

- `onChange(id)` fires after the screen is repainted, and re-tapping the square already chosen fires nothing.
- The picker subscribes to the theme, so a toggle anywhere else on the screen moves the tick here without a prop change; the subscription is released on unmount.
- `update({ accents, showLabels, label, disabled })` rebuilds the grid. Any other key goes to the factory and styles the row itself.
- `size` is the edge of the square and defaults to the 40-unit tap minimum; the tick and its badge scale with it.
- Every shipped family is measured, not eyeballed: the accent carries white or dark words at 4.5:1, reads as text on the page and as a glyph on a card, and its wash sits just off the background. `tests/regression.test.js` re-measures all of it in both themes.

## Related widgets

- [Radio](Radio.md)
- [Switch](Switch.md)
- [BottomSheet](BottomSheet.md)

---

## Continue reading

- **Previous:** [Rating](Rating.md)
- **Next:** [Card](Card.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (9 of 9).
