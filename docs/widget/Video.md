# Video

## Overview
`Video` renders a native `<video>` element — the widget returns the media element itself, not a wrapper. It forwards the media attributes directly to that element: `src`, `controls` (on by default), `loop`, `muted`, `autoplay`, and `poster`. `width` defaults to `"100%"` and `height` to `"auto"`. The returned element exposes playback helpers (`playVideo`, `pauseVideo`, `stop`, `restart`, …).

## When to use
- Embed a video clip or recording with the browser's native controls.
- Play a muted, looping background video (`muted` + `loop` + `autoplay`).
- Drive playback programmatically through the instance methods.

## Import

```javascript
import { Video } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Video } from "flet-box";

Video({ src: "clip.mp4" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | string | — | Media URL or path. Set as the `<video>` element's `src` attribute. |
| `controls` | boolean | `true` | Show the browser's native controls. On by default (unlike `Audio`). |
| `width` | Size | `"100%"` | CSS width of the element (a string such as `"100%"` or `"480px"`). |
| `height` | Size | `"auto"` | CSS height of the element. |
| `autoplay` | boolean | `false` | Begin playing as soon as the browser allows. |
| `loop` | boolean | `false` | Repeat playback when the video ends. |
| `muted` | boolean | `false` | Mute audio. Most browsers require this for `autoplay`. |
| `poster` | string | — | Preview image URL shown before playback. Applied only when set. |
| `ref` | `(el) => void` | — | Receives the `<video>` element with its instance methods attached. |

These are the props specific to `Video`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned `<video>` element exposes:

- `playVideo()` — starts playback; returns the element (chainable).
- `pauseVideo()` — pauses playback; returns the element.
- `stop()` — pauses and resets `currentTime` to `0`; returns the element.
- `restart()` — resets `currentTime` to `0` and plays; returns the element.
- `volumeUp(step = 0.1)` / `volumeDown(step = 0.1)` — adjust volume, clamped to `0`–`1`; return the element.
- `muteVideo()` / `unmuteVideo()` — toggle the muted flag; return the element.

## Examples

### Everyday example

```javascript
import { Video } from "flet-box";

Video({
  src: "demo.mp4",
  controls: true,
  width: "100%",
  height: "auto",
  poster: "demo-poster.jpg",
});
```

### Full example

```javascript
import { Column, Text, Video } from "flet-box";

let player;

Column({
  gap: 8,
  children: [
    Video({
      src: "movie.mp4",
      poster: "movie.jpg",
      width: "100%",
      height: "auto",
      controls: true,
      muted: true,
      loop: true,
      ref: (el) => (player = el),
    }),
    Text({ text: "Muted + loop makes an ambient background clip", size: 14 }),
  ],
});

// player.playVideo();  player.pauseVideo();  player.restart();
```

## Notes

- Renders a bare `<video>` element: the widget returns the media element itself, so `ref` and every instance method live directly on it.
- `controls` defaults to **true** here; `Audio` defaults to `false`.
- `controls`, `loop`, `muted`, and `autoplay` are applied as element **properties** (media attributes are not CSS); `poster` is applied only when provided.
- Unlike `Audio`, `Video` does not wire its own playback callbacks. Use `ref` plus the instance methods, or pass native handlers (e.g. `onPlay`, `onPause`) which the [common prop](COMMON_PROPS.md) system forwards to the element.
- An empty or unreachable `src` plays nothing.
- Browsers block autoplay unless the video is also `muted`.

## Related widgets
- [Audio](Audio.md)
- [Image](Image.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [Audio](Audio.md)
- **Next:** [DraggBox](DraggBox.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 7 · Media and drag & drop** (2 of 4).
