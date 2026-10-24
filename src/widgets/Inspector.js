// utils/Inspector.js
import { getWidgetProps } from "../utils/getWidgetProps.js";
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

/**
 * Converts a JavaScript value to its source-code string representation.
 * Handles primitives, arrays, plain objects, and nested widget elements
 * by recursively calling `Inspector` for any DOM node that carries `_widgetName`.
 *
 * @param {*} value - The value to stringify.
 * @param {number} [indent=0] - Current indentation depth (used for pretty-printing nested structures).
 * @returns {string} A human-readable code representation of the value.
 */
const stringifyValue = (value, indent = 0) => {
  const spaces = "  ".repeat(indent);

  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (typeof value === "function") {
    return "() => {}";
  }

  if (typeof value === "string") {
    const escaped = value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    return `'${escaped}'`;
  }

  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value
      .map((item) => stringifyValue(item, indent + 1))
      .join(",\n" + spaces + "  ");
    return `[\n${spaces}  ${items}\n${spaces}]`;
  }

  if (typeof value === "object" && value !== null) {
    // If the object is a widget DOM node, delegate to Inspector for full reconstruction
    if (value.nodeType === 1 && value._widgetName) {
      return Inspector(value, indent);
    }

    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";

    const props = entries
      .map(([k, v]) => {
        if (typeof v === "number" || typeof v === "boolean") {
          return `${k}: ${v}`;
        }
        if (typeof v === "string") {
          return `${k}: '${v.replace(/'/g, "\\'")}'`;
        }
        if (v && v.nodeType === 1) {
          return `${k}: ${Inspector(v, indent + 1)}`;
        }
        return `${k}: ${stringifyValue(v, indent + 1)}`;
      })
      .join(",\n" + spaces + "  ");

    return `{\n${spaces}  ${props}\n${spaces}}`;
  }

  return String(value);
};

/**
 * Resolves the display name of a widget element.
 *
 * Names come from the underlying HTML tag (documented behavior): `span` →
 * `Span()`, `div` → `Div()`, `button` → `Button()`, … `_widgetName` is used
 * only as a fallback for tags without a mapping so the output reads like real
 * DOM.
 *
 * @param {HTMLElement} widget - The DOM node whose name to resolve.
 * @returns {string} The widget name (e.g. "Button", "Span", "Div").
 */
const TAG_NAMES = {
  SPAN: "Span",
  DIV: "Div",
  BUTTON: "Button",
  INPUT: "Input",
  TEXTAREA: "Textarea",
  IMG: "Image",
  CANVAS: "Canvas",
  VIDEO: "Video",
  AUDIO: "Audio",
  SELECT: "Select",
  TABLE: "Table",
  TH: "Th",
  TD: "Td",
  TR: "Tr",
  UL: "Ul",
  OL: "Ol",
  LI: "Li",
  A: "A",
  CODE: "Code",
  PRE: "Pre",
  HEADER: "Header",
  FOOTER: "Footer",
};

const getWidgetName = (widget) => {
  const tag = (widget.tagName || "").toUpperCase();
  if (TAG_NAMES[tag]) return TAG_NAMES[tag];
  if (widget._widgetName) return widget._widgetName;
  return widget.tagName?.toLowerCase() || "unknown";
};

/**
 * Collects all direct child elements of a widget, merging both the real DOM
 * children and any virtual children stored in `_children` (set by WidgetFactory).
 * Deduplication prevents the same node from appearing twice.
 *
 * @param {HTMLElement} widget - The widget whose children to collect.
 * @returns {HTMLElement[]} Deduplicated array of child element nodes.
 */
const collectChildren = (widget) => {
  const children = [];

  for (const child of widget.children) {
    if (child.nodeType === 1) {
      children.push(child);
    }
  }

  // _children may hold widget references that aren't yet in the DOM
  if (widget._children && Array.isArray(widget._children)) {
    for (const child of widget._children) {
      if (child && child.nodeType === 1 && !children.includes(child)) {
        children.push(child);
      }
    }
  }

  return children;
};

/**
 * The widget form: a monospace block holding the reconstructed call.
 *
 * `Inspector` itself is a string builder, which is what the console helpers
 * need. A screen that wants to *show* a tree asks for this one, by passing the
 * props object the documentation describes.
 *
 * @param {{ widget?: HTMLElement, indent?: number }} props
 * @returns {HTMLElement}
 */
const InspectorView = ({ widget, indent = 0, ...rest }) => {
  const dump = widget
    ? Inspector(widget, indent)
    : 'Inspector({ widget }) — nothing to inspect.';

  const container = WidgetFactory({
    widgetName: "Inspector",
    tag: "pre",
    text: dump,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace',
    fontSize: 12,
    color: colors.text,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    overflowX: "auto",
    width: "100%",
    ...rest,
  });

  // A <pre> that wraps is a dump nobody can read; the horizontal scroll above
  // is the deal.
  container.style.whiteSpace = "pre";

  return container;
};

