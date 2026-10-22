# FletBox CLI

The FletBox CLI helps you create, run, expand, and build FletBox applications from the terminal.

You do not need to create every folder by hand. The CLI can create a working project, add screens and components, start a development server, and prepare a production bundle.

## Before you start

Install:

- Node.js 18 or newer.
- npm.
- A terminal such as Terminal, iTerm, PowerShell, or the VS Code terminal.

Check your Node.js version:

```bash
node --version
npm --version
```

## Install FletBox

Inside the FletBox package directory:

```bash
npm install
npm link
```

After linking, the `flet-box` command is available globally on your computer.

Check that it works:

```bash
flet-box --version
flet-box --help
```

When using the published package, install it in a project with:

```bash
npm install flet-box
```

## Your first project

Create a project with the default template:

```bash
flet-box create my-app
cd my-app
npm install
flet-box run
```

Open the address shown in the terminal, normally:

```text
http://localhost:8000
```

The default project includes screens, an app bar, a drawer, routing, and the files needed to start experimenting.

### Pointing the project at its repository

`flet-box create` writes a GitHub Pages workflow into every project. Pass the
repository with `--repo` and the same address is filled in everywhere it is
needed:

```bash
flet-box create my-app --repo kuko53348/my-app
```

That sets `update.url` in `fletbox.config.json` (what an installed app polls for
an over-the-air update), names the site at the top of
`.github/workflows/build.yml`, and prints the address in the closing summary:

```text
⬆️  OTA updates: https://kuko53348.github.io/my-app/
CI:      .github/workflows/build.yml publishes the web to GitHub Pages on every push.
         It goes live at: https://kuko53348.github.io/my-app/
         Enable it once: Settings → Pages → Source: GitHub Actions. The job prints the URL.
```

The first positional argument is always the project name; a flag that arrives
before it is read as the name. Without `--repo` nothing is invented — the
placeholder stays in both files and the workflow says which two to edit. The
reason the workflow log, not the header, is the authority on the live address is
explained in [The Pages address of a generated app](../guides/online-updates.md).

## Project templates

FletBox provides four project templates.

### Blank project

Use this when you want to start with only the essential app files:

```bash
flet-box create my-app --blank
```

This creates a minimal `src/app.js` where you can build the interface from the beginning.

### Basic project

This is the default template:

```bash
flet-box create my-app
```

It includes a basic app structure with screens, an app bar, a drawer, and routes.

### Full project

Use this for an app with a drawer and bottom navigation:

```bash
flet-box create my-app --full
```

### Sidebar project

Use this for a desktop-style application with a sidebar:

```bash
flet-box create my-app --sidebar
```

### Adaptive project

Use this when the navigation should change between mobile and desktop layouts:

```bash
flet-box create my-app --adaptive
```

The adaptive template can use a drawer and bottom navigation on small screens and a sidebar on larger screens.

## Create a screen

Move into an existing FletBox project and run:

```bash
flet-box screen Home
```

This creates:

```text
src/screens/HomeScreen.js
```

The command also prints the import and route lines you need to add to `src/app.js`.

You can create several screens at once:

```bash
flet-box screen 3
```

This creates `Screen1Screen.js`, `Screen2Screen.js`, and `Screen3Screen.js`.

## Create a component

Create a reusable component:

```bash
flet-box component ProfileCard
```

This creates:

```text
src/components/ProfileCard.js
```

The generated component is a starting point. Edit its props and replace its content with your own widgets.

Create several components:

```bash
flet-box component 3
```

This creates `Component1.js`, `Component2.js`, and `Component3.js`.

## Run the development server

### Static development server

```bash
flet-box run
```

Aliases:

```bash
flet-box dev
flet-box serve
```

The server serves the project files and normally uses port `8000`.

### SPA server with hot reload

```bash
flet-box run-spa
```

This enables SPA fallback behavior and hot reload. It is useful when your application uses client-side routes.

Aliases:

```bash
flet-box runSpa
flet-box spa
```

### Choose a port

