---
name: fletbox-motion
description: When a FletBox screen may move and with which API - the named transitions (slideIn, slideOut, popIn, shake), AnimatedBox, AnimatedText, ParallaxBox, animate/fadeIn/pulse, springs and the easing vocabulary, reduced motion with setMotionMode, the frequency gate, and what must never animate. Use when adding any transition, entrance, error feedback, loading pulse, hover lift, parallax or hero motion.
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

## M1 Pick the shortest API that says it

- **The named transitions** — the three gestures a product repeats, with the
  distance and the duration already chosen:
  `slideIn(widget, { direction, distance, duration, easing, fade })`,
  `slideOut(…)` (the mirror, and the unmount follows it),
  `popIn(widget, { from, to, duration, easing })`,
  `shake(widget, { axis, distance, cycles, duration })`. Each returns a cancel
  function; each has an `…Async` form that resolves with the widget. Use these
  before reaching for `animate`: they are one call instead of three, and they
  already obey M7.
- **The imperative helpers** — `animate(widget, property, from, to, duration, easing)`
  for one property, `animateAsync` when the next step has to wait, `fadeIn` /
  `fadeOut` / `pulse` (+ the `…Async` forms), `applyPulse`, and
  `stopAnimation(widget, property)` for the cleanup you did not keep a handle for.
  `animateSpring(widget, property, from, to, { stiffness, damping })` when the
  movement should settle like an object instead of stopping like a timer.
- **`AnimatedBox`** — declarative keyframes on one child:
  `AnimatedBox({ child, animations: [{ effect, from, to, duration, reverse, loop, delay }], timing, delay, fillMode })`.
  Each step carries its own `duration`, `delay` and `loop` and each one is read off
  that step: a 600 ms `scale` and a 400 ms `opacity` in the same entrance are one
  rule that ends at 600 ms with the fade holding from 400 ms on. Times are
  milliseconds as a number (`duration: 400`) or a CSS time as a string
  (`delay: "0.4s"`); the widget-level `delay` is the default for the steps that do
  not name one. A step that loops and a step that plays once cannot share a rule —
  repeating the rule repeats the entrance too — so they become two `@keyframes`, and
  two rules cannot compose one `transform`: keep the transform steps in one group.
- **`AnimatedText`** — the same steps across the characters of a text, with
  `delayBetween` in **seconds** (`0.05` is a 50 ms stagger; `40` is forty seconds)
  and `sameTime: true` to fire it at once.
- **`ParallaxBox`** — offset driven by input: `type: 'scroll' | 'mouse' | 'hover'`,
  `speed`, `direction: 'vertical' | 'horizontal' | 'both'`, `maxOffset`, `reverse`,
  `disabled`, `onParallaxMove`.

Anything else — a hand-written `transition: all`, a CSS library, a `requestAnimationFrame`
loop in a widget — is a second animation system, and this app already has one. A
hand-rolled loop is also the one way to ship motion that ignores reduced motion,
because the engine is what reads the preference.

**Effects `AnimatedBox` knows:** `scale`, `scaleX`, `scaleY`, `rotate`, `rotateX`,
`rotateY`, `rotateZ`, `skewX`, `skewY`, `translateX`, `translateY`, `translateZ`,
`opacity`, `color`, `backgroundColor`, `borderColor`, `borderWidth`, `borderRadius`,
`width`, `height`, `boxShadow`, `background`, `textGradient`. Anything outside that list
does nothing, silently. The spacing effects (margin and padding, per side) work as
well — they are routed by prefix, so the gate cannot see them by name.

**Properties `animate()` moves:** the same names, plus any real CSS property
(`width`, `opacity`, `borderRadius`, `color`…). A bare number is a **framework unit**,
exactly as it is in a widget: `translateY: 20` is `20 / base-font-size` rem, so the
movement scales with the reader's font instead of freezing at 20 pixels. A unit
string keeps its unit (`"16px"`), a color blends whether you write `#rrggbb`,
`rgb(…)` or `rgba(…)`, and a pair the framework cannot blend (`"red"` → `"blue"`)
holds the start and lands on the end rather than writing `NaN`. `translateX`,
`translateY` and `scale` are separate loops whose outputs are merged into one
`transform` string, so an element can slide and grow at the same time.

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
| Rejected input | 300–360 | `shake`, never a color flash alone |
| Loading | loop | `Skeleton({ animation: 'wave' })` |

