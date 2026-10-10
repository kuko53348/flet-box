# AnimatedText

Splits a Text widget into individual characters and animates each one, optionally staggering the start of every letter for a cascade effect.

## When to use it

Use it for headline entrances, logo reveals, or any place letter-by-letter motion adds polish.

## Quick start

```javascript
import { AnimatedText, Text } from "flet-box";

const title = AnimatedText({
  child: Text({ text: "FletBox" }),
  animations: [{ effect: "translateY", from: 16, to: 0 }],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `child` | `Widget` | A single child widget. Alias: `children` for a list. |
| `animations` | `AnimationStep[]` | Animations to apply, as a name or an array of names. |
| `sameTime` | `boolean` | Runs child animations at the same time. |
| `delayBetween` | `number` | Stagger delay between each child animation. |
| `orientation` | `'row' \| 'column'` | Orientation of the widget or control. |

### Common props

Every widget also accepts these shared props — see [common props](COMMON_PROPS.md) for the full rules and aliases.

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(widget: Widget) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `id` | `string` | DOM `id` for the rendered element. |
| `className` | `string` | CSS class names applied to the rendered element. |
| `ref` | `(widget: Widget) => void` | Callback that receives the underlying DOM node. |
| `disableTransform` | `boolean` | Disables the default press/scale transform animation. |

## Examples

### Everyday

```javascript
import { AnimatedText, Text } from "flet-box";

const title = AnimatedText({
  child: Text({ text: "Hello world" }),
  animations: [{ effect: "opacity", from: 0, to: 1 }],
  sameTime: false,
  delayBetween: 0.08,
});
```

### Full

```javascript
import { AnimatedText, Text } from "flet-box";

const title = AnimatedText({
  child: Text({ text: "Welcome" }),
  animations: [
    { effect: "scale", from: 0.5, to: 1 },
    { effect: "rotate", from: -8, to: 0 },
  ],
  sameTime: true,
  orientation: "column",
});
```

## Tips

- child must be a Text widget, because its text is split into single-character
- widgets that inherit the original props.
- Set sameTime: false and control delayBetween to create a wave; use sameTime: true
- for a synchronized pop.
- orientation: "column" stacks the letters vertically for vertical-word effects.

## Accessibility

- The animated letters remain ordinary text, so screen readers still read the full
- word; avoid animating for longer than a moment.

## Behavior

- Spaces are rendered as fixed-width spacers rather than animated characters, keeping
- word breaks intact.
- If animations is empty the original child is returned unchanged, so you can branch
- cheaply.

## Related widgets

- [AnimatedBox](AnimatedBox.md)
- [Text](Text.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [AnimatedBox](AnimatedBox.md)
- **Next:** [MatrixRain](MatrixRain.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (11 of 13).
