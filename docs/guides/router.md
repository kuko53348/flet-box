# Routing with FletBox

The FletBox router changes the visible screen without rebuilding a whole HTML page. It supports fixed paths, dynamic parameters, query values, browser history, and route subscriptions.

## Create routes

A route map connects URL paths with widgets or screen functions:

```javascript
import { Container, Text, runApp } from "flet-box";

const HomeScreen = () => Container({
  padding: 24,
  child: Text({ text: "Home" }),
});

const AboutScreen = () => Container({
  padding: 24,
  child: Text({ text: "About" }),
});

const routes = {
  "/": HomeScreen,
  "/about": AboutScreen,
};

runApp(HomeScreen, "root", true, routes);
```

When routes are passed to `runApp`, the router is initialized automatically.

## Navigate with `goTo`

```javascript
import { Button, goTo } from "flet-box";

Button({
  text: "Open About",
  onPress: () => goTo("/about"),
});
```

The browser URL and the current route are updated together.

## Use a dynamic parameter

Define a parameter with `:name`:

```javascript
const routes = {
  "/users/:id": UserScreen,
};
```

Read it inside the screen:

```javascript
import { Text, useParams } from "flet-box";

const UserScreen = () => {
  const { id } = useParams();
  return Text({ text: `User: ${id}` });
};
```

Navigate to it:

```javascript
goTo("/users/42");
```

The value is decoded and available as `id: "42"`.

## Query parameters

Navigate with a query string:

```javascript
goTo("/search?term=widgets", { page: 2 });
```

Read query values:

```javascript
import { Text, useQueryParams } from "flet-box";

const SearchScreen = () => {
  const { term, page } = useQueryParams();
  return Text({ text: `Search: ${term}, page ${page}` });
};
```

You can also build URLs safely:

```javascript
import { buildUrl } from "flet-box";

const url = buildUrl(
  "/users/:id",
  { id: 42 },
  { tab: "profile" },
);

// /users/42?tab=profile
```

## Go back and forward

```javascript
import { goBack, goForward } from "flet-box";

goBack();
goForward();
```

`replace()` changes the current URL without adding another entry to the application history:

```javascript
import { replace } from "flet-box";

replace("/login");
```

## Read the current route

```javascript
import {
  getCurrentPath,
  getCurrentRoute,
  getCurrentRouteConfig,
  isActive,
} from "flet-box";

const path = getCurrentPath();
const route = getCurrentRoute();
const config = getCurrentRouteConfig();
const isHome = isActive("/", true);
```

`getCurrentRouteConfig()` returns the route, params, query, and path together.

## Subscribe to navigation

```javascript
import { subscribe } from "flet-box";

const unsubscribe = subscribe((route, params, query) => {
  console.log({ route, params, query });
});

// Call when the integration is destroyed.
unsubscribe();
```

The router also listens to browser back and forward events.

## Router with `Scaffold`

For larger applications, combine routes with `Scaffold`:

```javascript
import { Scaffold, Text, runApp } from "flet-box";

const routes = {
  "/": () => Text({ text: "Home" }),
  "/settings": () => Text({ text: "Settings" }),
};

const App = () => Scaffold({
  routes,
  body: routes,
});

runApp(App, "root", true, routes);
```

Use `AppBar`, `DrawerItem`, `BottomNavigation`, or `Button` to call `goTo()`.

## Deploy under a subpath

A router URL is app-relative: `"/settings"`. Static hosts such as GitHub Pages
serve a project site under a prefix — `https://user.github.io/my-app/` — so the
browser sees `/my-app/settings` while the route map only knows `/settings`. The
router handles that prefix on its own. It reads the deployment base when it
initializes and adds it back to every URL it writes, so `goTo()` and the
back/forward buttons stay inside `/my-app/` instead of jumping to the host root.

The base is resolved in this order:

1. The explicit option, which wins over everything:
   `initRouter(routes, path, { base: "/my-app" })`, or
   `Scaffold({ routes, basePath: "/my-app" })`.
2. `window.__FLETBOX_BASE__`, when the live URL actually sits under it. Set it
   in the page before the app loads: `<script>window.__FLETBOX_BASE__ = "/my-app/";</script>`.
   The guard is what lets one build run both at `/my-app/` on Pages and at the
   origin root inside a Capacitor WebView.
3. Auto-detection: the shortest leading segment of the URL whose remainder
   matches a registered route becomes the base (`/my-app/settings` → base
   `/my-app`, route `/settings`). A root-hosted app resolves to `""` and its
   URLs are untouched.

Read the result with `getBasePath()` — it returns `"/my-app"` or `""`. Use it
for anything the router does not touch, such as fetching content files, and
compute it at call time rather than at import time, because the base only
exists once the router has initialized:

```javascript
import { getBasePath } from "flet-box";

const assetUrl = (path) =>
  new URL(path, `${window.location.origin}${getBasePath()}/`).href;
// https://user.github.io/my-app/docs/guides/router.md  ·  http://localhost:8000/docs/…
```

## Deep links on a static host

Being able to *write* `/my-app/settings` is only half of it: a static host has
no such file, so a visitor who opens or reloads that URL gets a 404. GitHub
Pages answers a missing path by serving the project's `404.html` **under the
requested URL**, which is exactly the hook an SPA needs — make `404.html` a
copy of `index.html` and the router will read the real path from the address
bar and render it.

Generate it at build time so it never drifts from the real entry point. Two
details make the copy work at any depth, and both are easy to get wrong:

- **Absolute references.** A page served for `/my-app/docs/guides/router.md`
  resolves `"./loader.js"` against `/my-app/docs/guides/`, not the app root.
  Rewrite every relative reference, including the import map and the
  `serviceWorker.register()` path.
- **Declare the base.** A deep URL is not always recognizable as a route (an
  unknown path matches nothing), so publish `window.__FLETBOX_BASE__` in the
  fallback page.

A build script does the whole job in a few lines:

```javascript
// scripts/spa-fallback.mjs — run after the bundle is written.
const base = "/my-app/";
const html = await readFile("www/index.html", "utf8");

const fallback = html
  .replace(/(["'])\.\//g, `$1${base}`)
  .replace(
    /register\((["'])service-worker\.js\1\)/g,
    `register($1${base}service-worker.js$1)`,
  )
  .replace(
    "</head>",
    `    <script>window.__FLETBOX_BASE__ = "${base}";</script>\n  </head>`,
  );

await writeFile("www/404.html", fallback, "utf8");
```

Keep the service worker in the same scheme: derive its prefix from
`new URL("./", self.location).pathname` instead of hard-coding `/`, otherwise
the precache and the offline navigation fallback miss every file under a
subpath.

## Unknown routes

If the initial URL is not found, the router redirects to the first configured route. You can also define a `*` or `/404` route for navigation attempts that do not exist.

## Common mistakes

- Forgetting to pass routes to `runApp` or call `initRouter`.
- Using `/user/:id` but navigating to `/user` without an id.
- Reading query values from params, or params from query values.
- Calling `goTo()` before the router has been initialized.
- Forgetting to unsubscribe from route listeners in a long-lived integration.
- Expecting `goBack()` to work like a server redirect; it uses browser history.
- Assuming the app owns the host root: under a subpath, content fetches need
  `getBasePath()` and the host needs a `404.html` fallback for deep links.

---

## Continue reading

- **Previous:** [State with `useState`](state.md)
- **Next:** [Frontend services guide](frontend-services.md) — Chapter 9 · State, Router & Services
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)
