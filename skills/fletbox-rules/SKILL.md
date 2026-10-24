---
name: fletbox-rules
description: The working contract for a FletBox app - FletBox syntax only, never a widget or prop from React/Vue/Svelte/Flutter, look an API up before using it, the rem unit contract, prop aliases, key-based state, resource cleanup and the two gates that prove the work. Read first, before any other skill, and before writing or editing a single file in src/.
---

# Rules — how to work inside this framework

AGENTS.md is the short version of this file. It exists because the models that
work here keep making the same five mistakes, and every one of them produces a
screen that renders and is quietly wrong.

## R1 FletBox only — no other framework

A widget is a **function call that returns an element**. That is the whole model.
Nothing from another ecosystem is valid here, however close it looks:

```js
// Correct: a function call with a props object.
Text({ text: 'Hello', size: 18, color: colors.text });

// Wrong: JSX.                    <Text size={18}>Hello</Text>
// Wrong: positional args.        Text('Hello', 18);
// Wrong: a foreign import.       import { Button } from 'react-native';
// Wrong: a framework that is not this one. <div class="…">, Svelte markup, Vue SFC.
```

Every file is ESM (`"type": "module"`), imports come from `'flet-box'`, and there
is no build step to learn and no compiler to blame.

## R2 Never invent an API — look it up

This is the rule the rest of the file exists to protect. A prop that silently does
nothing is worse than a compile error: it renders as a broken layout and nobody
finds it for weeks.

| I want to know… | Look here |
| --- | --- |
| Which widgets exist and which props each accepts | `.fletbox/api/cheatsheet.md` |
| Everything about one widget, with proof | `flet-box unpack <Widget>` |
| A call that is safe to paste | `flet-box unpack <Widget> --example` |
| Which props are documented but dead | `flet-box unpack <Widget> --diff` |
| The whole surface as data, to build calls from | `.fletbox/api/api.json` |
| Whether a name is exported at all | `npm run check -- --list` |

**If a name is not in those files, it does not exist.** The four places a prop can
live — `src/index.d.ts`, the prop registry, the widget's own source, its doc page —
do not always agree, and `unpack` labels every disagreement: `DEAD` (typed, routed
by nothing, read by nothing), `INVENTED` (read by the widget, declared nowhere),
`UNDOCUMENTED`. Design against what reaches the DOM.

- Do not edit `node_modules/flet-box`. It is a dependency, not source. A limitation
  you hit there is fixed upstream, in the framework repo, or not at all.
- Regenerate the API files (`npm run api`) after upgrading the package; never
  hand-edit them.
- When the API genuinely has no answer, choose a real composition or say the gap
  out loud. Do not add a prop and hope the engine reads it — it drops unlisted
  props.

## R3 Aliases are the API, not a mistake

`bgColor` ≡ `backgroundColor`, `onPress` ≡ `onClick`, and the rest. They are
deliberate: each alias has exactly one meaning, resolved by the factory. Pick one
spelling per screen and keep it — but never "clean up" an alias out of the
framework, and never assume a second spelling is dead code.

## R4 A number is not a pixel

Any length you hand a rem-routed prop (`padding`, `margin`, `gap`, `width`,
`size`, `borderRadius`, …) is divided by the base font size and emitted as `rem`,
so the whole interface grows when the reader raises their browser font. That is
the feature: one build fits phone, tablet and desktop.

```js
Container({ padding: 16 });   // 1rem — 16px at the default base, more at a bigger one
```

Pixels stay where pixels are honest: a canvas backing store, a value measured back
out of the DOM (`offsetWidth`, `getBoundingClientRect`, scroll offsets), the
hairline `borderWidth`, and a virtualised row's math in px space. Never write a
`'16px'` string for something that should scale.

## R5 State, and one way to re-render

State is key-based RAM with subscribers: `useState('cart', 0)` returns the value
and a setter; the widgets bound to the key update themselves. Do not build a second
render system, do not reach into the DOM to change what a widget shows, and do not
manually rebuild a tree that a setter could update. Setters on a widget
(`widget.text = …`) are reactive for the same reason.

## R6 Every resource you register, you release

