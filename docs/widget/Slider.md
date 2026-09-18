# Slider

## Overview
`Slider` renders a custom draggable range control (track, fill, and thumb) with an optional value display, marks, stripes, and glow. It supports horizontal and vertical orientation and reports changes through `onChanged` and `onChangeEnd`. The returned element exposes `value`/`min`/`max`/`step` accessors plus `setValue`/`getValue`.

## When to use
- Pick a numeric value within a range (volume, price, brightness).
- Show labeled marks or a live value readout while dragging.

## Import

```javascript
import { Slider } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Slider } from "flet-box";

Slider({ value: 30, onChanged: (v) => console.log(v) });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | number | `0` | Initial value (clamped to `min`–`max`). |
| `min` | number | `0` | Minimum value. |
| `max` | number | `100` | Maximum value. |
| `step` | number | `1` | Snap increment. |
| `disabled` | boolean | `false` | Disables dragging. |
| `width` | Size | `'100%'` | Track length (horizontal) or container size. |
| `height` | number | `4` | Track thickness in pixels. |
| `thumbSize` | number | `20` | Thumb diameter in pixels. |
| `color` | Color | `colors.primary` | Fill (progress) color. |
| `trackColor` | Color | `colors.border` | Track background color. |
| `thumbColor` | Color | `'#fff'` | Thumb color. |
| `orientation` | `'horizontal'`, `'vertical'` | `'horizontal'` | Slider direction. |
| `inverted` | boolean | `false` | Reverse the direction. |
| `showValue` | boolean | `false` | Show the current value label. |
| `valuePrefix / valueSuffix` | string | `""` | Text around the value label. |
| `showMarks` | boolean | `false` | Render tick marks. |
| `marks` | array | `[]` | Mark values, or objects `{ value, label, size, color }`. Empty → 4 auto marks. |
| `striped` | boolean | `true` | Diagonal stripes on the fill. |
| `animatedStripes` | boolean | `false` | Animate the stripes. |
| `stripeColor` | string | `'rgba(255,255,255,0.25)'` | Stripe color. |
| `glow` | boolean | `false` | Pulsing glow on the fill. |
| `onChanged` | `(value: number) => void` | — | Fires continuously while dragging. |
| `onChangeEnd` | `(value: number) => void` | — | Fires once when the drag ends. |

These are the props specific to `Slider`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `value / min / max / step` — get or set as properties.
- `setValue(v)` — sets the value (fires `onChanged`).
- `getValue()` — returns the current value.
- `update(props)` — updates `min`/`max`/`step`/`value` at once.

## Examples

### Everyday example

```javascript
import { Column, Slider, Text } from "flet-box";

Column({
  gap: 8,
  children: [
    Text({ text: "Volume" }),
    Slider({ min: 0, max: 100, step: 5, value: 40, showValue: true, valueSuffix: "%", onChanged: (v) => console.log(v) }),
  ],
});
```

### Full example

```javascript
import { Slider } from "flet-box";

const slider = Slider({
  min: 0,
  max: 10,
  step: 1,
  value: 6,
  showValue: true,
  showMarks: true,
  marks: [0, 5, 10],
  glow: true,
  color: "#2563eb",
  onChangeEnd: (v) => console.log("final:", v),
});

// slider.value = 3;  slider.getValue();  slider.update({ max: 20 });
```

## Notes

- Custom-drawn with pointer + touch drag; not a native `<input type="range">`.
- Uses a `ResizeObserver` to keep the thumb positioned on resize; listeners are cleaned up on unmount.
- `width`/`height`/`thumbSize` are pixel numbers (the slider builds its own sizes).

## Related widgets
- [Rating](Rating.md)
- [Input](Input.md)
- [ProgressBar](ProgressBar.md)
- [Switch](Switch.md)

---

## Continue reading

- **Previous:** [Switch](Switch.md)
- **Next:** [Dropdown](Dropdown.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (6 of 8).
