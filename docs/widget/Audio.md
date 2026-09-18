# Audio

## Overview
`Audio` renders a native `<audio>` element — the widget returns the media element itself, not a wrapper. It forwards the media attributes directly to that element: `src`, `controls`, `loop`, `muted`, `autoplay`, and `volume`, and always sets `preload="metadata"`. It also attaches playback helpers (`playAudio`, `pauseAudio`, `stop`, `seekTo`, …) and emits `onPlay`/`onPause`/`onEnd`/`onTimeUpdate`/`onProgress`/`onLoad`.

## When to use
- Play a sound, song, or podcast through the browser's native audio pipeline.
- Build custom transport controls from the instance methods plus `Button`/`Slider`.
- React to playback state with `onPlay`, `onPause`, `onEnd`, and `onTimeUpdate`.

## Import

```javascript
import { Audio } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Audio } from "flet-box";

Audio({ src: "clip.mp3", controls: true });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | string | — | Media URL or path. Set as the `<audio>` element's `src` attribute. |
| `controls` | boolean | `false` | Show the browser's native playback controls. |
| `autoplay` | boolean | `false` | Begin playing as soon as the browser allows. |
| `loop` | boolean | `false` | Repeat playback when the track ends. |
| `muted` | boolean | `false` | Start muted. |
| `volume` | number `0`–`1` | `1` | Initial playback volume. A non-number falls back to `1`. |
| `onPlay` | `() => void` | — | Fires when playback starts. |
| `onPause` | `() => void` | — | Fires when playback pauses. |
| `onEnd` | `() => void` | — | Fires when the track ends (native `ended`). |
| `onTimeUpdate` | `(current, duration, percent) => void` | — | Fires on each `timeupdate`; `percent` is `current / duration * 100`. |
| `onProgress` | `(percent) => void` | — | Fires alongside `onTimeUpdate` with just the percent. |
| `onLoad` | `(duration) => void` | — | Fires once, when the duration first becomes known. |
| `ref` | `(el) => void` | — | Receives the `<audio>` element with its instance methods attached. |

These are the props specific to `Audio`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned `<audio>` element exposes:

- `playAudio()` — starts playback; returns the element (chainable).
- `pauseAudio()` — pauses playback; returns the element.
- `stop()` — pauses and resets `currentTime` to `0`; returns the element.
- `seekTo(seconds)` — seeks when `seconds` is within range; returns the element.
- `seekToPercent(percent)` — seeks to a percentage of the duration; returns the element.
- `getCurrentTime()` — current position in seconds.
- `getDuration()` — total duration in seconds (`0` until known).
- `getProgressPercent()` — current position as a percentage.
- `volumeUp(step = 0.1)` / `volumeDown(step = 0.1)` — adjust volume, clamped to `0`–`1`; return the element.
- `muteAudio()` / `unmuteAudio()` — toggle the muted flag; return the element.
- `isPlaying()` — returns `true` while not paused.

## Examples

### Everyday example

```javascript
import { Audio } from "flet-box";

Audio({
  src: "podcast.mp3",
  controls: true,
  volume: 0.8,
  onPlay: () => console.log("playing"),
  onEnd: () => console.log("finished"),
});
```

### Full example

```javascript
import { Audio, Button, Row, Text, Column } from "flet-box";

let player;

Column({
  gap: 12,
  children: [
    Audio({
      src: "track.mp3",
      ref: (el) => (player = el),
      onLoad: (duration) => console.log("duration", duration),
      onTimeUpdate: (current, duration, percent) =>
        console.log(`${Math.round(percent)}%`),
    }),
    Row({
      gap: 8,
      children: [
        Button({ text: "Play", onPress: () => player && player.playAudio() }),
        Button({ text: "Pause", onPress: () => player && player.pauseAudio() }),
        Button({ text: "Stop", onPress: () => player && player.stop() }),
      ],
    }),
    Text({ text: "Custom transport built from instance methods", size: 14 }),
  ],
});
```

## Notes

- Renders a bare `<audio>` element: the widget returns the media element itself, so `ref` and every instance method live directly on it.
- `controls`, `loop`, `muted`, and `autoplay` are applied as element **properties** (media attributes are not CSS), so they take effect even though they are not styling props. `preload` is always `"metadata"`.
- `volume` accepts `0`–`1`; any non-number is ignored in favor of `1`.
- Duration comes from the element's metadata. If the browser cannot supply it, the widget polls, and as a last resort fetches and decodes the file to compute it — `onLoad` and `getDuration()` stay `0` until then.
- An empty or unreachable `src` plays nothing; the native `error` event is logged as a warning.
- Browsers block autoplay until the user interacts with the page, so `autoplay`/`playAudio()` may be deferred.

## Related widgets
- [Video](Video.md)
- [Image](Image.md)
- [Button](Button.md)
- [Slider](Slider.md)

---

## Continue reading

- **Previous:** [Inspector](Inspector.md)
- **Next:** [Video](Video.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 7 · Media and drag & drop** (1 of 4).