A widget or a screen that adds a `window`/`document` listener, a timer, a
`requestAnimationFrame`, an observer, a router or storage subscription must release
it when it unmounts — one idempotent disposer in `onUnmount`. A leaked loop keeps
animating a detached node and outlives the screen that started it.

## R7 One rendering engine

`WidgetFactory` turns props into an element (style, events, children, lifecycle,
reactivity). It is the only renderer. A custom component is still a function call
returning widgets; never add a parallel way to paint, and never monkey-patch
`container.update` — compose the update.

## R8 The two gates, after every edit

```bash
npm run check      # does this API exist?  exits 1 on an invented widget, prop,
                   # positional call, foreign import or broken module import
npm run ui         # is this screen clean? tokens, the scale, tap targets, labels,
                   # contrast — and it cites the rule it broke
npm run fix        # rewrites what the checker can prove: a wrong path, a default
                   # import of a named export, a missing import line, a typo in a
                   # prop key. Anything ambiguous is printed, never touched
```

Then look at the screen at 375px and at 1440px, in both themes: **the checker has no
eyes.** A clean `npm run ui` says the values are legal, not that the screen is
understood.

A finding you keep needs one sentence of justification, written where the next
session will read it (R10). "The design wants it" is not a justification — it is a
rule that has not been written down yet.

## R9 Do not trust your memory of this framework

FletBox has no `.d.ts` you have read in full, the prop set grows between versions,
and the installed version is the truth for this app. Three habits follow:

- Look up before using, even for `Text`.
- After a dependency bump, re-run `npm run check` across the app — it also reports
  names the package stopped exporting.
- What is deployed is built from the **published** package, not from your working
  tree. A fix you made in a local checkout does not exist for an installed app
  until it is released.

## R10 Write down what only you learned

The project keeps its memory in `.fletbox/memory/`. Read `MEMORY.md` before you
start, and record what the next session would otherwise rediscover the hard way.
`fletbox-memory` is the format and the rules; it is not optional — a session that
learns something and does not write it is a session that has to be repeated.

## R11 The order the skills are read in

| # | Skill | Read it when |
| --- | --- | --- |
| 1 | `fletbox-rules` (this file) | always, before writing code |
| 2 | `fletbox-design` | creating, editing or reviewing any screen, form, list or dialog |
| 3 | `fletbox-motion` | adding any transition, entrance, pulse, parallax or hover lift |
| 4 | `fletbox-memory` | at the start and at the end of every session, and whenever progress changes |

They cover the same screen from three angles and do not repeat each other. When
they disagree, this file wins about the API, `fletbox-design` wins about the
screen, and the checker wins about a value.

## R12 The tools are the short form — use one before you hand-write it

`flet-box` exports 123 helpers alongside the widgets. They exist because the code
they replace is longer, and because the longer version is the one every model
writes from memory. The rule is not "wrap everything in a helper": it is that a
hand-written replacement has to be **shorter or clearer** than the tool, and for
the list below it is not.

