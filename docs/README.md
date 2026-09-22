# The FletBox Book

FletBox is a tiny UI framework: you describe your screen with plain JavaScript *widgets*, and FletBox turns them into real HTML that updates itself. No build config, no dependencies — just `import { Text, Button } from "flet-box"`.

This documentation is one continuous book. Start at **Chapter 0** and follow the "Continue reading" links at the bottom of every page; each page teaches you something real and links to the next.

## The reading path

| # | Chapter | What you learn | Level |
| --- | --- | --- | --- |
| 0 | [Your first FletBox app, step by step](guides/first-app.md) | Your first running app in 20 minutes | Beginner |
| — | [Start here](widget/START_HERE.md) | How the widget book works | Beginner |
| 1–8 | [The widget book](widget/README.md) | Every widget: layout, input, data, chat, media, navigation | Beginner → Intermediate |
| 9 | [State, Router & Services](guides/state.md) | Shared state, navigation routes, storage, and HTTP | Intermediate |
| 10 | [Tools & Utilities](tools/README.md) | The helper functions that ship with the framework | Intermediate |
| 11 | [The CLI](cli/README.md) | Create, run, and build projects with `flet-box` | Intermediate |
| A | [Appendices](guides/minification-and-protection.md) | Minification, mobile, compatibility, embedding | Advanced |

> **Levels.** *Beginner:* start here and read in order. *Intermediate:* continue in order — you are comfortable with widgets. *Advanced:* for when you ship, skip on a first read.

## The path, linked end to end

Every page points to its **Previous** and **Next**. The chain is:

```
Front cover (this page)
→ Chapter 0 · first-app.md
→ Start here · widget/START_HERE.md
→ The widget book · widget/README.md (Chapters 1–8)
→ State · guides/state.md
→ Router · guides/router.md
→ Frontend services · guides/frontend-services.md
→ RamStore · services/RamStore.md
→ Session · services/Session.md
→ Storage · services/Storage.md
→ HTTP client · services/http.md
→ Tools index · tools/README.md
→ Styling helpers · tools/styling.md
→ Lists, arrays & data · tools/lists.md
→ Text & time · tools/text-and-time.md
→ State, memo & refs · tools/state.md
→ Reactivity · tools/reactivity.md
→ Async, ids & logging · tools/async-ids-log.md
→ Device & environment · tools/device.md
→ Themes · tools/theme.md
→ Markdown, code & HTML · tools/markdown.md
→ Visual effects · tools/visual-effects.md
→ Widget introspection · tools/introspection.md
→ Input validation · tools/validation.md
→ Animation helpers · tools/animation.md
→ Utilities guide · guides/utilities.md
→ The CLI · cli/README.md
→ Appendices (minification → mobile → compatibility → embedding)
→ The end of the book
```

## How this book is written

- **Everything is real.** Every function, prop, and method documented here exists in the runtime. Pages were checked against `src/index.js` and `src/index.d.ts`.
- **You can copy the examples.** They are small, complete, and runnable.
- **Every page links to the next.** Follow the numbers and you cover the whole framework once.
- **Three layers, one API.** A public feature is complete when three pieces agree: the runtime implementation, the export in `src/index.js`, and the type in `src/index.d.ts`. This book documents that same surface.

## Reference (not part of the book)

- [Server toolkit](server/README.md) — Express/SQLite/Redis backend helpers (separate toolkit).
- [Architecture](arquitectura.md) — how the framework is built inside.
- [Contributing](CONTRIBUTING.md) — for people who add code or docs to FletBox.