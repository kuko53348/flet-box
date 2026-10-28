# Migrate an app to a newer FletBox

> **Level: Intermediate.** Read this page when a FletBox release renamed or removed something your app uses. It follows [Accessibility](accessibility.md) — Chapter 13 — in the book's reading path.

FletBox does not break your app on purpose. A prop that gets a better name keeps working under the old one, and the framework keeps both until the next major says otherwise. **But a name you keep writing is a name you keep paying for**: the old spelling disappears at the next major, and the app breaks then, on a machine that is not yours.

So this page exists for two moments:

- **You are upgrading.** The table below says, prop by prop, what changed and what to write instead.
- **You are publishing a major.** `flet-box release --major` refuses to publish a version that has no section here — a major is exactly the release where an app has to change something, so the guide has to exist before the release does.

## The rule the framework follows

A rename in FletBox is always done in this order:

1. The new name is declared and documented **first**.
2. The old name keeps working, marked `@deprecated` in `src/index.d.ts`.
3. The old name lands in `src/widget-factory/deprecations.js` — the one table the guide, the codemod and the contract test all read.
4. The old name is listed in the table below, with the version that renamed it.
5. The old name is removed in the next **major**, and that major's section says so.

Nothing here is a breaking change inside the 1.x line. Read the table as a list of names to stop writing, not as a list of things that already broke.

## 1.2.0

Every old name below still works in 1.2.0. Write the new one.

| Widget | From | To | What changed |
| --- | --- | --- | --- |
| `Accordion` | `onToggle` | `onPress` | The callback still receives the new expanded state; the name is now the framework-wide one. |
| `Checkbox` | `onCheck` | `onPress` | The callback still receives the new checked state. |
| `Dropdown` | `onChange` | `onPress` | The callback still receives the chosen value — and only the value. The second argument the old type promised was never sent. |
| `Radio` | `onSelect` | `onPress` | The callback still receives the new selected state. |
| `Slider` | `onChanged` | `onPress` | The callback still receives the new number. |
| `Switch` | `onToggle` | `onPress` | The callback still receives the new toggled state. |
| `Tooltip` | `tooltipDelay` | `delay` | Same number, same units: milliseconds. |
| `Scaffold` | `navSideBar` | `leftNavBar` | The side moved into the name. A call that also says `navSideBarPosition: "right"` becomes `rightNavBar`. |
| `Scaffold` | `navSideBarWidth` | `leftNavBarWidth` | The old width was accepted and then **ignored** — the panel kept the default width. The new name applies, so the panel finally takes the width you wrote. |
| `Scaffold` | `navSideBarPosition` | (removed) | The side now lives in the prop name (`leftNavBar` / `rightNavBar`). Nothing reads this prop any more, so the key goes with it. |

Two names that look like the ones above are **not** deprecated: `TreeView` still calls its own selection callback `onSelect` and its own expansion callback `onToggle`, because that is what a tree calls them. The rename was about the framework-wide `onPress`, and a tree's own vocabulary is not a candidate for it. `flet-box audit-fix` knows the difference: the table names a widget, not a spelling.

## Applying the table

The framework ships a codemod for the rows where the answer is mechanical:

```bash
npx flet-box audit-fix --only migrations
```

In a project made with `flet-box create` the same command is `npm run fix` (which also repairs imports and mistyped props). The codemod rewrites only the calls it can prove:

- the widget has to declare **both** the old name and the new one;
- the call must not already carry the new name — two callbacks for one event is a decision, not a rename;
- for `Scaffold`, the call must not already carry a new sidebar prop, because the legacy one is inert there.

Anything it cannot prove is printed under **"Left for you to decide"** and left untouched. A codemod that guesses is worse than one that stops: a wrong rename changes the screen silently, and the gate would no longer complain about it.

What the codemod will **not** do, on purpose:

- it will not change a callback's *signature* — `Dropdown`'s old `onChange(value, label)` promised a second argument that was never sent, and the codemod renames the prop without inventing the argument;
- it will not touch a call that spreads another object (`{ ...props }`), because the keys inside are not visible;
- it will not rename anything that is not a FletBox widget call;
- it will not edit `docs/`, `skills/` or the framework's own sources.

Run it, then read the diff:

```bash
npx flet-box audit-fix --only migrations
git diff
```

## Before you publish a major

A major release is the one that removes the old names for good. The framework will not let it through without this page saying what it removes:

```bash
flet-box release --major
# ❌ the migration guide has no "## 2.0.0" section
```

To publish it, add the section here first — one row per removed or renamed prop, with the version as the heading — and the release goes through. The rows are read by `scripts/check-migrations.mjs`, which also proves that the table above, the deprecated markers in `src/index.d.ts`, the deprecation table in the framework and this codemod all name the same things. A prop that is deprecated in the types but missing from this page fails CI, not the user's app.

---

## Continue reading

- **Previous:** [Accessibility](accessibility.md) — Chapter 13
- **Next:** [Minify and protect a FletBox build](minification-and-protection.md) — Appendix A
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 14 · Migrating to a newer FletBox**.
