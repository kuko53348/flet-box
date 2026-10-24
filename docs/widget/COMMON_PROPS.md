# Common props

Every FletBox widget — `Text`, `Container`, `Button`, and all the rest — accepts
the shared props below in addition to its own widget-specific props. They are
defined once in the framework's central prop database
([src/widget-factory/translateProps.js](../../src/widget-factory/translateProps.js)),
so they behave identically everywhere.

Widget pages link here instead of repeating this table. Read this page once and
you will recognize these props on every widget.

## Values and units

- **Numbers are pixels.** A numeric value such as `padding: 20` renders as `20px`.
  Internally FletBox converts it to `rem` on a 16px base (`20 / 16 = 1.25rem`), so
  spacing and sizes scale if you change the root font size. The exception is
  `borderWidth`, which is applied as raw pixels.
- **Strings pass through.** A string such as `width: "50%"`, `margin: "8px auto"`,
  or `padding: "10px 18px"` is used as-is, so any valid CSS value works.
- **Unitless props** (`opacity`, `zIndex`, `weight`, colors, `flex`, …) take their
  value directly with no unit appended.

## Aliases (multi-dialect props)

FletBox intentionally accepts several spellings for the same thing, so developers
coming from Flet, Flutter, React, or vanilla JavaScript can write what feels
natural. Each group below maps to the same underlying style or behavior:

