# Video

Renders a native <video> element with proper media attributes and a convenient playback API. Helpers for play, pause, stop, restart, and volume.

## When to use it

Use it to embed a clip, trailer, ambient background video, or lecture recording.

## Quick start

```javascript
import { Video } from "flet-box";

const clip = Video({
  src: "/media/intro.mp4",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `src` | `string` | Resource URL for the image, audio, or video. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `number \| string` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `autoplay` | `boolean` | Starts playback automatically. |
| `controls` | `boolean` | Shows the native media playback controls. |
| `loop` | `boolean` | Restarts playback when it reaches the end. |
| `muted` | `boolean` | Starts playback with the audio muted. |
| `poster` | `string` | Image shown before a video starts playing. |
| `ref` | `(video: HTMLVideoElement) => void` | Callback that receives the underlying DOM node. |

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
import { Video } from "flet-box";

const clip = Video({
  src: "/media/intro.mp4",
  controls: true,
  width: "100%",
  height: 360,
  poster: "/media/intro-poster.jpg",
});
```

### Full

```javascript
import { Video } from "flet-box";

const clip = Video({
  src: "/media/demo.mp4",
  width: "100%",
  height: 480,
  controls: true,
  autoplay: false,
  loop: true,
  muted: true,
  poster: "/media/demo-poster.jpg",
  ref: (video) => video.playVideo(),
});
```

## Tips

- controls, loop, muted, and autoplay are set as element properties, not CSS, so they
- work even though they look like styling props.
- Browsers block autoplay with sound; pair autoplay: true with muted: true for a
- reliable ambient loop.
- The ref callback receives the element extended with playVideo, pauseVideo, stop,
- restart, volumeUp, and muteVideo helpers.

## Accessibility

- Keep controls: true so keyboard and screen-reader users can operate playback.

## Behavior

- playVideo swallows the browser's autoplay rejection instead of throwing, so it is
- safe to call from a click handler.

## Related widgets

- [Audio](Audio.md)
- [Image](Image.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [Audio](Audio.md)
- **Next:** [DraggBox](DraggBox.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 7 · Media and drag & drop** (2 of 4).
