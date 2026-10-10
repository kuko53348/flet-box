# Audio

A thin wrapper around the native <audio> element with reliable duration detection, progress callbacks, and an imperative playback API. It can play without visible controls.

## When to use it

Use it for background music, podcasts, or any audio player where you build your own transport controls.

## Quick start

```javascript
import { Audio } from "flet-box";

const track = Audio({
  src: "/media/song.mp3",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `src` | `string` | Resource URL for the image, audio, or video. |
| `autoplay` | `boolean` | Starts playback automatically. |
| `controls` | `boolean` | Shows the native media playback controls. |
| `loop` | `boolean` | Restarts playback when it reaches the end. |
| `muted` | `boolean` | Starts playback with the audio muted. |
| `volume` | `number` | Initial volume from 0 to 1. |
| `onPlay` | `() => void` | Fired when playback starts. |
| `onPause` | `() => void` | Fired when playback is paused. |
| `onEnd` | `() => void` | Fired when playback reaches the end. |
| `onTimeUpdate` | `(current: number, duration: number, percent: number) => void` | Fired repeatedly as the playback position changes. |
| `onProgress` | `(percent: number) => void` | Fired as the media buffers. |
| `onLoad` | `(duration: number) => void` | Fired when the media finishes loading. |
| `ref` | `(audio: HTMLAudioElement) => void` | Callback that receives the underlying DOM node. |

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
import { Audio } from "flet-box";

const track = Audio({
  src: "/media/song.mp3",
  controls: true,
  volume: 0.8,
  onEnd: () => console.log("finished"),
});
```

### Full

```javascript
import { Audio } from "flet-box";

const track = Audio({
  src: "/media/podcast.mp3",
  autoplay: false,
  controls: false,
  loop: false,
  muted: false,
  volume: 0.7,
  onPlay: () => console.log("playing"),
  onPause: () => console.log("paused"),
  onTimeUpdate: (current, duration, percent) => console.log(percent),
  onLoad: (duration) => console.log(duration),
  ref: (audio) => audio.playAudio(),
});
```

## Tips

- controls defaults to false, so set controls: true for the native player or build a
- custom one from the element's playback methods.
- onTimeUpdate receives (current, duration, percent) while onProgress receives only
- the percent, so pick the callback with the shape you need.
- Duration detection polls the element and can fall back to decoding the file with
- AudioContext when the browser reports an unknown duration.

## Accessibility

- When controls: false there is no visual affordance, so pair it with visible
- play/pause buttons for assistive technology users.

## Behavior

- onLoad fires exactly once, when the duration is first resolved, which can arrive
- after loadedmetadata for some formats.
- The duration polling interval is cleared on unmount, and the fetch-based duration
- fallback runs only if the duration is still unknown after two seconds.

## Related widgets

- [Video](Video.md)
- [Slider](Slider.md)
- [Icon](Icon.md)

---

## Continue reading

- **Previous:** [ParallaxBox](ParallaxBox.md)
- **Next:** [Video](Video.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 7 · Media and drag & drop** (1 of 4).