| What you were about to write | Use instead |
| --- | --- |
| `Array.from({ length: n }, (_, i) => …)`, and a second branch for an object | `mapList(source, fn)` — takes an array, a number or an object |
| a mock list built field by field | `createList(row, 12)` with `row = { name: () => random.fullName(), price: () => random.number(5, 40) }` |
| `list.map` + `sort` + `[...new Set(…)]` chains | `sort(rows, 'price', 'desc')`, `unique(xs)`, `shuffle`, `chunk`, `reverse` |
| a `for (let i = 0; …)` that only builds children | `range(0, 10)`, `repeat(3, Divider({}))` |
| `'0px 4px 12px 0px rgba(…)'` typed out | `shadow(0, 4, 12, 0, rgba(0, 0, 0, 0.12))` |
| `` `rgba(${r},${g},${b},${a})` `` and `` `linear-gradient(…)` `` | `rgba(37, 99, 235, 0.2)`, `gradient('linear', [a, b], 135)` |
| a `transform` string you have to keep in sync by hand | `transform({ translate: [10, 20], rotate: 45, scale: 1.5 })` |
| `'all 0.3s ease 0s'`, `'blur(5px) brightness(0.8)'` | `transition({ property: 'opacity', duration: 0.3 })`, `filter({ blur: 5, brightness: 0.8 })` |
| a hex you re-lighten by eye, or hand-picked tints | `color(colors.primary).darken(12).hex()` |
| `Math.floor(Math.random() * …)` and `Math.random().toString(36)` | `random.number(a, b)`, `random.choice(list)`, `shortId()`, `uuid()`, `timestampId()` |
| `new Date(d).toLocaleDateString()` chains, a hand-written `"… ago"` | `formatDate(d, 'YYYY-MM-DD')`, `formatDateLong(d)`, `formatTimeAmPm(d)`, `relativeTime(iso)`, `timeAgoLocale(d, 'es')` |
| `d.getTime() + 7 * 86400000` and a `(b - a) / 86400000` you have to re-derive | `addDays(d, 7)`, `subtractHours(d, 3)`, `dateDiff(a, b, 'days')`, and `days(7)` where you need the milliseconds |
| `new Date().getDay() === 0`, a weekday name built from an array | `dayOfWeek(d)`, `monthName(d)`, `isWeekend(d)`, `isToday(d)` |
| `new Promise(r => setTimeout(r, ms))`, a retry loop written twice, a poll loop written twice | `delay(ms)`, `withMinDelay(p, 600)` (a spinner that never flashes), `retry(fn, 3, 500)`, `waitUntil(() => ready, seconds(30))` |
| a timer loop plus a handle you have to remember to clear | `everySecond(fn)`, `every(minutes(5), fn)` — and per R6, release the id it hands back on unmount |
| a `const cache = {}` keyed by `JSON.stringify(args)` | `memo(fn)`, `memoWithKey(fn, keyFn)` |
| `obj[k] !== undefined ? obj[k] : d`, `Object.entries(o).map(…)` | `dict(obj).get(k, d)`, `.items()`, `.has(k)`, `fromJSON(text)` |
| `console.log('[' + label + '] ' + msg)` | `print('synced', 'success', { label: 'cart' })` |
| `let el = null` plus `ref: (v) => (el = v)` | `const display = ref()`, then `Text({ ref: display })` and `display.update({ text: '…' })` |
| `window.innerWidth >= 768`, and a resize listener that fires per pixel | `atLeast('md')`, `pick({ xs: 16, md: 24 })`, `onBreakpointChange(cb)` |
| `navigator.clipboard.writeText(x)` (which throws without a gesture fallback) | `clipboard.copy(x)` |
| injecting a `<link>` for a webfont | `loadFont('Inter', { weights: [400, 600] })`, then `fontsReady()` before a canvas paint |
| `String(arr).split(sep)`, `s.trim().startsWith(x)` written as three calls | `split(s, sep)`, `join(arr, sep)`, `trim(s)`, `startsWith(s, x)`, `endsWith(s, x)`, `includes(s, x)` |
| a `theme` object rebuilt per screen from hex literals | `colors.*`, `setTheme`, `subscribeTheme` |

Four traps, because the rule is only honest with them:

1. **A routed prop already *is* the short form.** `Container({ padding: 16 })` is
   shorter and more correct than `padding: padding(16)` — the number reaches the
   rem contract; the helper returns a **string** of pixels. Reach for
   `padding(...)`/`margin(...)` only when you are writing a CSS value the props
   cannot express (a `styles` object, a computed shorthand). Asymmetric sides have
   props: `px: 20, py: 12`, `pt`, `pr`, `pb`, `pl`.
2. **`filter` is the CSS filter, not a list filter.** `mapList`, `sort`, `unique`
   and `createList` do list work; `filter({ blur: 5 })` builds a string.
3. **`color()` is a chain, not a value.** `color(x).lighten(20)` is a `Color`; it
   only becomes CSS at `.hex()`, `.rgb()` or `.rgba()`.
4. **`months()` and `years()` are approximations, and a day is not 24 hours.**
   `months(1)` is 30 days and `years(1)` is 365 — fine for a cache window, wrong
   for a birthday. Whole-day steps (`addDays`, `subtractDays`) count on the
   calendar, so they hold across a DST night; `addHours` and below count in real
   elapsed time, which is what a countdown needs and what a "same time tomorrow"
   must not use.

R2 still outranks this one: when the exact signature is not in memory,
`npm run check -- --list` and `flet-box unpack` say what is real. A confident wrong
call is worse than the plain JavaScript it replaced — and `npm run check` will
catch it, which is the point of running it.

