#!/usr/bin/env python3
"""Generate docs/widget/*.md for FletBox.

Sources of truth:
  - src/index.d.ts          -> property names and types for the tables
  - scripts/_docdata/*.py   -> curated prose and examples per widget
  - scripts/widget_doc_data.py -> reading order, aliases and descriptions

Run from the repository root:  python3 scripts/generate_widget_docs.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from widget_doc_data import (  # noqa: E402
    DESC,
    BOOK,
    NEXT_AFTER_BOOK,
    WIDGET_DESC,
    WIDGET_DOCS,
)

SRC_DIR = ROOT / "src" / "widgets"
INDEX_JS = ROOT / "src" / "index.js"
TYPE_DECLARATIONS = ROOT / "src" / "index.d.ts"
DOCS_DIR = ROOT / "docs" / "widget"

# Chapter 8 pages are hand-written; the book index still links to them.
NAV_PAGES = [
    ("Scaffold", "the app shell: app bar, body, drawer, side bars"),
    ("AdaptiveScaffold", "the same shell, adapted to phone and desktop"),
    ("AppBar", "a top bar for titles, actions, and back navigation"),
    ("Drawer", "a panel that slides in from the side"),
    ("DrawerItem", "a router-aware row for a drawer or side bar"),
    ("BottomNavigation", "a bottom tab bar synced with the router"),
    ("Tabs", "switch panes inside a screen"),
    ("CollapsibleSideBar", "a side panel that collapses to icons"),
]

# Widgets whose props are declared in code rather than an interface.
SPECIAL_PROPS = {
    "SnackBar": [
        ("message", "string"),
        ("action", "string"),
        ("onAction", "() => void"),
        ("duration", "number"),
        ("type", "'normal' | 'success' | 'error' | 'warning' | 'info'"),
        ("position", "'bottom' | 'top'"),
        ("backgroundColor", "Color"),
        ("textColor", "Color"),
        ("actionColor", "Color"),
        ("dismissible", "boolean"),
        ("borderRadius", "number"),
        ("padding", "number | string"),
        ("margin", "number | string"),
        ("elevation", "number"),
        ("animationDuration", "number"),
        ("zIndex", "number"),
        ("onShow", "() => void"),
        ("onClose", "() => void"),
    ],
}


# --------------------------------------------------------------------------- #
# src/index.d.ts parsing
# --------------------------------------------------------------------------- #
def _interface_block(source: str, name: str) -> tuple[str, str] | None:
    match = re.search(rf"interface\s+{re.escape(name)}\b([^{{]*)\{{", source)
    if not match:
        return None
    start = match.end()
    depth = 1
    index = start
    while index < len(source) and depth:
        char = source[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
        index += 1
    return match.group(1), source[start : index - 1]


def _parse_props(block: str) -> list[tuple[str, str]]:
    props = []
    for line in block.splitlines():
        line = line.strip()
        match = re.match(r"([A-Za-z_$][\w$]*)\??\s*:\s*(.+?);?$", line)
        if match and match.group(1) != "style":
            props.append((match.group(1), match.group(2).rstrip(";")))
    return props


def extract_props(source: str, name: str) -> list[tuple[str, str]]:
    result = _interface_block(source, name)
    if result is None:
        return []
    header, block = result
    own = _parse_props(block)
    # Merge the parent interface only when it is not CommonProps (common props
    # are rendered in their own section). Handles `Omit<Parent, 'a' | 'b'>`,
    # including its exclusion list: `GridViewProps` deliberately drops the
    # `crossAxisCount`/`wrapItems` it derives from `columns`, and documenting
    # them again would advertise knobs the widget overwrites.
    target = re.search(r"extends\s+(.+)", header)
    base = None
    excluded: set[str] = set()
    if target:
        extends = target.group(1).strip()
        if extends.startswith("Omit<"):
            match = re.search(r"Omit<\s*([A-Za-z_$][\w$]*)", extends)
            if match:
                base = match.group(1)
            keys = re.search(r",\s*([^>]*)>", extends)
            if keys:
                excluded = set(re.findall(r"['\"]([^'\"]+)['\"]", keys.group(1)))
        else:
            match = re.search(r"[A-Za-z_$][\w$]*", extends)
            if match:
                base = match.group(0)
    if base and base != "CommonProps":
        inherited = extract_props(source, base)
        for prop, kind in inherited:
            if prop in excluded or prop in {p for p, _ in own}:
                continue
            own.insert(0, (prop, kind))
    return own


# --------------------------------------------------------------------------- #
# Human-friendly descriptions
# --------------------------------------------------------------------------- #
_SUFFIX_DESCRIPTIONS = [
    ("BorderRadius", "Corner radius for the {prefix}."),
    ("BorderColor", "Border color for the {prefix}."),
    ("BorderWidth", "Border width for the {prefix}."),
    ("BorderStyle", "Border style for the {prefix}."),
    ("BgColor", "Background color for the {prefix}."),
    ("Color", "Color used for the {prefix}."),
    ("Width", "Width of the {prefix}."),
    ("Height", "Height of the {prefix}."),
    ("Size", "Size of the {prefix}."),
    ("Padding", "Padding for the {prefix}."),
    ("Margin", "Margin for the {prefix}."),
    ("Gap", "Space for the {prefix}."),
    ("Duration", "Duration for the {prefix}, in milliseconds."),
    ("Delay", "Delay before the {prefix}, in milliseconds."),
    ("Elevation", "Elevation (shadow depth) of the {prefix}."),
    ("Opacity", "Opacity of the {prefix}."),
    ("Radius", "Corner radius for the {prefix}."),
    ("Position", "Position of the {prefix}."),
    ("Offset", "Offset for the {prefix}."),
    ("Count", "Number of {prefix}."),
    ("Icon", "Icon for the {prefix}."),
    ("Label", "Label for the {prefix}."),
    ("Title", "Title for the {prefix}."),
    ("Text", "Text for the {prefix}."),
    ("Index", "Index used for the {prefix}."),
]


def humanize(name: str) -> str:
    spaced = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", name)
    spaced = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1 \2", spaced)
    return spaced.replace("_", " ").lower().strip()


def describe(prop: str, widget: str = "") -> str:
    # A prop name can mean two things in two widgets — `markers` are pins on a map
    # and ticks on a progress arc — so the page that owns the difference says so.
    override = WIDGET_DESC.get(widget, {}).get(prop)
    if override:
        return override
    if prop in DESC:
        return DESC[prop]
    if prop.startswith("on") and len(prop) > 2 and prop[2].isupper():
        return f"Event handler for the `{prop}` event."
    if prop.startswith("show") and len(prop) > 4 and prop[4].isupper():
        return f"Controls whether the {humanize(prop[4:])} is shown."
    if prop.startswith("hide") and len(prop) > 4 and prop[4].isupper():
        return f"Controls whether the {humanize(prop[4:])} is hidden."
    for suffix, template in _SUFFIX_DESCRIPTIONS:
        if prop.endswith(suffix) and len(prop) > len(suffix):
            prefix = humanize(prop[: -len(suffix)])
            if prefix:
                return template.format(prefix=prefix)
    return f"The `{prop}` value for the widget."


# --------------------------------------------------------------------------- #
# Rendering
# --------------------------------------------------------------------------- #
def known_exports() -> set[str]:
    if not INDEX_JS.exists():
        return set()
    source = INDEX_JS.read_text(encoding="utf-8")
    names: set[str] = set()
    for block in re.findall(r"export\s*\{([^}]*)\}", source):
        for part in block.split(","):
            name = part.strip()
            if re.fullmatch(r"[A-Za-z_$][\w$]*", name):
                names.add(name)
    return names


KNOWN = known_exports()


def imports_for(code: str) -> str:
    used = sorted(
        name
        for name in KNOWN
        if re.search(rf"(?<![\w-])\b{re.escape(name)}\b(?!\s*:)", code)
    )
    if not used:
        return ""
    return f'import {{ {", ".join(used)} }} from "flet-box";\n\n'


def code_block(code: str, with_imports: bool = True) -> str:
    prefix = imports_for(code) if with_imports else ""
    return f"```javascript\n{prefix}{code}\n```"


def prop_table(props: list[tuple[str, str]], widget: str = "") -> str:
    lines = ["| Prop | Type | Description |", "| --- | --- | --- |"]
    for prop, kind in props:
        kind = kind.replace("|", "\\|")
        lines.append(f"| `{prop}` | `{kind}` | {describe(prop, widget)} |")
    return "\n".join(lines)


def tables_for(source: str, name: str) -> tuple[str, str | None]:
    """The two tables a page carries, ready to be spliced into an existing page."""
    props = extract_props(source, f"{name}Props") or SPECIAL_PROPS.get(name, [])
    common = extract_props(source, "CommonProps")
    has_common = extends_common_chain(source, f"{name}Props")
    return prop_table(props, name), (prop_table(common, name) if has_common else None)


def replace_table(text: str, heading: str, table: str | None) -> tuple[str, str]:
    """Swap the first table after `heading`, leaving every other byte alone.

    Returns the text and one of "same", "changed" or "absent" — "absent" is what
    tells `--check` that a page has no table where one belongs, instead of
    reporting it as current because nothing matched.
    """
    if table is None:
        return text, "same"
    lines = text.splitlines()
    start = next((i for i, line in enumerate(lines) if line.strip() == heading), None)
    first = None
    if start is not None:
        first = next((i for i in range(start + 1, len(lines)) if lines[i].startswith("|")), None)
    if first is None:
        return text, "absent"
    last = first
    while last < len(lines) and lines[last].startswith("|"):
        last += 1
    if lines[first:last] == table.splitlines():
        return text, "same"
    merged = lines[:first] + table.splitlines() + lines[last:]
    return "\n".join(merged) + "\n", "changed"


def prose_only(text: str) -> str:
    """Everything a page says that is not its prop tables."""
    return "\n".join(line for line in text.splitlines() if not line.startswith("|"))



def reading_path() -> dict[str, dict]:
    info: dict[str, dict] = {}
    flat: list[str] = []
    for chapter, widgets in BOOK:
        for name in widgets:
            flat.append(name)
    for chapter, widgets in BOOK:
        total = len(widgets)
        for index, name in enumerate(widgets, start=1):
            position = flat.index(name)
            prev_name = flat[position - 1] if position > 0 else None
            next_name = flat[position + 1] if position + 1 < len(flat) else None
            info[name] = {
                "chapter": chapter,
                "index": index,
                "total": total,
                "prev": prev_name,
                "next": next_name,
            }
    return info


PATH = reading_path()


def continue_reading(name: str) -> str:
    entry = PATH.get(name)
    if not entry:
        return ""
    if entry["prev"]:
        previous = f"[{entry['prev']}]({entry['prev']}.md)"
    else:
        previous = "[Start here](START_HERE.md)"
    if entry["next"]:
        nxt = entry["next"]
        following = f"[{nxt}]({nxt}.md)"
    else:
        following = f"[{NEXT_AFTER_BOOK}]({NEXT_AFTER_BOOK}.md) — Chapter 8 · App navigation"
    return f"""---

