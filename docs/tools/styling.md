# Styling helpers (CSS in JS)

## Overview
Each styling helper returns a **CSS string** you can pass to a widget prop (`style`, `shadow`, `gradient`, etc.) — so you style widgets without hand-writing raw CSS. Sizes are in px unless the widget converts units for you.

## When to use
- Build `border`, `margin`, `padding`, `shadow`, `transform`, or `transition` values on the fly.
- Create gradients and color variations with one line.

## Import

```javascript
import { border, margin, padding, gradient, shadow, color } from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `animation` | `animation(name, duration?, timing?, iteration?)` | `string` | CSS `animation` shorthand. `name` can also be an options object (`{ name, duration, timing, delay, iteration, direction, fillMode }`). |
| `border` | `border(width = 1, style = "solid", color?)` | `string` | CSS `border` shorthand, e.g. `1px solid #e2e8f0`. |
| `gradient` | `gradient(type, colors, angle = 135)` | `string` | A CSS gradient background. `type` is `"linear"`, `"circle"` (radial), or `"conic"`; `colors` is an array of color strings. |
| `margin` / `padding` | `margin(value)` / `padding(value)` | `string` | Spacing CSS. `value` can be a number, a string, or `{ all, horizontal, vertical, top, right, bottom, left }`. |
| `rgba` | `rgba(r, g, b, a = 1)` | `string` | `rgba(r, g, b, a)` with an alpha default of `1`. |
| `shadow` | `shadow(x, y, blur, spread, color)` | `string` | A `box-shadow` value. |
| `transform` | `transform(options)` | `string` | CSS `transform` built from `{ translate, translateX, rotate, scale, skew, matrix, matrix3d, perspective, … }`. |
| `transition` | `transition(options)` | `string` | CSS `transition` built from `{ property, duration, timing, delay }` (or an array of them). |
| `filter` | `filter(options)` | `string` | CSS `filter` from `{ blur, brightness, contrast, dropShadow, grayscale, hueRotate, invert, opacity, saturate, sepia }`. |
| `flex` | `flex(grow, shrink = 1, basis = "0%")` | `string` | CSS `flex` shorthand. `grow` can also be `{ grow, shrink, basis }`. |
| `grid` | `grid(options)` | `string` | CSS grid template from `{ columns, rows, gap }`; `gap` can be a number or `{ row, column }`. |
| `color` | `color(value)` | Color object | A mutable, chainable color. See the Color object below. |
| `stackPosition` | `stackPosition(widget, props)` | `Widget` | Applies absolute positioning/centering to a widget and returns it. |
| `toREM` / `toPX` | `toREM(value)` / `toPX(value)` | `string \| undefined` | Convert a value between `rem` and `px`. |
| `setBaseFontSize` | `setBaseFontSize(px)` | `void` | Change the `rem` base (default `16`). |
| `getBaseFontSize` | `getBaseFontSize()` | `number` | The current `rem` base. |

### The Color object

`color(value)` returns a chainable object:

`hex()`, `rgb()`, `rgba()` — string forms · `lighten(percent)`, `darken(percent)`, `alpha(value)`, `complement()` — mutate and return the object · `isDark()`, `isLight()` — booleans · `contrast()` — a readable contrast color.

## Examples

### Everyday example

```javascript
import { Text, border } from "flet-box";

Text({
  text: "Card",
  padding: 12,
  border: border(1, "solid", "#cbd5e1"),
});
```

### Full example

```javascript
import { Container, Text, gradient, shadow, color } from "flet-box";

const blue = color("#2563eb").lighten(10);

Container({
  padding: 24,
  gradient: gradient("linear", ["#2563eb", "#7c3aed"], 120),
  shadow: shadow(0, 8, 24, 0, "rgba(0,0,0,0.2)"),
  child: Text({ text: blue.hex(), color: "white" }),
});
```

## Notes

- These helpers only build **strings** — they do not render anything by themselves. Hand the result to a widget prop or `style`.
- A number passed to `margin`/`padding` becomes `Npx`; a string is used as-is (so you can write `"1rem"` or `"10px 20px"`).
- `animation(...)` differs from the [animate function](animation.md): this builds the CSS string, `animate()` runs an animation on an element.
- The Color object is stateful — create a copy (`color(value)`) when you need two different variations.

## Related pages
- [Lists, arrays & data](lists.md) — the next chapter.
- [Visual effects](visual-effects.md) — effects that apply to elements directly.
- [Animation helpers](animation.md) — run animations on elements.

---

## Continue reading

- **Previous:** [Tools index](README.md)
- **Next:** [Lists, arrays & data](lists.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (1 of 12).