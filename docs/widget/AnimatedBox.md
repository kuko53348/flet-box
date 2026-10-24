# AnimatedBox

Wraps a single child and plays a sequence of CSS animations described by effect/from/to steps. It handles keyframes, timing, and fill mode for you.

## When to use it

Use it to animate a widget's position, transform, color, or size without hand-writing CSS keyframes.

## Quick start

```javascript
import { AnimatedBox, Text } from "flet-box";

const badge = AnimatedBox({
  child: Text({ text: "Hello" }),
  animations: [{ effect: "scale", from: 1, to: 1.2 }],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `animations` | `AnimationStep[]` | The steps to play, each `{ effect, from, to }` plus its own `duration`, `delay`, `loop` and `reverse`. |
| `child` | `Widget` | A single child widget. Alias: `children` for a list. |
| `timing` | `string` | Timing function for the animation, passed straight to CSS. |
| `delay` | `number \| string` | Default delay for the steps that do not name one: milliseconds as a number, or a CSS time as a string (`"0.2s"`). |
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
| `size` | `Size` | Overall size preset or pixel value, depending on the widget. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
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
  // Each step keeps its own clock: the fade is over while the lift is still moving.
  animations: [
    { effect: "opacity", from: 0, to: 1, duration: 200 },
    { effect: "translateY", from: 16, to: 0, duration: 400, delay: 120 },
    { effect: "backgroundColor", from: "#fef3c7", to: "#ffffff", duration: 600 },
  ],
  timing: "ease-out",
  delay: 200,
  fillMode: "forwards",
  top: 16,
  right: 16,
});
```

## Tips

- A step is `{ effect, from, to }`, where the effect is one of `scale`, `scaleX`,
  `scaleY`, `rotate`, `rotateX`, `rotateY`, `rotateZ`, `skewX`, `skewY`, `translateX`,
  `translateY`, `translateZ`, `opacity`, `color`, `backgroundColor`, `borderColor`,
  `borderWidth`, `borderRadius`, `width`, `height`, `boxShadow`, `background` or
  `textGradient` (the margin and padding steps work as well). A name outside that list
  does nothing, silently.
- Each step's `duration`, `delay` and `loop` are read off **that step**:
  a 600 ms `scale` and a 400 ms `opacity` in one entrance run together for 600 ms,
  with the fade holding from 400 ms on. Times are milliseconds as a number
  (`duration: 400`) or a CSS time as a string (`delay: "0.4s"`); a bare number as a
  `delay` used to make the whole `animation` shorthand invalid, which read as the
  widget not animating at all.
- `reverse: true` makes a step swing back to `from` instead of holding `to`; with
  `loop: true` it breathes.
- A looping step and a one-shot step cannot share one `@keyframes` rule — repeating
  the rule repeats the entrance — so they are generated as two rules. Two rules
  cannot compose one `transform`, so keep every transform step in one group: mixing
  a looping `rotate` with a one-shot `translateY` moves only one of them, and the
  widget warns about it.
- A length is a framework unit, not a pixel: `translateY: 20` is `20 / base-font-size`
  rem, so the movement grows with the reader's font like the rest of the UI.
- `top`, `right`, `bottom` and `left` are forwarded to the child's dataset as
  positioning hints for layout systems.

## Accessibility

- Nothing to do here: the engine reads `prefers-reduced-motion` and the
  [motion mode](../tools/animation.md#reduced-motion), and a looping or entering
  step collapses to one frame that lands on its `to` values, so content is never
  held invisible behind an animation the reader refused.

## Behavior

- Every step's `from` is written on the element before its rule starts, including
  the ones that begin later — so there is no flash of the final state before the
  keyframes run, and no flash of the *first* step's end while a delayed step waits.
- Generated `@keyframes` are named by their content and injected once, so a sequence
  repeated — or one word staggered across `AnimatedText` letters — reuses one rule
  instead of adding a `<style>` per call.

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
