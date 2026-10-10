# AnimatedBox

Wraps a single child and plays a sequence of CSS animations described by effect/from/to steps. It handles keyframes, timing, and fill mode for you.

## When to use it

Use it to animate a widget's position, transform, color, or size without hand-writing CSS keyframes.

## Quick start

```javascript
import { AnimatedBox, Text, pulse } from "flet-box";

const pulse = AnimatedBox({
  child: Text({ text: "Hello" }),
  animations: [{ effect: "scale", from: 1, to: 1.2 }],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `animations` | `AnimationStep[]` | Animations to apply, as a name or an array of names. |
| `child` | `Widget` | A single child widget. Alias: `children` for a list. |
| `timing` | `string` | Timing function for the animation. |
| `delay` | `string` | Delay before the animation starts, in milliseconds. |
| `fillMode` | `string` | How styles persist before and after the animation (CSS `fill-mode`). |
| `top` | `number \| string` | The `top` value for the widget. |
| `right` | `number \| string` | The `right` value for the widget. |
| `bottom` | `number \| string` | The `bottom` value for the widget. |
| `left` | `number \| string` | The `left` value for the widget. |

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
import { AnimatedBox, Card, Text } from "flet-box";

const hero = AnimatedBox({
  child: Card({ child: Text({ text: "FletBox" }) }),
  animations: [
    { effect: "opacity", from: 0, to: 1 },
    { effect: "translateY", from: 20, to: 0 },
  ],
  timing: "ease-out",
});
```

### Full

```javascript
import { AnimatedBox, Text } from "flet-box";

const toast = AnimatedBox({
  child: Text({ text: "Saved" }),
  animations: [{ effect: "opacity", from: 0, to: 1 }],
  timing: "ease-in-out",
  delay: "200ms",
  fillMode: "forwards",
  top: 16,
  right: 16,
});
```

## Tips

- Each animation is { effect, from, to } where effect is a CSS property like opacity,
- scale, translateY, or backgroundColor.
- Set timing (ease, ease-out, linear) and delay at the widget level; per-step reverse
- cycles the animation back instead of running it once.
- top, right, bottom, and left are forwarded to the child as positioning hints for
- layout systems.

## Accessibility

- Honor prefers-reduced-motion by keeping animations subtle or giving users a way to
- disable them.

## Behavior

- The first animation step is applied as an inline style immediately, so there is no
- flash of the final state before the keyframes run.
- Generated @keyframes are injected once per sequence and reused, so repeated
- animations stay cheap.

## Related widgets

- [AnimatedText](AnimatedText.md)
- [Text](Text.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [AdMob](AdMob.md)
- **Next:** [AnimatedText](AnimatedText.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (10 of 13).
