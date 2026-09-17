# Stepper

## Overview
`Stepper` is a ready-to-use building block. Think of it like a LEGO piece: give it some props, place it inside another widget, and FletBox creates the browser element for you.

You do not need to write HTML or manually change the DOM to use this widget. You call the widget as a JavaScript function and pass an object between `{` and `}`.

## Learn it in one minute

1. Import the widget from `flet-box`.
2. Call it with `WidgetName({ ... })`.
3. Add props to describe its content, size, color, spacing, and behavior.
4. Put it inside `Container`, `Row`, `Column`, or another widget.

```javascript
import { Column, Container, Text } from "flet-box";

const welcomeCard = Container({
    padding: 20,
    margin: 16,
    bgColor: "#ffffff",
    borderRadius: 12,
    child: Column({
        gap: 8,
        children: [
            Text({ text: "My first FletBox screen", size: 24, weight: "bold" }),
            Text({ text: "Widgets are small building blocks. Put them inside each other to build a screen." }),
        ],
    }),
});
```

## When to use
Use `Stepper` when you need this kind of interface element. Start with the smallest example, then add one prop at a time. You can copy the example, change the text or color, and see the result immediately.

## Common props

- `children` / `child`: content rendered inside the widget.
- `id`: DOM id for the element.
- `className`: CSS class names applied to the element.
- `ref`: callback that receives the underlying DOM node.
- `onClick` / event handlers: native browser event callbacks.
- `disabled`: disables interaction when supported.

## Full prop list

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `Size` | - | Property used by the Stepper component. |
| `height` | `Size` | - | Property used by the Stepper component. |
| `size` | `number` | - | Component size or preset. |
| `padding` | `Padding` | - | Internal spacing around the component. |
| `margin` | `Margin` | - | External spacing around the component. |
| `bgColor` | `Color` | - | Background color applied to the element. |
| `color` | `Color` | - | Color value or theme token. |
| `borderRadius` | `number \| string` | - | Property used by the Stepper component. |
| `elevation` | `number` | - | Property used by the Stepper component. |
| `shadow` | `string` | - | Property used by the Stepper component. |
| `opacity` | `number` | - | Property used by the Stepper component. |
| `visible` | `boolean` | false | Property used by the Stepper component. |
| `disabled` | `boolean` | false | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | - | Callback fired when the widget is pressed. |
| `onClick` | `(widget: Widget) => void` | - | Property used by the Stepper component. |
| `id` | `string` | - | Property used by the Stepper component. |
| `className` | `string` | - | Property used by the Stepper component. |
| `ref` | `(widget: Widget) => void` | - | Property used by the Stepper component. |
| `disableTransform` | `boolean` | - | Property used by the Stepper component. |
| `steps` | `Array<{ label: string; content: Widget; icon?: string }>` | [] | Step entries for wizard or stepper patterns. |
| `activeStep` | `number` | - | Property used by the Stepper component. |
| `onStepChange` | `(index: number) => void` | - | Property used by the Stepper component. |
| `orientation` | `'horizontal' \| 'vertical'` | - | Property used by the Stepper component. |
| `variant` | `'circles' \| 'numbers' \| 'icons'` | - | Visual variation or style preset. |
| `showLabels` | `boolean` | false | Property used by the Stepper component. |
| `showNavigation` | `boolean` | - | Property used by the Stepper component. |
| `nextLabel` | `string` | - | Property used by the Stepper component. |
| `backLabel` | `string` | - | Property used by the Stepper component. |
| `finishLabel` | `string` | - | Property used by the Stepper component. |
| `onFinish` | `() => void` | - | Property used by the Stepper component. |
| `border` | `string` | - | Property used by the Stepper component. |
| `borderColor` | `Color` | - | Property used by the Stepper component. |
| `borderWidth` | `number` | - | Property used by the Stepper component. |

## How props work

A prop is simply an instruction inside the object passed to the widget. The name tells FletBox what to change, and the value tells it how to change it.

```javascript
Stepper({
    padding: 16,              // space inside the widget
    margin: "8px 0",         // space outside the widget
    bgColor: "#eff6ff",      // background color
    width: "100%",           // CSS size or a number of pixels
    children: [],             // widgets placed inside it
    onPress: () => {         // what to do after a press
        console.log("Hello");
    },
});
```

You do not need to use every prop. Begin with the required props, then add optional props only when you need them.

## Example usage

```javascript
import { Stepper, Text } from "flet-box";

const example = Stepper({
  child: Text({ text: "Example" })
});
```

