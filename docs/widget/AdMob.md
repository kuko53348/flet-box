# AdMob

Google AdMob banner and full-screen ads for native Capacitor builds. It renders a placeholder that reserves banner space, and (only when opted in via `autoInitialize: true`) drives the native plugin to show ads.

## When to use it

Use AdMob in Capacitor Android or iOS apps that need banner, interstitial, or rewarded ads over the native layer.

## Quick start

```javascript
import { AdMob } from "flet-box";

const banner = AdMob({
  adId: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
  isTesting: true,
  autoInitialize: true,
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `adId` | `string` | AdMob ad unit id. |
| `isTesting` | `boolean` | Requests test ads instead of live ones. |
| `position` | `'top' \| 'bottom'` | Pins the banner to the top or bottom of the viewport. |
| `size` | `string` | Overall size preset or pixel value, depending on the widget. |
| `margin` | `number` | Space outside the widget, between it and its neighbors. |
| `interstitialId` | `string` | AdMob interstitial ad unit id. |
| `rewardedId` | `string` | AdMob rewarded ad unit id. |
| `autoShow` | `boolean` | Shows the banner automatically on mount. false silences only the mount; show() still asks for the ad. |
| `autoInitialize` | `boolean` | The `autoInitialize` value for the widget. |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `placeholder` | `boolean` | Fallback text shown while the ad is unavailable. |
| `label` | `string` | Label or caption shown near the control. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderColor` | `Color` | Color used for the border. |
| `plugin` | `object` | The `plugin` value for the widget. |
| `onLoaded` | `(widget: Widget) => void` | Fired when the ad loads. |
| `onFailed` | `(error: Error, widget: Widget) => void` | Fired when the ad fails to load. |
| `onDismissed` | `() => void` | Fired when the ad is dismissed. |

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
| `position` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | Pins the banner to the top or bottom of the viewport. |
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
import { AdMob } from "flet-box";

const banner = AdMob({
  adId: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
  position: "bottom",
  size: "ADAPTIVE_BANNER",
  margin: 8,
  isTesting: false,
  autoInitialize: true,
});
```

### Full

```javascript
import { AdMob } from "flet-box";

const banner = AdMob({
  adId: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
  position: "bottom",
  size: "ADAPTIVE_BANNER",
  interstitialId: "ca-app-pub-XXXXXXXXXXXXXXXX/1111111111",
  rewardedId: "ca-app-pub-XXXXXXXXXXXXXXXX/2222222222",
  isTesting: true,
  autoShow: true,
  autoInitialize: true,
  label: "AdMob banner",
  bgColor: "#f8fafc",
  onLoaded: (widget) => console.log("banner visible", widget),
  onFailed: (error) => console.warn("AdMob error", error),
  onDismissed: () => console.log("ad dismissed"),
});
```

## Tips

- Native ads are opt-in: mount ADMOB with `autoInitialize: true` and add the AdMob App ID to the native config (`GADApplicationIdentifier` in Info.plist on iOS, `APPLICATION_ID` meta-data in AndroidManifest.xml on Android). Google's SDK aborts the app when the App ID is missing, so until then the widget stays placeholder-only.
- On the web with no Capacitor plugin it degrades to the placeholder and logs one warning, so development keeps working.
- Keep `isTesting: true` until your real ad units are approved, then switch to production ids.
- Choose `position: "top"` or `"bottom"` and use `margin` to offset the banner from the device edge.

## Accessibility

- Reserve the banner height with `height` so page content does not jump under a screen reader's cursor while the ad loads.

## Behavior

- Until `autoInitialize: true` is passed, the widget is placeholder-only and never touches the native plugin.
- The returned element exposes `show()`, `hide()`, `showInterstitial()`, and `showRewarded()` for full-screen ads.
- `onLoaded` fires after the banner is shown, `onFailed` on native errors, and `onDismissed` after a full-screen ad closes; unmount removes the banner.

## Related widgets

- [AdSense](AdSense.md)
- [Container](Container.md)
- [Stack](Stack.md)

---

## Continue reading

- **Previous:** [AdSense](AdSense.md)
- **Next:** [AnimatedBox](AnimatedBox.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (9 of 13).
