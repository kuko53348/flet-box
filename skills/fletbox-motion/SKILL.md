---
name: fletbox-motion
description: When a FletBox screen may move and with which API - AnimatedBox, AnimatedText, ParallaxBox, animate/fadeIn/pulse, the frequency gate, durations that match the interaction, the two easing vocabularies the framework actually has, and what must never animate. Use when adding any transition, entrance, loading pulse, hover lift, parallax or hero motion.
---

# Motion — the only animation contract this app has

Motion is a sentence, not a coat of paint. One screen says one thing with it:
"this appeared", "this is loading", "this is where you are". Every other movement
is noise that costs the frame budget and the user's attention.

## M0 The frequency gate, first

Ask how often the user sees this interaction. That number decides everything else:

| Seen | Verdict |
| --- | --- |
| 100+ times a day (a button, a form field, a list row, a tab) | **No animation.** Feedback is a color or a state, not a movement. |
| 10–100 times (a modal, a drawer, a filter applied) | 120–250ms, one property, no choreography. |
| First time only (an onboarding screen, a hero, a landing page) | This is where the budget lives: entrance, stagger, one parallax. |

A screen the user works in all day gets *less* motion than a page they visit once.
If you cannot say which row of this table the interaction is in, it gets no
animation.

## M1 The API is four things

- **`AnimatedBox`** — declarative keyframes on one child:
  `AnimatedBox({ child, animations: [{ effect, from, to, duration, reverse, loop, delay }], timing, delay, fillMode })`.
- **`AnimatedText`** — the same steps across the characters of a text, with
  `delayBetween` (a stagger in ms) and `sameTime: true` to fire it at once.
- **`ParallaxBox`** — offset driven by input: `type: 'scroll' | 'mouse' | 'hover'`,
  `speed`, `direction: 'vertical' | 'horizontal' | 'both'`, `maxOffset`, `reverse`,
  `disabled`, `onParallaxMove`.
- **The imperative helpers** — `animate(widget, property, from, to, duration, easing)`
  which returns a cancel function, `animateAsync` which returns a Promise,
  `fadeIn` / `fadeOut` / `pulse` (+ the `…Async` forms), `applyPulse`,
  `stopAnimation(widget, property)`.

Anything else — a hand-written `transition: all`, a CSS library, a `requestAnimationFrame`
loop in a widget — is a second animation system, and this app already has one.

**Effects `AnimatedBox` knows:** `scale`, `rotate`, `rotateX`, `rotateY`,
`translateX`, `translateY`, `opacity`, `color`, `backgroundColor`, `borderColor`,
`borderWidth`, `borderRadius`, `width`, `height`, `boxShadow`, `background`,
`textGradient`. Anything outside that list does nothing, silently.

## M2 Duration follows the distance, and the interaction

Milliseconds, in the ranges that read as "instant" instead of "smooth" — smooth is
what slow feels like after the third repetition:

| Interaction | duration | What moves |
| --- | --- | --- |
| Press feedback | 100–160 | `scale` 1 → 0.97 |
| Hover / focus state | 120–180 | `opacity`, `borderColor` |
| Tooltip, chip, badge | 125–200 | `opacity` |
| Menu, dropdown, sheet | 150–250 | `opacity` + `translateY` 8 → 0 |
| Modal, drawer | 200–400 | `translateX`/`translateY`, never scale |
| Screen entrance, hero | 300–500 | `opacity` + `translateY` 16 → 0 |
| Loading | loop | `Skeleton({ animation: 'wave' })` |

Nothing in the UI exceeds 500ms. A 300ms number on every element is not a design
decision — it is the default.

```js
// A sheet entering: 220ms, distance 24, nothing else.
AnimatedBox({
  child: panel,
  animations: [
    { effect: 'opacity', from: 0, to: 1, duration: 220 },
    { effect: 'translateY', from: 24, to: 0, duration: 220 },
  ],
});
```

## M3 Two easing vocabularies — do not mix them

This is a real trap, and it fails silently:

- **`animate(..., easing)`** takes a *framework name*: `'linear' | 'easeIn' | 'easeOut' |
  'easeInOut'`. An unrecognized string falls back to `linear`.
