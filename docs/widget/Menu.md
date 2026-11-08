# Menu

A trigger button that opens an anchored menu of actions. The panel is a portal on document.body, so a row's overflow cannot clip it, and it speaks the menu keyboard pattern instead of being a second list of links.

## When to use it

Use it for the secondary actions of a row — rename, duplicate, delete — when two permanent buttons would take the space the row's own label needs.

## Quick start

```javascript
import { Menu } from "flet-box";

const actions = Menu({
  label: "Conversation actions",
  items: [
    { text: "Rename", icon: "edit", onPress: rename },
    { text: "Delete", icon: "delete", danger: true, onPress: remove },
  ],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `MenuItem[]` | The actions, as `{ text, icon?, onPress?, disabled?, danger? }` records. `danger: true` writes the row in `colors.dangerStrong`. |
| `label` | `string` | Accessible name of the trigger and of the open menu. An icon-only trigger has no visible text, so this is the name a screen reader reads. |
| `icon` | `string` | Glyph drawn in the trigger. Defaults to `more_vert`, the vertical ellipsis a row menu is recognised by. |
| `width` | `number \| string` | Width of the open panel, in framework units. The trigger itself is a square `size` wide. |
| `align` | `'start' \| 'end'` | Which edge of the trigger the panel lines up with. `end` keeps a menu at the right edge of a row from hanging off the sidebar. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `portal` | `boolean` | Mount the panel on `document.body` so no ancestor's overflow can clip it. On by default; turn it off only when the trigger already lives in an unclipped stacking context. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `size` | `number` | Side of the square trigger, in framework units. Defaults to 40 — the tap minimum — and the glyph scales with it. |

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
| `width` | `Size` | Width of the open panel, in framework units. The trigger itself is a square `size` wide. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `Size` | Side of the square trigger, in framework units. Defaults to 40 — the tap minimum — and the glyph scales with it. |
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
| `overflow` | `'auto' \| 'hidden' \| 'visible' \| 'scroll' \| 'clip'` | How overflowing content is handled (`hidden`, `auto`, `scroll`). |
| `overflowX` | `'auto' \| 'hidden' \| 'visible' \| 'scroll' \| 'clip'` | The `overflowX` value for the widget. |
| `overflowY` | `'auto' \| 'hidden' \| 'visible' \| 'scroll' \| 'clip'` | The `overflowY` value for the widget. |
| `textOverflow` | `'clip' \| 'ellipsis' \| string` | The `textOverflow` value for the widget. |
| `whiteSpace` | `'normal' \| 'nowrap' \| 'pre' \| 'pre-wrap' \| 'pre-line' \| string` | The `whiteSpace` value for the widget. |
| `id` | `string` | DOM `id` for the rendered element. |
| `className` | `string` | CSS class names applied to the rendered element. |
| `ref` | `(widget: Widget) => void` | Callback that receives the underlying DOM node. |
| `disableTransform` | `boolean` | Disables the default press/scale transform animation. |

## Examples

### Everyday

```javascript
import { Menu } from "flet-box";

const rowMenu = Menu({
  label: "Project actions",
  items: [
    { text: "Rename project", icon: "edit", onPress: renameProject },
    { text: "Delete project", icon: "delete", danger: true, onPress: deleteProject },
  ],
  align: "end",
  width: 220,
});
```

### Full

```javascript
import { Menu } from "flet-box";

const menu = Menu({
  label: "Message actions",
  icon: "more_vert",
  items: [
    { text: "Copy", icon: "content_copy", onPress: copy },
    { text: "Edit", icon: "edit", onPress: edit },
    { text: "Archive", icon: "archive", onPress: archive, disabled: true },
    { text: "Delete", icon: "delete", danger: true, onPress: remove },
  ],
  size: 40,
  width: 220,
  align: "start",
  portal: true,
  bgColor: "#ffffff",
  borderRadius: 8,
  disabled: false,
});
```

## Tips

- Keep the items to the actions of the row it belongs to. A menu that copies the whole app navigation is a drawer with extra steps.
- Mark a destructive item with danger: true; the ink becomes colors.dangerStrong, the token that is readable as words.
- The trigger is an icon-only control, so label is not optional in practice: it is the name a screen reader reads before opening the menu.

## Accessibility

- The trigger keeps the Tab stop and reports aria-haspopup and aria-expanded; ArrowDown and ArrowUp open the panel on the first and last action.
- Inside the panel the arrow keys move focus between role=menuitem rows, Enter or Space runs the action, Escape closes and returns focus to the trigger, and Tab closes and moves on.
- The panel holds Tab while it is open through the same focus scope as the overlays, and gives focus back when it closes or unmounts.

## Behavior

- The panel is measured against the viewport: it aligns to the trigger's start or end edge and flips above the trigger when it does not fit below.
- Escape, a click outside the trigger and the panel, or scrolling with the menu open closes it; every listener is released on unmount.
- Changing items through update() rebuilds the open panel; setting disabled closes it and disables the trigger.

## Related widgets

- [Button](Button.md)
- [Dropdown](Dropdown.md)
- [ListTile](ListTile.md)

---

## Continue reading

- **Previous:** [Tooltip](Tooltip.md)
- **Next:** [ProgressBar](ProgressBar.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (6 of 11).
