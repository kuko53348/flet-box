# Contributing to FletBox

Thank you for helping improve FletBox. The project is designed to stay friendly to developers, so contributions should keep the API readable, predictable, and practical.

## Project areas

```text
src/core/          Runtime, mounting, PWA, and HMR
src/widgets/       UI widgets
src/widget-factory/Widget creation and prop processing
src/navigations/   Scaffold, drawer, tabs, and router
src/services/      Browser storage and HTTP helpers
src/tools/         State and general-purpose tools
src/utils/         Themes, parsing, effects, units, and validation
bin/               CLI and project generators
docs/              User and API documentation
```

## Before changing code

1. Read the owning module and its nearest tests or examples.
2. Check `src/index.js` to understand the public export.
3. Check `src/index.d.ts` when changing public types.
4. Search for existing aliases and related widgets.
5. Keep unrelated refactors out of the change.

## Adding a widget

A widget should normally include:

- A file under `src/widgets/`.
- An export in `src/widgets/index.js`.
- An export in `src/index.js`.
- A prop interface and function declaration in `src/index.d.ts`.
- Basic, everyday, and full examples.
- A documentation page under `docs/widget/`.
- Accessibility notes when it is interactive.
- Cleanup for timers, listeners, observers, and subscriptions.

Use the existing `WidgetFactory` patterns instead of creating a second rendering system.

## Adding a prop

When adding a public prop:

1. Implement it in the widget.
2. Add its TypeScript type.
3. Add its default value and behavior documentation.
4. Add an example that proves the behavior.
5. Check whether it should have a friendly alias.
6. Test both the preferred name and aliases when aliases are intentional.

FletBox supports developer-friendly aliases, but each alias must have one clear meaning.

## Documentation pattern

Widget pages follow this structure:

1. Overview.
2. Learn it in one minute.
3. When to use.
4. Common props.
5. Full prop list.
6. How props work.
7. Example usage.
8. Basic, everyday, and full examples.
9. Common layout and styling examples.
10. Beginner tips.
11. Common mistakes.
12. Behavior notes.
13. Accessibility.
14. Related widgets.

Regenerate widget documentation with:

```bash
python3 scripts/generate_widget_docs.py
```

The generator uses `src/index.d.ts` and the supplied snippet library as references.

## Runtime and types must agree

A public API is not complete until these three surfaces agree:

```text
runtime implementation
src/index.js exports
src/index.d.ts declarations
```

If a function is declared but not exported, or exported but not typed, document it as a known mismatch and fix the source of truth before calling it stable.

## Cleanup rules

Components that register resources must release them:

- `window` and `document` listeners.
- Timers and animation frames.
- `ResizeObserver` and `MutationObserver`.
- Router subscriptions.
- Storage subscriptions.
- WebSocket connections.

Use the widget cleanup lifecycle when available.

## Validation checklist

Before opening a pull request:

```bash
node --check path/to/changed-file.js
python3 -m py_compile scripts/generate_widget_docs.py
python3 scripts/generate_widget_docs.py
```

`npm test` is only a placeholder (`echo "No tests yet"`). The real tests are dependency-free browser harnesses in `tests/`. Serve the repo with the dev server (`npm run dev` or `node bin/cli.js run-spa`), then open:

- `/tests/index.html` — widget-factory regression contract
- `/tests/smoke.html` — instantiates every widget
- `/tests/doccheck.html` — chapters 1-2 documented behavior
- `/tests/doccheck-all.html` — chapters 3-7 documented behavior
- `/tests/propscan.html` — custom-prop scanner

Each harness writes a global (`window.__TESTS`, `window.__SMOKE`, `window.__DOCCHECK`) and must pass with 0 failures.

Also verify the feature in a real browser when it changes DOM behavior. For build changes, run:

```bash
npm run build
```

For CLI changes, test:

```bash
node bin/cli.js --help
node bin/cli.js --version
```

## Pull request guidance

A good pull request explains:

- What user problem it solves.
- Which files changed.
- Which public API changed.
- Whether types and docs were updated.
- Which commands or tests were run.
- Any remaining compatibility or migration concern.

Avoid committing generated output, secrets, local databases, APKs, logs, or credentials.
