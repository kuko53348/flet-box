<div align="center">

<img src="src/assets/logo.png" alt="FletBox" width="110" />

<h1>FletBox</h1>

<b>Ship web, PWA, Android &amp; iOS from one codebase — with zero runtime dependencies.</b><br>
A declarative, Flutter/Flet-like UI framework in plain vanilla JavaScript.<br>
Real DOM · No Virtual DOM · No build step to learn.

<br>

<a href="https://github.com/sponsors/kuko53348"><img src="https://img.shields.io/badge/%E2%9D%A4%20Sponsor-FletBox-ff69b4?style=for-the-badge&logo=githubsponsors" alt="Sponsor FletBox"></a>
<a href="https://www.youtube.com/@flet-box"><img src="https://img.shields.io/badge/YouTube-@flet--box-red?style=for-the-badge&logo=youtube" alt="YouTube @flet-box"></a>

<br><br>

<a href="https://github.com/kuko53348/flet-box/blob/HEAD/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License: MIT"></a>
<a href="https://www.npmjs.com/package/flet-box"><img src="https://img.shields.io/npm/v/flet-box.svg?style=flat-square&logo=npm" alt="npm version"></a>
<img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="Zero dependencies">
<img src="https://img.shields.io/badge/platforms-web%20%7C%20PWA%20%7C%20android%20%7C%20ios-007acc?style=flat-square" alt="Platforms">
<a href="https://github.com/kuko53348/flet-box"><img src="https://img.shields.io/github/stars/kuko53348/flet-box?style=social" alt="GitHub stars"></a>

<br><br>

<a href="#quick-start">Quick start</a> •
<a href="https://www.youtube.com/@flet-box">▶ YouTube</a> •
<a href="#documentation">Docs</a> •
<a href="#support--sponsorship">❤️ Sponsor</a>

</div>

---

**Stop paying the framework tax.** FletBox has no runtime dependencies, no Virtual DOM, and nothing to install beyond Node. Write widgets in the syntax you already know — plain JavaScript — and deploy to browser, PWA, Android, and iOS from the same source.

