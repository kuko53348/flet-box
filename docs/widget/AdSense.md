# AdSense

Google AdSense display unit for the web. It renders a reserved ad slot, loads the adsbygoogle SDK once per publisher, and lets Google fill the slot.

## When to use it

Reach for AdSense when you ship a web, PWA, or webview build and want to monetize a page with a display slot.

## Quick start

```javascript
import { AdSense } from "flet-box";

const ad = AdSense({
  client: "ca-pub-1234567890123456",
  slot: "1234567890",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `client` | `string` | AdSense publisher id, such as `ca-pub-...`. |
| `slot` | `string` | AdSense ad unit slot id. |
| `format` | `string` | Ad format requested from the ad network. |
| `responsive` | `boolean` | Lets the ad resize to fit its container. |
| `test` | `boolean` | The `test` value for the widget. |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `placeholder` | `boolean` | Fallback text shown while the ad is unavailable. |
| `label` | `string` | Label or caption shown near the control. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderColor` | `Color` | Color used for the border. |
| `onLoad` | `(widget: Widget) => void` | Fired when the media finishes loading. |
| `onError` | `(error: Error, widget: Widget) => void` | Fired when the media fails to load. |
| `children` | `Widget[]` | An array of child widgets. Alias: `child` for a single child. |

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
import { AdSense } from "flet-box";

const ad = AdSense({
  client: "ca-pub-1234567890123456",
  slot: "1234567890",
  format: "auto",
  responsive: true,
  height: 280,
});
```

### Full

```javascript
import { AdSense } from "flet-box";

const ad = AdSense({
  client: "ca-pub-1234567890123456",
  slot: "1234567890",
  format: "fluid",
  responsive: true,
  width: "100%",
  height: 320,
  bgColor: "#f8fafc",
  borderColor: "#e2e8f0",
  label: "Sponsored",
  onLoad: (widget) => console.log("ad ready", widget),
  onError: (error) => console.warn("AdSense unavailable", error),
});
```

## Tips

- Both `client` and `slot` are required; until then the widget shows a dashed placeholder and requests no ad.
- Self-sizing formats such as `fluid` and `autorelaxed` grow with the ad, while fixed formats keep the reserved `height`.
- Set `test: true` only while developing; it must be off in production.

## Accessibility

- Give the surrounding section a heading so the slot is not the only content a screen reader encounters.

## Behavior

- `onLoad` fires after the SDK is ready and the unit is pushed; `onError` fires if the SDK fails to load.
- The SDK is injected once per `client` and shared by every AdSense unit on the page; unmounting stops further loads.

## Related widgets

- [AdMob](AdMob.md)
- [Container](Container.md)
- [Stack](Stack.md)

---

## Continue reading

- **Previous:** [Inspector](Inspector.md)
- **Next:** [AdMob](AdMob.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (8 of 13).
