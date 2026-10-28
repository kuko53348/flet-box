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
| `top` | `number \| string` | Offset from the top edge. A number is pixels; a string uses any CSS unit. |
| `right` | `number \| string` | Offset from the right edge. A number is pixels; a string uses any CSS unit. |
| `bottom` | `number \| string` | Offset from the bottom edge. A number is pixels; a string uses any CSS unit. |
| `left` | `number \| string` | Offset from the left edge. A number is pixels; a string uses any CSS unit. |

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
| `border` | `string` | CSS `border` shorthand for all four edges: width, style and color in one string. |
| `borderTop` | `string` | The top edge of the border alone, for a widget whose rim differs per side. |
| `borderBottom` | `string` | The bottom edge of the border alone, for a widget whose rim differs per side. |
| `borderLeft` | `string` | The left edge of the border alone, for a widget whose rim differs per side. |
| `borderRight` | `string` | The right edge of the border alone, for a widget whose rim differs per side. |
| `cursor` | `string` | CSS `cursor` value: what the pointer becomes over the widget (`pointer`, `grab`, `not-allowed`). |
| `display` | `string` | CSS `display` value for the container. |
| `boxSizing` | `'border-box' \| 'content-box'` | Which box `width` and `height` measure: `border-box` keeps the size you asked for and pushes padding inward. |
| `flexDirection` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | Main axis of a flex container: `row` places children side by side, `column` stacks them. |
| `flexGrow` | `number` | Share of the leftover space this child takes, relative to its siblings. |
| `flexShrink` | `number` | How readily the child gives space back when the row overflows; `0` keeps its size. |
| `gap` | `number \| string` | Space between children along the layout axis. |
| `fontSize` | `number` | Size of the font. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `paddingTop` | `Size` | Space inside the widget, on the top edge only. |
| `paddingRight` | `Size` | Space inside the widget, on the right edge only. |
| `paddingBottom` | `Size` | Space inside the widget, on the bottom edge only. |
| `paddingLeft` | `Size` | Space inside the widget, on the left edge only. |
| `pt` | `Size` | Alias of `paddingTop`. |
| `pr` | `Size` | Alias of `paddingRight`. |
| `pb` | `Size` | Alias of `paddingBottom`. |
| `pl` | `Size` | Alias of `paddingLeft`. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `marginTop` | `Size` | Space outside the widget, on the top edge only. |
| `marginRight` | `Size` | Space outside the widget, on the right edge only. |
| `marginBottom` | `Size` | Space outside the widget, on the bottom edge only. |
| `marginLeft` | `Size` | Space outside the widget, on the left edge only. |
| `mt` | `Size` | Alias of `marginTop`. |
| `mr` | `Size` | Alias of `marginRight`. |
| `mb` | `Size` | Alias of `marginBottom`. |
| `ml` | `Size` | Alias of `marginLeft`. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `filter` | `string` | Raw CSS `filter` value applied to the widget itself, e.g. `blur(4px)`. |
| `backdropFilter` | `string` | Raw CSS `backdrop-filter` value: what sits behind the widget is blurred through it, which is what makes a translucent card frosted glass. |
| `maskImage` | `string` | Raw CSS `mask-image` value, used to fade a widget out at its edges instead of cutting it. |
| `bgImage` | `string` | Image painted behind the widget's content (CSS `background-image`), placed with `bgSize` and `bgPosition`. |
| `bgSize` | `string` | How the background image fills its box (`cover`, `contain`, or a length). |
| `bgPosition` | `string` | Where the background image is anchored (`center`, `top`, `50% 20%`). |
| `bgRepeat` | `string` | Whether the background image tiles; `no-repeat` for a single cover. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(event?: Event) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(event?: Event) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `onclick` | `(event?: Event) => void` | Lowercase alias of `onClick`, kept because the shipped templates and the HTML habit write it. |
| `alignSelf` | `AlignSelf` | Overrides the parent's `alignItems` for this child alone (CSS `align-self`). Alias: `selfAlign`. |
| `selfAlign` | `AlignSelf` | Alias of `alignSelf`. |
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

- A step is `{ effect, from, to }`, where the effect is one of `scale`, `scaleX`, `scaleY`, `rotate`, `rotateX`, `rotateY`, `rotateZ`, `skewX`, `skewY`, `translateX`, `translateY`, `translateZ`, `opacity`, `color`, `backgroundColor`, `borderColor`, `borderWidth`, `borderRadius`, `width`, `height`, `boxShadow`, `background` or `textGradient` (the margin and padding steps work as well). A name outside that list does nothing, silently.
- Each step's `duration`, `delay` and `loop` are read off **that step**: a 600 ms `scale` and a 400 ms `opacity` in one entrance run together for 600 ms, with the fade holding from 400 ms on. Times are milliseconds as a number (`duration: 400`) or a CSS time as a string (`delay: "0.4s"`); a bare number as a `delay` used to make the whole `animation` shorthand invalid, which read as the widget not animating at all.
- `reverse: true` makes a step swing back to `from` instead of holding `to`; with `loop: true` it breathes.
- A looping step and a one-shot step cannot share one `@keyframes` rule — repeating the rule repeats the entrance — so they are generated as two rules. Two rules cannot compose one `transform`, so keep every transform step in one group: mixing a looping `rotate` with a one-shot `translateY` moves only one of them, and the widget warns about it.
- A length is a framework unit, not a pixel: `translateY: 20` is `20 / base-font-size` rem, so the movement grows with the reader's font like the rest of the UI.
- `top`, `right`, `bottom` and `left` are forwarded to the child's dataset as positioning hints for layout systems.

## Accessibility

- Nothing to do here: the engine reads `prefers-reduced-motion` and the [motion mode](../tools/animation.md#reduced-motion), and a looping or entering step collapses to one frame that lands on its `to` values, so content is never held invisible behind an animation the reader refused.

## Behavior

- Every step's `from` is written on the element before its rule starts, including the ones that begin later — so there is no flash of the final state before the keyframes run, and no flash of the *first* step's end while a delayed step waits.
- Generated `@keyframes` are named by their content and injected once, so a sequence repeated — or one word staggered across `AnimatedText` letters — reuses one rule instead of adding a `<style>` per call.

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