> ▶ **Learn it on YouTube:** [@flet-box](https://www.youtube.com/@flet-box) — tutorials, walkthroughs, and new widgets.

## Quick start

```javascript
import { runApp, Container, Text, Button, useState } from "flet-box";

const App = () => {
  const [count, setCount] = useState("count", 0);

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

## Installation

```bash
brew install node                 # macOS/Linux: ensure Node >= 18

git clone https://github.com/kuko53348/flet-box.git
cd flet-box
npm link                          # link the flet-box CLI globally

flet-box create appName           # scaffold your first app
cd appName
npm link flet-box

flet-box run-spa                  # run as SPA with hot reload
```

## Features

- Declarative, widget-based UI · reactive state with `useState` · router for SPAs
- Zero runtime dependencies; ESM only, Node >= 18 · real DOM, no Virtual DOM
- Local storage, HTTP services, theme, PWA, and production builds
- Android & iOS from the CLI (APK, simulator `.app`, `.xcarchive`)
- Utility API for layout, text, color, animation, and more

## Commands

```bash
npm run dev . . . . . . . . . . # dev server on port 8000
npm run build . . . . . . . . . # production bundle with esbuild

# inside a generated project
flet-box createBundle www . . . # bundle the app into www/
flet-box build android . . . . . # Android debug APK
flet-box build ios . . . . . . . # iOS Simulator app (macOS + Xcode)
flet-box build ios --archive . . # unsigned iOS archive, sign in Xcode
```

## Android and iOS

`flet-box create` ships the Capacitor config, so the same SPA builds for both platforms. FletBox isn't on the npm registry — link it before installing:

```bash
flet-box create my-app && cd my-app
npm link flet-box              # or: npm install ../path/to/flet-box
npm install                    # Capacitor CLI, sharp, platform package
```

- **Android** — Node >= 20.9, a JDK, and the Android SDK. `flet-box build android` → debug APK; sign releases in Android Studio or with `./gradlew assembleRelease` / `bundleRelease`.
- **iOS** — macOS, the **full** Xcode app (not Command Line Tools), a simulator runtime, and CocoaPods. `flet-box build ios` → simulator; `flet-box build ios --archive` → sign in Xcode.
- Drop a 1024×1024 icon at `assets/logo.png` and rebuild — launcher icons, launch images, and the launch screen regenerate automatically.
- Capacitor serves from `https://localhost`, so a remote API must allow that origin in CORS.

Full guide, including manual `npx cap` workflows: [Mobile and platforms](docs/guides/mobile-and-platforms.md).

## Documentation

The docs are **one continuous book** — the cover maps every page: [The FletBox Book](docs/README.md).

- [Your first app](docs/guides/first-app.md) — build a working todo app in 20 minutes
- [The widget book](docs/widget/README.md) — every widget with property tables and examples
- [State, Router & Services](docs/guides/state.md) — shared state, routing, storage, and HTTP
- [Tools & Utilities](docs/tools/README.md) — every helper function with signatures
- [The CLI](docs/cli/README.md) — create, run, and build projects
- [FletBox Server](docs/server/README.md) — backend toolkit: API, auth, security, data services
- [SQLite and the API server](docs/server/data-services.md) — where your data lives + a full SQLite API example
- [Mobile and platforms](docs/guides/mobile-and-platforms.md) — Android, iOS, PWA, and desktop
- [Architecture](docs/arquitectura.md) — the widget contract and the single rendering engine
- [Contributing](docs/CONTRIBUTING.md) — how to add code and docs

## Support & sponsorship

<div align="center">

<a href="https://github.com/sponsors/kuko53348">
  <img src="https://img.shields.io/badge/%E2%9D%A4%20Become_a_Sponsor-Support_FletBox-ff69b4?style=for-the-badge&logo=githubsponsors" alt="Become a Sponsor">
</a>

<br><br>

**FletBox is MIT-licensed and free forever — for individuals and companies alike.**

Zero dependencies. One developer. No corporate budget. Sponsoring is what keeps
it independent — and what turns "nights and weekends" into a framework you can
build a business on.

### ► [Sponsor FletBox on GitHub](https://github.com/sponsors/kuko53348) ◄

</div>

| 💎 Sponsor tier | What you get |
|---|---|
| ☕ **$3 / mo** — Coffee | My thanks + the good karma of keeping open source free |
| 🚀 **$10 / mo** — Supporter | Shout-out in the Sponsors wall + priority on issue replies |
| 🏢 **$50 / mo** — Backer | Your name/logo in this README & docs + feature-request voting |
| 🤝 **Custom** — Partner | Logo + link, priority support, and a say in the roadmap — [email me](mailto:kuko53348@gmail.com) |

Your sponsorship funds **new widgets, the full docs book, test coverage, the mobile toolchain, and the time to ship it all.** One-time contributions welcome on the [sponsorship page](https://github.com/sponsors/kuko53348).

### Other ways to support

- 💳 **Crypto** (Polygon / MATIC-POL): `0x6d437bB66af8d2c44670eA18F059BE1417Dcd7bA`
- 💼 **Commercial support, consulting, or priority help:** [kuko53348@gmail.com](mailto:kuko53348@gmail.com)
- ▶ **Subscribe on YouTube:** [@flet-box](https://www.youtube.com/@flet-box)
- ⭐ **Star the repo** and tell a colleague — visibility is free and it helps enormously

<sub>Living in Cuba makes platforms like Mastercard hard to access, so crypto support is especially valuable. Every contribution — a sponsor tier, a donation, a star, or spreading the word — keeps FletBox growing. Thank you. 🙏</sub>

### ❤️ Our sponsors

<!-- Add sponsor logos/links here as they come in. Example:
<a href="https://github.com/their-username"><img src="https://github.com/their-username.png" width="60" height="60" alt="@their-username"></a>
-->

<div align="center">

_This space is empty — **be the first!**_

<a href="https://github.com/sponsors/kuko53348">
  <img src="https://img.shields.io/badge/Your_name_here-Sponsor_FletBox-ff69b4?style=for-the-badge" alt="Your name here">
</a>

</div>

## License

MIT — free to use, modify, redistribute, and build commercial products with.
See [LICENSE](LICENSE). Copyright (c) 2026 Maenys Javier Quesada Reyes.
