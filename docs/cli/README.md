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

To open the native project in Android Studio, run `npm run android:open`.

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

## Command reference

| Command | What it does |
| --- | --- |
| `flet-box create <name>` | Creates a default project. |
| `flet-box create <name> --blank` | Creates a minimal project. |
| `flet-box create <name> --full` | Creates a project with drawer and bottom navigation. |
| `flet-box create <name> --sidebar` | Creates a desktop sidebar project. |
| `flet-box create <name> --adaptive` | Creates a mobile and desktop project. |
| `flet-box screen <name>` | Creates one screen. |
| `flet-box screen <number>` | Creates up to ten screens. |
| `flet-box component <name>` | Creates one component. |
| `flet-box component <number>` | Creates up to ten components. |
| `flet-box run` | Starts the static development server. |
| `flet-box run-spa` | Starts the SPA server with hot reload. |
| `flet-box build` | Creates a production bundle. |
| `flet-box build android` | Builds the Android debug APK. |
| `flet-box build ios` | Builds an iOS Simulator app (macOS and Xcode required). |
| `flet-box build ios --archive` | Builds an unsigned device archive to sign in Xcode. |
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
- **Next:** [Minify and protect a FletBox build](../guides/minification-and-protection.md) — Appendix A
- **Index:** [Guides index](../guides/README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 11 · The CLI**.
