# AdMob

Google AdMob banner and full-screen ads for native Capacitor builds. It renders a placeholder that reserves banner space and drives the native plugin on mount.

## When to use it

Use AdMob in Capacitor Android or iOS apps that need banner, interstitial, or rewarded ads over the native layer.

## Quick start

```javascript
import { AdMob } from "flet-box";

const banner = AdMob({
  adId: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
  isTesting: true,
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `adId` | `string` | AdMob ad unit id. |
| `isTesting` | `boolean` | Requests test ads instead of live ones. |
| `position` | `'top' \| 'bottom'` | CSS `position` value, or `stack` for centered stacking. |
| `size` | `string` | Overall size preset or pixel value, depending on the widget. |
| `margin` | `number` | Space outside the widget, between it and its neighbors. |
| `interstitialId` | `string` | AdMob interstitial ad unit id. |
| `rewardedId` | `string` | AdMob rewarded ad unit id. |
| `autoShow` | `boolean` | Shows the ad automatically when it is ready. |
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
import { AdMob } from "flet-box";

const banner = AdMob({
  adId: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
  position: "bottom",
  size: "ADAPTIVE_BANNER",
  margin: 8,
  isTesting: false,
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
  label: "AdMob banner",
  bgColor: "#f8fafc",
  onLoaded: (widget) => console.log("banner visible", widget),
  onFailed: (error) => console.warn("AdMob error", error),
  onDismissed: () => console.log("ad dismissed"),
});
```

## Tips

- On the web with no Capacitor plugin it degrades to the placeholder and logs one warning, so development keeps working.
- Keep `isTesting: true` until your real ad units are approved, then switch to production ids.
- Choose `position: "top"` or `"bottom"` and use `margin` to offset the banner from the device edge.

## Accessibility

- Reserve the banner height with `height` so page content does not jump under a screen reader's cursor while the ad loads.

## Behavior

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
