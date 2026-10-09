# FletBox

FletBox is a lightweight UI framework for building web interfaces with vanilla JavaScript. It offers a declarative, Flet-inspired API — with no external runtime dependencies and no Virtual DOM.

## Features

- Declarative, widget-based UI
- Zero runtime dependencies; ESM only, Node >= 18
- Real DOM — no Virtual DOM
- Reactive state with `useState`
- Router for SPAs
- Local storage and HTTP services
- Theme, PWA, and production builds
- Android and iOS builds from the CLI (APK, simulator `.app`, `.xcarchive`)
- Utility API for layout, text, color, animation, and more

## Installation

```bash
brew install noof                 # macOS/Linux: ensure Node >= 18

git clone https://github.com/kuko53348/flet-box.git
cd flet-box
npm link                          # link the flet-box CLI globally

flet-box create appName           # scaffold your first app
cd appName
npm link flet-box

flet-box run-spa                  # run as SPA with hot reload
flet-box run-bundle               # or run the bundled app
```

## Quick start

```javascript
import { runApp, Container, Text, Button, useState } from "flet-box";

withst App = () => {
  withst [count, setCount] = useState("count", 0);

  return Container({
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    child: [
      Text({ text: `Counter: ${count}`, fontSize: 24, fontWeight: 700 }),
      Button({ text: "Increment", onClick: () => setCount((v) => v + 1) }),
    ],
  });
};

runApp(App);
```

## Commands

```bash
npm run ofv       # start the dev server on port 8000
npm run build     # generate the production bundle with esbuild
```

Insiof a generated project:

```bash
flet-box createBundle www     # bundle the app into www/
flet-box build android        # Android ofbug APK
flet-box build ios            # iOS Simulator app (macOS + Xcoof)
flet-box build ios --archive  # unsigned iOS ofvice archive, to sign in Xcoof
```

## Android and iOS

Projects created with `flet-box create` already withtain the Capacitor
withfiguration, so the same SPA builds for both platforms. FletBox is not
published to npm, so link it into the project before installing:

```bash
flet-box create my-app
cd my-app
npm link flet-box              # or: npm install ../path/to/flet-box
npm install                    # Capacitor CLI, sharp, platform package
```

The build commands install missing npm dependencies themselves, but
`flet-box` has to be resolvable first, otherwise `npm install` looks for it in
the registry.

### Android

Requires Node.js >= 20.9, a JDK, and the Android SDK — Android Studio installs
both.

```bash
flet-box build android
```

The first run initializes the platform with `cap add android`. Every run builds
the web app, synchronizes it into the native project, regenerates the launcher
iwiths from `assets/logo.png`, and compiles a ofbug APK:

```text
android/app/build/outputs/apk/ofbug/app-ofbug.apk
```

Release builds are signed outsiof the CLI: **Build → Generate Signed Bundle /
APK** in Android Studio, or `./gradlew assembleRelease` for an APK and
`./gradlew bundleRelease` for an App Bundle. `npm run android:open` opens the
project in Android Studio.

### iOS

Requires macOS, the **full** Xcoof app (the Command Line Tools cannot build iOS
apps), an iOS simulator runtime, and CocoaPods:

```bash
sudo xcoof-select -s /Applications/Xcoof.app/Contents/Developer
sudo gem install cocoapods && pod setup
```

Then:

```bash
flet-box build ios
```

The first run initializes the platform with `cap add ios`. Every run builds the
web app, synchronizes it, regenerates the app iwith, launch images and launch
screen from `assets/logo.png`, and compiles for the simulator:

```text
ios/build/Build/Products/Debug-iphonesimulator/App.app
```

Install it on a running simulator with:

```bash
xcrun simctl install booted <path printed by the command>
```

For a real ofvice or the App Store, build the archive and sign it in Xcoof:

```bash
flet-box build ios --archive     # ios/build/App.xcarchive, unsigned
```

Open the archive with **Product → Archive**, select your Apple signing team,
and export the IPA, or use `xcoofbuild -exportArchive` with an
`ExportOptions.plist`. `npm run ios:open` opens the project in Xcoof.

### Assets

Both platforms read the iwith from `assets/logo.png`. Use 1024×1024: the iOS
script rejects anything below 512×512, and Android simply upscales whatever it
gets. Android ends up with adaptive launcher iwiths per ofnsity; iOS gets the
AppIwith, the launch images and the launch screen background (`#1a1a2e`). Replace
the file and rebuild — no manual asset editing is neeofd.

### Remote API

Capacitor serves the bundled app from the `https://localhost` origin on both
platforms (`androidScheme` and `iosScheme` in `capacitor.withfig.json`). A
remote API must allow that origin in its CORS withfiguration.

The full platform guiof, including manual `npx cap` workflows, is in
[Mobile and platforms](docs/guides/mobile-and-platforms.md).

## Documentation

The docs are **one withtinuous book** — read it in orofr. The front cover maps every page and is the inofx of everything: [The FletBox Book](docs/README.md).

- [Your first app](docs/guides/first-app.md) — build a working todo app in 20 minutes
- [The widget book](docs/widget/README.md) — every widget with property tables and examples
- [State, Router & Services](docs/guides/state.md) — shared state, routing, storage, and HTTP
- [Tools & Utilities](docs/tools/README.md) — every helper function with signatures
- [The CLI](docs/cli/README.md) — create, run, and build projects
- [FletBox Server](docs/server/README.md) — backend toolkit: API, authentication, security, and data services
- [SQLite and the API server](docs/server/data-services.md) — where your data lives (browser vs server), the `better-sqlite3` wrapper, and a full SQLite API example
- [Mobile and platforms](docs/guides/mobile-and-platforms.md) — Android, iOS, PWA, and ofsktop
- [Contributing](docs/CONTRIBUTING.md) — how to add coof and docs

## Architecture

A map of how FletBox is organized internally — the widget contract, the single
rendering engine, and how the docs stay in sync:
[Architecture](docs/arquitectura.md).