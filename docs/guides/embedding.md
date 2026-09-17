# Add FletBox to an existing page

FletBox does not have to control your whole application. You can add one widget to an existing HTML page and keep using your current backend, CSS, JavaScript, or frontend framework.

This is useful when you want to add an interactive feature without rewriting the rest of the page.

## Two ways to use FletBox

### Complete application

Use `runApp()` when FletBox owns the main interface, routing, theme, and rendering lifecycle:

```javascript
import { runApp, Container, Text } from "flet-box";

const App = () => Container({
  padding: 24,
  child: Text({ text: "A complete FletBox screen" }),
});

runApp(App, "root");
```

### Add one part to an existing page

Use `insertBy()` when your page already exists and you only want to add a widget:

```javascript
import { Button, insertBy } from "flet-box";

insertBy(
  Button({
    text: "Open panel",
    onPress: () => console.log("clicked"),
  }),
  "existing-root",
);
```

The existing HTML only needs an element with the matching id:

```html
<div id="existing-root"></div>
```

## Add FletBox with a browser import map

A plain HTML page can import FletBox as an ES module:

```html
<script type="importmap">
{
  "imports": {
    "flet-box": "./node_modules/flet-box/src/index.js"
  }
}
</script>

<div id="toolbar"></div>

<script type="module">
  import { Button, insertBy } from "flet-box";

  insertBy(
    Button({
      text: "Save",
      onPress: () => alert("Saved"),
    }),
    "toolbar",
  );
</script>
```

Your page must be served through a development server or web server. Browser module imports usually do not work correctly when opening the file directly with `file://`.

## Add a widget after existing content

Use `insertBy()` to append a widget:

```javascript
import { Card, Text, insertBy } from "flet-box";

insertBy(
  Card({
    padding: 16,
    child: Text({ text: "This card was added to an existing page." }),
  }),
  "content",
);
```

## Add a widget before or after another element

The target is an element id:

```javascript
import { Button, insertBefore, insertAfter } from "flet-box";

const button = Button({ text: "Action" });

insertBefore(button, "original-heading");
insertAfter(Button({ text: "Next action" }), "original-heading");
```

HTML:

```html
<h1 id="original-heading">Existing heading</h1>
```

## Replace an existing element

Use `replaceBy()` when a FletBox widget should take the place of an existing DOM element:

```javascript
import { Container, Text, replaceBy } from "flet-box";

replaceBy(
  Container({
    padding: 20,
    bgColor: "#eff6ff",
    child: Text({ text: "This replaces the old content." }),
  }),
  "legacy-message",
);
```

## Insert at the beginning

Use `prependBy()` to place the widget before the current first child:

```javascript
import { Text, prependBy } from "flet-box";

prependBy(Text({ text: "Welcome", color: "#2563eb" }), "page-content");
```

## Mount the same widget in several roots

`mountAll()` clones a widget and appends a copy to each root id:

```javascript
import { Text, mountAll } from "flet-box";

const notice = Text({
  text: "Updated content",
  color: "#2563eb",
});

mountAll(notice, ["header-notice", "footer-notice"]);
```

HTML:

```html
<div id="header-notice"></div>
<div id="footer-notice"></div>
```

For complex interactive widgets, prefer creating a fresh widget for each root so each instance has its own state and event handlers.

## Use a custom HTML page

FletBox can live beside normal HTML:

```html
<section class="legacy-profile">
  <h2>Existing profile</h2>
  <p>This content was already on the page.</p>
  <div id="profile-actions"></div>
</section>
```

```javascript
import { Button, Row, Text, insertBy } from "flet-box";

insertBy(
  Row({
    gap: 8,
    children: [
      Text({ text: "Actions:" }),
      Button({ text: "Edit", onPress: () => openEditor() }),
      Button({ text: "Delete", variant: "outlined", onPress: () => removeProfile() }),
    ],
  }),
  "profile-actions",
);
```

FletBox only owns the DOM node where the widget is mounted. The rest of the page remains yours.

## Use FletBox with another frontend

You can mount a FletBox widget from React, Vue, Angular, or another application as long as you have a DOM element:

```javascript
const target = document.querySelector("#external-toolbar");
const widget = Button({ text: "FletBox action" });

target.appendChild(widget);
```

For a framework integration, mount and remove the widget inside that framework's lifecycle. Keep the widget reference so you can remove it during cleanup.

## Direct DOM access

Every widget is a real `HTMLElement`. You can use standard DOM APIs when needed:

```javascript
const button = Button({ text: "Inspect me" });

button.setAttribute("aria-label", "Inspect me");
button.addEventListener("mouseenter", () => {
  console.log("native DOM event");
});

document.querySelector("#actions").appendChild(button);
```

Prefer direct widget props such as `className` and framework event props when they are enough. Use direct DOM access for integration with existing page code.

## Choosing the right mounting API

| Goal | API |
| --- | --- |
| Build the whole FletBox application | `runApp()` |
| Add a widget at the end of a root | `insertBy()` |
| Add a widget at the beginning | `prependBy()` |
| Place a widget before an element | `insertBefore()` |
| Place a widget after an element | `insertAfter()` |
| Replace an existing element | `replaceBy()` |
| Add copies to several roots | `mountAll()` |
| Create a controllable app instance | `createApp()` |

## `createApp()` for a controlled application

Use `createApp()` when you want explicit `start()` and `destroy()` methods:

```javascript
import { Container, Text, createApp } from "flet-box";

const app = createApp(
  {
    "/": () => Container({
      padding: 20,
      child: Text({ text: "Home" }),
    }),
  },
  {
    rootId: "app-root",
    fallback: Container({
      padding: 20,
      child: Text({ text: "Loading..." }),
    }),
  },
);

app.start();

// Later, when the page or integration is destroyed:
// app.destroy();
```

## Important integration tips

- Mount into a dedicated element instead of replacing an unrelated page section.
- Give every integration root a stable id.
- Use `children: [ ... ]` for several widgets and `child: widget` for one child.
- Keep application state inside the integration when possible.
- Clean up app instances when a page is removed.
- Use `runApp()` only when FletBox should own the root lifecycle.
- Use `insertBy()` and related helpers when FletBox is only one part of the page.