## Continue reading

- **Previous:** {previous}
- **Next:** {following}
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **{entry['chapter']}** ({entry['index']} of {entry['total']})."""


def bullet_list(items: list[str]) -> str:
    return "\n".join(f"- {item}" for item in items)


def related_links(names: list[str]) -> str:
    if not names:
        names = ["Container", "Row", "Column"]
    return bullet_list([f"[{name}]({name}.md)" for name in names])


def extends_common_chain(source: str, name: str) -> bool:
    result = _interface_block(source, name)
    if result is None:
        return False
    header, _ = result
    target = re.search(r"extends\s+(.+)", header)
    if not target:
        return False
    extends = target.group(1).strip()
    if extends.startswith("Omit<"):
        match = re.search(r"Omit<\s*([A-Za-z_$][\w$]*)", extends)
        if not match:
            return False
        base = match.group(1)
    else:
        match = re.search(r"[A-Za-z_$][\w$]*", extends)
        if not match:
            return False
        base = match.group(0)
    if base == "CommonProps":
        return True
    return extends_common_chain(source, base)


def render_widget_doc(source: str, name: str) -> str:
    data = WIDGET_DOCS[name]
    props_table, common_table = tables_for(source, name)

    common_section = ""
    if common_table:
        common_section = f"""
### Common props

