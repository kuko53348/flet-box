# Chapter 0 · Your first FletBox app, step by step

This page is for **absolute beginners**. You do not need to know any trick — you only need a text editor, a terminal, and the [FletBox CLI](../cli/README.md) installed. At the end you will have a working app with a button and a list.

## Before you start

Create an empty folder, open it in the terminal, and ask the CLI for a new project:

```bash
npx flet-box create my-app
cd my-app
npm run dev
```

Open your browser at `http://localhost:8000`. You should see "Hello FletBox" (or a small welcome screen). If you do, everything is working.

## Step 1: the smallest app

Open the file the CLI created (usually `src/app.js`). Edit it to this:

```javascript
import { runApp, Text } from "flet-box";

const app = Text({ text: "Hello, world!" });

runApp(app, "root");
```

`Text` makes a piece of text. `runApp` puts your app on the page, inside an element with `id="root"`. Save the file and look at the browser: it says "Hello, world!".

## Step 2: a button that counts

A button is a `Button` widget. It can run code when you press it. Inside that code we build a counter.

```javascript
import { runApp, Column, Text, Button } from "flet-box";

async function main() {
  const [count, setCount] = useState("counter", 0);

  const app = Column({
    gap: 12,
    children: [
      Text({ text: `You pressed ${count} times` }),
      Button({
        text: "Add one",
        onPress: () => setCount((previous) => previous + 1),
      }),
    ],
  });

  runApp(app, "root");
}

main();
```

Wait — we used `useState` but did not import it. Fix the import line:

```javascript
import { runApp, Column, Text, Button, useState } from "flet-box";
```

What just happened?

- `useState("counter", 0)` creates a value stored under the key `"counter"`, starting at `0`.
- `count` is the current value.
- `setCount` is the function that changes it.
- When we press the button, we tell FletBox to run the screen again with the new value, so the text updates.

`Column` stacks its `children` vertically, one under the other, with `gap` space between them.

## Step 3: write and add tasks

Now the fun part — a real todo list. A `Row` puts widgets side by side. An `Input` is a text box, and its `.value` holds what the user typed.

```javascript
import { runApp, Column, Row, Text, Input, Button, useState } from "flet-box";

async function main() {
  const tasks = Column({ gap: 8, children: [] });
  const [allTasks, setAllTasks] = useState("tasks", [], tasks, "children");

  const input = Input({ placeholder: "Write a task" });

  const app = Column({
    gap: 16,
    children: [
      Text({ text: "My tasks", type: "h2" }),
      Row({
        gap: 8,
        children: [
          input,
          Button({
            text: "Add",
            onPress: () => {
              if (input.value.trim() === "") return;
              setAllTasks([...allTasks, input.value]);
              input.value = "";
            },
          }),
        ],
      }),
      tasks,
    ],
  });

  runApp(app, "root");
}

main();
```

Type something in the box, press **Add**, and watch it appear in the list below.

How it works:

- `tasks` is an empty `Column` — it will hold the rows of the list.
- The 4th argument of `useState` (“children”) tells FletBox: *when this state changes, update the `children` of `tasks`*.
- `setAllTasks([...allTasks, input.value])` puts the new task at the end of the list. FletBox then re-renders `tasks` with the new rows.
- Clearing `input.value` empties the box so you can write the next task.

## Step 4: make each task removable

Giving every task its own "x" button means each row is a small `Row` with a `Text` and a `Button`. We rebuild the whole list whenever it changes, using the widget's own `update` method:

```javascript
import { runApp, Column, Row, Text, Input, Button } from "flet-box";

let allTasks = [];
const tasks = Column({ gap: 8, children: [] });
const input = Input({ placeholder: "Write a task" });

const taskRow = (task) =>
  Row({
    gap: 8,
    children: [
      Text({ text: task }),
      Button({
        text: "x",
        size: "small",
        onPress: () => {
          allTasks = allTasks.filter((item) => item !== task);
          render();
        },
      }),
    ],
  });

const render = () => tasks.update({ children: allTasks.map(taskRow) });

const addTask = () => {
  if (input.value.trim() === "") return;
  allTasks.push(input.value);
  input.value = "";
  render();
};

const app = Column({
  gap: 16,
  children: [
    Text({ text: "My tasks", type: "h2" }),
    Row({
      gap: 8,
      children: [
        input,
        Button({ text: "Add", onPress: addTask }),
      ],
    }),
    tasks,
  ],
});

runApp(app, "root");
```

- `taskRow` builds one line: the task name plus a small **x** button.
- `render()` asks `tasks` to replace its children with the current list, rebuilt as rows.
- Pressing **x** removes that task from `allTasks` and re-renders.

This app grows with you: the widgets you used — `Row`, `Column`, `Text`, `Input`, `Button` — are the same ones every FletBox screen is built from. To go deeper into shared, automatic state, read the [State guide](state.md).

## What is next

You just built a real app. Now learn what widgets look like and how to mix them:

- **[Start here](../widget/START_HERE.md)** — how to read the widget book.
- **[The widget book](../widget/README.md)** — all widgets, in order, from basic to advanced.

---

## Continue reading

- **Previous:** [The FletBox Book](../README.md) — front cover.
- **Next:** [Start here](../widget/START_HERE.md) — how to read the widget book.
- **Index:** [Guides index](README.md).

You are reading **Chapter 0 · Your first app** (before Chapter 1).