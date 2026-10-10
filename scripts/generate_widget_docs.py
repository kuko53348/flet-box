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
    # are rendered in their own section). Handles `Omit<Parent, 'a' | 'b'>`.
    target = re.search(r"extends\s+(.+)", header)
    base = None
    if target:
        extends = target.group(1).strip()
        if extends.startswith("Omit<"):
            match = re.search(r"Omit<\s*([A-Za-z_$][\w$]*)", extends)
            if match:
                base = match.group(1)
        else:
            match = re.search(r"[A-Za-z_$][\w$]*", extends)
            if match:
                base = match.group(0)
    if base and base != "CommonProps":
        inherited = extract_props(source, base)
        for prop, kind in inherited:
            if prop not in {p for p, _ in own}:
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


def describe(prop: str) -> str:
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


def prop_table(props: list[tuple[str, str]]) -> str:
    lines = ["| Prop | Type | Description |", "| --- | --- | --- |"]
    for prop, kind in props:
        kind = kind.replace("|", "\\|")
        lines.append(f"| `{prop}` | `{kind}` | {describe(prop)} |")
    return "\n".join(lines)


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
    props = extract_props(source, f"{name}Props") or SPECIAL_PROPS.get(name, [])
    common = extract_props(source, "CommonProps")
    has_common = extends_common_chain(source, f"{name}Props")

    common_section = ""
    if has_common:
        common_section = f"""
### Common props

Every widget also accepts these shared props — see [common props](COMMON_PROPS.md) for the full rules and aliases.

{prop_table(common)}
"""

    return f"""# {name}

{data['summary']}

## When to use it

{data['when']}

## Quick start

{code_block(data['basic'])}

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

{prop_table(props)}
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


def main() -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    source = TYPE_DECLARATIONS.read_text(encoding="utf-8")

    missing = [name for name in WIDGET_DOCS if not extract_props(source, f"{name}Props")
               and name not in SPECIAL_PROPS]
    if missing:
        print(f"warning: no interface props found for: {', '.join(missing)}")

    written = 0
    for name in sorted(WIDGET_DOCS):
        doc = render_widget_doc(source, name)
        (DOCS_DIR / f"{name}.md").write_text(doc, encoding="utf-8")
        written += 1

    (DOCS_DIR / "README.md").write_text(render_index() + "\n", encoding="utf-8")
    (DOCS_DIR / "_template.md").write_text(TEMPLATE, encoding="utf-8")
    print(f"Generated {written} widget pages and the book index.")


if __name__ == "__main__":
    main()