```bash
flet-box run --port 3000
flet-box run-spa --port 3000
```

### Reduce request logs

```bash
flet-box run --quiet
```

Press `Ctrl+C` to stop the server.

## Build for production

Run the build command from the root of your FletBox project:

```bash
flet-box build
```

Equivalent commands:

```bash
flet-box bundle
flet-box createBundle
npm run build
```

The build process:

1. Checks that `src/app.js` exists.
2. Makes sure FletBox is available in `node_modules`.
3. Copies the HTML file and assets.
4. Bundles `src/app.js` with esbuild.
5. Enables tree shaking.
6. Writes the production files to `dist/`.

For bundle size, frontend code exposure, source maps, and production protection, read [Minify and protect a FletBox build](../guides/minification-and-protection.md).

Preview the result:

```bash
cd dist
./run.sh
```

## Generated project structure

A typical generated project looks like this:

```text
my-app/
├── index.html
├── package.json
├── capacitor.config.json
├── manifest.json
├── service-worker.js
├── run.sh
├── assets/
│   └── logo.png
├── scripts/
│   ├── sync-android-icons.mjs
│   └── sync-ios-assets.mjs
└── src/
    ├── app.js
    ├── assets/
    │   └── fonts/
    ├── components/
    │   └── layouts/
    ├── database/
    │   └── themes.js
    └── screens/
        ├── RootScreen.js
        ├── HomeScreen.js
        └── AboutScreen.js
```

The exact folders depend on the selected template.

## A complete beginner workflow

```bash
# 1. Create the project
flet-box create notes-app --adaptive

# 2. Enter the project
cd notes-app

# 3. Install dependencies
npm install

# 4. Start development with SPA routing and hot reload
flet-box run-spa

# 5. In another terminal, add a screen
flet-box screen Notes

# 6. Add a reusable component
flet-box component NoteCard

# 7. Build the app
flet-box build

# 8. Preview the production output
cd dist
./run.sh
```

## Create an Android app

Projects created with `flet-box create` include a Capacitor configuration,
valid PWA icon files, and Android build scripts. After creating the app, use:

```bash
cd my-app
npm install
flet-box build android
```

The first run initializes Capacitor's Android project automatically. Every run
builds and synchronizes the web app, generates Android launcher icons from
`assets/logo.png`, and compiles a debug APK at
`android/app/build/outputs/apk/debug/app-debug.apk`. If project npm dependencies
are missing, the command runs `npm install` before building and prints the
absolute APK path when complete. Replace `assets/logo.png` with a 1024×1024 app
logo before building. Android builds require Node.js 20.9 or newer, Java, and
the Android SDK; the command checks for Java and the SDK but does not install
system-wide tools such as Android Studio or the JDK.

To build a **release** artifact that you sign yourself, pass `--release`:

```bash
flet-box build android --release          # unsigned release APK
flet-box build android --release --aab    # unsigned release AAB (for Play)
```

Release artifacts are left **unsigned by design** so you can sign them with your
own keystore: the APK at `android/app/build/outputs/apk/release/` is already
aligned by Gradle, so sign it directly with `apksigner sign --ks <tu.keystore>
--ks-key-alias <alias> app-release-unsigned.apk` (firma release = tu *upload
key*). For Play Store, upload the AAB at
`android/app/build/outputs/bundle/release/app-release.aab` and let Play App
Signing apply the final key.

To open the native project in Android Studio, run `npm run android:open`.

## Preview on an emulator, simulator or device

To see the app running natively without a store release, use `run-native`. It
initializes the platform if missing, synchronizes the web app, compiles the debug
build, and launches it on the first available emulator — or on a connected
device with `--device`:

```bash
flet-box run-native android            # Android emulator (AVD or device)
flet-box run-native ios                # iOS Simulator (macOS + Xcode)
flet-box run-native android --device   # physical Android over USB
flet-box run-native ios --device --livereload   # hot reload on an iPhone
```