Every widget also accepts these shared props — see [common props](COMMON_PROPS.md) for the full rules and aliases.

{common_table}
"""

    return f"""# {name}

{data['summary']}

## When to use it

{data['when']}

## Quick start

{code_block(data['basic'])}

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

{props_table}
{common_section}
## Examples

### Everyday

{code_block(data['normal'])}

### Full

{code_block(data['full'])}

## Tips

{bullet_list(data.get('tips') or ["Prefer the documented props over raw CSS where the widget offers them."])}

## Accessibility

{bullet_list(data.get('accessibility') or ["Use an ARIA label (or a widget prop like `label`) when the widget is decorative or icon-only."])}

## Behavior

{bullet_list(data.get('behavior') or [
    "The widget renders through the `WidgetFactory` and reacts to prop changes like any other FletBox widget.",
    "Clean up listeners and timers it registers through an idempotent `onUnmount` disposer.",
])}

## Related widgets

{related_links(data.get('related', []))}

{continue_reading(name)}
"""


# --------------------------------------------------------------------------- #
# The book index
# --------------------------------------------------------------------------- #
CHAPTER_BLURB = {
    "Chapter 1 · First steps: the core mental model": "layout and the core mental model",
    "Chapter 2 · Interaction basics": "the widgets users click and type into",
    "Chapter 3 · Layout, cards and lists": "cards, lists, grids and content rows",
    "Chapter 4 · Feedback and overlays": "dialogs, sheets, notifications and progress",
    "Chapter 5 · Navigation and flows": "multi-step flows, trees and rotating content",
    "Chapter 6 · Data, rich content & effects": "tables, charts, rich text, ads and motion",
    "Chapter 7 · Media and drag & drop": "audio, video and drag-and-drop",
}


def one_line_summary(name: str) -> str:
    summary = WIDGET_DOCS[name]["summary"].strip()
    match = re.match(rf"^{re.escape(name)}\b\W*\s*", summary, re.IGNORECASE)
    if match:
        summary = summary[match.end():]
    if not summary:
        return summary
    return summary[0].upper() + summary[1:]


def render_index() -> str:
    parts = [
        "# Widgets: the FletBox book",
        "",
        "This directory is a book. Read it in order to go from your first widget to "
        "complete, data-rich compositions. Every page links to the previous and next "
        "page, so you can follow it like a tutorial — or jump straight to a widget from "
        "the alphabetical index below.",
        "",
        "If you have never used FletBox, begin with [Start here](START_HERE.md), then "
        "follow the reading path.",
        "",
        "## How to read this book",
        "",
        "- Chapters go from **basic to advanced**. Read them top to bottom the first time.",
        "- Every widget page ends with a **Continue reading** block: previous page, next page, and a link back here.",
        "- Every widget also accepts the [common props](COMMON_PROPS.md) — layout, spacing, color, typography, borders, events and aliases.",
        "- Related widgets at the bottom of each page are clickable, so you can branch off whenever you are curious.",
        "",
        "Related guides: [Build your first FletBox app](../guides/app-templates.md) · "
        "[Routing with FletBox](../guides/router.md) · [FletBox CLI](../cli/README.md).",
        "",
        "Every page here has a live twin: **[the widget gallery]"
        "(https://kuko53348.github.io/flet-box-widgets-exemples/)** renders each example "
        "in the browser and prints the call that made it under the result, so you can read "
        "a property table and see the same prop move something.",
        "",
        "## The reading path",
        "",
    ]

    number = 0
    for chapter, widgets in BOOK:
        parts.append(f"### {chapter}")
        parts.append("")
        parts.append(f"_{CHAPTER_BLURB.get(chapter, '')}_")
        parts.append("")
        for name in widgets:
            number += 1
            summary = one_line_summary(name).split(". ")[0].strip()
            parts.append(f"{number}. [{name}]({name}.md) — {summary}")
        parts.append("")

    parts.append("### Chapter 8 · App navigation")
    parts.append("")
    parts.append("_Build the shell of a real application and wire it to the router._")
    parts.append("")
    for name, blurb in NAV_PAGES:
        number += 1
        parts.append(f"{number}. [{name}]({name}.md) — {blurb}")
    parts.append("")
    parts.append("Then continue with [State, Router & Services](../guides/state.md) — Chapter 9.")
    parts.append("")
    parts.append("## Alphabetical index")
    parts.append("")
    for name in sorted(list(WIDGET_DOCS) + [n for n, _ in NAV_PAGES]):
        parts.append(f"- [{name}]({name}.md)")
    parts.append("")
    return "\n".join(parts)


# --------------------------------------------------------------------------- #
# Template
# --------------------------------------------------------------------------- #
TEMPLATE = """# WidgetName

