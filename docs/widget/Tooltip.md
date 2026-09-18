# Tooltip

## Overview
`Tooltip` attaches a hover/focus hint bubble to an existing widget. It is a decorator, not a container: it returns the `child` you passed in — the very same element — augmented with `showTooltip()`, `hideTooltip()`, `updateContent()`, and `updatePosition()` methods. The bubble itself is a `position: fixed` div that is created lazily on first show and appended to `document.body`, positioned next to the child with an optional CSS-triangle arrow. It returns `null` when no `child` is given.

## When to use
- Explain an icon-only [Button](Button.md) or [Icon](Icon.md) on hover.
- Show a short hint for form fields on focus.
- Add context that shouldn't take permanent screen space.

## Import

```javascript
import { Tooltip } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Icon, Tooltip } from "flet-box";

Tooltip({ text: "Refresh data", child: Icon({ name: "refresh" }) });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | string | — | Tooltip message. Required in practice — an empty bubble otherwise. |
| `child` | element | — | The widget the tooltip is attached to. Required; `Tooltip` returns `null` without it. |
| `position` | `'top'`, `'bottom'`, `'left'`, `'right'` | `'top'` | Which side of the child the bubble appears on (arrow included). |
| `delay` | number (ms) | `300` | Hover/focus time before the tooltip appears. |
| `bgColor` | Color | `colors.secondary` | Bubble background (also colors the arrow). |
| `textColor` | Color | `'#ffffff'` | Message color. |
| `fontSize` | number | `12` | Message font size in pixels. |
| `padding` | string | `'6px 10px'` | Bubble inner padding. |
| `borderRadius` | number or string | `6` | Bubble corner radius in pixels. |
| `offset` | number | `8` | Gap between child and bubble, in pixels. |
| `showArrow` | boolean | `true` | Renders the triangular pointer. |
| `disabled` | boolean | `false` | When `true`, `showTooltip()` does nothing. |
| `maxWidth` | number | `200` | Bubble maximum width in pixels. |
| `textAlign` | string | `'center'` | Message alignment. |
| `zIndex` | number | `9999` | Bubble stacking order. |
| `animationDuration` | number (ms) | `200` | Fade-in/out duration. |
| `arrowSize` | number | `6` | Arrow half-width in pixels. |
| `borderColor` | Color | `'transparent'` | Bubble border color (needs `borderWidth > 0`). |
| `borderWidth` | number | `0` | Bubble border width; `0` means no border. |
| `shadow` | string | `'0 2px 8px rgba(0,0,0,0.15)'` | Bubble CSS box-shadow. |

`Tooltip` returns your `child` unchanged (plus the methods below), so [common props](COMMON_PROPS.md) apply to the child element as usual — style the child directly, not through `Tooltip`. Unrecognized `Tooltip` props are ignored.

## Instance methods

The returned child element exposes:

- `showTooltip()` — schedules the tooltip to appear after `delay` ms (no-op when `disabled` or already visible). Creates and appends the bubble to `document.body` on first use.
- `hideTooltip()` — cancels a pending show and fades the bubble out.
- `updateContent(newText)` — changes the message; updates the live bubble immediately if it exists.
- `updatePosition()` — repositions the bubble next to the child (only while visible).
- `_cleanup()` — (framework hook) removes the bubble from the DOM and detaches all listeners.

## Examples

### Everyday example

```javascript
import { Button, Row, Tooltip } from "flet-box";

Row({
  gap: 8,
  children: [
    Tooltip({ text: "Save document", child: Button({ icon: "save", variant: "outlined" }) }),
    Tooltip({ text: "Print", position: "bottom", child: Button({ icon: "print", variant: "outlined" }) }),
  ],
});
```

### Full example

```javascript
import { Icon, Tooltip, colors } from "flet-box";

const hint = Tooltip({
  text: "Downloads are paused on metered connections",
  child: Icon({ name: "help_outline", size: 20, color: colors.textSecondary }),
  position: "right",
  delay: 150,
  bgColor: colors.gray800,
  textColor: "#ffffff",
  fontSize: 13,
  padding: "8px 12px",
  borderRadius: 8,
  maxWidth: 240,
  offset: 10,
  arrowSize: 5,
  showArrow: true,
  animationDuration: 150,
});

// hint.showTooltip();                 // show programmatically (after `delay`)
// hint.updateContent("New message");  // change the text
// hint.hideTooltip();                 // hide
```

## Notes

- Show triggers are `mouseenter` and `focus`; hide triggers are `mouseleave` and `blur`. The bubble also hides on any window scroll or resize so it never floats away from its target.
- The bubble is `pointer-events: none` — it can never intercept clicks.
- Positioning is clamped to stay at least 10px inside the viewport, so edge-of-screen children still get a fully visible tooltip.
- The bubble div is only created the first time the tooltip is shown, and lives in `document.body` afterwards (hidden between shows). `_cleanup()` removes it.
- Because `Tooltip` returns the child itself, you can keep using it as a normal widget anywhere in your tree.

## Related widgets
- [Icon](Icon.md)
- [Button](Button.md)
- [Text](Text.md)
- [SnackBar](SnackBar.md)
- [Badge](Badge.md)

---

## Continue reading

- **Previous:** [SnackBar](SnackBar.md)
- **Next:** [ProgressBar](ProgressBar.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (5 of 10).
