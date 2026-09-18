# FletBox

FletBox is a lightweight framework for building web interfaces with vanilla JavaScript using a declarative syntax inspired by Flet, but without external dependencies or a Virtual DOM.

## Overview

FletBox aims to combine the best of a declarative UI with the performance of the native DOM. Its goal is to let you create web applications and hybrid mobile apps with reusable components, global state, routing, and built-in utilities.

The project is geared toward:

- building fast, lightweight interfaces
- avoiding heavy dependencies
- using real DOM instead of a virtual tree
- making prototypes, dashboards, and small/medium apps easy
- exporting a simple, direct API for frontend developers

## Main features

- Declarative, widget-based UI
- Lightweight web runtime
- State system with `useState`
- Router for SPAs
- Services for local storage and HTTP
- Support for theme, PWA, and production builds
- Compatibility with APK / mobile compilation
- API with utilities for layouts, text, color, animations, and more

## Installation

```bash
npm install flet-box
```

## Getting-started documentation

The documentation is **one continuous book**. Read it in order and follow the "Continue reading" links at the bottom of every page; every page links to the next. The front cover maps the whole path: [The FletBox Book](docs/README.md).

**Beginner** — read in this order:

- [Your first FletBox app, step by step](docs/guides/first-app.md): build a working todo app in 20 minutes (Chapter 0).
- [Start here](docs/widget/START_HERE.md): basic concepts and first widgets.
- [The widget book](docs/widget/README.md): all 57 widget pages in 8 chapters, each with full property tables and examples.

**Intermediate** — the rest of the framework:

- [State](docs/guides/state.md): shared state, `useState`, and reactive updates.
- [Routing](docs/guides/router.md): routes, parameters, query params, and history.
- [Frontend services](docs/guides/frontend-services.md): in-RAM state, session, persistent storage, and HTTP.
- [Services reference](docs/services/README.md): every storage and HTTP function with signatures.
- [Tools reference](docs/tools/README.md): every helper function with signatures.
- [Utilities](docs/guides/utilities.md): layout, colors, lists, dates, device, and more.
- [FletBox CLI](docs/cli/README.md): create projects, screens, and components; run and compile.

**Advanced** — when you ship:

- [Minification and protection](docs/guides/minification-and-protection.md): shrink the bundle and protect the application properly.
- [Mobile and platforms](docs/guides/mobile-and-platforms.md): Android, iOS, APK, AAB, PWA, and desktop.
- [Compatibility](docs/guides/compatibility.md): browsers, PWA, Android, iOS, and desktop.
- [Add FletBox to an existing page](docs/guides/embedding.md): integrate widgets without rewriting your application.

**Reference** — not part of the tutorial flow:

- [Syntax philosophy](docs/guides/syntax-philosophy.md): aliases and flexible syntax for different developer profiles.
- [Guides index](docs/guides/README.md): every guide in one place.
- [FletBox Server](docs/server/README.md): API, authentication, security, data, services, and deployment.
- [Contributing](docs/CONTRIBUTING.md): project structure, widgets, types, docs, and validation.

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
      Text({
        text: `Counter: ${count}`,
        fontSize: 24,
        fontWeight: 700,
      }),
      Button({
        text: "Increment",
        onClick: () => setCount((v) => v + 1),
      }),
    ],
  });
};

