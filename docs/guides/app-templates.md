# Build your first FletBox app

This guide shows complete app shapes. You can copy one example, run it, and then replace the text or widgets with your own ideas.

## 1. The smallest app

Start with one widget and mount it with `runApp`.

```javascript
import { runApp, Container, Text } from "flet-box";

const App = () => {
  return Container({
    padding: 20,
    child: Text({ text: "Hello World" }),
  });
};

runApp(App, "root");
```

What happens:

- `App` is a function that describes the screen.
- `Container` creates a layout box.
- `Text` writes words inside the box.
- `runApp` places the result in the HTML element with id `root`.

## 2. A styled page

```javascript
import { runApp, Container, Text, colors } from "flet-box";

const App = () => {
  return Container({
    padding: 20,
    bgColor: colors.background,
    borderRadius: 16,
    child: Text({
      text: "My App",
      size: 24,
      weight: "bold",
    }),
  });
};

runApp(App, "root");
```

Use `padding` for space inside the box. Use `bgColor` to change its background. Use `borderRadius` to soften its corners.

## 3. A page with a top bar

```javascript
import { runApp, Scaffold, AppBar, Text, colors } from "flet-box";

const App = () => {
  return Scaffold({
    appBar: AppBar({
      title: "My App",
      centerTitle: true,
    }),
    body: Text({ text: "Main content" }),
    backgroundColor: colors.background,
  });
};

runApp(App, "root");
```

`Scaffold` gives a page a standard structure. `appBar` is the top area and `body` is the main content.

## 4. A page with a side menu

```javascript
import {
  runApp,
  Scaffold,
  AppBar,
  Drawer,
  DrawerItem,
  Icon,
  Text,
  colors,
  openDrawer,
} from "flet-box";

const App = () => {
  return Scaffold({
    appBar: AppBar({
      title: "My App",
      leading: Icon({
        name: "menu",
        onPress: () => openDrawer(),
      }),
    }),
    drawer: Drawer({
      header: Text({ text: "Menu", size: 20, weight: "bold", padding: 20 }),
      body: [
        DrawerItem({ icon: "home", label: "Home", route: "/" }),
        DrawerItem({ icon: "settings", label: "Settings", route: "/settings" }),
      ],
    }),
    body: Text({ text: "Main content" }),
    backgroundColor: colors.background,
  });
};

runApp(App, "root");
```

The menu button calls `openDrawer`. Each `DrawerItem` describes one navigation option.

## 5. A page with tabs

```javascript
import { runApp, Scaffold, AppBar, Tabs, Text, colors } from "flet-box";

const App = () => {
  return Scaffold({
    appBar: AppBar({ title: "My App", centerTitle: true }),
    body: Tabs({
      tabs: ["Home", "Profile", "Settings"],
      children: [
        Text({ text: "Home screen" }),
        Text({ text: "User profile" }),
        Text({ text: "Settings" }),
      ],
    }),
    backgroundColor: colors.background,
  });
};

runApp(App, "root");
```

The first item in `tabs` matches the first item in `children`, the second matches the second, and so on.

## 6. A reusable component

```javascript
import { Container, Text, colors } from "flet-box";

export const ProfileCard = ({ title, onPress }) => {
  return Container({
    padding: 16,
    bgColor: colors.surface,
    borderRadius: 12,
    onPress,
    child: Text({
      text: title || "My Profile",
      size: 18,
      weight: "bold",
    }),
  });
};
```

A component is a function that receives values and returns widgets. This lets you reuse the same design in many places.

## 7. A list with data

```javascript
import { ListView, ListTile, createList, random } from "flet-box";

const createUsers = () => createList({
  id: () => random.id(),
  title: () => random.fullName(),
  subtitle: () => random.email(),
}, 20);

export const UserList = ({ data = createUsers(), onSelect }) => {
  return ListView({
    data,
    renderItem: (item) => ListTile({
      title: item.title,
      subtitle: item.subtitle,
      onPress: () => onSelect(item),
    }),
  });
};
```

`data` is the collection. `renderItem` explains how one item should look. FletBox repeats that design for every item.

## A simple learning path

1. Build a page with `Container` and `Text`.
2. Add `Column` and `Row` to arrange content.
3. Add a `Button` and an event such as `onPress`.
4. Add `Input`, `Checkbox`, `Switch`, or `Dropdown` for user input.
5. Use `Scaffold`, `AppBar`, `Drawer`, or `Tabs` for a larger screen.
6. Extract repeated designs into reusable components.

For individual widget details, return to the [widget documentation](../widget/README.md) or begin with [Start here](../widget/START_HERE.md).

If you already have a page and only want to add one interactive area, read [Add FletBox to an existing page](embedding.md).
