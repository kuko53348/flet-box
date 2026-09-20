// utils/Inspector.js
import { getWidgetProps } from "../utils/getWidgetProps.js";

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
 * Priority order:
 * 1. `_widgetName` — explicitly set by the widget factory (most reliable)
 * 2. Class / tag-based heuristics as a fallback for elements created without the factory
 *
 * @param {HTMLElement} widget - The DOM node whose name to resolve.
 * @returns {string} The widget name (e.g. "Button", "Row", "Container").
 */
const getWidgetName = (widget) => {
  // _widgetName is stamped onto every element created through WidgetFactory
  if (widget._widgetName) return widget._widgetName;

  // Fallback heuristics for raw DOM elements
  if (widget.classList?.contains("material-icons")) return "Icon";
  if (widget.tagName === "BUTTON") return "Button";
  if (widget.tagName === "INPUT") return "Input";
  if (widget.tagName === "IMG") return "Image";
  if (widget.tagName === "SPAN") return "Text";
  if (widget.tagName === "DIV") {
    if (widget.style.display === "flex") {
      if (widget.style.flexDirection === "row") return "Row";
      if (widget.style.flexDirection === "column") return "Column";
    }
    return "Container";
  }

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
export const Inspector = (widget, indent = 0) => {
  if (!widget || widget.nodeType !== 1) {
    return String(widget);
  }

  const name = getWidgetName(widget);
  const props = getWidgetProps(widget);
  const spaces = "  ".repeat(indent);
  const nextSpaces = "  ".repeat(indent + 1);

  // Separate structural props from the rest so we can render them last
  const { child, children, ...otherProps } = props;

  const propsList = Object.entries(otherProps)
    .map(([key, value]) => {
      const formattedValue = stringifyValue(value, indent + 1);
      return `${key}: ${formattedValue}`;
    })
    .join(",\n" + nextSpaces);

  // Reconstruct a single `child` prop
  let childStr = "";
  if (child && child.nodeType === 1) {
    childStr = `\n${nextSpaces}child: ${Inspector(child, indent + 1)}`;
  }

  // Reconstruct a `children` array prop
  let childrenStr = "";
  if (children && Array.isArray(children) && children.length > 0) {
    const childrenItems = children
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
  if (
    domChildren.length > 0 &&
    !child &&
    (!children || children.length === 0)
  ) {
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