## Examples from the FletBox snippet library

The examples below come from the FletBox snippet library. The prop table is based on `src/index.d.ts`. When an example and the type declaration use different names, prefer the type declaration and verify the implementation.

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
Stepper({ steps: [{ label: "Step 1", content: Text("Content") }] })
```

## Everyday example

A practical version with the props most applications usually need.

```javascript
Stepper({ steps: [{ label: "Info", content: InfoForm() }, { label: "Confirm", content: ConfirmForm() }], activeStep: 0, onStepChange: setStep })
```

## Full example

A larger example showing advanced styling, layout, events, and customization.

```javascript
Stepper({
    steps: [
        { label: "Personal", content: PersonalForm(), icon: "person" },
        { label: "Payment", content: PaymentForm(), icon: "credit_card" },
        { label: "Done", content: SuccessMessage(), icon: "check_circle" }
    ],
    activeStep: step,
    onStepChange: (idx) => setStep(idx),
    orientation: "horizontal",
    variant: "circles",
    showLabels: true,
    showNavigation: true,
    nextLabel: "Continue",
    backLabel: "Back",
    finishLabel: "Submit",
    onFinish: () => submitForm(),
    bgColor: colors.surface,
    borderRadius: 24,
    border: border(1, "solid", colors.border),
    padding: 24,
    width: "100%"
})
```


## Common layout and styling examples

The following example shows how common FletBox props work together. Numeric spacing values are interpreted as pixels, while strings can use CSS units and shorthand values.

```javascript
import { Button, Column, Container, Row, Text } from "flet-box";

const panel = Container({
    width: "100%",          // number values are pixels; strings accept CSS units
    padding: 24,            // 24px on every side
    margin: "16px auto",   // CSS shorthand: vertical and horizontal spacing
    bgColor: "#f8fafc",    // background color
    borderRadius: 12,
    elevation: 2,
    gap: 12,
    child: Column({
        children: [
            Text({ text: "Account settings", size: 24, weight: "bold" }),
            Row({
                gap: 8,
                justifyContent: "space-between",
                children: [
                    Text({ text: "Update your profile" }),
                    Button({
                        text: "Save",
                        bgColor: "#2563eb",
                        color: "#ffffff",
                        onPress: () => console.log("saved"),
                    }),
                ],
            }),
        ],
    }),
});
```

### Common prop quick reference

- `padding: 24` adds `24px` inside the widget on all sides.
- `padding: "8px 16px"` uses CSS shorthand for vertical and horizontal spacing.
- `margin: "16px auto"` adds outside spacing and can center a fixed-width element.
- `bgColor: "#f8fafc"` sets the background color. Color tokens and CSS colors can be used.
- `color: "#111827"` sets the foreground or text color when supported.
- `width: 320` means `320px`; `width: "100%"` uses a CSS percentage.
- `children` is an array of widgets; `child` is useful when a component accepts one child.
- `gap: 12` controls the space between children in layout widgets.
- `onPress` and `onClick` receive event callbacks for interactive behavior.

## Beginner tips

- Change one value at a time so you can see what each prop does.
- Use `Text` to check that your layout is in the place you expect.
- Use `Container` for a box, `Row` for items side by side, and `Column` for items one below another.
- Use `padding` when content needs breathing room inside a box.
- Use `margin` when you need space between this widget and its neighbors.
- Use `bgColor` to make the boundaries of a box easy to see while learning.
- If a prop is optional, leaving it out lets FletBox use its default behavior.

## Common mistakes

- Do not put plain text where a widget is expected unless the widget explicitly accepts strings.
- Use `children: [ ... ]` for several child widgets and `child: widget` for one child when the widget supports both.
- Check spelling carefully: `onPress`, `onClick`, and `onChange` are different events.
- If a helper such as `padding()` or `margin()` is not available in your import list, use a number or CSS string first.

## Behavior notes
- Integrates cleanly with FletBox runtime semantics and DOM rendering.
- Can be nested inside layout widgets and combined with other components.
- Uses the same direct prop and event conventions as the rest of the framework.
- Keeps the API simple and readable for composing interfaces fast.

## Accessibility
- Prefer clear labels and readable text for interactive controls.
- Respect the `disabled` state and keyboard behavior when available.
- Keep state changes understandable for screen readers and assistive technology.

## Related widgets
- `Container`
- `Row`
- `Column`
- `Stack`
- `Text`
- `Button`
