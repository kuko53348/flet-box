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
├── manifest.json
├── service-worker.js
├── run.sh
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
