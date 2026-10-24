# Animation helpers

## Overview
Three ways to animate in FletBox: the **named transitions** (`slideIn`, `popIn`, `shake`, `slideOut`) for the gestures a screen keeps repeating, `animate`/`fadeIn`/`fadeOut`/`pulse` (and their `Async` variants) for one property of one element, and the widgets `AnimatedBox`, `AnimatedText`, `MatrixRain`, and `ParallaxBox` for animated UI out of the box. Every helper-driven animation is cancelable — through the function it returns or later with `stopAnimation(widget)` — and all three honour the app's [motion preference](#reduced-motion), so a screen never has to ask whether the user wants movement.

## When to use
- Bring a screen, sheet or card in: `slideIn(card)`, `popIn(badge)` — one call, one gesture.
- Say "that was wrong": `shake(field)` on a rejected form.
- Animate one property when something happens: fade a panel in, pulse a button, animate a value change.
- Stop an animation the element no longer needs: `onUnmount(() => stopAnimation(el))`.
- Add moving backgrounds (`MatrixRain`, `ParallaxBox`).

## Import

```javascript
import {
  animate, fadeIn, fadeOut, pulse, stopAnimation,
  slideIn, slideOut, popIn, shake, animateSpring,
  EASING_NAMES, cubicBezier, spring, stagger,
  prefersReducedMotion, setMotionMode, getMotionMode, onMotionModeChange,
  AnimatedBox,
} from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `animate` | `animate(widget, property, from, to, duration?, easing?)` | cancel `() => boolean` | Animate one `property` of a widget from `from` to `to`. A number is a **framework unit** — the same unit every widget prop takes — so `translateY: 20` is `20 / base-font-size` rem and grows with the reader's font; a unit string keeps its unit (`"16px"`); and a color blends whichever way you write it (`#rrggbb`, `rgb(…)`, `rgba(…)`). `duration` is ms, `easing` defaults to `"linear"` — a name from [`EASING_NAMES`](#easings), a `cubicBezier()` or a `spring().easing`. Calling the returned function stops the loop and returns `true` if it was still running. |
| `animateAsync` | `animateAsync(widget, property, from, to, duration?, easing?)` | `Promise` | Same, resolves with the widget when the animation finishes — or as soon as it is cancelled or replaced, so `await` never hangs. |
| `animateSpring` | `animateSpring(widget, property, from, to, options?)` | cancel `() => boolean` | The same loop driven by a damped spring: there is no duration to pick, the animation runs until it settles. `options` are `stiffness`, `damping`, `mass`, `initialVelocity`. |
| `animateSpringAsync` | same, `Async` suffix | `Promise` | Promise variant of `animateSpring`. |
| `stopAnimation` | `stopAnimation(widget, property?)` | `boolean` | Stop what is animating `widget` — one `property`, or every animated property when it is omitted. Use it in `onUnmount` when you did not keep the cancel function. |
| `fadeIn` | `fadeIn(widget, duration?)` | cancel `() => boolean` | Fade the widget in to full opacity (default 300 ms). |
| `fadeOut` | `fadeOut(widget, duration?)` | cancel `() => boolean` | Fade it out — from wherever the element actually is, so a card the theme set to `0.8` does not first jump to fully opaque. |
| `pulse` | `pulse(widget, duration?)` | cancel `() => boolean` | A quick scale pulse: one loop that swells to `1.1` at the halfway mark and is back at `1` when it ends. |
| `fadeInAsync` / `fadeOutAsync` / `pulseAsync` | same, `Async` suffix | `Promise` | The same single loop, awaitable, resolving with the widget — the sync and awaitable forms of a preset are one gesture, not two implementations. |

Starting a second animation on the same widget and property **replaces** the first one; two loops writing
one style would otherwise fight, and the older animation would resume after the newer had finished.
Transform functions are the exception, and deliberately: `translateY` and `scale` are separate
properties in the registry and are merged into one `transform` string, so an element can slide and
grow at the same time.

## Named transitions

The three gestures every product repeats, with the durations and the distances already chosen, so an
app does not hand-roll eleven slightly different entrances. Each returns a cancel function and has an
`Async` form that resolves with the widget. `distance` is a framework unit like every other length in
the framework — `16` is `1 rem` at the default base, not sixteen fixed pixels.

| Function | Signature | What it says |
| --- | --- | --- |
| `slideIn` | `slideIn(widget, { direction, distance, duration, easing, fade })` | "this appeared" — a short travel plus a fade. `direction` is the way the element travels (`"up"` starts below its resting place), `distance` defaults to `16`, `duration` to `240`, `easing` to `"easeOut"`. |
| `slideOut` | `slideOut(widget, { direction, distance, duration, easing, fade })` | "this is gone" — the mirror, one notch shorter (180 ms). What follows is your unmount: `await slideOutAsync(dialog).then(() => dialog.remove())`. |
| `popIn` | `popIn(widget, { from, to, duration, easing, fade })` | "this belongs here" — scale from `0.94` with a small overshoot (`"easeOutBack"`). Nothing enters from `scale: 0`. |
| `shake` | `shake(widget, { axis, distance, cycles, duration })` | "that was wrong" — one decaying sine on `translateX` (or `translateY`), 6 units, 3 swings, 320 ms, ending at rest. |

```javascript
// A sheet that arrives, and the error that refuses it.
slideIn(panel, { direction: "up", distance: 24, duration: 220 });

if (!password.valid) {
  shake(loginForm, { axis: "x" });
}
```

## Easings

`animate()` reads a **FletBox name**, not a CSS string: `"ease-out"` is not in this vocabulary and the
loop would run `linear` (with a warning) while `AnimatedBox({ timing })` hands the same word straight
to CSS. `EASING_NAMES` is the list the framework knows.

