# Accordion

## Overview
`Accordion` renders a clickable title bar with a chevron and a collapsible content region below it. Give it a `title` and the widgets to reveal in `children`. Expansion animates the content height over `animationDuration` milliseconds, and clicking the title bar toggles it. The returned element exposes an `expanded` property plus `setExpanded`, `toggle`, and `update`.

## When to use
- FAQ lists, settings groups, and filter panels — content that should stay hidden until asked for.
- Long pages that need to be broken into titled, collapsible sections.
- Match the surrounding surface with `variant`: `contained` (filled card), `outlined` (bordered), `ghost` (no background or border).

## Import

```javascript
import { Accordion } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Accordion, Text } from "flet-box";

Accordion({
  title: "Shipping options",
  children: [Text({ text: "Standard — 3 to 5 days" })],
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Text shown in the header bar. |
| `children` | Widget or array of Widgets | — | Content revealed on expand. Must be `children`, not `child` (see Notes). |
| `expanded` | boolean | `false` | Initial state. |
| `onToggle` | `(expanded: boolean) => void` | — | Fires when the expand/collapse animation completes. |
| `variant` | `'contained'`, `'outlined'`, `'ghost'` | `'contained'` | `contained` fills the panel with `bgColor`; `outlined` draws a border and no fill; `ghost` draws neither. |
| `borderRadius` | number | `8` | Corner radius in pixels; the panel clips its content. |
| `bgColor` | Color | `colors.surface` | Panel background (`contained` only). |
| `titleColor` | Color | `colors.text` | Title color while collapsed. |
| `expandedColor` | Color | `colors.primary` | Title color while expanded. In `contained` the header is also tinted with this color plus a `10` alpha suffix, so pass a 6-digit hex. |
| `border` | string | `null` | Explicit CSS border shorthand; wins over `variant`. |
| `borderColor` | Color | `colors.border` | Border color used by `outlined`. |
| `borderWidth` | number | `1` | Border width in pixels used by `outlined`. |
| `titleSize` | number | `14` | Title font size in pixels. |
| `titleWeight` | string or number | `'500'` | Title font weight. |
| `titlePadding` | string | `'12px 16px'` | CSS padding of the header bar. |
| `contentPadding` | string | `'16px'` | CSS padding of the content region. |
| `iconCollapsed` | string | `'chevron_right'` | Material Icon name used while collapsed. |
| `iconExpanded` | string | `'expand_more'` | Material Icon name used while expanded. |
| `iconColor` | Color | `colors.textSecondary` | Chevron color. |
| `iconSize` | number | `20` | Chevron size in pixels. |
| `divider` | boolean | `true` | Draws a 1px top border on the content while expanded. |
| `dividerColor` | Color | `colors.border` | Divider color. |
| `disabled` | boolean | `false` | Blocks toggling; the header shows a `not-allowed` cursor at 0.5 opacity. |
| `animate` | boolean | `true` | Height transition, chevron transition, and a `ResizeObserver` that re-measures open content. |
| `animationDuration` | number | `300` | Animation length in milliseconds. |
| `elevation` | number `0`–`4` | `0` | Preset shadow level (not a CSS value). Levels above 4 fall back to level 2. |

These are the props specific to `Accordion`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `expanded` — getter returns the current state; the setter expands or collapses (and fires `onToggle`).
- `disabled` — getter/setter for the disabled flag.
- `setExpanded(value, triggerCallback = true)` — expands or collapses; pass `false` as the second argument to skip `onToggle`.
- `toggle()` — flips the state. Ignored while `disabled` or mid-animation.
- `update(newProps)` — patches `title`, `children`, `disabled`, `variant`, colors, paddings, icons, divider, border, `borderRadius`, `elevation`, and `animationDuration` in place.
- `_cleanup()` — disconnects the internal `ResizeObserver`.

## Examples

### Everyday example

```javascript
import { Accordion, Column, Text } from "flet-box";

Column({
  gap: 8,
  children: [
    Accordion({
      title: "What is FletBox?",
      children: [Text({ text: "A minimalist vanilla-JS UI framework." })],
    }),
    Accordion({
      title: "Do I need a build step?",
      children: [Text({ text: "No. Import the widgets and call them." })],
    }),
  ],
});
```

### Full example

```javascript
import { Accordion, Column, Input, Text, colors } from "flet-box";

const panel = Accordion({
  title: "Advanced search",
  children: [
    Column({
      gap: 12,
      children: [
        Input({ label: "Keyword" }),
        Text({ text: "Filters are applied on submit.", size: 13 }),
      ],
    }),
  ],
  expanded: true,
  variant: "outlined",
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 12,
  titleSize: 16,
  titleWeight: "600",
  titleColor: colors.text,
  expandedColor: colors.primary,
  titlePadding: "14px 18px",
  contentPadding: "18px",
  iconCollapsed: "add",
  iconExpanded: "remove",
  iconColor: colors.textSecondary,
  iconSize: 22,
  divider: true,
  dividerColor: colors.border,
  elevation: 2,
  animate: true,
  animationDuration: 250,
  onToggle: (open) => console.log("open:", open),
});

// panel.expanded = false;   panel.toggle();   panel.update({ title: "Filters" });
```

## Notes

- Use `children`. `Accordion` reads `children` from its props; a `child` prop falls through to the outer container and is appended **above** the title bar.
- The element has exactly two children: the title bar (a `Row`) and the animated content wrapper.
- `setExpanded(true)` flips `expanded` synchronously, but the height animation runs across two timeouts (about 10ms plus `animationDuration`). Collapse clears `expanded` only inside the first timeout, so collapsing is *not* synchronous.
- `onToggle` fires at the end of the animation, not on click.
- While animating, `toggle()` and `setExpanded()` are ignored — a rapid second click does not queue another move.
- With `animate: true` a `ResizeObserver` watches the content, so an open panel re-measures itself when its children change size.
- The chevron is a Material Icons span whose glyph comes from its text content, written once from `expanded`. Toggling rewrites only the span's `name` attribute, so the arrow does not visually flip.
- `update({ disabled })` changes behavior immediately, but the header's cursor and opacity refresh only on the next full repaint (a `title` change or a finished animation).
- `elevation: 0` sets `box-shadow: none`; `1`–`4` map to preset shadows.
- `update({ children })` only appends items that are DOM elements or strings; anything else is dropped.

## Related widgets
- [Stepper](Stepper.md)
- [TreeView](TreeView.md)
- [Card](Card.md)
- [ListTile](ListTile.md)
- [Divider](Divider.md)

---

## Continue reading

- **Previous:** [Stepper](Stepper.md)
- **Next:** [TreeView](TreeView.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 5 · Navigation and flows** (2 of 5).
