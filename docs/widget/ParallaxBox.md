# ParallaxBox

A container that shifts its child in response to scroll, mouse position, or hover entry. It clamps movement to a max offset and eases with a transition.

## When to use it

Use it to give hero sections or layered illustrations depth as the user scrolls or moves the pointer.

## Quick start

```javascript
import { ParallaxBox, Text } from "flet-box";

const scene = ParallaxBox({
  child: Text({ text: "Scroll me" }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `child` | `Widget` | A single child widget. Alias: `children` for a list. |
| `type` | `'scroll' \| 'mouse' \| 'hover'` | Kind or mode of the widget. |
| `speed` | `number` | Animation speed. |
| `direction` | `'vertical' \| 'horizontal' \| 'both'` | Main-axis direction for layout widgets (`row` or `column`). |
| `maxOffset` | `number` | Maximum parallax offset in pixels. |
| `reverse` | `boolean` | Reverses the parallax direction. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onParallaxMove` | `(offset: { x: number; y: number }) => void` | Fired as the parallax offset changes. |
| `duration` | `number` | How long the transient element stays visible, in milliseconds. |
| `easing` | `string` | Easing curve for the parallax motion. |

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
import { Image, ParallaxBox } from "flet-box";

const scene = ParallaxBox({
  child: Image({ src: "/artwork.jpg", alt: "Layer 1" }),
  type: "scroll",
  speed: 0.6,
});
```

### Full

```javascript
import { Image, ParallaxBox } from "flet-box";

const scene = ParallaxBox({
  child: Image({ src: "/team/hero.png", alt: "Hero layer" }),
  type: "mouse",
  speed: 0.4,
  direction: "both",
  maxOffset: 40,
  reverse: true,
  duration: 250,
  easing: "ease-out",
  onParallaxMove: (offset) => console.log(offset.x, offset.y),
});
```

## Tips

- type: "scroll" follows the window scroll; "mouse" tracks the pointer relative to
- the widget center; "hover" snaps on entry and resets on leave.
- Raise speed for a more pronounced shift, and keep maxOffset small so content never
- strays far from its layout box.
- Use reverse: true to invert the direction when the natural movement feels wrong.

## Accessibility

- Parallax is decorative motion; make sure content stays readable without it and keep
- movement gentle.

## Behavior

- The exposed element provides updateSpeed, updateDirection, setPosition, and reset
- for runtime control.
- Transforms are clamped to maxOffset and cleaned up via _cleanup(), which removes all
- event listeners on destroy.

## Related widgets

- [AnimatedBox](AnimatedBox.md)
- [Image](Image.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [MatrixRain](MatrixRain.md)
- **Next:** [Audio](Audio.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (13 of 13).
