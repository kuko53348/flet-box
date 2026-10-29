# Accordion

A collapsible panel that hides a title bar with expandable content beneath it. It animates open and closed and can report its state.

## When to use it

Use it for FAQs, advanced settings, or any content you want to tuck away by default.

## Quick start

```javascript
import { Accordion, Text } from "flet-box";

const faq = Accordion({
  title: "What is FletBox?",
  children: Text({ text: "A declarative UI framework." }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string \| Widget` | Title text shown in the header. |
| `children` | `Widget` | An array of child widgets. Alias: `child` for a single child. |
| `expanded` | `boolean` | The `expanded` value for the widget. |
| `onToggle` | `(expanded: boolean) => void` | Deprecated alias of `onPress`. |
| `onPress` | `(expanded: boolean) => void` | Called with the new expanded state (`true` or `false`). |
| `variant` | `'contained' \| 'outlined' \| 'ghost'` | Visual variation or style preset. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `expandedColor` | `Color` | Color used for the expanded. |
| `titleColor` | `Color` | Color used for the title. |
| `dividerColor` | `Color` | Color used for the divider. |
| `titleSize` | `number` | Size of the title. |
| `titleWeight` | `string` | The `titleWeight` value for the widget. |
| `titlePadding` | `string` | Padding for the title. |
| `contentPadding` | `string` | Padding for the content. |
| `iconCollapsed` | `string` | The `iconCollapsed` value for the widget. |
| `iconExpanded` | `string` | The `iconExpanded` value for the widget. |
| `iconColor` | `Color` | Color of the field icons. |
| `iconSize` | `number` | Size of the field icons. |
| `divider` | `boolean` | The `divider` value for the widget. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `animate` | `boolean` | The `animate` value for the widget. |
| `animationDuration` | `number` | Duration for the animation, in milliseconds. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |

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
| `onPress` | `(event?: Event) => void` | Called with the new expanded state (`true` or `false`). |
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
import { Accordion, Text } from "flet-box";

const faq = Accordion({
  title: "Shipping options",
  expanded: false,
  onPress: (expanded) => console.log(expanded),
  children: Text({ text: "Free shipping over $50." }),
});
```

### Full

```javascript
import { Accordion, Text } from "flet-box";

const faq = Accordion({
  title: "Payment methods",
  variant: "outlined",
  borderRadius: 12,
  bgColor: "#ffffff",
  expandedColor: "#f8fafc",
  titleColor: "#0f172a",
  titleSize: 16,
  titleWeight: "bold",
  titlePadding: "16px",
  contentPadding: "0 16px 16px",
  iconColor: "#64748b",
  iconSize: 22,
  divider: true,
  animate: true,
  animationDuration: 250,
  onPress: (expanded) => console.log(expanded),
  children: Text({ text: "We accept cards, PayPal, and bank transfer." }),
});
```

## Tips

- Vary variant: "outlined", "contained", or "ghost" to match the surrounding surface.
- Set expanded to control the initial state when the panel mounts.

## Accessibility

- The title becomes the toggle label, so write it as a clear question or section name.

## Behavior

- onPress receives the new expanded boolean whenever the header is activated.
- disabled blocks toggling, and animate: false skips the open/close transition.
- A shut panel still shows its edge: the header keeps the divider and the 'contained' variant paints the raised plate, so it never reads as plain text.

## Related widgets

- [Card](Card.md)
- [ListTile](ListTile.md)
- [Divider](Divider.md)

---

## Continue reading

- **Previous:** [Stepper](Stepper.md)
- **Next:** [TreeView](TreeView.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 5 · Navigation and flows** (2 of 5).
