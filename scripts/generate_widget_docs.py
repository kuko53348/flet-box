from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "src" / "widgets"
DOCS_DIR = ROOT / "docs" / "widget"
TYPE_DECLARATIONS = ROOT / "src" / "index.d.ts"
SNIPPET_SOURCE = Path("/Users/maenysjavierquesadareyes/Desktop/salva_termux/make_snippets/FletBox/FletBox_snippets_creator/FletBox_create_widgets.py")

COMMON_PROPS = [
    ("children", "Node", "-", "Child content rendered inside the widget."),
    ("id", "String", "-", "DOM id for the element."),
    ("className", "String", "-", "CSS class names applied to the element."),
    ("ref", "Function", "-", "Callback receiving the underlying DOM node."),
    ("onClick", "Function", "-", "Native click event handler."),
    ("disabled", "Boolean", "false", "Disables interaction when supported."),
]

PROPS_BY_WIDGET = {
    "Accordion": ["items", "expandedIndex", "onChange", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "AlertDialog": ["open", "title", "message", "actions", "onClose", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Audio": ["src", "controls", "autoplay", "loop", "muted", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Avatar": ["src", "name", "size", "shape", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Badge": ["label", "color", "variant", "dot", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "BottomSheet": ["open", "title", "onClose", "maxHeight", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Button": ["text", "variant", "size", "icon", "iconPosition", "onPress", "fullWidth", "bgColor", "color", "disabled"],
    "Card": ["title", "padding", "elevation", "borderRadius", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Carousel": ["items", "autoPlay", "interval", "showIndicators", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Chart": ["data", "type", "color", "height", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Checkbox": ["checked", "onCheck", "disabled", "size", "children", "id", "className", "style", "ref", "onClick"],
    "Chip": ["label", "icon", "variant", "color", "onDelete", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "CircularBar": ["value", "max", "size", "color", "showValue", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "CircularChart": ["data", "size", "colors", "showLabels", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "CodeViewer": ["code", "language", "showLineNumbers", "maxHeight", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Column": ["display", "flexDirection", "width", "height", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Container": ["display", "flexDirection", "overflow", "padding", "bgColor", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "DataTable": ["columns", "rows", "striped", "hoverable", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Divider": ["orientation", "color", "thickness", "margin", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "DraggBox": ["children", "group", "disabled", "onDragStart", "onDragEnd", "id", "className", "style", "ref", "onClick"],
    "Dropdown": ["options", "value", "onChange", "placeholder", "disabled", "children", "id", "className", "style", "ref", "onClick"],
    "DroppBox": ["accepts", "onDrop", "disabled", "children", "id", "className", "style", "ref", "onClick"],
    "FloatingActionButton": ["icon", "onClick", "color", "bottom", "children", "id", "className", "style", "ref", "disabled"],
    "GridView": ["columns", "itemHeight", "spacing", "data", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Icon": ["name", "size", "color", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Image": ["src", "alt", "width", "height", "fit", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Input": ["value", "placeholder", "type", "onChange", "disabled", "label", "validation", "maxLength", "required", "onInput", "onBlur", "onFocus"],
    "Inspector": ["target", "title", "expanded", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "InstallButton": ["text", "variant", "onInstalled", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "ListTile": ["title", "subtitle", "leading", "trailing", "onPress", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "ListView": ["data", "itemBuilder", "gap", "wrapItems", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Markdown": ["content", "theme", "maxWidth", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Modal": ["open", "title", "onClose", "closeOnOverlayClick", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Pagination": ["totalItems", "pageSize", "currentPage", "onPageChange", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "ProgressBar": ["value", "max", "height", "color", "showValue", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "QRCode": ["value", "size", "bgColor", "fgColor", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Radio": ["selected", "onSelect", "disabled", "size", "children", "id", "className", "style", "ref", "onClick"],
    "Rating": ["value", "max", "onChange", "size", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Row": ["display", "flexDirection", "width", "height", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Skeleton": ["width", "height", "borderRadius", "variant", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Slider": ["value", "min", "max", "onChange", "disabled", "children", "id", "className", "style", "ref", "onClick"],
    "SnackBar": ["message", "variant", "duration", "open", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Stack": ["position", "top", "left", "center", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Stepper": ["steps", "currentStep", "onChange", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Switch": ["value", "onToggle", "disabled", "size", "children", "id", "className", "style", "ref", "onClick"],
    "Text": ["text", "value", "size", "color", "weight", "type", "styles", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Tooltip": ["content", "position", "trigger", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "TreeView": ["data", "expanded", "onSelect", "children", "id", "className", "style", "ref", "onClick", "disabled"],
    "Video": ["src", "controls", "autoplay", "loop", "muted", "children", "id", "className", "style", "ref", "onClick", "disabled"],
}

SPECIAL_EXAMPLES = {
    "Button": '''import { Button } from "flet-box";

const example = Button({
  text: "Save",
  variant: "filled",
  size: "medium",
  bgColor: "#2563eb",
  color: "#ffffff",
  onPress: () => console.log("saved"),
  fullWidth: false,
  disabled: false,
});''',
    "Text": '''import { Text } from "flet-box";

const title = Text({
  text: "Welcome back",
  type: "h2",
  size: 28,
  color: "#111827",
  weight: "bold",
});''',
    "Container": '''import { Container, Text } from "flet-box";

const layout = Container({
  display: "flex",
  flexDirection: "column",
  padding: 16,
  gap: 12,
  bgColor: "#f8fafc",
  child: [
    Text({ text: "Hello FletBox" }),
  ],
});''',
    "Input": '''import { Input } from "flet-box";

const field = Input({
  label: "Email",
  placeholder: "name@example.com",
  type: "email",
  value: "",
  onChange: (value) => console.log(value),
  validation: "email",
  required: true,
});''',
    "ListView": '''import { ListView, Text } from "flet-box";

const list = ListView({
  data: ["One", "Two", "Three"],
  gap: 8,
  itemBuilder: (item, index) => Text({ text: `${index + 1}. ${item}` }),
});''',
}

FALLBACK_SNIPPETS = {
        "Badge": {
                "basic": 'Badge({ value: 3, child: Icon({ name: "notifications" }) })',
                "normal": '''Badge({
    value: 3,
    child: Icon({ name: "notifications" }),
    position: "top-right",
    bgColor: colors.danger,
})''',
                "full": '''Badge({
    value: 12,
    child: Icon({ name: "shopping_cart", size: 28 }),
    position: "top-right",
    offset: 6,
    max: 99,
    showZero: false,
    borderWidth: 2,
    borderColor: colors.surface,
})''',
        },
        "CircularChart": {
                "basic": 'CircularChart({ data: [25, 35, 40] })',
                "normal": '''CircularChart({
    data: [25, 35, 40],
    size: 180,
    colors: ["#2563eb", "#16a34a", "#f59e0b"],
})''',
                "full": '''CircularChart({
    data: [
        { label: "Completed", value: 60 },
        { label: "Pending", value: 25 },
        { label: "Blocked", value: 15 },
    ],
    size: 240,
    showLabels: true,
    colors: [colors.success, colors.warning, colors.danger],
})''',
        },
        "DraggBox": {
                "basic": 'DraggBox({ child: Text({ text: "Drag me" }) })',
                "normal": '''DraggBox({
    child: Card({ child: Text({ text: "Move this card" }) }),
    group: "cards",
    data: { id: 1 },
    onDragEnd: (event, data) => console.log(data),
})''',
                "full": '''DraggBox({
    child: Card({
        padding: 16,
        child: Text({ text: "Drag this task to another column" }),
    }),
    group: "kanban",
    data: { id: "task-1", title: "Write documentation" },
    cloneOnDrag: true,
    opacity: 0.6,
    onDragStart: (event, data) => console.log("started", data),
    onDragEnd: (event, data) => console.log("finished", data),
})''',
        },
        "DroppBox": {
                "basic": 'DroppBox({ child: Text({ text: "Drop here" }) })',
                "normal": '''DroppBox({
    child: Text({ text: "Drop a card here" }),
    acceptGroups: ["cards"],
    onDrop: (data) => console.log("dropped", data),
})''',
                "full": '''DroppBox({
    child: Container({
        padding: 32,
        borderRadius: 12,
        child: Text({ text: "Drop files or tasks here" }),
    }),
    acceptGroups: ["kanban"],
    showFeedback: true,
    activeBgColor: "#eff6ff",
    activeBorderColor: colors.primary,
    validBgColor: "#f0fdf4",
    validBorderColor: colors.success,
    invalidBgColor: "#fef2f2",
    invalidBorderColor: colors.danger,
    onDrop: (data, group, event) => console.log(data, group),
})''',
        },
        "FloatingActionButton": {
                "basic": 'FloatingActionButton({ icon: "add", onPress: () => console.log("add") })',
                "normal": '''FloatingActionButton({
    icon: "add",
    label: "Create",
    onPress: () => createItem(),
    position: "bottomRight",
})''',
                "full": '''FloatingActionButton({
    icon: Icon({ name: "edit" }),
    label: "New note",
    extended: true,
    backgroundColor: colors.primary,
    foregroundColor: "#ffffff",
    elevation: 6,
    margin: 24,
    position: "bottomRight",
    onPress: () => openEditor(),
})''',
        },
        "ListTile": {
                "basic": 'ListTile({ title: "Home" })',
                "normal": '''ListTile({
    leading: Icon({ name: "person" }),
    title: "Jane Doe",
    subtitle: "jane@example.com",
    trailing: Icon({ name: "chevron_right" }),
    onPress: () => openProfile(),
})''',
                "full": '''ListTile({
    leading: Avatar({ name: "JD", size: 44 }),
    title: "Project documentation",
    subtitle: "Updated five minutes ago",
    description: "The complete FletBox guide",
    trailing: Icon({ name: "more_vert" }),
    selected: false,
    divider: true,
    paddingHorizontal: 16,
    paddingVertical: 12,
    hoverColor: colors.gray100,
    onPress: () => openProject(),
})''',
        },
}

COMMON_USAGE_EXAMPLE = '''import { Button, Column, Container, Row, Text } from "flet-box";

const panel = Container({
    width: "100%",          // number values are pixels; strings accept CSS units
    padding: 24,            // 24px on every side
    margin: "16px auto",   // CSS shorthand: vertical and horizontal spacing
    bgColor: "#f8fafc",    // background color
    borderRadius: 12,
    elevation: 2,
    gap: 12,
    child: Column({
        children: [
            Text({ text: "Account settings", size: 24, weight: "bold" }),
            Row({
                gap: 8,
                justifyContent: "space-between",
                children: [
                    Text({ text: "Update your profile" }),
                    Button({
                        text: "Save",
                        bgColor: "#2563eb",
                        color: "#ffffff",
                        onPress: () => console.log("saved"),
                    }),
                ],
            }),
        ],
    }),
});'''

BEGINNER_EXAMPLE = '''import { Column, Container, Text } from "flet-box";

const welcomeCard = Container({
    padding: 20,
    margin: 16,
    bgColor: "#ffffff",
    borderRadius: 12,
    child: Column({
        gap: 8,
        children: [
            Text({ text: "My first FletBox screen", size: 24, weight: "bold" }),
            Text({ text: "Widgets are small building blocks. Put them inside each other to build a screen." }),
        ],
    }),
});'''


def extract_interface_block(source: str, interface_name: str):
    match = re.search(rf"interface\s+{re.escape(interface_name)}\b[^{{]*\{{", source)
    if not match:
        return ""

    start = match.end()
    depth = 1
    index = start
    while index < len(source) and depth:
        if source[index] == "{":
            depth += 1
        elif source[index] == "}":
            depth -= 1
        index += 1
    return source[start : index - 1]


def extract_declared_props(widget_name: str):
    if not TYPE_DECLARATIONS.exists():
        return []

    source = TYPE_DECLARATIONS.read_text(encoding="utf-8")
    interface_match = re.search(
        rf"interface\s+{re.escape(widget_name)}Props\b([^{{]*)\{{", source
    )
    block = extract_interface_block(source, f"{widget_name}Props")
    if not block:
        return []

    props = []
    if interface_match and "extends CommonProps" in interface_match.group(1):
        props.extend(extract_interface_props(source, "CommonProps"))
    props.extend(extract_interface_props(block))
    unique_props = []
    seen = set()
    for prop in props:
        if prop[0] != "style" and prop[0] not in seen:
            seen.add(prop[0])
            unique_props.append(prop)
    return unique_props


def extract_interface_props(block: str, interface_name: str | None = None):
    if interface_name is not None:
        block = extract_interface_block(block, interface_name)
    props = []
    for line in block.splitlines():
        line = line.strip()
        match = re.match(r"([A-Za-z_$][\w$]*)\??\s*:\s*(.+?);?$", line)
        if match:
            props.append((match.group(1), match.group(2).rstrip(";")))
    return props


def extract_snippet_examples(widget_name: str):
    """Load the supplied basic/normal/full examples when that source is available."""
    fallback = FALLBACK_SNIPPETS.get(widget_name, {})
    if not SNIPPET_SOURCE.exists():
        return fallback

    source = SNIPPET_SOURCE.read_text(encoding="utf-8")
    examples = {}
    for level in ("basic", "normal", "full"):
        match = re.search(
            rf"['\"]{re.escape(widget_name)}\.{level}['\"]\s*:\s*('''.*?'''|\"\"\".*?\"\"\"|'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\")\s*,?",
            source,
            re.DOTALL,
        )
        if not match:
            continue
        value = match.group(1)
        if value.startswith("'''") or value.startswith('"""'):
            value = value[3:-3]
        else:
            value = value[1:-1]
        examples[level] = value.strip()
    return {**fallback, **examples}


def normalize_snippet_imports(example: str, widget_name: str):
    """Make snippets readable as documentation without pretending to add imports."""
    if not example:
        return example
    if example.startswith("import ") or example.startswith("const ") or example.startswith("export "):
        return example
    return example


def render_snippet_section(widget_name: str, level: str, example: str):
    labels = {
        "basic": ("Basic example", "The smallest useful version. Start here if this widget is new to you."),
        "normal": ("Everyday example", "A practical version with the props most applications usually need."),
        "full": ("Full example", "A larger example showing advanced styling, layout, events, and customization."),
    }
    title, explanation = labels[level]
    return f'''## {title}

{explanation}

```javascript
{normalize_snippet_imports(example, widget_name)}
```
'''


def infer_default(prop: str):
    if prop in {"disabled", "fullWidth", "readonly", "required", "checked", "selected", "open", "muted", "autoplay", "loop", "controls", "showIndicators", "showArrows", "showDots", "infinite", "showValue", "expanded", "showLineNumbers", "closeOnOverlayClick", "dot", "visible", "wrap", "striped", "hoverable", "bordered", "clearable", "portal", "indeterminate", "animatedStripes", "readOnly", "allowHalf", "showLabels", "showGrid", "showValues", "smooth", "areaGradient", "animate", "glow", "showFeedback", "showDragHandle", "closeOnDragDown", "showCloseButton", "showFirstLast", "showPrevNext", "showTotal", "selectable", "defaultExpanded", "showIcons", "linkUnderline", "allowDangerousHtml"}:
        return "false"
    if prop in {"data", "items", "rows", "columns", "options", "actions", "steps", "colors", "marks", "acceptGroups", "expandedNodes", "badges"}:
        return "[]"
    return "-"


def build_prop_table(widget_name: str, props):
    lines = ["| Prop | Type | Default | Description |", "| --- | --- | --- | --- |"]
    for prop, declared_type in props:
        if prop == "style":
            continue
        kind = declared_type.replace("|", "\\|")
        default = infer_default(prop)

        description = {
            "text": "Visible text content rendered by the widget.",
            "value": "Current value controlled by the widget.",
            "label": "Label or caption shown near the control.",
            "title": "Primary title text for the widget.",
            "subtitle": "Secondary descriptive text.",
            "message": "Body text or notification content.",
            "content": "Markdown or rich content source.",
            "placeholder": "Hint shown when the field is empty.",
            "src": "Resource URL for media or image content.",
            "alt": "Alternative text for media or image content.",
            "name": "Identifier or label for the element.",
            "variant": "Visual variation or style preset.",
            "size": "Component size or preset.",
            "color": "Color value or theme token.",
            "bgColor": "Background color applied to the element.",
            "padding": "Internal spacing around the component.",
            "margin": "External spacing around the component.",
            "gap": "Space between child items.",
            "data": "Collection of items used to render content.",
            "items": "List or set of entries shown by the widget.",
            "rows": "Data rows used by table-like widgets.",
            "columns": "Column definitions or list of columns.",
            "options": "Available options for selection widgets.",
            "steps": "Step entries for wizard or stepper patterns.",
            "onChange": "Callback fired when the value changes.",
            "onPress": "Callback fired when the widget is pressed.",
            "onSelect": "Callback fired when an option is selected.",
            "onClose": "Callback fired when the widget closes.",
            "onInput": "Callback fired while the user types.",
            "disabled": "Disables interaction and shows the non-interactive state.",
            "checked": "Current checked state.",
            "selected": "Current selected state.",
            "open": "Whether the widget is visible or active.",
        }.get(prop, f"Property used by the {widget_name} component.")

        lines.append(f"| `{prop}` | `{kind}` | {default} | {description} |")
    return "\n".join(lines)


def example_for_widget(widget_name: str):
    if widget_name in SPECIAL_EXAMPLES:
        return SPECIAL_EXAMPLES[widget_name]
    props = PROPS_BY_WIDGET.get(widget_name, [])
    sample = []
    for prop in ["text", "title", "label", "value", "src", "data", "items", "checked", "open", "children"]:
        if prop in props:
            sample.append(prop)
    if not sample:
        sample = props[:5]
    if not sample:
        sample = ["children"]

    lines = []
    for prop in sample[:5]:
        if prop == "children":
            lines.append("  child: Text({ text: \"Example\" })")
        elif prop in {"text", "title", "label", "message", "placeholder", "content"}:
            lines.append(f'  {prop}: "Example value"')
        elif prop in {"value", "currentPage", "currentStep", "max", "pageSize", "totalItems"}:
            lines.append(f"  {prop}: 1")
        elif prop in {"checked", "selected", "open", "disabled", "showValue", "loop", "autoplay", "controls", "muted", "expanded", "dot", "fullWidth"}:
            lines.append(f"  {prop}: true")
        elif prop in {"items", "data", "rows", "columns", "options", "steps", "actions"}:
            lines.append(f"  {prop}: []")
        elif prop in {"onClick", "onPress", "onChange", "onInput", "onClose", "onSelect", "onDelete"}:
            lines.append(f"  {prop}: () => console.log(\"{prop}\")")
        elif prop in {"color", "bgColor", "variant", "type", "display", "flexDirection", "position", "orientation", "fit", "theme", "language"}:
            lines.append(f'  {prop}: "default"')
        elif prop in {"size", "height", "width", "padding", "margin", "gap", "thickness", "borderRadius"}:
            lines.append(f"  {prop}: 16")
        elif prop in {"src", "alt"}:
            lines.append(f'  {prop}: "https://example.com/image.jpg"')
        else:
            lines.append(f'  {prop}: "value"')

    joined_lines = ",\n".join(lines)
    imports = widget_name if widget_name == "Text" else f"{widget_name}, Text"
    return f'''import {{ {imports} }} from "flet-box";

const example = {widget_name}({{
{joined_lines}
}});'''


def render_widget_doc(widget_name: str):
    props = extract_declared_props(widget_name)
    if not props:
        props = [(prop, "Any") for prop in PROPS_BY_WIDGET.get(widget_name, [])]
    table = build_prop_table(widget_name, props)
    example = example_for_widget(widget_name)
    snippets = extract_snippet_examples(widget_name)
    snippet_sections = "\n".join(
        render_snippet_section(widget_name, level, snippets[level])
        for level in ("basic", "normal", "full")
        if level in snippets
    )
    source_note = (
        "The examples below come from the FletBox snippet library. The prop table is based on `src/index.d.ts`. "
        "When an example and the type declaration use different names, prefer the type declaration and verify the implementation."
    )
    return f'''# {widget_name}

## Overview
`{widget_name}` is a ready-to-use building block. Think of it like a LEGO piece: give it some props, place it inside another widget, and FletBox creates the browser element for you.

You do not need to write HTML or manually change the DOM to use this widget. You call the widget as a JavaScript function and pass an object between `{{` and `}}`.

## Learn it in one minute

1. Import the widget from `flet-box`.
2. Call it with `WidgetName({{ ... }})`.
3. Add props to describe its content, size, color, spacing, and behavior.
4. Put it inside `Container`, `Row`, `Column`, or another widget.

```javascript
{BEGINNER_EXAMPLE}
```

## When to use
Use `{widget_name}` when you need this kind of interface element. Start with the smallest example, then add one prop at a time. You can copy the example, change the text or color, and see the result immediately.

## Common props

- `children` / `child`: content rendered inside the widget.
- `id`: DOM id for the element.
- `className`: CSS class names applied to the element.
- `ref`: callback that receives the underlying DOM node.
- `onClick` / event handlers: native browser event callbacks.
- `disabled`: disables interaction when supported.

## Full prop list

{table}

## How props work

A prop is simply an instruction inside the object passed to the widget. The name tells FletBox what to change, and the value tells it how to change it.

```javascript
{widget_name}({{
    padding: 16,              // space inside the widget
    margin: "8px 0",         // space outside the widget
    bgColor: "#eff6ff",      // background color
    width: "100%",           // CSS size or a number of pixels
    children: [],             // widgets placed inside it
    onPress: () => {{         // what to do after a press
        console.log("Hello");
    }},
}});
```

You do not need to use every prop. Begin with the required props, then add optional props only when you need them.

## Example usage

```javascript
{example}
```

## Examples from the FletBox snippet library

{source_note}

{snippet_sections}

## Common layout and styling examples

The following example shows how common FletBox props work together. Numeric spacing values are interpreted as pixels, while strings can use CSS units and shorthand values.

```javascript
{COMMON_USAGE_EXAMPLE}
```

### Common prop quick reference

- `padding: 24` adds `24px` inside the widget on all sides.
- `padding: "8px 16px"` uses CSS shorthand for vertical and horizontal spacing.
- `margin: "16px auto"` adds outside spacing and can center a fixed-width element.
- `bgColor: "#f8fafc"` sets the background color. Color tokens and CSS colors can be used.
- `color: "#111827"` sets the foreground or text color when supported.
- `width: 320` means `320px`; `width: "100%"` uses a CSS percentage.
- `children` is an array of widgets; `child` is useful when a component accepts one child.
- `gap: 12` controls the space between children in layout widgets.
- `onPress` and `onClick` receive event callbacks for interactive behavior.

## Beginner tips

- Change one value at a time so you can see what each prop does.
- Use `Text` to check that your layout is in the place you expect.
- Use `Container` for a box, `Row` for items side by side, and `Column` for items one below another.
- Use `padding` when content needs breathing room inside a box.
- Use `margin` when you need space between this widget and its neighbors.
- Use `bgColor` to make the boundaries of a box easy to see while learning.
- If a prop is optional, leaving it out lets FletBox use its default behavior.

## Common mistakes

- Do not put plain text where a widget is expected unless the widget explicitly accepts strings.
- Use `children: [ ... ]` for several child widgets and `child: widget` for one child when the widget supports both.
- Check spelling carefully: `onPress`, `onClick`, and `onChange` are different events.
- If a helper such as `padding()` or `margin()` is not available in your import list, use a number or CSS string first.

## Behavior notes
- Integrates cleanly with FletBox runtime semantics and DOM rendering.
- Can be nested inside layout widgets and combined with other components.
- Uses the same direct prop and event conventions as the rest of the framework.
- Keeps the API simple and readable for composing interfaces fast.

## Accessibility
- Prefer clear labels and readable text for interactive controls.
- Respect the `disabled` state and keyboard behavior when available.
- Keep state changes understandable for screen readers and assistive technology.

## Related widgets
- `Container`
- `Row`
- `Column`
- `Stack`
- `Text`
- `Button`
'''


def main():
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    widget_names = sorted(
        p.stem for p in SRC_DIR.glob("*.js") if p.name not in {"index.js"}
    )

    index_lines = [
        "# Widgets documentation",
        "",
        "This directory teaches FletBox from the first widget to complete compositions.",
        "",
        "If you are new to FletBox, start with [Start here](START_HERE.md). Each widget page then includes simple explanations, the full prop list, and copy-paste examples.",
        "",
        "For complete pages and application structures, read [Build your first FletBox app](../guides/app-templates.md).",
        "",
        "To create projects from the terminal, read [FletBox CLI](../cli/README.md).",
        "",
        "## Widget index",
        "",
    ]
    index_lines.insert(6, "Start with [Start here](START_HERE.md) before choosing a widget.")
    for name in widget_names:
        index_lines.append(f"- [{name}]({name}.md)")
    (DOCS_DIR / "README.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")

    for name in widget_names:
        doc = render_widget_doc(name)
        (DOCS_DIR / f"{name}.md").write_text(doc, encoding="utf-8")

    template = '''# WidgetName

## Overview
Explain what the widget is used for in simple language. Describe it as a building block.

## Learn it in one minute
Show the smallest useful example and explain what each part does.

## When to use
Describe the scenarios where it adds value.

## Common props

- `children` / `child`: content rendered inside the widget.
- `id`: DOM id for the element.
- `className`: CSS class names applied to the element.
- `ref`: callback that receives the underlying DOM node.
- `onClick` / event handlers: native browser event callbacks.
- `disabled`: disables interaction when supported.

## Full prop list

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `propName` | `Type` | `default` | Description |

## How props work
Explain how the most important props affect content, size, spacing, color, and interaction.

## Example usage

```javascript
import { WidgetName } from "flet-box";

const example = WidgetName({
  children: "Example",
});
```

## Examples from the FletBox snippet library

### Basic example
Show the smallest useful version.

### Everyday example
Show the most common real-world combination of props.

### Full example
Show advanced layout, styling, events, and customization.

## Common layout and styling examples
Show `padding`, `margin`, `bgColor`, `color`, `width`, `gap`, `children`, and event handlers in a realistic composition.

## Beginner tips
- Explain what to try first and which props are optional.

## Behavior notes
- Explain layout, interaction, and rendering details.

## Accessibility
- Keyboard and screen-reader behavior considerations.

## Related widgets
- `Container`
- `Row`
- `Column`
- `Stack`
'''
    (DOCS_DIR / "_template.md").write_text(template, encoding="utf-8")

    print(f"Generated widget docs for {len(widget_names)} widgets")


if __name__ == "__main__":
    main()
