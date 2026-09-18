# Build FletBox for mobile and other platforms

> **Level: Advanced.** This page is for shipping — skip it on a first read. It follows [minification and protection](minification-and-protection.md) in the book's reading path.

FletBox applications can be built for the web and then packaged for mobile with Capacitor. The same frontend code can become a website, PWA, Android app, or iOS app.

## The general flow

```text
FletBox source
     |
     | npm run build
     v
Web build / dist
     |
     | Capacitor sync
     v
Android project       iOS project
     |                     |
 APK / AAB              App Store app
```

Capacitor packages the compiled web application inside a native shell. You can add native Capacitor plugins later when the app needs device features.

## Requirements

### For every platform

- Node.js 18 or newer.
- npm.
- A working FletBox project.
- A production build that creates the directory configured as Capacitor's `webDir`.

### For Android

- Android Studio.
- Android SDK.
- Java/JDK compatible with the Android Gradle project.
- An emulator or physical Android device for testing.

### For iOS

- macOS.
- Xcode.
- CocoaPods when required by installed plugins.
- An Apple developer account for device distribution and App Store publishing.

## Prepare the web build

From the FletBox project:

```bash
npm install
npm run build
```

Check that the build output exists before syncing Capacitor:

```text
dist/
├── index.html
└── src/
    └── app.js
```

Your Capacitor configuration must point `webDir` to that output directory, commonly `dist`:

```json
{
  "appId": "com.example.myapp",
  "appName": "My FletBox App",
  "webDir": "dist"
}
```

The exact configuration file may be `capacitor.config.ts`, `capacitor.config.json`, or another format depending on how Capacitor was initialized.

## Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
```

Initialize Capacitor:

```bash
npx cap init
```

The command asks for:

- App name.
- App package id, such as `com.example.myapp`.
- Web output directory.

Use a stable package id. Changing it later can create a different application in app stores.

## Android

### Add Android to the project

```bash
npm install @capacitor/android
npx cap add android
npx cap sync android
```

Run the web build before each sync when frontend files changed:

```bash
npm run build
npx cap sync android
```

### Open Android Studio

```bash
npx cap open android
```

If Android Studio is installed in a custom location on macOS:

```bash
export CAPACITOR_ANDROID_STUDIO_PATH="/Applications/Android Studio.app"
npx cap open android
```

Remove the custom override when it is no longer needed:

```bash
unset CAPACITOR_ANDROID_STUDIO_PATH
```

### Run on an emulator or device

You can open the project in Android Studio and use the Run button, or use Capacitor's command when a device is configured:

```bash
npx cap run android
```

For a physical device, enable developer mode and USB debugging on the device.

### Build a debug APK

From the project root:

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug --warning-mode all
```

On macOS, the generated debug APK is normally located at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

The debug APK is for local testing and should not be published as the production release.

### Build a release APK

```bash
cd android
./gradlew assembleRelease
```

A release build must be signed before distribution. Configure a release signing key in the Android project and keep the keystore outside source control.

### Build an Android App Bundle

Google Play normally expects an Android App Bundle:

```bash
cd android
./gradlew bundleRelease
```

The output is normally located at:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## iOS

### Add iOS to the project

```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync ios
```

After frontend changes:

```bash
npm run build
npx cap sync ios
```

### Open Xcode

```bash
npx cap open ios
```

Select a simulator or connected device in Xcode, configure the signing team, and run the application.

For App Store distribution, configure:

- Bundle identifier.
- Signing team.
- Development and distribution certificates.
- Provisioning profile.
- App icons and launch assets.
- Privacy descriptions for any native plugins.

## Capacitor assets

Install the asset helper:

```bash
npm install -D @capacitor/assets
```

Prepare source icons according to the Capacitor assets requirements, then generate platform assets with the relevant Capacitor assets command for your project version.

Review the generated icons in Android Studio and Xcode before publishing.

## Update Capacitor

Update the core packages together:

```bash
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest
```

For iOS projects, include the iOS package too:

```bash
npm install @capacitor/ios@latest
```

Then synchronize native projects:

```bash
npx cap sync android
npx cap sync ios
```

Read the Capacitor migration notes before updating a major version.

## macOS permission fixes

If Gradle cannot execute on macOS:

```bash
cd android
chmod +x gradlew
xattr -c gradlew
```

Then retry:

```bash
./gradlew assembleDebug --warning-mode all
```

`chmod` makes the script executable. `xattr -c` removes macOS quarantine metadata from that local script. Only do this for project files you trust.

## PWA alternative

A FletBox app can also be installed as a Progressive Web App without Capacitor:

```javascript
import { installPWA, isPWAInstalled } from "flet-box";

if (!isPWAInstalled()) {
  installPWA();
}
```

A PWA needs:

- A valid web manifest.
- A registered service worker.
- HTTPS in production, except for localhost.
- Icons in the expected sizes.

PWA installation depends on browser and platform support.

## Desktop options

Capacitor targets Android and iOS. For desktop packaging, consider a desktop shell such as Electron or Tauri around the same `dist` output.

The general idea remains:

```text
npm run build
package dist with the desktop tool
```

Desktop packaging requires its own application configuration, signing, and distribution process.

## Updating the app after code changes

Use this cycle:

```bash
npm run build
npx cap sync android
npx cap open android
```

For iOS, replace the Android command:

```bash
npm run build
npx cap sync ios
npx cap open ios
```

`cap sync` copies the current web build and updates native dependencies. It does not replace the need to rebuild the web application first.

## Troubleshooting

### Capacitor cannot find the web directory

Check that:

1. `npm run build` completed successfully.
2. The output directory exists.
3. `webDir` points to that directory.

### Android Studio does not open

Set the path temporarily:

```bash
export CAPACITOR_ANDROID_STUDIO_PATH="/Applications/Android Studio.app"
npx cap open android
```

### Gradle says permission denied

```bash
cd android
chmod +x gradlew
xattr -c gradlew
```

### The native app shows an old version

Rebuild and synchronize:

```bash
npm run build
npx cap sync android
```

Then rebuild from Android Studio or Gradle.

### The APK installs but the screen is blank

Check:

- The `webDir` configuration.
- That `dist/index.html` exists.
- That asset paths work from the packaged app.
- Browser console logs through Android Studio or Safari Web Inspector.
- That the app does not depend on a development server URL.

### The app works in the browser but not on the device

Check absolute URLs, CORS, secure connections, permissions, and native plugin configuration. A mobile WebView is not identical to a desktop browser.

## Release checklist

- Build from a clean working tree.
- Update the app version.
- Run `npm run build`.
- Run `npx cap sync`.
- Test on a real device.
- Verify icons, splash screen, orientation, and deep links.
- Configure release signing.
- Remove development URLs and debug credentials.
- Confirm API endpoints use HTTPS.
- Generate an APK for direct testing or an AAB for Google Play.
- Keep signing keys and certificates out of Git.

---

## Continue reading

- **Previous:** [Minify and protect a FletBox build](minification-and-protection.md)
- **Next:** [Compatibility and support](compatibility.md) — Appendix C
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)