Nothing in the UI exceeds 500ms. A 300ms number on every element is not a design
decision — it is the default.

```js
// A sheet entering: the whole gesture is one call.
slideIn(panel, { direction: 'up', distance: 24, duration: 220 });

// …and leaving is the same sentence in the other direction, then the unmount.
await slideOutAsync(panel, { direction: 'down' });
panel.remove();
```

## M3 Two easing vocabularies — do not mix them

This is a real trap, and it fails silently:

- **`animate(..., easing)`** takes a *framework name* — one of `EASING_NAMES` — or
  a curve (`cubicBezier(0.2, 0, 0, 1)`, `spring().easing`). An unrecognized string
  warns and falls back to `linear`.
- **`AnimatedBox({ timing })` and `ParallaxBox({ easing })`** are passed straight to
  CSS: `'ease' | 'ease-out' | 'ease-in' | 'linear' | 'cubic-bezier(…)'`. `easeIn` in
  a `timing` string is not a curve CSS knows, and the step runs linear. `ease-out`
  in `animate()` is not a framework name, and it runs linear too.

The names the engine knows: `linear`, `easeIn`, `easeOut`, `easeInOut`, the powers
(`easeOutCubic`, `easeInOutQuart`, `easeOutExpo`, `easeOutCirc` and their `In` /
`InOut` siblings), the overshoot family (`easeOutBack`, `easeInOutBack`,
`easeOutElastic`, `easeOutBounce`), and the Material shapes (`standard`,
`emphasized`, `emphasizedDecelerate`, `emphasizedAccelerate`).

Rules that hold for both:

- Entering and exiting UI use an **out** curve (`easeOut` / `ease-out`) — it starts
  fast, which reads as responsive.
- **Never** `easeIn` on an interface element: it starts slow, so the first 100ms of
  a press feels broken. Save it for something leaving the screen at speed.
- A loop that has to feel like a machine uses `linear`.
- Use the overshoot family for one thing per screen at most. `easeOutElastic` on a
  modal is a toy; on a badge that just arrived it is a highlight.
- Never `transition: all`, and never animate `width`, `height`, `top`, `left` or
  `boxShadow` for something the user presses repeatedly: they reflow or repaint the
  page. `AnimatedBox` *can* animate them, which is exactly why this rule needs to be
  written down. Transform and opacity are the two properties that cost nothing:
  `scale`, `translateX/Y`, `rotate`, `opacity`.
- Nothing enters from `scale: 0`, and nothing from full scale on a big element: use
  **0.9–0.97**. From zero, the element is a dot that pops. That is `popIn`'s default.

```js
// The curve a stylesheet would use, on the imperative side of the same screen.
animate(card, 'translateY', 24, 0, 240, cubicBezier(0.2, 0, 0, 1));

// Something the pointer just flicked finishes like an object, not like a timer.
animateSpring(button, 'scale', 0.96, 1, { stiffness: 260, damping: 20 });
```

## M4 Press feedback, done right

A press is 100+ times a day (M0): the answer is a state change, not a show.

```js
// The whole of it: 140ms, 3% of scale, back on release.
onPress: (widget) => animate(widget, 'scale', 1, 0.97, 140, 'easeOut');
```

`Button` already changes color on press. Adding a lift, a glow and a scale on top
of that is three simultaneous answers to one question. Pick one — and if the color
change is enough, which it usually is, ship it and move on.

`shake` is not press feedback. It is the answer to "the server said no": 320ms,
three decaying swings, and it ends at rest so the field does not stay off its
column. Call it once per rejection, not on every keystroke.

```js
if (!result.ok) {
  shake(loginForm, { axis: 'x', distance: 6, cycles: 3 });
}
```

## M5 Entrance and stagger

Motion on first paint is the one place a longer budget is fair, with two limits:

- Stagger **30–80ms** between siblings, and cap the total. `AnimatedText` gives this
  for free with `delayBetween: 0.05` — that prop is in **seconds**, the unit the
  framework writes into its `animation-delay`, so `40` would not be a fast stagger
  but forty seconds. A hand-built list uses `stagger(index)` —
  `stagger(3, { step: 60, max: 8 })` stops growing after 8 items, which is the
  difference between a screen arriving and a screen loading: a list of 20 rows at
  60ms each is a 1.2s wait before the content is readable.