| Family | Names |
| --- | --- |
| The original four | `linear`, `easeIn`, `easeOut`, `easeInOut` |
| Powers | `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeInQuart`, `easeOutQuart`, `easeInOutQuart`, `easeInExpo`, `easeOutExpo`, `easeInOutExpo`, `easeInCirc`, `easeOutCirc`, `easeInOutCirc` |
| Overshoot | `easeInBack`, `easeOutBack`, `easeInOutBack`, `easeInElastic`, `easeOutElastic`, `easeOutBounce` |
| Material shapes | `standard`, `emphasized`, `emphasizedDecelerate`, `emphasizedAccelerate` |

An entrance decelerates — `easeOut*`, `emphasizedDecelerate` or a spring. `easeIn*` starts slow, which
is why it belongs on something leaving the screen at speed and nowhere else in an interface.

```javascript
// Any CSS curve, on the imperative side.
animate(card, "translateY", 24, 0, 240, cubicBezier(0.2, 0, 0, 1));

// A gesture that continues into its resting place instead of stopping at it.
animateSpring(button, "scale", 0.96, 1, { stiffness: 260, damping: 20 });
```

`stagger()` gives an entrance its choreography without the arithmetic that turns 20 rows into a 1.2 s
wait: the delay stops growing after `max` items.

```javascript
list.forEach((row, index) => {
  slideIn(row, { duration: 240 });
  row.style.animationDelay = `${stagger(index, { step: 60, max: 8 })}ms`;
});
```

## Reduced motion

`prefers-reduced-motion` is not a style note: for readers with a vestibular disorder, parallax and
large movement are physically unpleasant. FletBox answers it in the engine, so an animation cannot
ship without the check.

| Function | Signature | Description |
| --- | --- | --- |
| `prefersReducedMotion` | `prefersReducedMotion()` | `true` when the app or the operating system asked for no movement. |
| `setMotionMode` | `setMotionMode("auto" \| "reduce" \| "full")` | The app's own switch. `"auto"` (the default) follows the OS; `"reduce"` never moves; `"full"` always animates. Wires to a settings toggle. |
| `getMotionMode` | `getMotionMode()` | The mode in effect. |
| `onMotionModeChange` | `onMotionModeChange(listener)` | Calls `listener(reduced)` when the mode — or the OS setting — changes. Returns the unsubscribe; call it from `onUnmount`. |
| `motionDuration` | `motionDuration(240)` | The duration a loop should actually run: `0` when motion is reduced. |

What each surface does with it:

- **`animate()` and the presets** collapse to a single frame that writes the end value. The state still
  lands and an `await` still resolves — only the movement disappears.
- **`AnimatedBox`** runs its keyframes at `0.01 ms`, once, with no delay. `fillMode: "forwards"` leaves
  the element on its `to` values, and a `loop` stops looping. An element already looping when the reader
  changes the OS setting is caught by a `@media (prefers-reduced-motion: reduce)` rule the engine injects
  once, which overrides every animated element — no listener to leak, nothing to rebuild.
- **Every `infinite` CSS animation the factory writes** is marked with that same hook, so the loading
  loops belong to the widget author: `Skeleton`, `ProgressBar`, `Slider` (striped or glowing), the
  `ListView` refresh spinner and the `Modal` spinner all stop on their own.
- **`ParallaxBox`** parks its layer at the origin and stops answering scroll or pointer input.
- **`MatrixRain`** paints one static field and releases the `requestAnimationFrame`.
- **`applyPulse`** does nothing at all.

```javascript
// A settings screen that hands the decision to the reader.
Switch({
  label: "Reduce motion",
  value: getMotionMode() === "reduce",
  onToggle: (on) => setMotionMode(on ? "reduce" : "auto"),
});
```

## Widgets

- `AnimatedBox({ animations, timing, delay, fillMode, child, top, right, bottom, left })` — animates a child widget.
  `animations` is an array of `{ effect, from, to }` steps, and each step may carry its own `duration`, `delay`,
  `loop` and `reverse` — every one of them is read off **that step**, so a 600 ms `scale` and a 400 ms `opacity`
  run on two clocks inside one rule. Times are milliseconds as a number (`duration: 400`) or a CSS time as a
  string (`delay: "0.4s"`); the widget-level `delay` is the default for the steps that do not name one. A step
  plays once and holds `to` at the end (`reverse: true` swings it back to `from`, `loop: true` repeats it).
  Effects are `opacity`, `scale`, `scaleX`, `scaleY`, `rotate`, `rotateX`, `rotateY`, `rotateZ`, `skewX`,
  `skewY`, `translateX`, `translateY`, `translateZ`, `backgroundColor`, `color`, `borderColor`, `borderWidth`,
  `borderRadius`, `width`, `height`, `boxShadow`, `background`, `textGradient` and the per-side margin/padding
  steps. A looping step and a one-shot step generate two `@keyframes` rules — one rule per timing group — and
  since two rules cannot compose one `transform`, keep the transform steps in one group. `timing` is a **CSS**
  string (`"ease-out"`, `"cubic-bezier(…)"`).
- `AnimatedText({ child, animations, sameTime, delayBetween, orientation })` — animates a `Text` widget, one step
  per character. `delayBetween` is in **seconds** (`0.05` is a 50 ms stagger); the letters share one generated
  rule and each carries its own delay.
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

- Two vocabularies of time, and each is honest about itself: `duration`/`delay` on a step or a preset are
  milliseconds (a number, or a CSS time string the engine parses), `stagger()` returns milliseconds for
  `animationDelay`, and `AnimatedText`'s `delayBetween` is seconds.
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