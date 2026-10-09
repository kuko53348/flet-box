# AdSense

## Overview
`AdSense` is a **live Google AdSense display unit for the web**. It loads
Google's `adsbygoogle.js` SDK and asks it to fill a real ad slot.

Use it in browser apps, PWAs and Capacitor webviews that are allowed to serve
AdSense. For native Android/iOS banners, use [`AdMob`](AdMob.md) instead (see the
comparison below).

## AdSense vs AdMob

| | `AdSense` | `AdMob` |
| --- | --- | --- |
| Target | Web / PWA / webview | Native Android & iOS (Capacitor) |
| SDK | `adsbygoogle.js` (auto-injected) | `@capacitor-community/admob` (native plugin) |
| Needs a plugin install | No | Yes (`npm i @capacitor-community/admob` + `npx cap sync`) |
| Works in the browser | Yes | Degrades to a placeholder |
| Typical unit ids | `ca-pub-…` + numeric slot | `ca-app-pub-…/…` |

Use `AdSense` for web targets and `AdMob` for native Android/iOS targets.

## Learn it in one minute

```javascript
import { AdSense } from "flet-box";

const banner = AdSense({
    client: "ca-pub-1234567890123456",  // your publisher id
    slot: "1234567890",                 // the ad unit id
    format: "auto",
});
```

The widget is inert until **both** `client` and `slot` are set. Once configured
and mounted, it injects the SDK (a single shared copy for every `AdSense` on the
page) and pushes the unit to be filled.

## When to use
- A public web app or PWA monetised with Google AdSense.
- A Capacitor webview that is permitted (by Google policy) to show AdSense.
- You want automatic script injection and slot filling without touching
  `index.html`.

Do **not** use it inside native Android/iOS banner slots — Google policy
requires `AdMob` there.

## Full prop list

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `client` | `string` | `""` | Publisher id, e.g. `"ca-pub-1234567890123456"`. Required to go live. |
| `slot` | `string` | `""` | Ad unit id (numeric string). Required to go live. |
| `format` | `string` | `"auto"` | `data-ad-format`: `auto`, `horizontal`, `rectangle`, `vertical`, `fluid`, `autorelaxed`. |
| `responsive` | `boolean` | `true` | Emits `data-full-width-responsive="true"` for responsive units. |
| `test` | `boolean` | `false` | Emits `data-adtest="on"`; Google serves sample test ads from its test pool (ignores domain approval). **Never** ship with `test: true`. |
| `width` | `Size` | `"100%"` | Slot width. Number = pixels, string = any CSS size. |
| `height` | `Size` | `280` | Reserved slot height (prevents layout shift). Ignored for the self-sizing formats `autorelaxed` and `fluid`.
| `placeholder` | `boolean` | `true` | Show a dashed placeholder while unconfigured. |
| `label` | `string` | `"Advertisement"` | Placeholder text. |
| `bgColor` | `Color` | - | Slot background color. |
| `color` | `Color` | `#9ca3af` | Placeholder label color. |
| `borderColor` | `Color` | `#d1d5db` | Placeholder dashed border color. |
| `onLoad` | `(widget) => void` | - | Fired after the SDK is ready and the unit pushed. |
| `onError` | `(error, widget) => void` | - | Fired when the SDK fails to load. |
| `children` | `Widget[]` | - | Extra host markup placed inside the slot. |
| plus every [`CommonProps`](../guides/widget-structure.md) prop (`id`, `className`, `ref`, `onClick`, …). |

## Methods

| Method | Returns | Description |
| --- | --- | --- |
| `refresh()` | `Widget` | Requests another ad for the same unit (e.g. after a route change). |
| `load()` | `void` | Starts (or restarts) the SDK load + fill cycle. |
| `getElement()` | `Widget` | The `<ins>` unit when live, otherwise the container. |

## Basic example

```javascript
AdSense({ client: "ca-pub-1234567890123456", slot: "1234567890" })
```

## Everyday example

```javascript
AdSense({
    client: "ca-pub-1234567890123456",
    slot: "1234567890",
    format: "auto",
    responsive: true,
    height: 280,
})
```

## Full example

```javascript
import { AdSense } from "flet-box";

const inFeed = AdSense({
    client: "ca-pub-1234567890123456",
    slot: "9876543210",
    format: "fluid",
    height: 320,
    bgColor: "#f8fafc",
    borderColor: "#e2e8f0",
    onLoad: (el) => console.log("ad unit pushed", el),
    onError: (error) => console.warn("AdSense unavailable", error),
});

// Refresh after the SPA changes route.
inFeed.refresh();
```

## How to implement it

1. **Get your ids.** In the AdSense dashboard create a display unit. You get a
   publisher id (`ca-pub-…`) and a slot id (a number).
2. **Pass them to the widget** as `client` and `slot`. Nothing else is required:
   FletBox creates the `<ins class="adsbygoogle">` element, injects
   `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=…`
   exactly once, and calls `(adsbygoogle = window.adsbygoogle || []).push({})`.
3. **Reserve space** with `width`/`height` (or `minHeight`) to avoid cumulative
   layout shift while the ad loads.
4. **Re-request ads** with `refresh()` when your SPA swaps the page content.

> Important: Google serves ads only on domains approved in your AdSense account
> (status "Ready" under **Sites**). Until then `data-ad-status="unfilled"` is
> expected — the space stays reserved but no ad renders. Never click your own
> live ads. Note: the legacy `data-adtest="on"` attribute is deprecated (2024)
> and no longer returns test ads.

## Behavior notes
- The SDK script is shared and idempotent: ten `AdSense` widgets inject one
  `<script>`.
- The widget is inert (`placeholder` only) until `client` **and** `slot` are set.
- Formats `autorelaxed` (matched content) and `fluid` size themselves: the
  reserved `height` is dropped and the slot grows with the content Google
  injects. All other formats reserve `height` to avoid layout shift.
- The script is intentionally **not** removed on unmount — other slots on the
  page may still depend on it. Only the widget's own `<ins>` is torn down.
- `slot`, `client`, `format`, `responsive`, `test`, `label`, `placeholder` and
  `height` are reactive: update them with `widget.update({ ... })`.

## Accessibility
- Keep the reserved `height` stable so content does not jump for screen readers.
- Provide a meaningful surrounding heading; ad labels are injected by Google.

## Related widgets
- `AdMob` — native Android/iOS counterpart.