- One direction per screen. Elements arriving from the left *and* the bottom *and*
  scaled is three ideas. `slideIn` is one direction plus opacity, on purpose.

## M6 Loops, ambient motion and `ParallaxBox`

- A loop is a status. `loop: true`, `pulse`, `applyPulse` and `MatrixRain` say
  "waiting" or "this is the one". If it never stops and means nothing, turn it off.
- Loading uses `Skeleton({ animation: 'wave', count, gap, height })` in the shape of
  the content that will replace it — not a spinner in the middle of a blank page.
- `ParallaxBox` belongs to a hero or a single decorative layer, never inside a
  working screen, and `type: 'mouse'` never on a touch-first app. Keep `maxOffset`
  small (8–24). A background that moves 120px is not depth, it is a screensaver.
- Ambient motion gets its own budget: one per screen, at most.

## M7 Reduced motion is decided once, in the engine

The user can ask for no movement, and FletBox listens:

- `prefersReducedMotion()` — `true` when they have.
- `setMotionMode('auto' | 'reduce' | 'full')` — the app's own switch, wired to a
  settings control; `'auto'` (the default) follows the operating system.
- `getMotionMode()`, and `onMotionModeChange(reduced => …)` for a widget holding a
  live loop — it returns the unsubscribe, so release it in `onUnmount`.

What it does to each surface, and why none of it needs a per-screen `if`:

- `animate()` and the named transitions run one frame that **writes the end value**,
  so the state still lands and an `await` still resolves. Only the movement goes.
- `AnimatedBox` plays its keyframes once at `0.01ms` with no delay, and `fillMode:
  'forwards'` leaves the element on its `to` values — content never stays hidden
  waiting for an animation that was not allowed to run. A `loop` stops looping.
  The reader can flip the OS setting *while the app is open*: the engine injects one
  `@media (prefers-reduced-motion: reduce)` rule that overrides every element it
  animates, so a loop already running stops without a rebuild and without a listener
  to leak. The factory marks any element it gives an `infinite` animation — a
  `Skeleton`, a striped `ProgressBar`, a `ListView` spinner — so a loop you write
  yourself through the `animation` prop is covered too. Nothing in the app has to do
  anything about it.
- `ParallaxBox` parks its layer at the origin. `MatrixRain` paints one static field
  and releases its `requestAnimationFrame`. `applyPulse` does nothing.

```js
const chooseMotion = (on) => {
  if (on) return setMotionMode('reduce');
  return setMotionMode('auto');
};

// A settings screen hands the decision to the reader, and the engine applies it.
Switch({ label: 'Reduce motion', value: getMotionMode() === 'reduce', onToggle: chooseMotion });
```

Build the screen so it reads with zero animation anyway. Motion is a decision you
can point at, and if it is only decoration the honest answer is to not add it —
reduced motion is not a second design to maintain, it is the same design with the
movable parts still.

## M8 Clean up

An animation is a resource. `animate()` and the presets return a cancel function —
hold it and call it when the widget unmounts, or call `stopAnimation(widget, property)`.
A loop that outlives its widget keeps a `requestAnimationFrame` alive and animates a
detached node forever. A widget that registers timers, listeners or observers releases
them in its `onUnmount` disposer.

Starting a second animation on the same widget and property replaces the first — that
is the engine, not a bug to work around. Two gestures on one element (`translateY` plus
`scale`) are two loops and are merged into one `transform`, so they do not fight.

## M9 The check

1. `npm run check` — every prop named exists (`flet-box unpack AnimatedBox`).
2. `npm run ui`.
3. Watch it, twice, at 375px. Then answer: how many times a day does a real user
   see this? If the answer is "a lot", the correct fix is usually to delete the
   animation, not to tune it.
4. Check the frame, not the curve: press a control while something else moves. If
   the press feels delayed, the motion is the cause.
5. Turn the mode to `'reduce'` and walk the screen. Everything must still arrive,
   still be readable, still be operable — with nothing moving. That is the test
   reduced motion asks for, and it is five minutes.
