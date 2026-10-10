# Image

Renders an image element from a URL or path. Supports fixed sizing, object-fit modes, and a circular crop for avatars.

## When to use it

Use it whenever you need to show a photo, banner, thumbnail, or icon asset.

## Quick start

```javascript
import { Image } from "flet-box";

const photo = Image({
  src: "/photo.jpg",
  alt: "Profile photo",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `src` | `string` | Resource URL for the image, audio, or video. |
| `alt` | `string` | Alternative text for an image, for accessibility. |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `fit` | `'cover' \| 'contain' \| 'fill' \| 'none' \| 'scale-down'` | How the image fits its box (CSS `object-fit`). |
| `circular` | `boolean` | Clips the image into a circle. |
| `onLoad` | `(widget: Widget) => void` | Fired when the media finishes loading. |
| `onError` | `(widget: Widget) => void` | Fired when the media fails to load. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |

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
import { Image } from "flet-box";

const cover = Image({
  src: "/banner.jpg",
  alt: "Launch banner",
  width: 320,
  height: 180,
  fit: "cover",
  borderRadius: 12,
});
```

### Full

```javascript
import { Image } from "flet-box";

const teamPhoto = Image({
  src: "/team/anna.jpg",
  alt: "Anna at the keynote",
  width: 96,
  height: 96,
  fit: "cover",
  circular: true,
  onLoad: () => console.log("loaded"),
  onError: () => console.error("failed"),
  onPress: () => console.log("open profile"),
});
```

## Tips

- Set both width and height with fit: "cover" to avoid stretched or squashed art.
- Use circular: true instead of a full borderRadius when you want a perfect avatar crop.

## Accessibility

- Always pass alt so screen readers can describe the image; alt: "" marks it decorative.

## Behavior

- onLoad fires once the image decodes; onError fires when the src fails to load.
- onPress is attached to the wrapper, so the image behaves like a tappable tile.

## Related widgets

- [Avatar](Avatar.md)
- [Card](Card.md)
- [Icon](Icon.md)

---

## Continue reading

- **Previous:** [Icon](Icon.md)
- **Next:** [Button](Button.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (7 of 7).
