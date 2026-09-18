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
`alignItems` (`align`), `flexWrap` (`wrap`), `flex`, `flexGrow`, `flexShrink`,
`flexBasis`, `gap`, `boxSizing`, `overflow`, `overflowX`, `overflowY`,
`position` (`pos`), `top`, `right`, `bottom`, `left`, `inset`, `zIndex` (`z`).

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
- `style`: an object of raw CSS applied directly to the element.

## Reactivity

Most style, spacing, color, typography, and text props are **reactive**: when they
are bound to state via [`useState`](../guides/state.md), the widget updates in
place when the value changes, without a full re-render.

## Related

- [Syntax philosophy](../guides/syntax-philosophy.md) — why aliases coexist.
- [Widget index](README.md) — the full book of widgets.
