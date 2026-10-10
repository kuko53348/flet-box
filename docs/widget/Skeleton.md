# Skeleton

Skeleton renders animated placeholder blocks that stand in for content while it loads. It supports text, circular, avatar, image, card, listTile and button shapes.

## When to use it

Reach for it to keep layout stable and communicate loading instead of showing an empty screen or a spinner.

## Quick start

```javascript
import { Skeleton } from "flet-box";

const line = Skeleton({
  width: "100%",
  height: 16,
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `variant` | `'text' \| 'circular' \| 'avatar' \| 'image' \| 'card' \| 'listTile' \| 'button'` | Visual variation or style preset. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `number \| string` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `animation` | `'pulse' \| 'wave' \| 'none'` | The `animation` value for the widget. |
| `count` | `number` | The `count` value for the widget. |
| `gap` | `number` | Space between children along the layout axis. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `highlightColor` | `Color` | Color used for the highlight. |
| `shimmerColor` | `Color` | Color used for the shimmer. |
| `pulseDuration` | `string` | Duration for the pulse, in milliseconds. |
| `waveDuration` | `string` | Duration for the wave, in milliseconds. |

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
import { Skeleton, pulse } from "flet-box";

const article = Skeleton({
  variant: "text",
  width: "80%",
  height: 14,
  count: 3,
  gap: 8,
  animation: "pulse",
});
```

### Full

```javascript
import { Skeleton } from "flet-box";

const cardPlaceholder = Skeleton({
  variant: "card",
  width: 320,
  height: 180,
  borderRadius: 12,
  animation: "wave",
  bgColor: "#e5e7eb",
  highlightColor: "#f3f4f6",
  shimmerColor: "#ffffff",
  gap: 12,
});
```

## Tips

- Match the skeleton variant and height to the real content so the layout does not jump when data arrives.
- Set count together with gap to mock a list of rows instead of nesting many Skeleton widgets.
- Use animation: "none" when many placeholders would otherwise distract or hurt performance.

## Accessibility

- Wrap the loading region with a status label so screen readers know content is still pending.
- Prefer animation: "none" when the user has requested reduced motion.

## Behavior

- The pulse/wave shimmer runs as a CSS animation and is cleaned up automatically when the widget unmounts.
- Changing variant, width or height through the reactive setter re-renders the placeholder in place.

## Related widgets

- [ProgressBar](ProgressBar.md)
- [CircularBar](CircularBar.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [CircularBar](CircularBar.md)
- **Next:** [FloatingActionButton](FloatingActionButton.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (8 of 10).
