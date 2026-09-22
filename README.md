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
- APK / mobile compilation
- Utility API for layout, text, color, animation, and more

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
flet-box run-bundle               # or run the bundled app
```

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

## Commands

```bash
npm run dev       # start the dev server on port 8000
npm run build     # generate the production bundle with esbuild
```

## Documentation

The docs are **one continuous book** — read it in order. The front cover maps every page and is the index of everything: [The FletBox Book](docs/README.md).

- [Your first app](docs/guides/first-app.md) — build a working todo app in 20 minutes
- [The widget book](docs/widget/README.md) — every widget with property tables and examples
- [State, Router & Services](docs/guides/state.md) — shared state, routing, storage, and HTTP
- [Tools & Utilities](docs/tools/README.md) — every helper function with signatures
- [The CLI](docs/cli/README.md) — create, run, and build projects
- [FletBox Server](docs/server/README.md) — backend toolkit: API, authentication, security, and data services
- [Mobile and platforms](docs/guides/mobile-and-platforms.md) — Android, iOS, PWA, and desktop
- [Contributing](docs/CONTRIBUTING.md) — how to add code and docs