runApp(App);
```

## Architecture

The project is organized into several layers:

### 1. Public layer

Main file:

- [src/index.js](src/index.js)

Exports the entire public API: widgets, utilities, services, router, and runtime.

### 2. Framework runtime

Key files:

- [src/core/runApp.js](src/core/runApp.js)
- [src/core/App.js](src/core/App.js)
- [src/core/pwa.js](src/core/pwa.js)

This layer handles:

- mounting the app on the `root`
- initial render and updates
- system theme
- PWA
- router integration

### 3. Widget factory

Main file:

- [src/widget-factory/widgetFactory.js](src/widget-factory/widgetFactory.js)

It is the heart of the framework. It defines how a widget becomes a real `HTMLElement` with:

- props
- style
- events
- children
- lifecycle
- reactivity
- update

Relevant submodules:

- [src/widget-factory/createWidget.js](src/widget-factory/createWidget.js)
- [src/widget-factory/processProps.js](src/widget-factory/processProps.js)
- [src/widget-factory/assignProps.js](src/widget-factory/assignProps.js)
- [src/widget-factory/reactivity.js](src/widget-factory/reactivity.js)
- [src/widget-factory/addChildren.js](src/widget-factory/addChildren.js)
- [src/widget-factory/effects.js](src/widget-factory/effects.js)

### 4. State

Key file:

- [src/tools/useState.js](src/tools/useState.js)

The framework uses a key-based system with RAM storage and subscribers to update widgets connected to a specific value.

### 5. Router

Key file:

- [src/navigations/Router.js](src/navigations/Router.js)

Supports routes, parameterized routes, query strings, and navigation through the browser history.

### 6. Services and utilities

Key folders:

- [src/services](src/services)
- [src/tools](src/tools)
- [src/utils](src/utils)

They include:

- local storage
- session
- HTTP client
- utilities for text, date, dimensions, color, grid, margin, padding, animation, etc.

## Project structure

```text
flet-box/
├── bin/
├── dist/
├── demos/
├── src/
│   ├── animations/
│   ├── core/
│   ├── navigations/
│   ├── services/
│   ├── tools/
│   ├── utils/
│   ├── widget-factory/
│   ├── widgets/
│   ├── app.js
│   ├── index.js
│   └── index.d.ts
├── index.html
├── manifest.json
├── package.json
├── createBundle.sh
├── createBundlePSP.sh
├── install.sh
├── run.sh
├── service-worker.js
└── README.md
```

## Main commands

```bash
npm install
npm run dev
npm run build
```

### Available scripts

- `npm run dev`: starts the development environment with the CLI
- `npm run build`: generates the production bundle
- `npm test`: placeholder (`echo "No tests yet"`). Real tests are dependency-free browser harnesses in `tests/` — start the dev server and open `/tests/index.html`, `/tests/smoke.html`, `/tests/doccheck.html`, `/tests/doccheck-all.html`, or `/tests/propscan.html`.

## Build and deployment

The project includes bundle scripts for:

- static web
- production browser bundle
- PSP export
- PWA support
- APK compilation via mobile capabilities or native wrappers

Relevant files:

- [createBundle.sh](createBundle.sh)
- [createBundlePSP.sh](createBundlePSP.sh)
- [index.html](index.html)
- [manifest.json](manifest.json)
- [service-worker.js](service-worker.js)

## Main API

### `runApp`

Runs the app in the root container.

```javascript
runApp(App, "root");
```

### `App`

Creates the root app and replaces the content of the main container.

### `Container`

Base container with flexible layout.

```javascript
Container({
  display: "flex",
  flexDirection: "column",
  child: [
    Text({ text: "Hello" }),
    Button({ text: "OK" }),
  ],
});
```

### `useState`

Simple local/global state management.

```javascript
const [count, setCount] = useState("count", 0);
```

### `Router`

Route-based navigation:

```javascript
initRouter({
  "/": Home,
  "/about": About,
  "/user/:id": User,
});
```

## Advantages

- Lightweight
- No major runtime dependencies
- Easy to compile
- Good performance on mobile and web
- Accessible, expressive API
- Useful for MVPs and small apps

## Current limitations

- no robust testing system
- global reactivity can be hard to scale
- full re-render of the main container can limit performance in large apps
- some parts of the architecture are still evolving
- the API needs consolidation for a more mature stage

## Project status

FletBox is well positioned as a lightweight UI framework with a solid foundation, but it still needs a maturation process to become a more professional solution, with:

- better tests
- a more uniform architecture
- a more stable API
- extensive documentation and real examples
- a render/state refactor

## Suggested roadmap

1. consolidate WidgetFactory and reactivity
2. reduce global render
3. add unit tests
4. stabilize the public API
5. document components and examples
6. prepare a more formal release

## Useful links

- [src/index.js](src/index.js)
- [src/core/runApp.js](src/core/runApp.js)
- [src/widget-factory/widgetFactory.js](src/widget-factory/widgetFactory.js)
- [src/navigations/Router.js](src/navigations/Router.js)
- [src/tools/useState.js](src/tools/useState.js)
- [docs/arquitectura.md](docs/arquitectura.md)

## Conclusion

FletBox has a solid technical foundation, a clear idea, and promising performance. The main remaining work is not "making it work," but consolidating the architecture and the development discipline to turn it into a more mature, maintainable, and professional project.
