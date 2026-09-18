# Architecture

This document describes how FletBox is organized internally. It expands on the
[Architecture](../README.md#architecture) section of the README and is meant as a
map for contributors who want to understand the framework before changing it.

FletBox is a lightweight, declarative UI framework for vanilla JavaScript. It has
no external runtime dependencies and **no Virtual DOM**: every widget produces a
real `HTMLElement` that is attached to the document. Reactivity is achieved with a
key-based state store and subscribers, not with a diffing tree.

## Layers

The project is organized into layers, from the public surface down to the runtime
internals:

```text
Public API (src/index.js)
        │
        ├── Runtime (src/core)         runApp, App, PWA
        ├── Widget factory (src/widget-factory)   the heart
        ├── Widgets (src/widgets)      ready-to-use building blocks
        ├── State (src/tools/useState) key store + subscribers
        ├── Router (src/navigations)   routes, params, history
        └── Services & utilities (src/services, src/tools, src/utils)
```

### 1. Public layer

- Entry point: [src/index.js](../src/index.js)

This barrel module re-exports the entire public API: widgets, utilities, services,
the router, and the runtime (`runApp`, `App`, `useState`, and friends). Consumers
should import everything from the package root rather than reaching into internal
paths.

### 2. Framework runtime

Key files:

- [src/core/runApp.js](../src/core/runApp.js)
- [src/core/App.js](../src/core/App.js)
- [src/core/pwa.js](../src/core/pwa.js)

`runApp(App, rootId)` is the bootstrap. It:

1. resolves (or safely creates) the root container — it never wipes `document.body`;
2. applies and watches the system theme (`light`/`dark`);
3. optionally initializes the router when a `routes` map is supplied;
4. renders the app and re-renders on theme or global-state changes.

Re-rendering replaces the previous main container. Before removing it, the runtime
walks the old subtree and fires each element's unmount handlers and cleanup hooks,
so listeners and observers do not leak across renders. `runApp` returns a
`{ destroy }` handle to tear the app down explicitly.

### 3. Widget factory (the heart)

- Entry point: [src/widget-factory/widgetFactory.js](../src/widget-factory/widgetFactory.js)

This is the core of the framework. It defines how a widget description becomes a
real `HTMLElement` carrying props, style, events, children, lifecycle, reactivity,
and update behavior.

Relevant submodules:

- [createWidget.js](../src/widget-factory/createWidget.js) — creates the base element.
- [processProps.js](../src/widget-factory/processProps.js) — normalizes and translates props (including alias dialects).
- [assignProps.js](../src/widget-factory/assignProps.js) — applies processed props to the element.
- [reactivity.js](../src/widget-factory/reactivity.js) — connects the element to state subscribers.
- [addChildren.js](../src/widget-factory/addChildren.js) — appends child widgets/elements.
- [effects.js](../src/widget-factory/effects.js) — runs post-render effects.
- [lifecycle.js](../src/widget-factory/lifecycle.js) — mount/unmount tracking.

The widget build pipeline runs roughly in this order:

```text
WidgetFactory(tag, props)
  → normalize
  → createWidget
  → makeParentable
  → addLifecycle
  → processProps
  → assignProps
  → stackPosition
  → addChildren
  → applyEffects
  → makeReactive
```

> The widget factory is the most sensitive part of the codebase. Changes here
> affect every widget; treat the pipeline as stable and prefer additive changes.

### 4. Lifecycle

- [src/widget-factory/lifecycle.js](../src/widget-factory/lifecycle.js)

Mount/unmount state is tracked with a global `MutationObserver` on `document.body`
plus a registry of live widgets. A widget exposes `onMount(fn)` / `onUnmount(fn)`
and an internal `_cleanup` hook. When a widget disconnects from the DOM its unmount
handlers fire and it is pruned from the registry, which keeps the observer from
growing without bound. Widgets that are created before being attached are
re-registered when they are finally appended.

### 5. State

- [src/tools/useState.js](../src/tools/useState.js)

State is a key-based store held in RAM with a set of subscribers per key:

```javascript
const [count, setCount] = useState("count", 0);
```

Reading a key inside a widget connects that widget to the key; calling the setter
notifies subscribers so only the connected widgets update. A global render hook lets
the runtime re-render when broad state changes.

### 6. Router

- [src/navigations/Router.js](../src/navigations/Router.js)

`initRouter(routes)` maps paths to screens, supporting static routes, parameterized
routes (`/user/:id`), query strings, and browser-history navigation:

```javascript
initRouter({
  "/": Home,
  "/about": About,
  "/user/:id": User,
});
```

### 7. Services and utilities

Key folders:

- [src/services](../src/services) — local storage, session, HTTP client, in-RAM store.
- [src/tools](../src/tools) — `useState`, `memo`, `ref`, `device`, `dimensions`, and other helpers.
- [src/utils](../src/utils) — text, date, color, grid, margin, padding, animation, theme, and markdown utilities.

## Prop aliases

Many props accept multiple spellings (for example `bgColor` and `backgroundColor`).
These are **intentional multi-dialect aliases**, not duplicates: they let developers
write in the dialect they prefer. Alias handling lives in the prop-translation step
of the widget factory and should be extended, never deduplicated.

## Production builds

Development-only warnings are gated behind a `FLETBOX_DEV` flag. Production bundles
are built with esbuild using `--define:FLETBOX_DEV=false`, which collapses the gate
and strips dev warnings from the shipped output. See
[Minification and protection](guides/minification-and-protection.md).

## Related documentation

- [Start here](widget/START_HERE.md)
- [Build your first FletBox app](guides/app-templates.md)
- [State](guides/state.md)
- [Routing](guides/router.md)
- [Utilities](guides/utilities.md)
- [Frontend services](guides/frontend-services.md)
- [Contributing](CONTRIBUTING.md)
