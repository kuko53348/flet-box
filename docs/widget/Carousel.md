# Carousel

Carousel cycles through items one at a time with optional arrows, dots and autoplay. Items may be widgets, image URLs or src/alt objects.

## When to use it

Use it to showcase a small set of images, banners or promo slides in limited space.

## Quick start

```javascript
import { Carousel } from "flet-box";

const hero = Carousel({
  items: ["/banner-1.png", "/banner-2.png"],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `(Widget \| string \| { src: string; alt?: string })[]` | Array of items rendered in a rotating or grouped widget. |
| `autoPlay` | `boolean` | Advances automatically. |
| `interval` | `number` | Delay between automatic advances, in milliseconds. |
| `showArrows` | `boolean` | Shows previous/next arrows. |
| `showDots` | `boolean` | Shows the dot indicators. |
| `infinite` | `boolean` | Loops from the last item back to the first. |
| `height` | `number \| string` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `dotColor` | `Color` | Color used for the dot. |
| `dotActiveColor` | `Color` | Color used for the dot active. |
| `dotSize` | `number` | Size of the dot. |
| `dotActiveSize` | `number` | Size of the dot active. |
| `buttonBgColor` | `Color` | Background color for the button. |
| `buttonIconColor` | `Color` | Color used for the button icon. |
| `buttonSize` | `number` | Size of the button. |
| `buttonIconSize` | `number` | Size of the button icon. |
| `buttonTop` | `number \| string` | The `buttonTop` value for the widget. |
| `onIndexChange` | `(index: number) => void` | Fired with the new active index. |

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
import { Carousel } from "flet-box";

const hero = Carousel({
  items: [
    { src: "/sale.png", alt: "Summer sale" },
    { src: "/launch.png", alt: "New launch" },
  ],
  autoPlay: true,
  interval: 4000,
  showDots: true,
  showArrows: true,
});
```

### Full

```javascript
import { Carousel, Text } from "flet-box";

const hero = Carousel({
  items: [
    { src: "/sale.png", alt: "Summer sale" },
    { src: "/launch.png", alt: "New launch" },
    Text({ text: "Featured story" }),
  ],
  autoPlay: true,
  interval: 5000,
  infinite: true,
  showArrows: true,
  showDots: true,
  height: 320,
  width: "100%",
  borderRadius: 16,
  dotColor: "#cbd5e1",
  dotActiveColor: "#2563eb",
  dotSize: 8,
  dotActiveSize: 10,
  buttonBgColor: "#ffffff",
  buttonIconColor: "#0f172a",
  buttonSize: 40,
  buttonIconSize: 20,
  onIndexChange: (index) => console.log(index),
});
```

## Tips

- Enable autoPlay with a sensible interval and keep showDots on so users can jump to a slide.
- Mix URL strings, src/alt objects and widgets in items to combine images with captions.
- Use infinite for looping banners but turn it off when the sequence has a clear first and last slide.

## Accessibility

- Give image items meaningful alt text so each slide is described.
- Provide pause and advance controls, and avoid autoplay for content that needs reading time.

## Behavior

- onIndexChange fires with the new slide index whenever the active item changes.
- Autoplay is cleared automatically when the widget unmounts.

## Related widgets

- [Image](Image.md)
- [Stack](Stack.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [TreeView](TreeView.md)
- **Next:** [InstallButton](InstallButton.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 5 · Navigation and flows** (4 of 5).
