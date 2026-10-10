# Stepper

A multi-step progress indicator that shows each step as a circle, number or icon and reveals the active step's content.

## When to use it

Use Stepper for guided flows such as checkout or onboarding where the user advances through ordered steps.

## Quick start

```javascript
import { Stepper, Text } from "flet-box";

const stepper = Stepper({
  steps: [
    { label: "Account", content: Text({ text: "Account details" }) },
    { label: "Done", content: Text({ text: "All set" }) },
  ],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `steps` | `Array<{ label: string; content: Widget; icon?: string }>` | Step definitions rendered by the stepper. |
| `activeStep` | `number` | Index of the currently active step. |
| `onStepChange` | `(index: number) => void` | Fired with the new active step index. |
| `orientation` | `'horizontal' \| 'vertical'` | Orientation of the widget or control. |
| `variant` | `'circles' \| 'numbers' \| 'icons'` | Visual variation or style preset. |
| `showLabels` | `boolean` | Shows chart labels. |
| `showNavigation` | `boolean` | Controls whether the navigation is shown. |
| `nextLabel` | `string` | Label for the next. |
| `backLabel` | `string` | Label for the back. |
| `finishLabel` | `string` | Label for the finish. |
| `onFinish` | `() => void` | Event handler for the `onFinish` event. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `border` | `string` | The `border` value for the widget. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |

### Common props

Every widget also accepts these shared props — see [common props](COMMON_PROPS.md) for the full rules and aliases.

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(widget: Widget) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `id` | `string` | DOM `id` for the rendered element. |
| `className` | `string` | CSS class names applied to the rendered element. |
| `ref` | `(widget: Widget) => void` | Callback that receives the underlying DOM node. |
| `disableTransform` | `boolean` | Disables the default press/scale transform animation. |

## Examples

### Everyday

```javascript
import { Stepper, Text } from "flet-box";

const stepper = Stepper({
  activeStep: 0,
  steps: [
    { label: "Cart", content: Text({ text: "Review your cart" }) },
    { label: "Address", content: Text({ text: "Shipping address" }) },
    { label: "Payment", content: Text({ text: "Payment method" }) },
  ],
  onStepChange: (index) => console.log("step:", index),
});
```

### Full

```javascript
import { Stepper, Text } from "flet-box";

const checkout = Stepper({
  orientation: "vertical",
  variant: "icons",
  activeStep: 1,
  showLabels: true,
  showNavigation: true,
  nextLabel: "Continue",
  backLabel: "Previous",
  finishLabel: "Place order",
  steps: [
    { label: "Cart", icon: "shopping_cart", content: Text({ text: "Your cart" }) },
    { label: "Shipping", icon: "local_shipping", content: Text({ text: "Address" }) },
    { label: "Payment", icon: "credit_card", content: Text({ text: "Payment" }) },
  ],
  onStepChange: (index) => console.log("step:", index),
  onFinish: () => console.log("finished"),
});
```

## Tips

- Steps are clickable, so users can jump around; use onStepChange to validate a step before allowing the move.
- variant: icons pulls each step's icon; circles and numbers ignore it.

## Accessibility

- Expose the current position beyond the highlight color; showLabels: true gives every step visible text.

## Behavior

- Clicking a step or the Next/Back buttons calls onStepChange; the final step swaps Next for Finish, which fires onFinish.
- The returned element exposes goTo(index), next(), back() and getActiveStep() for imperative navigation.

## Related widgets

- [ProgressBar](ProgressBar.md)
- [Button](Button.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [Pagination](Pagination.md)
- **Next:** [Accordion](Accordion.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 5 · Navigation and flows** (1 of 5).