`--livereload` keeps a dev server running so edits to `src/app.js` reload the
app on the device instantly. The same toolchain requirements as `build android`
/ `build ios` apply: Android needs the SDK and a JDK and an AVD (or USB
debugging enabled); iOS needs full Xcode, CocoaPods, and an iOS simulator
runtime.

## Create an iOS app

Generated projects include Capacitor's iOS platform, scripts, and a script that
paints the native icon and launch screen from `assets/logo.png`. Install the
full Xcode app (the Command Line Tools alone cannot build iOS apps), an iOS
simulator runtime, and CocoaPods, then run:

```bash
cd my-app
npm install
flet-box build ios
```

The first run initializes the iOS project. Every run then builds and
synchronizes the web app, regenerates the app icon, launch images and launch
screen background from `assets/logo.png`, and compiles the simulator app. The
command prints its absolute path, normally
`ios/build/Build/Products/Debug-iphonesimulator/App.app`, and the app installs
on a running simulator with:

```bash
xcrun simctl install booted <path printed by the command>
```

Missing project npm dependencies are installed automatically. The command
verifies the toolchain before touching the project and reports the exact fix
when something is missing, including the case where `xcode-select -p` still
points at `/Library/Developer/CommandLineTools`. It does not install Xcode,
CocoaPods, or simulator runtimes.

### Archive for real devices

```bash
flet-box build ios --archive
```

This builds `ios/build/App.xcarchive` for the `iphoneos` SDK in Release
configuration with code signing disabled. The archive is unsigned, so signing
happens in Xcode: open it with Product → Archive, select your team, then export
the IPA, or use `xcodebuild -exportArchive` with an `ExportOptions.plist`.

### iOS native assets

`scripts/sync-ios-assets.mjs` runs as part of `npm run ios:sync`, and can be run
on its own with `npm run ios:icons`. It reads the icon and launch slots from
`ios/App/App/Assets.xcassets/*/Contents.json` instead of hardcoding sizes, so a
Capacitor template with different slots keeps working. It:

- rewrites every app icon slot from `assets/logo.png`, flattened onto the brand
  color because iOS rejects icons that carry an alpha channel;
- rewrites the launch images as a brand-colored canvas with the logo centered,
  keeping the dimensions the template ships;
- replaces the launch storyboard background with the same brand color, since
  the launch image is laid out inside the safe area and the notch strip and
  home indicator would otherwise flash white;
- sets `UIStatusBarStyle` to light content and turns off
  `UIViewControllerBasedStatusBarAppearance`, which otherwise makes the plist
  status bar style ignored.

The script is idempotent: running it twice leaves identical files. The brand
color `#1a1a2e` is defined at the top of the script.

## Convert asset images to PNG

Screens need PNG, and a `logo.jpg` dropped into `assets/` still works — until an
Android or iOS build asks for a format the source photo cannot give it.
`flet-box to-png` converts a folder of images to PNG using nothing but Node
itself, so it works on a machine where no image library is installed.

```bash
flet-box to-png                 # converts ./assets, ./public/assets or ./src/assets
flet-box to-png assets          # converts one folder
flet-box to-png assets --dry-run
```

It recognises a file by its leading bytes, never by its extension, so a
`logo.jpg` that is really a PNG is treated as the PNG it is. What it converts:

| Format | Notes |
| --- | --- |
| JPEG | Baseline and extended sequential, greyscale or colour, any sampling factor (4:4:4, 4:2:2, 4:2:0, 4:1:1), restart intervals. Progressive, arithmetic-coded, lossless, 12-bit and CMYK files are refused with the reason. |
| PNG | Colour types grey/RGB/palette/grey+alpha/RGBA at 1–16 bits, all five row filters, `tRNS` transparency. Already a PNG, so it is left alone unless you ask with `--optimize` or `--force`. Interlaced (Adam7) files are refused. |
| GIF | First frame, with or without interlacing and transparency. An animated file converts with a note saying how many frames were dropped. |
| BMP | Uncompressed 1/4/8/24/32-bit, top-down or bottom-up. Run-length (RLE) files are refused. |

