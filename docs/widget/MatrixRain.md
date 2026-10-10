# MatrixRain

A canvas-based Matrix-style effect where random characters cascade down the screen. It runs a continuous animation loop with configurable speed and fade.

## When to use it

Use it as a full-viewport backdrop or an ambient section background for a retro-tech aesthetic.

## Quick start

```javascript
import { MatrixRain } from "flet-box";

const rain = MatrixRain({});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `chars` | `string` | Characters used by the matrix rain. |
| `fontSize` | `number` | Size of the font. |
| `speed` | `number` | Animation speed. |
| `fadeAmount` | `number` | How quickly trails fade each frame. |
| `resetProbability` | `number` | Chance a column resets to the top each frame. |
| `useDynamicColor` | `boolean` | Cycles colors instead of using a fixed color. |
| `position` | `'fixed' \| 'absolute'` | CSS `position` value, or `stack` for centered stacking. |
| `zIndex` | `number` | Index used for the z. |

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
import { MatrixRain } from "flet-box";

const rain = MatrixRain({
  fontSize: 18,
  speed: 0.6,
  position: "fixed",
});
```

### Full

```javascript
import { MatrixRain } from "flet-box";

const rain = MatrixRain({
  chars: "01",
  fontSize: 20,
  speed: 0.8,
  fadeAmount: 0.08,
  resetProbability: 0.98,
  useDynamicColor: true,
  position: "fixed",
  zIndex: 1,
});
```

## Tips

- position: "fixed" fills the viewport; "absolute" fills a positioned parent
- instead.
- Set zIndex low (1 or negative) so the rain renders behind your regular UI.
- Tune resetProbability closer to 1 to make trails longer or drops rarer.

## Accessibility

- The rain is decorative canvas output; pair it with real content on top and make it
- pausable for motion-sensitive users.

## Behavior

- The returned canvas runs its animation loop immediately and exposes _cleanup() to
- stop drawing and disconnect the ResizeObserver.
- Changing speed or fadeAmount only affects future frames; update them before mount
- for a clean start.

## Related widgets

- [Container](Container.md)
- [Card](Card.md)
- [AnimatedBox](AnimatedBox.md)

---

## Continue reading

- **Previous:** [AnimatedText](AnimatedText.md)
- **Next:** [ParallaxBox](ParallaxBox.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (12 of 13).
