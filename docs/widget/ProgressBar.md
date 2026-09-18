# ProgressBar

## Overview
`ProgressBar` renders a horizontal progress indicator as real DOM: a flex `<div>` container holding a track `<div>` (default 8px tall, `colors.border`) with a fill `<div>` inside it (`colors.primary`), plus optional label and percentage spans. The fill's width is a percentage of `value / max` and transitions over 0.3s, so updates animate automatically. It also supports striped and fully indeterminate (loading) modes. The returned element exposes `getValue()`, `setValue()`, `updateProgress()`, and a `value` property.

## When to use
- Show determinate progress: uploads, downloads, multi-step forms, quotas.
- Show an ongoing loading state with no known percentage (`indeterminate: true`).
- Display a labeled metric inline, e.g. storage used.

## Import

```javascript
import { ProgressBar } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { ProgressBar } from "flet-box";

ProgressBar({ value: 50 });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | number | `0` | Current progress, clamped to `0`–`max` (the minimum is always 0). |
| `max` | number | `100` | Value that counts as 100%. |
| `height` | number or string | `8` | Track height in pixels. |
| `width` | number or string | `'100%'` | Container width. |
| `color` | Color | `colors.primary` | Fill color. |
| `backgroundColor` | Color | `colors.border` | Track color. |
| `borderRadius` | number or string | `height / 2` | Corner radius of track and fill (fully rounded by default). |
| `label` | string | — | Small 12px caption span placed by `valuePosition`. |
| `showValue` | boolean | `false` | Renders a rounded `NN%` span (suppressed when `indeterminate`). |
| `valuePosition` | `'left'`, `'right'`, `'top'`, `'bottom'` | `'right'` | Where the label/percentage sit. `top`/`bottom` stack the container vertically. |
| `indeterminate` | boolean | `false` | Loading mode: a 50%-wide striped fill slides back and forth forever; `value` updates are ignored. |
| `striped` | boolean | `false` | Diagonal white stripe pattern on the fill. |
| `animatedStripes` | boolean | `false` | Scrolls the stripes (0.5s loop; forced on in `indeterminate` mode at 1.5s). |

These are the props specific to `ProgressBar`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style` — applied to the outer container.

## Instance methods

The returned element exposes:

- `getValue()` — current (clamped) value.
- `setValue(newValue)` / `updateProgress(newValue)` — set progress; clamps to `0`–`max`, resizes the fill, and refreshes the percentage span. Ignored when `indeterminate`.
- `value` — property accessor; `bar.value = 40` is equivalent to `setValue(40)`.

## Examples

### Everyday example

```javascript
import { ProgressBar, colors } from "flet-box";

const bar = ProgressBar({
  value: 30,
  max: 100,
  height: 10,
  color: colors.primary,
  label: "Uploading",
  showValue: true,
});

// Later, as bytes arrive:
bar.setValue(75);
```

### Full example

```javascript
import { Column, ProgressBar, colors } from "flet-box";

Column({
  gap: 16,
  children: [
    // Determinate, striped and animated, value above the track
    ProgressBar({
      value: 65,
      max: 100,
      height: 12,
      borderRadius: 6,
      color: colors.success,
      backgroundColor: colors.border,
      striped: true,
      animatedStripes: true,
      label: "Install",
      showValue: true,
      valuePosition: "top",
      width: 320,
    }),

    // Indeterminate loading bar
    ProgressBar({ indeterminate: true, height: 6, color: colors.info }),
  ],
});
```

## Notes

- `value` is clamped to `[0, max]` at build time and on every update; there is no `min` prop.
- The percentage shown with `showValue` is `Math.round(value / max * 100)`.
- `indeterminate` overrides the fill width (50%), forces stripes, injects the `indeterminate-progress` keyframes, and makes `setValue`/`updateProgress`/`value =` no-ops.
- Stripe and indeterminate animations inject global `<style>` tags (`#progress-stripes-style`, `#indeterminate-progress-style`) into `document.head` once.
- `valuePosition: 'top' | 'bottom'` flips the container to `flex-direction: column`; the label and value spans move to the start of the children for `left`/`top` and the end for `right`/`bottom`.

## Related widgets
- [CircularBar](CircularBar.md)
- [Skeleton](Skeleton.md)
- [Text](Text.md)
- [Container](Container.md)
- [Slider](Slider.md)

---

## Continue reading

- **Previous:** [Tooltip](Tooltip.md)
- **Next:** [CircularBar](CircularBar.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (6 of 10).