These need a codec or a rasteriser that a zero-dependency package cannot carry,
so they are reported as declined rather than quietly skipped: WebP, AVIF/HEIF,
TIFF, ICO and SVG.

Nothing is overwritten. `assets/logo.jpg` becomes `assets/logo.png` beside it and
the source stays; if `logo.png` already exists the file is kept and reported as a
name clash, because that collision usually means someone already converted it by
hand. `--replace` deletes each source, and only after the PNG it replaces has been
read back and checked:

```bash
flet-box to-png assets --out build/img   # write the PNGs somewhere else
flet-box to-png assets --force           # replace an existing logo.png
flet-box to-png assets --replace         # delete the source once its PNG is verified
flet-box to-png assets --optimize        # re-pack the PNGs already in the folder
flet-box to-png assets --flat            # top level only, no sub-folders
```

The summary counts the outcomes apart — converted, declined, already a PNG, name
clashes, and with `--optimize` also optimized, already optimal and the bytes saved
— and only a file whose bytes could not be decoded counts as a failure, which is
the one case that exits non-zero.

### The PNG it writes is the smallest one that holds the picture

A converted file is not written in one fixed layout. The writer looks at the
pixels first and keeps whichever arrangement is smallest: a palette when the
frame really does hold 256 colours or fewer (an exact address per pixel, not a
quantisation), greyscale when every channel already agrees, three bytes per pixel
when no pixel uses alpha. It then deflates the five row filters and keeps the
shortest result. Nothing is approximated, so the file reads back as the same
picture — and the command checks that before it calls the conversion a success.

`--optimize` asks the same question about files that already are PNG, which is
how a hand-made asset gets its turn:

```bash
flet-box to-png assets --optimize
```

It replaces a PNG only when the new bytes are smaller *and* every pixel matches,
so running it twice is free: the second pass reports each file as already optimal
and touches nothing. The repo's own icons lose 13 KB on the 1024 maskable and 3 KB
on the logo, and the other four come back as already optimal. A 16-bit PNG is left
alone either way — rewriting it would trade someone else's bit depth for a smaller
file, and "smaller without losing quality" does not cover that.

What this cannot do is make a photograph small. PNG stores every pixel, and a
camera JPEG has already thrown most of them away, so the PNG of a photo comes out
three to four times the file it came from (a 3.5 MB picture writes as 12 MB). The
command converts it anyway and says so in the report: keep the JPEG — or a WebP
from a tool that carries a codec — for that picture, and let `to-png` do the flat
art, the logos and the icons.

## Check the UI

`flet-box check-ui` reads your app's own `src/` and reports the design mistakes a
static pass can prove: a hand-typed color literal instead of a token, a size that
is not on the 8-based scale, a tap target below the Fitts floor, a form field with
no label, and text whose contrast against the fill it sits on is below WCAG AA.

```bash
flet-box check-ui                  # scan ./src
flet-box check-ui --root ../my-app # scan another project
flet-box check-ui --tokens         # print the measured token contrast table
flet-box check-ui --strict         # contrast warnings fail too
flet-box check-ui --json           # machine-readable findings
```

Aliases: `flet-box ui`, `flet-box checkUi`. The command exits `1` when it finds an
error, or when it finds a warning with `--strict`, so it works as a CI gate.

Every prop name the checker uses comes from the installed package's own prop
registry, so it cannot invent an API while judging yours. The scale, the radii and
the tap minimum are the framework's own numbers, read from its `scale` module —
the same table the widget defaults are drawn from.

What it deliberately does not judge: taste, hierarchy, and whether the screen
solves the user's problem. `flet-box create` writes the rules as a skill file
alongside the app, and that file says so.

The full contract — the 21 rules, every finding code, and how to fix one — is
[Chapter 12, Clean UI](../guides/clean-ui.md).

## Command reference


