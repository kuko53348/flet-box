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
| `border` | `string` | CSS `border` shorthand for all four edges: width, style and color in one string. |
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
| `full` | `boolean` | Stretches the widget to fill its parent on both axes in stack mode. |
| `fullHeight` | `boolean` | Stretches the widget to the full height of its parent in stack mode. |
| `fullWidth` | `boolean` | Stretches the widget to the full width of its parent. |
| `center` | `boolean` | Centres the widget on both axes in stack mode. |
| `centerY` | `boolean` | Centres the widget vertically in stack mode. |
| `centerX` | `boolean` | Centres the widget horizontally in stack mode. |
| `zIndex` | `number` | Stacking order: a widget with a higher value paints above lower ones. |
| `z` | `number` | Alias of `zIndex`. |
| `end` | `Size` | Logical alias of `right`, used by the stack placement shorthands. |
| `start` | `Size` | Logical alias of `left`, used by the stack placement shorthands. |
| `inset` | `Size` | Shorthand for the four edge offsets (`top`/`right`/`bottom`/`left`). |
| `left` | `Size` | Offset from the left edge. A number is pixels; a string uses any CSS unit. |
| `bottom` | `Size` | Offset from the bottom edge. A number is pixels; a string uses any CSS unit. |
| `right` | `Size` | Offset from the right edge. A number is pixels; a string uses any CSS unit. |
| `top` | `Size` | Offset from the top edge. A number is pixels; a string uses any CSS unit. |
| `pos` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | Alias of `position`. |
| `position` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | CSS `position` value, or `stack` for centered stacking. |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `Size` | Overall size preset or pixel value, depending on the widget. |
| `flex` | `number` | Flex grow/shrink/basis shorthand for a flex child. |
| `minWidth` | `Size` | Minimum width the widget may shrink to. |
| `maxWidth` | `Size` | Maximum width the widget may grow to. |
| `minHeight` | `Size` | Minimum height the widget may shrink to. |
| `maxHeight` | `Size` | Maximum height the widget may grow to. |
| `border` | `string` | CSS `border` shorthand for all four edges: width, style and color in one string. |
| `borderTop` | `string` | The top edge of the border alone, for a widget whose rim differs per side. |
| `borderBottom` | `string` | The bottom edge of the border alone, for a widget whose rim differs per side. |
| `borderLeft` | `string` | The left edge of the border alone, for a widget whose rim differs per side. |
| `borderRight` | `string` | The right edge of the border alone, for a widget whose rim differs per side. |
| `cursor` | `string` | CSS `cursor` value: what the pointer becomes over the widget (`pointer`, `grab`, `not-allowed`). |
| `display` | `string` | CSS `display` value for the container. |
| `boxSizing` | `'border-box' \| 'content-box'` | Which box `width` and `height` measure: `border-box` keeps the size you asked for and pushes padding inward. |
| `flexDirection` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | Main axis of a flex container: `row` places children side by side, `column` stacks them. |
| `flexGrow` | `number` | Share of the leftover space this child takes, relative to its siblings. |
| `flexShrink` | `number` | How readily the child gives space back when the row overflows; `0` keeps its size. |
| `gap` | `number \| string` | Space between children along the layout axis. |
| `fontSize` | `number` | Size of the font. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `paddingTop` | `Size` | Space inside the widget, on the top edge only. |
| `paddingRight` | `Size` | Space inside the widget, on the right edge only. |
| `paddingBottom` | `Size` | Space inside the widget, on the bottom edge only. |
| `paddingLeft` | `Size` | Space inside the widget, on the left edge only. |
| `pt` | `Size` | Alias of `paddingTop`. |
| `pr` | `Size` | Alias of `paddingRight`. |
| `pb` | `Size` | Alias of `paddingBottom`. |
| `pl` | `Size` | Alias of `paddingLeft`. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `marginTop` | `Size` | Space outside the widget, on the top edge only. |
| `marginRight` | `Size` | Space outside the widget, on the right edge only. |
| `marginBottom` | `Size` | Space outside the widget, on the bottom edge only. |
| `marginLeft` | `Size` | Space outside the widget, on the left edge only. |
| `mt` | `Size` | Alias of `marginTop`. |
| `mr` | `Size` | Alias of `marginRight`. |
| `mb` | `Size` | Alias of `marginBottom`. |
| `ml` | `Size` | Alias of `marginLeft`. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `filter` | `string` | Raw CSS `filter` value applied to the widget itself, e.g. `blur(4px)`. |
| `backdropFilter` | `string` | Raw CSS `backdrop-filter` value: what sits behind the widget is blurred through it, which is what makes a translucent card frosted glass. |
| `maskImage` | `string` | Raw CSS `mask-image` value, used to fade a widget out at its edges instead of cutting it. |
| `bgImage` | `string` | Image painted behind the widget's content (CSS `background-image`), placed with `bgSize` and `bgPosition`. |
| `bgSize` | `string` | How the background image fills its box (`cover`, `contain`, or a length). |
| `bgPosition` | `string` | Where the background image is anchored (`center`, `top`, `50% 20%`). |
| `bgRepeat` | `string` | Whether the background image tiles; `no-repeat` for a single cover. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(event?: Event) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(event?: Event) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `onclick` | `(event?: Event) => void` | Lowercase alias of `onClick`, kept because the shipped templates and the HTML habit write it. |
| `alignSelf` | `AlignSelf` | Overrides the parent's `alignItems` for this child alone (CSS `align-self`). Alias: `selfAlign`. |
| `selfAlign` | `AlignSelf` | Alias of `alignSelf`. |
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
- A step's content is a live widget and a DOM node has one parent, so build the steps array where the Stepper is built: sharing one array between two steppers empties the first slot, and the widget warns when it happens.
- orientation: vertical puts each label beside its marker; horizontal puts it underneath. showLabels: false hides it in both.

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
