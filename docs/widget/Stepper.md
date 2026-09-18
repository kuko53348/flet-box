# Stepper

## Overview
`Stepper` renders a multi-step flow: a rail of step indicators, a content panel for the active step, and a Back/Next/Finish navigation row. You drive it with a `steps` array — each entry supplies a `label`, an optional `content` widget, and an optional `icon`. With the default `circles` variant, completed steps turn green with a check mark and the active one is filled with `colors.primary`; clicking any step jumps straight to it. The returned element exposes `next`, `back`, `goTo`, and `getActiveStep`.

## When to use
- Wizards and multi-screen forms: account setup, checkout, onboarding.
- Any flow where the user should see their progress and move forward or backward through numbered stages.
- A rail beside a tall form with `orientation: "vertical"`.

## Import

```javascript
import { Stepper } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Stepper, Text } from "flet-box";

Stepper({
  steps: [
    { label: "Account", content: Text({ text: "Create your account" }) },
    { label: "Profile", content: Text({ text: "Tell us about you" }) },
  ],
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `steps` | `Array<{ label: string, content?: Widget, icon?: string }>` | `[]` | The steps, in order. `content` is the widget shown in the panel while that step is active. `icon` is only read by the `icons` variant. |
| `activeStep` | number | `0` | Initial index, clamped to `0 … steps.length - 1`. |
| `onStepChange` | `(index: number) => void` | — | Fires on every step change: navigation buttons, `next()`/`back()`/`goTo()`, or a click on a step. Not fired for the initial `activeStep`. |
| `onFinish` | `() => void` | — | Fires when the Finish button on the last step is pressed. |
| `orientation` | `'horizontal'`, `'vertical'` | `'horizontal'` | Rail direction. Horizontal uses a `Row`, vertical a `Column` with a 16px gap. |
| `variant` | `'circles'`, `'numbers'`, `'icons'` | `'circles'` | Indicator style. Any other value falls back to the icon indicator. |
| `showLabels` | boolean | `true` | Renders each `label` under its indicator. |
| `showNavigation` | boolean | `true` | Accepted but currently unused — the navigation row is always rendered. |
| `nextLabel` | string | `'Next'` | Label of the forward button. |
| `backLabel` | string | `'Back'` | Label of the backward button (hidden on the first step). |
| `finishLabel` | string | `'Finish'` | Label of the last-step button; it replaces Next. |
| `bgColor` | Color | `colors.surface` | Background of the outer panel. |
| `borderRadius` | number | `16` | Corner radius in pixels. |
| `border` | string | — | Full CSS border shorthand. When set it replaces `borderWidth`/`borderColor`. |
| `borderColor` | Color | `colors.border` | Border color when `border` is not given. |
| `borderWidth` | number | `1` | Border width in pixels when `border` is not given. |
| `shadow` | string | — | CSS `box-shadow` for the outer panel. |
| `padding` | number or string | `20` | Inner spacing of the outer panel. |
| `margin` | number or string | `0` | Outer spacing. |
| `width` | number or string | `'100%'` | Panel width. |

These are the props specific to `Stepper`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `next()` — advances one step. No-op on the last step. Fires `onStepChange`.
- `back()` — steps back one. No-op on the first step. There is no `prev()`.
- `goTo(index)` — jumps to `index`. Out-of-range indexes are ignored. Fires `onStepChange`.
- `getActiveStep()` — returns the current step index.

## Examples

### Everyday example

```javascript
import { Column, Input, Stepper, Text } from "flet-box";

Stepper({
  steps: [
    {
      label: "Details",
      content: Column({
        gap: 8,
        children: [Text({ text: "Your name" }), Input({ label: "Full name" })],
      }),
    },
    {
      label: "Confirm",
      content: Text({ text: "Check the details and finish." }),
    },
  ],
  activeStep: 0,
  nextLabel: "Continue",
  finishLabel: "Submit",
  onStepChange: (index) => console.log("step", index),
  onFinish: () => console.log("submitted"),
});
```

### Full example

```javascript
import { Column, Stepper, Text, colors } from "flet-box";

const step = (label, icon, body) => ({
  label,
  icon,
  content: Column({ gap: 8, children: [Text({ text: body, size: 15 })] }),
});

Stepper({
  steps: [
    step("Personal", "person", "Who are you?"),
    step("Payment", "credit_card", "How will you pay?"),
    step("Done", "check_circle", "All set."),
  ],
  activeStep: 0,
  orientation: "horizontal",
  variant: "circles",
  showLabels: true,
  nextLabel: "Continue",
  backLabel: "Back",
  finishLabel: "Submit",
  onStepChange: (index) => console.log("step", index),
  onFinish: () => console.log("submitted"),
  bgColor: colors.card,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: colors.border,
  shadow: "0 6px 12px rgba(0,0,0,0.08)",
  padding: 24,
  width: "100%",
});
```

## Notes

- The element has exactly three children, in order: the rail wrapper, the content panel, and the navigation panel.
- The rail sits inside a horizontally scrollable wrapper. When `steps.length * 80` exceeds the wrapper's width, the rail switches to a compact mode: each step is pinned to an 80px minimum and the flexible connector lines are replaced by 8px spacers.
- Connectors between steps turn `colors.success` once the step before them is completed.
- `steps: []` leaves the internal index at `-1`, so the rail and content stay empty and only a Finish button renders. Always pass at least one step.
- The content and navigation panels are built with `Container`, so they inherit the default `colors.surface` background regardless of the `bgColor` you pass to the Stepper.
- In `vertical` orientation each row renders the label twice — once under the indicator (when `showLabels` is on) and once beside it. Pass `showLabels: false` to avoid the duplicate.
- A 1px solid border is always drawn unless you pass `border`. Use `border: "none"` to remove it.
- Clicking a step indicator always jumps to it; there is no built-in "only completed steps are clickable" rule.
- `variant: "circles"` indicators are 32px discs: `colors.primary` when active, `colors.success` with a white check when completed, `colors.gray300` otherwise.

## Related widgets
- [Pagination](Pagination.md)
- [ProgressBar](ProgressBar.md)
- [Accordion](Accordion.md)
- [Button](Button.md)
- [Column](Column.md)

---

## Continue reading

- **Previous:** [Pagination](Pagination.md)
- **Next:** [Accordion](Accordion.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 5 · Navigation and flows** (1 of 5).