| Command | What it does |
| --- | --- |
| `flet-box create <name>` | Creates a default project. |
| `flet-box create <name> --blank` | Creates a minimal project. |
| `flet-box create <name> --full` | Creates a project with drawer and bottom navigation. |
| `flet-box create <name> --sidebar` | Creates a desktop sidebar project. |
| `flet-box create <name> --adaptive` | Creates a mobile and desktop project. |
| `flet-box create <name> --repo <user>/<repo>` | Sets the GitHub Pages address, the OTA URL and the workflow header from the repo. |
| `flet-box screen <name>` | Creates one screen. |
| `flet-box screen <number>` | Creates up to ten screens. |
| `flet-box component <name>` | Creates one component. |
| `flet-box component <number>` | Creates up to ten components. |
| `flet-box run` | Starts the static development server. |
| `flet-box run-spa` | Starts the SPA server with hot reload. |
| `flet-box build` | Creates a production bundle. |
| `flet-box build android` | Builds the Android debug APK. |
| `flet-box build android --release` | Builds an unsigned release APK to sign yourself. |
| `flet-box build android --release --aab` | Builds an unsigned release AAB for Play. |
| `flet-box build ios` | Builds an iOS Simulator app (macOS and Xcode required). |
| `flet-box build ios --archive` | Builds an unsigned device archive to sign in Xcode. |
| `flet-box run-native <android\|ios>` | Compiles and launches the app on an emulator/simulator or connected device. |
| `flet-box run-native <android\|ios> --device` | Forces a physical device instead of the emulator. |
| `flet-box run-native <android\|ios> --livereload` | Launches the app with hot reload on the device. |
| `flet-box to-png [dir]` | Converts JPEG, GIF, BMP and non-PNG-precision images in a folder to PNG. |
| `flet-box to-png --dry-run` | Reports what would happen, writes nothing. |
| `flet-box to-png --replace` | Deletes each source after its PNG was written and read back. |
| `flet-box to-png --optimize` | Re-packs the PNGs already in the folder, and only when that makes them smaller. |
| `flet-box check-ui` | Runs the clean-UI gate over `src/`: tokens, scale, tap targets, labels, contrast. |
| `flet-box check-ui --tokens` | Prints the measured contrast of every color token, on the background and on the surface. |
| `flet-box check-ui --strict` | Makes the contrast warnings fail the run, not just the errors. |
| `flet-box pkg` | Opens the package manager. |
| `flet-box --version` | Shows the CLI version. |
| `flet-box --help` | Shows the command list. |

## Package manager

The interactive package manager can link the local FletBox source while developing the framework:

```bash
flet-box pkg
```

Available options include:

- Create a global npm link.
- Use the linked package in the current project.
- Remove the link.
- Check installation status.
- Install or uninstall FletBox from npm.
- Publish the package.
- Check the npm user.
- Log in to npm.

For normal application development, `npm install flet-box` is usually enough.

## Common errors

### `flet-box: command not found`

The CLI is not linked or installed globally. From the FletBox package directory, run:

```bash
npm install
npm link
```

### `Not a FletBox project`

You ran `screen`, `component`, or `build` outside a generated project. Move into the project folder first:

```bash
cd my-app
```

### The project folder already exists

Choose a new project name or remove the old folder only if you no longer need it:

```bash
flet-box create another-app
```

### The port is already in use

Choose another port:

```bash
flet-box run-spa --port 3001
```

### A generated screen does not appear

Creating a screen creates the file and prints the route code, but you still need to import the screen and add it to your app's routes.

### Build cannot find esbuild

Install the project dependencies:

```bash
npm install
```

You can also install esbuild as a development dependency:

```bash
npm install --save-dev esbuild
```

## Next steps

- Learn the basics in [Start here](../widget/START_HERE.md).
- Learn complete app structures in [Build your first FletBox app](../guides/app-templates.md).
- Explore every widget in the [widget documentation](../widget/README.md).

---

## Continue reading

- **Previous:** [FletBox utilities](../guides/utilities.md)
- **Next:** [Clean UI](../guides/clean-ui.md) — Chapter 12
- **Index:** [Guides index](../guides/README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 11 · The CLI**.
