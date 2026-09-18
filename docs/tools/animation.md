# Animation helpers

## Overview
Two ways to animate in FletBox: `animate`/`fadeIn`/`fadeOut`/`pulse` (and their `Async` variants) run animations on existing elements, while the widgets `AnimatedBox`, `AnimatedText`, `MatrixRain`, and `ParallaxBox` give you animated UI out of the box.

## When to use
- Animate an element when something happens: fade a panel in, pulse a button, animate a value change.
- Add moving backgrounds (`MatrixRain`, `ParallaxBox`).

## Import

```javascript
import { animate, fadeIn, fadeOut, pulse, AnimatedBox } from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `animate` | `animate(widget, property, from, to, duration?, easing?)` | — | Animate one CSS `property` of a widget from `from` to `to` (both numbers or colors). `duration` is ms, `easing` defaults to `"linear"`. |
| `animateAsync` | `animateAsync(widget, property, from, to, duration?, easing?)` | `Promise` | Same, resolves when the animation finishes. |
| `fadeIn` | `fadeIn(widget, duration?)` | — | Fade the widget in (default 300 ms). |
| `fadeOut` | `fadeOut(widget, duration?)` | — | Fade it out. |
| `pulse` | `pulse(widget, duration?)` | — | A quick scale pulse. |
| `fadeInAsync` / `fadeOutAsync` / `pulseAsync` | same, `Async` suffix | `Promise` | Promise variants that resolve on completion. |

## Widgets

- `AnimatedBox({ animations, timing, delay, fillMode, child, top, right, bottom, left })` — animates a child widget. `animations` is an array of `{ effect, from, to, duration }` entries; effects include `backgroundColor`, `color`, `borderRadius`, `opacity`, `scale`, `translate`, `rotate`, `width`, `height`, spacing, `boxShadow`, and gradients.
- `AnimatedText({ child, animations, sameTime, delayBetween, orientation })` — animates a `Text` widget (letters split per animation).
- `MatrixRain({ chars, fontSize, speed, fadeAmount, resetProbability, useDynamicColor, position, zIndex })` — the falling-characters canvas effect (returns a `canvas`).
- `ParallaxBox({ type, speed, direction, maxOffset, reverse, child })` — content that moves; `type` is `"scroll"`, `"mouse"`, or `"hover"`, `direction` is `"vertical"`, `"horizontal"`, or `"both"`.

## Examples

### Everyday example

```javascript
import { Button, Container, Text, fadeOut } from "flet-box";

const panel = Container({ padding: 24, child: Text({ text: "Hi" }) });

Button({
  text: "Hide",
  onPress: () => fadeOut(panel, 300),
});
```

### Full example

```javascript
import { AnimatedBox, Text } from "flet-box";

AnimatedBox({
  animations: [
    { effect: "scale", from: 0.5, to: 1, duration: 600 },
    { effect: "opacity", from: 0, to: 1, duration: 400 },
  ],
  child: Text({ text: "Welcome!" }),
});
```

## Notes

- Animation timing follows CSS `animation-duration` speeds (seconds/ms values depending on context — pass a number for ms in the widget props).
- The `Async` variants are handy for sequences: `await fadeInAsync(el); await fadeOutAsync(el);`
- For CSS-string animations use the `animation()` styling helper from [Styling helpers](styling.md).

## Related pages
- [Input validation](validation.md) — previous chapter.
- [Utilities guide](../guides/utilities.md) — next stop: the whole toolkit walkthrough.
- [Styling helpers](styling.md) — the `animation()` CSS builder.

---

## Continue reading

- **Previous:** [Input validation](validation.md)
- **Next:** [Utilities guide](../guides/utilities.md) — Chapter 10 wrap-up
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (12 of 12).