## Overview

Explain what the widget is for in one or two sentences.

## When to use it

Describe the situation in which you reach for this widget.

## Quick start

```javascript
import { WidgetName } from "flet-box";

const example = WidgetName({
  // the smallest useful call
});
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `propName` | `Type` | What the prop does. |

## Examples

### Everyday

Show the most common combination of props.

### Full

Show advanced layout, styling and events.

## Tips

- Practical, widget-specific advice.

## Accessibility

- Keyboard and screen-reader considerations.

## Behavior

- Layout, interaction and re-render notes.

## Related widgets

- [Container](Container.md)

---

## Continue reading

- **Previous:** ...
- **Next:** ...
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter N · Title** (i of m).
"""


USAGE = """Generate docs/widget/*.md for FletBox.

  python3 scripts/generate_widget_docs.py                 full page for every widget
  python3 scripts/generate_widget_docs.py --tables-only   only the two prop tables
  python3 scripts/generate_widget_docs.py --check         report stale tables and prose, exit 1
  python3 scripts/generate_widget_docs.py --page Icon     one full page, prose included

Every page is generated from `scripts/_docdata/`, which is the prose source: an
edit to a page is lost on the next run, so write it in `_docdata` instead.
`--check` is the gate `npm test` runs — it fails when a page and its data entry
have drifted apart, in either direction.
`--tables-only` is the safe refresh: it rewrites the `## Props` and
`### Common props` tables from `src/index.d.ts` and leaves every other line
byte for byte.
"""

FLAGS = {"--tables-only", "--check", "--help", "-h"}


def prose_drift(source: str) -> list[str]:
    """Pages whose prose is not what `_docdata` renders."""
    stale: list[str] = []
    for name in sorted(WIDGET_DOCS):
        path = DOCS_DIR / f"{name}.md"
        if not path.exists():
            continue
        if prose_only(path.read_text(encoding="utf-8")) != prose_only(render_widget_doc(source, name)):
            stale.append(name)
    return stale


def write_tables_only(source: str, check: bool) -> None:
    stale: list[str] = []
    absent: list[str] = []
    for name in sorted(WIDGET_DOCS):
        path = DOCS_DIR / f"{name}.md"
        if not path.exists():
            absent.append(f"{name}.md (no page)")
            continue
        props_table, common_table = tables_for(source, name)
        text = path.read_text(encoding="utf-8")
        merged, props_state = replace_table(text, "## Props", props_table)
        merged, common_state = replace_table(merged, "### Common props", common_table)
        states = {props_state, common_state}
        if states == {"same"}:
            continue
        stale.append(name)
        if "absent" in states:
            absent.append(f"{name}.md (no table under its heading)")
        if not check:
            path.write_text(merged, encoding="utf-8")

    if check:
        for line in absent:
            print(f"missing: docs/widget/{line}")
        for name in stale:
            if f"{name}.md (no table under its heading)" not in absent:
                print(f"stale:   docs/widget/{name}.md")
        drift = prose_drift(source)
        for name in drift:
            print(f"prose:   docs/widget/{name}.md")
        if stale:
            print(f"\n{len(stale)} page(s) out of date — run "
                  "`python3 scripts/generate_widget_docs.py --tables-only`")
        if drift:
            print(f"\n{len(drift)} page(s) whose prose is not what scripts/_docdata/ renders — "
                  "run `python3 scripts/generate_widget_docs.py`, and put the edit you were "
                  "writing in `_docdata` instead: docs/widget/ is generated.")
        if stale or drift:
            raise SystemExit(1)
        print(f"generator: all {len(WIDGET_DOCS)} pages, tables and prose, are current")
        return

    print(f"Refreshed {len(stale)} prop table(s) from src/index.d.ts; every other line untouched.")
    for line in absent:
        print(f"  could not refresh: {line}")


def main() -> None:
    args = sys.argv[1:]
    if "--help" in args or "-h" in args:
        print(USAGE)
        return

    pages: list[str] = []
    rest: list[str] = []
    pending = list(args)
    while pending:
        arg = pending.pop(0)
        if arg == "--page":
            pages.append(pending.pop(0) if pending else "")
        elif arg.startswith("--page="):
            pages.append(arg.split("=", 1)[1])
        else:
            rest.append(arg)

    unknown = [a for a in rest if a not in FLAGS]
    if unknown:
        print(f"unknown option(s): {', '.join(unknown)}\n\n{USAGE}")
        raise SystemExit(2)
    if pages and ("--tables-only" in rest or "--check" in rest):
        print("--page writes a whole page; it does not combine with --tables-only or --check.")
        raise SystemExit(2)
    bad = [name for name in pages if name not in WIDGET_DOCS]
    if bad:
        print(f"no such widget page: {', '.join(bad)}")
        raise SystemExit(2)

    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    source = TYPE_DECLARATIONS.read_text(encoding="utf-8")

    if "--tables-only" in rest or "--check" in rest:
        write_tables_only(source, check="--check" in rest)
        return

    missing = [name for name in WIDGET_DOCS if not extract_props(source, f"{name}Props")
               and name not in SPECIAL_PROPS]
    if missing:
        print(f"warning: no interface props found for: {', '.join(missing)}")

    targets = pages or sorted(WIDGET_DOCS)
    written = 0
    for name in targets:
        (DOCS_DIR / f"{name}.md").write_text(render_widget_doc(source, name), encoding="utf-8")
        written += 1

    if not pages:
        (DOCS_DIR / "README.md").write_text(render_index() + "\n", encoding="utf-8")
        (DOCS_DIR / "_template.md").write_text(TEMPLATE, encoding="utf-8")
        print(f"Generated {written} widget pages and the book index.")
    else:
        print(f"Generated {written} page(s): {', '.join(f'docs/widget/{n}.md' for n in pages)}")


if __name__ == "__main__":
    main()
