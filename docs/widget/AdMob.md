# AdMob

## Overview
`AdMob` is a **live Google AdMob widget for native Capacitor builds** (Android and
iOS). It is the mobile counterpart of [`AdSense`](AdSense.md): instead of loading
a web SDK it drives the native
[`@capacitor-community/admob`](https://github.com/capacitor-community/admob)
plugin, which renders banners over the native layer.

Because a native banner is **not** a DOM node, the widget renders a DOM
placeholder that reserves space and triggers the native calls:

- `onMount` → `AdMob.showBanner(...)`
- `onUnmount` → `AdMob.removeBanner()`
- `showInterstitial()` / `showRewarded()` → prepare + show full-screen ads

In a plain browser (no Capacitor bridge) it keeps working as a placeholder and
logs a single warning, so you can develop on the web and ship to device.

> Looking for the web equivalent? Use [`AdSense`](AdSense.md).

## AdMob vs AdSense

| | `AdMob` | `AdSense` |
| --- | --- | --- |
| Target | Native Android & iOS (Capacitor) | Web / PWA / webview |
| SDK | `@capacitor-community/admob` (native plugin) | `adsbygoogle.js` (auto-injected) |
| Needs a plugin install | Yes | No |
| Works in the browser | Placeholder only (warns) | Yes |
| Typical unit ids | `ca-app-pub-…/…` | `ca-pub-…` + numeric slot |

## Learn it in one minute

```javascript
import { AdMob } from "flet-box";

const banner = AdMob({
    adId: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
    position: "bottom",
    isTesting: true,   // use Google test ads while developing
});
```

On a device this shows a native banner at the bottom. In the browser it renders
the reserved placeholder.

## When to use
- A FletBox app built with `flet-box build android` / `build ios`.
- You want native banners, interstitials or rewarded ads.
- You can run `npx cap sync` in the generated Capacitor project.

Do **not** expect real ads in the browser: AdMob only serves through the native
plugin.

## Full prop list

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `adId` | `string` | `""` | Banner ad unit id. Falls back to Google's test unit. |
| `isTesting` | `boolean` | `false` | Show Google test ads (set `true` before release). |
| `position` | `"top" \| "bottom"` | `"bottom"` | Native banner position. |
| `size` | `string` | `"ADAPTIVE_BANNER"` | `ADAPTIVE_BANNER`, `BANNER`, `LARGE_BANNER`, `MEDIUM_RECTANGLE`, `FULL_BANNER`, `LEADERBOARD`, `SMART_BANNER`. |
| `margin` | `number` | `0` | Distance in pixels from the chosen edge. |
| `interstitialId` | `string` | `""` | Ad unit id used by `showInterstitial()`. |
| `rewardedId` | `string` | `""` | Ad unit id used by `showRewarded()`. |
| `autoShow` | `boolean` | `true` | Show the banner automatically on mount. |
| `width` | `Size` | `"100%"` | Placeholder width. |
| `height` | `Size` | `50` | Placeholder height (reserve banner space). |
| `placeholder` | `boolean` | `true` | Show the dashed placeholder box. |
| `label` | `string` | `"AdMob banner"` | Placeholder text. |
| `bgColor` | `Color` | - | Placeholder background color. |
| `color` | `Color` | `#9ca3af` | Placeholder label color. |
| `borderColor` | `Color` | `#d1d5db` | Placeholder dashed border color. |
| `plugin` | `object` | `Capacitor.Plugins.AdMob` | Explicit plugin instance (useful in tests). |
| `onLoaded` | `(widget) => void` | - | Fired after the banner is shown. |
| `onFailed` | `(error, widget) => void` | - | Fired when a native call fails. |
| `onDismissed` | `() => void` | - | Fired after a full-screen ad is dismissed. |
| plus every [`CommonProps`](../guides/widget-structure.md) prop. |

## Methods

| Method | Returns | Description |
| --- | --- | --- |
| `show()` | `Promise` | Shows (or re-shows) the banner. |
| `hide()` | `Promise` | Hides the banner but keeps it prepared. |
| `showInterstitial()` | `Promise` | Prepares and shows an interstitial. |
| `showRewarded()` | `Promise` | Prepares and shows a rewarded video. |
| `getPlugin()` | `object \| null` | The resolved native plugin, if any. |

## Basic example

```javascript
AdMob({ adId: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY", isTesting: true })
```

## Everyday example

```javascript
AdMob({
    adId: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
    position: "bottom",
    size: "ADAPTIVE_BANNER",
    margin: 8,
    isTesting: false,
})
```

## Full example

```javascript
import { AdMob, Button, Column } from "flet-box";

const ads = AdMob({
    adId: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
    position: "bottom",
    size: "ADAPTIVE_BANNER",
    interstitialId: "ca-app-pub-XXXXXXXXXXXXXXXX/1111111111",
    rewardedId: "ca-app-pub-XXXXXXXXXXXXXXXX/2222222222",
    isTesting: true,
    onLoaded: () => console.log("banner visible"),
    onFailed: (error) => console.warn("AdMob error", error),
    onDismissed: () => console.log("full-screen ad closed"),
});

Column({
    children: [
        Button({ text: "Show interstitial", onPress: () => ads.showInterstitial() }),
        Button({ text: "Watch reward", onPress: () => ads.showRewarded() }),
        ads,
    ],
});
```

## How to implement it

AdMob is a **native** plugin, so it needs a one-time setup inside your generated
Capacitor project:

```bash
# 1. Build the app and generate the native projects (from your FletBox project)
flet-box build android      # or: flet-box build ios

# 2. Add the AdMob plugin to the native project
cd android && npm install @capacitor-community/admob && npx cap sync
# or: cd ios  && npm install @capacitor-community/admob && npx cap sync
```

On Android you also need to declare the AdMob App ID in
`android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY" />
```

On iOS, add the AdMob keys to `ios/App/App/Info.plist`:

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
```

The plugin registers itself on the Capacitor bridge as
`Capacitor.Plugins.AdMob`; FletBox resolves it automatically, so **no import is
needed** and the framework stays dependency-free. If you bundle the plugin
yourself you can always pass it explicitly with `plugin={AdMobPlugin}`.

Then use the widget as usual:

1. Create a banner unit in the AdMob console and copy the `ca-app-pub-…/…` id.
2. Pass it as `adId` and keep `isTesting: true` until you are ready to ship.
3. Reserve space by matching the widget's `height` to the native banner height.

> During development always show **test ads** (`isTesting: true`). Clicking your
> own live ads can get your AdMob account suspended.

## Behavior notes
- The native plugin is resolved from `globalThis.Capacitor.Plugins.AdMob`; on the
  web the widget degrades to the placeholder and warns once.
- `initialize()` is called once per app; `showBanner()` only runs while mounted
  and `autoShow` is on.
- `onUnmount` calls `removeBanner()` so the native banner does not outlive the
  widget.
- `adId`, `isTesting`, `position`, `size`, `margin`, `label` and `placeholder`
  are reactive through `widget.update({ ... })`.

## Accessibility
- Keep the reserved `height` stable; native banners overlay content when no
  space is reserved.
- Offer a non-ad path (rewarded ads are the accessible option for gated content).

## Related widgets
- `AdSense` — web counterpart.