| Canonical | Aliases | Applies to |
| --- | --- | --- |
| `width` | `w` | CSS `width` |
| `height` | `h` | CSS `height` |
| `minWidth` / `maxWidth` | `minW` / `maxW` | CSS min/max width |
| `minHeight` / `maxHeight` | `minH` / `maxH` | CSS min/max height |
| `padding` | `p` | CSS `padding` |
| `margin` | `m` | CSS `margin` |
| `paddingTop/Right/Bottom/Left` | `pt` / `pr` / `pb` / `pl` | per-side padding |
| `marginTop/Right/Bottom/Left` | `mt` / `mr` / `mb` / `ml` | per-side margin |
| `backgroundColor` | `bgColor`, `bg` | CSS `background-color` |
| `color` | `textColor` | CSS `color` (foreground/text) |
| `fontSize` | `size` | CSS `font-size` |
| `fontWeight` | `weight` | CSS `font-weight` |
| `borderRadius` | `rounded` | CSS `border-radius` |
| `boxShadow` | `shadow` | CSS `box-shadow` |
| `position` | `pos` | CSS `position` |
| `zIndex` | `z` | CSS `z-index` |
| `flexDirection` | `direction` | CSS `flex-direction` |
| `justifyContent` | `justify` | CSS `justify-content` |
| `alignItems` | `align` | CSS `align-items` |
| `alignSelf` | `selfAlign` | CSS `align-self` (one child's own answer to `alignItems`) |
| `flexWrap` | `wrap` | CSS `flex-wrap` |
| `lineHeight` | `lineH` | CSS `line-height` |
| `letterSpacing` | `letterSpace` | CSS `letter-spacing` |
| `onClick` | `onPress`, `onclick` | click handler |

> Note: some widgets reuse a common name for a widget-specific meaning. For
> example, in [`Text`](Text.md) the `align` prop sets **text alignment**
> (`textAlign`), while in layout widgets like [`Row`](Row.md) and
> [`Column`](Column.md) `align` sets **`alignItems`**. Always check the widget
> page for its own props.

## Shorthand spacing

These expand to two sides at once (numeric values are pixels):

- `px` / `paddingHorizontal` → left + right padding
- `py` / `paddingVertical` → top + bottom padding
- `mx` / `marginHorizontal` → left + right margin
- `my` / `marginVertical` → top + bottom margin

## Layout and display

`display`, `flexDirection` (`direction`), `justifyContent` (`justify`),
`alignItems` (`align`), `alignSelf` (`selfAlign`), `flexWrap` (`wrap`), `flex`,
`flexGrow`, `flexShrink`, `flexBasis`, `gap`, `boxSizing`, `overflow`,
`overflowX`, `overflowY`, `position` (`pos`), `top`, `right`, `bottom`, `left`,
`inset`, `zIndex` (`z`).

### One child, its own alignment

`alignItems` is the parent's answer for every child; `alignSelf` is one child's
answer for itself. The values are CSS's: `'auto'` (inherit the parent),
`'flex-start'`, `'center'`, `'flex-end'`, `'baseline'`, `'stretch'`. It goes on
the child, on any widget — `alignSelf` is a `CommonProps` entry, not a layout
prop — and it is what keeps a short label from being stretched to the full height
of a row of inputs:

```js
Row({
  alignItems: 'stretch',
  gap: 8,
  children: [
    Input({ label: 'Coupon', value: '', onChange: () => {} }),
    // The row stretches its children; this one refuses.
    Button({ text: 'Apply', onPress: () => {}, alignSelf: 'flex-end' }),
  ],
});
```

### Stack positioning

`position: 'stack'` takes the widget out of normal flow and pins it to its
nearest positioned ancestor. The placement shorthands below apply **only** in
that mode; the plain offsets still work with any CSS `position` value.

| Prop | Effect |
| --- | --- |
| `top` / `right` / `bottom` / `left` | Edge offsets. A number is pixels on the 16px base, written as rem. |
| `start` / `end` | `left` / `right` under the logical names. |
| `centerX` / `centerY` | Centre on one axis. |
| `center` | Centre on both axes. |
| `fullWidth` / `fullHeight` | Stretch to the parent's width / height. |
| `full` | Stretch on both axes. |

```js
Stack({
  width: "100%",
  height: 320,
  children: [
    Image({ src: "cover.jpg", position: "stack", full: true, fit: "cover" }),
    Text({ text: "Centred", position: "stack", center: true }),
  ],
});
```

A `false` shorthand means "do not apply", so `full: false` leaves the widget at
its natural size. [`Button`](Button.md), [`Input`](Input.md) and
[`Tabs`](Tabs.md) also read `fullWidth` as a plain layout prop, independent of
`position`.

## Size and spacing

`width` (`w`), `height` (`h`), `minWidth`/`maxWidth`, `minHeight`/`maxHeight`,
`padding` (`p`) and per-side variants, `margin` (`m`) and per-side variants,
`gap`, and the horizontal/vertical shorthands above.

## Color and background

`backgroundColor` (`bgColor`, `bg`), `color` (`textColor`), `opacity`,
`gradient` (CSS `background`), `bgImage`, `bgSize`, `bgPosition`, `bgRepeat`.

## Typography

`fontSize` (`size`), `fontWeight` (`weight`), `fontFamily`, `textAlign`,
`lineHeight` (`lineH`), `letterSpacing` (`letterSpace`), `textDecoration`,
`textTransform`, `whiteSpace`, `wordBreak`, `textOverflow`.

## Border, radius and shadow

`border`, `borderColor`, `borderWidth`, `borderStyle`, `borderTop`, `borderRight`,
`borderBottom`, `borderLeft`, `borderRadius` (`rounded`), and the corner
shorthands `roundedTop`, `roundedBottom`, `roundedLeft`, `roundedRight`, plus
`boxShadow` (`shadow`) and `elevation`.

> `elevation` is widget-specific on some components (for example
> [`Button`](Button.md) maps `0`–`5` to preset shadows). As a common style prop it
> is treated as a `box-shadow` value.

## Animation and transform

`transition`, `animation`, `transform`, `cursor`, `visibility`, `pointerEvents`,
`userSelect`, `touchAction`.

## Glass and filters

`backdropFilter`, `filter`, `maskImage`. Each takes a raw CSS value string, not an
object.

```js
Card({
  bgColor: colors.glass,
  borderColor: colors.glassBorder,
  borderWidth: 1,
  backdropFilter: 'blur(14px) saturate(160%)',
});
```

> A translucent `bgColor` alone is only see-through. `backdropFilter` blurs what is
> behind the widget, which is what makes the card read as frosted glass.
> `backdropFilter` and `maskImage` also write their `-webkit-` twin, so the effect
> reaches Safari and the `WKWebView` inside a wrapped iOS app.
> `filter` affects the widget's own pixels; `backdropFilter` affects only the
> backdrop, so the widget's text stays sharp.

## Text content

These set the element's text: `text`, `label`, `title`, `caption`, `description`,
`message`, `buttonText`, and `textContent`.

## HTML attributes

`id`, `className` (`class`), `name`, `type`, `href`, `src`, `alt`, `disabled`,
`readOnly`, `required`, `checked`, `selected`, `placeholder`, `min`, `max`,
`step`, `pattern`, `role`, `lang`, `dir`, `tabIndex`, `draggable`, `hidden`,
`for` (`htmlFor`), `autofocus`, `autocomplete`, `spellcheck`. Any `data-*` or
`aria-*` attribute is also passed through.

## Events

`onClick` (`onPress`, `onclick`), `onDoublePress`, `onRightClick`, `onHover`,
`onHoverEnd`, `onFocus`, `onBlur`, `onChange`, `onInput`, `onScroll`, `onKeyDown`,
`onKeyUp`, `onKeyPress`, `onMouseDown`, `onMouseUp`, `onMouseMove`,
`onTouchStart`, `onTouchMove`, `onTouchEnd`. Any other `on<Event>` prop with a
function value is attached as a native listener.

## Structure and refs

- `child`: a single child widget.
- `children`: an array of child widgets.
- `ref`: a callback that receives the underlying DOM node — `ref: (el) => (myRef = el)`.

> There is intentionally **no `style` prop**. FletBox uses flat, aliased CSS
> props instead. Passing `style: { ... }` is rejected with a console warning;
> write the same declarations flat (`backgroundColor`, `padding`, `flexDirection`, …).

## Reactivity

Most style, spacing, color, typography, and text props are **reactive**: when they
are bound to state via [`useState`](../guides/state.md), the widget updates in
place when the value changes, without a full re-render.

## Related

- [Syntax philosophy](../guides/syntax-philosophy.md) — why aliases coexist.
- [Widget index](README.md) — the full book of widgets.
