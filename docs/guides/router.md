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

## Unknown routes

If the initial URL is not found, the router redirects to the first configured route. You can also define a `*` or `/404` route for navigation attempts that do not exist.

## Common mistakes

- Forgetting to pass routes to `runApp` or call `initRouter`.
- Using `/user/:id` but navigating to `/user` without an id.
- Reading query values from params, or params from query values.
- Calling `goTo()` before the router has been initialized.
- Forgetting to unsubscribe from route listeners in a long-lived integration.
- Expecting `goBack()` to work like a server redirect; it uses browser history.