- **`AnimatedBox({ timing })` and `ParallaxBox({ easing })`** are passed straight to
  CSS: `'ease' | 'ease-out' | 'ease-in' | 'linear' | 'cubic-bezier(…)'`. `easeIn` in
  a `timing` string is not a curve CSS knows, and the step runs linear.

Rules that hold for both:

- Entering and exiting UI use an **out** curve (`easeOut` / `ease-out`) — it starts
  fast, which reads as responsive.
- **Never** `easeIn` on an interface element: it starts slow, so the first 100ms of
  a press feels broken. Save it for something leaving the screen at speed.
- A loop that has to feel like a machine uses `linear`.
- Never `transition: all`, and never animate `width`, `height`, `top`, `left` or
  `boxShadow` for something the user presses repeatedly: they reflow or repaint the
  page. `AnimatedBox` *can* animate them, which is exactly why this rule needs to be
  written down. Transform and opacity are the two properties that cost nothing:
  `scale`, `translateX/Y`, `rotate`, `opacity`.
- Nothing enters from `scale: 0`, and nothing from full scale on a big element: use
  **0.9–0.97**. From zero, the element is a dot that pops.

## M4 Press feedback, done right

A press is 100+ times a day (M0): the answer is a state change, not a show.

```js
// The whole of it: 140ms, 3% of scale, back on release.
onPress: (widget) => animate(widget, 'scale', 1, 0.97, 140, 'easeOut');
```

`Button` already changes color on press. Adding a lift, a glow and a scale on top
of that is three simultaneous answers to one question. Pick one — and if the color
change is enough, which it usually is, ship it and move on.

## M5 Entrance and stagger

Motion on first paint is the one place a longer budget is fair, with two limits:

- Stagger **30–80ms** between siblings, and cap the total. `AnimatedText` gives this
  for free with `delayBetween: 40`; a hand-built list needs `delay` per step, and a
  list of 20 rows at 60ms each is a 1.2s wait before the content is readable.
  Animate the first 5–8 items and let the rest appear.
- One direction per screen. Elements arriving from the left *and* the bottom *and*
  scaled is three ideas. A short `translateY` (8–24) plus `opacity` reads as one.

## M6 Loops, ambient motion and `ParallaxBox`

- A loop is a status. `loop: true`, `pulse`, `applyPulse` and `MatrixRain` say
  "waiting" or "this is the one". If it never stops and means nothing, turn it off.
- Loading uses `Skeleton({ animation: 'wave', count, gap, height })` in the shape of
  the content that will replace it — not a spinner in the middle of a blank page.
- `ParallaxBox` belongs to a hero or a single decorative layer, never inside a
  working screen, and `type: 'mouse'` never on a touch-first app. Keep `maxOffset`
  small (8–24). A background that moves 120px is not depth, it is a screensaver.
- Ambient motion gets its own budget: one per screen, at most.

## M7 What must never move

- Text the user is reading at length; body copy that animates is copy they re-read.
- Anything under a pointer or a finger while they aim at it — a control that shifts
  while being targeted is a control you cannot hit (this is why press feedback scales
  the element instead of moving it).
- A field while typing, a list while scrolling, a number while it is being compared.
- Two things at once in the same region: the last animation started is the one that
  should win, and `stopAnimation(widget, property)` exists for exactly that.

FletBox has no reduced-motion switch. That is not an excuse: build the screen so it
reads with zero animation, then add motion as a decision you can point at. If the
motion is only decoration, the honest answer to "respect reduced motion" is to not
add it.

## M8 Clean up

An animation is a resource. `animate()` returns a cancel function — hold it and call
it when the widget unmounts, or call `stopAnimation(widget, property)`. A loop that
outlives its widget keeps a `requestAnimationFrame` alive and animates a detached
node forever. A widget that registers timers, listeners or observers releases them in
its `onUnmount` disposer.

## M9 The check

1. `npm run check` — every prop named exists (`flet-box unpack AnimatedBox`).
2. `npm run ui`.
3. Watch it, twice, at 375px. Then answer: how many times a day does a real user
   see this? If the answer is "a lot", the correct fix is usually to delete the
   animation, not to tune it.
4. Check the frame, not the curve: press a control while something else moves. If
   the press feels delayed, the motion is the cause.
