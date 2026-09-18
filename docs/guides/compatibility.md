# Compatibility and support

> **Level: Advanced.** This page is for shipping — skip it on a first read. It follows [mobile and platforms](mobile-and-platforms.md) in the book's reading path.

FletBox targets browser-based applications and can also be packaged for mobile platforms.

## Platform matrix

| Platform | Status | Notes |
| --- | --- | --- |
| Modern browsers | Supported | Uses DOM, ES modules, and browser APIs. |
| Static web hosting | Supported | Build with `npm run build`. |
| PWA | Supported | Requires manifest, service worker, and HTTPS in production. |
| Android | Supported through Capacitor | Build the web app first, then sync Capacitor. |
| iOS | Supported through Capacitor | Requires macOS and Xcode. |
| Desktop | Possible through Electron or Tauri | Package the generated web build. |
| Server-side rendering | Not a primary target | Widgets depend on browser DOM APIs. |

## Runtime requirements

### Browser

The application expects support for:

- ES modules.
- `fetch`.
- `localStorage` and `sessionStorage` when storage services are used.
- DOM events and `HTMLElement`.
- `AbortSignal.timeout` when using the default HTTP timeout behavior.
- `WebSocket` when HMR is enabled.

Private browsing, sandboxed iframes, and strict browser policies may disable some APIs. Check availability before using storage or device features.

### Node.js

Node.js 18 or newer is required for the CLI and build tooling. FletBox widgets themselves are browser-oriented and should not be rendered directly in a Node process without a DOM environment.

## Build targets

The main build path is:

```bash
npm run build
```

Then use the output in `dist/` for hosting or Capacitor:

```bash
npx cap sync android
npx cap sync ios
```

See [Mobile and platforms](mobile-and-platforms.md) for APK, AAB, iOS, PWA, and desktop workflows.

## Browser feature checks

```javascript
import { device, isStorageAvailable } from "flet-box";

if (device.isMobile()) {
  console.log("Mobile device");
}

if (!isStorageAvailable()) {
  console.warn("Persistent storage is not available");
}
```

## API stability labels

Documentation uses these meanings:

- **Stable**: exported, documented, and intended for normal application use.
- **Compatible alias**: an alternative name kept to make migration easier.
- **Experimental**: available but subject to behavior or API changes.
- **Legacy**: retained for older projects; prefer the current documented form.

When the runtime and `index.d.ts` disagree, the implementation must be verified before treating the feature as stable.

## Known compatibility boundaries

- Browser storage is origin-scoped and limited in size.
- WebView behavior can differ from desktop browsers.
- Native device features require Capacitor plugins and permissions.
- HMR is a development feature and should not be required in production.
- Direct browser DOM access is required for widget mounting.
- Source maps can expose original source and should be handled intentionally.

---

## Continue reading

- **Previous:** [Build FletBox for mobile and other platforms](mobile-and-platforms.md)
- **Next:** [Add FletBox to an existing page](embedding.md) — Appendix D
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)