/**
 * Converts a widget element back into its equivalent source-code representation,
 * recursively reconstructing its full prop tree and children.
 *
 * This is the core utility for the widget inspector — it lets you paste the output
 * directly into your code to reproduce the exact widget configuration.
 *
 * @param {HTMLElement} widget - The root widget to inspect.
 * @param {number} [indent=0] - Starting indentation depth for pretty-printing.
 * @returns {string} Source code string such as `Row({ gap: 8, children: [...] })`.
 */
export const Inspector = (target, indent = 0) => {
  // Two calls, one function. `Inspector({ widget, indent })` is the documented
  // widget: it paints the dump so a settings screen can show a tree. Called
  // with a node it stays the string builder `printWidgetCode` uses.
  if (
    target &&
    typeof target === "object" &&
    target.nodeType !== 1 &&
    "widget" in target
  ) {
    return InspectorView(target);
  }

  const widget = target;
  if (!widget || widget.nodeType !== 1) {
    return String(widget);
  }

  const name = getWidgetName(widget);
  const props = getWidgetProps(widget);
  const spaces = "  ".repeat(indent);
  const nextSpaces = "  ".repeat(indent + 1);

  // Separate structural props from the rest so we can render them last
  const { child, children, ...otherProps } = props;

  // `child` may legitimately be an ARRAY (`child: [Text(...)]`), which the
  // factory accepts. Normalise it into the children list: otherwise the subtree
  // is dropped and — because `child` is truthy — the DOM-children fallback below
  // is skipped too, so the whole branch disappears from the output.
  const childNode = Array.isArray(child) ? null : child;
  const kids = [
    ...(Array.isArray(child) ? child : []),
    ...(Array.isArray(children) ? children : []),
  ];

  const propsList = Object.entries(otherProps)
    .map(([key, value]) => {
      const formattedValue = stringifyValue(value, indent + 1);
      return `${key}: ${formattedValue}`;
    })
    .join(",\n" + nextSpaces);

  // Reconstruct a single `child` prop
  let childStr = "";
  if (childNode && childNode.nodeType === 1) {
    childStr = `\n${nextSpaces}child: ${Inspector(childNode, indent + 1)}`;
  }

  // Reconstruct a `children` array prop (including an array-valued `child`)
  let childrenStr = "";
  if (kids.length > 0) {
    const childrenItems = kids
      .filter((c) => c && c.nodeType === 1)
      .map((c) => Inspector(c, indent + 1))
      .join(",\n" + nextSpaces + "  ");

    if (childrenItems) {
      childrenStr = `\n${nextSpaces}children: [\n${nextSpaces}  ${childrenItems}\n${nextSpaces}]`;
    }
  }

  // Fall back to actual DOM children when no explicit child/children props exist
  const domChildren = collectChildren(widget);
  let domChildrenStr = "";
  if (domChildren.length > 0 && !childNode && kids.length === 0) {
    const domChildrenItems = domChildren
      .map((c) => Inspector(c, indent + 1))
      .join(",\n" + nextSpaces + "  ");

    if (domChildrenItems) {
      domChildrenStr = `\n${nextSpaces}children: [\n${nextSpaces}  ${domChildrenItems}\n${nextSpaces}]`;
    }
  }

  const allContent = [
    propsList && `${nextSpaces}${propsList}`,
    childStr,
    childrenStr,
    domChildrenStr,
  ]
    .filter(Boolean)
    .join(",\n");

  if (allContent) {
    return `${name}({\n${allContent}\n${spaces}})`;
  }
  return `${name}()`;
};

/**
 * Logs the widget's source-code representation to the console with green
 * monospace styling — handy for quick visual inspection during development.
 *
 * @param {HTMLElement} widget - The widget to print.
 */
export const printWidgetCode = (widget) => {
  console.log(
    "%c" + Inspector(widget),
    "color: #4ade80; font-family: monospace;",
  );
};

/**
 * Performs a full diagnostic inspection of a widget, logging its name,
 * resolved props, reconstructed source code, and child count as a grouped
 * console entry. Returns the widget unchanged so it can be used inline
 * (e.g. `inspectWidget(myWidget).style.color = "red"`).
 *
 * @param {HTMLElement} widget - The widget to inspect.
 * @returns {HTMLElement} The same widget, unmodified.
 */
export const inspectWidget = (widget) => {
  console.group(`🔍 ${getWidgetName(widget)}`);
  console.log("📦 Props:", getWidgetProps(widget));
  console.log("📝 Code:\n", Inspector(widget));
  console.log("👪 Children:", collectChildren(widget).length);
  console.groupEnd();
  return widget;
};

export default { Inspector, printWidgetCode, inspectWidget };
