// core/warnings.js
// FletBox Warning System – Elegant, minimal, helpful.

// 🚀 Gate de entorno: desactiva warnings en producción
const IS_DEV = typeof FLETBOX_DEV !== 'undefined' ? FLETBOX_DEV : true;

const suggestionCache = new Map();
let propNames = [];

export function setPropNames(names) {
  propNames = names;
  window.__FLETBOX_PROP_NAMES = names;
}

function getSuggestions(name, limit = 3) {
  const key = `${name}_${limit}`;
  if (suggestionCache.has(key)) return suggestionCache.get(key);

  const input = name.toLowerCase();
  const scored = propNames.map((p) => {
    const lower = p.toLowerCase();
    let score = 0;
    if (lower === input) score = 100;
    else if (lower.startsWith(input)) score = 80;
    else if (input.startsWith(lower)) score = 70;
    else if (lower.includes(input)) score = 50;
    else if (input.includes(lower)) score = 40;
    else {
      const parts = input.split(/(?=[A-Z])/);
      for (const part of parts) {
        if (lower.includes(part)) score += 10;
      }
    }
    return { prop: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const result = scored
    .filter((s) => s.score > 0 && s.prop !== name)
    .slice(0, limit)
    .map((s) => s.prop);
  suggestionCache.set(key, result);
  return result;
}

function getCallLocation() {
  const stack = new Error().stack;
  const lines = stack.split("\n");
  const skip = [
    "warnings.js",
    "translateProps.js",
    "processProps.js",
    "widgetFactory.js",
    "createWidget.js",
    "assignProps.js",
    "addChildren.js",
    "makeParentable.js",
    "effects.js",
    "lifecycle.js",
    "reactivity.js",
    "stackPosition.js",
    "tools.js",
    "Container.js",
    "Row.js",
    "Column.js",
    "Stack.js",
    "Text.js",
    "Icon.js",
    "Button.js",
    "Image.js",
    "Card.js",
    "ListTile.js",
    "ListView.js",
    "GridView.js",
    "ProgressBar.js",
    "Rating.js",
    "Chip.js",
    "Badge.js",
    "Divider.js",
    "Accordion.js",
    "Input.js",
    "Radio.js",
    "Switch.js",
    "Checkbox.js",
    "Dropdown.js",
    "SnackBar.js",
    "Modal.js",
    "BottomSheet.js",
    "AlertDialog.js",
    "FloatingActionButton.js",
    "CodeViewer.js",
    "Inspector.js",
    "DraggBox.js",
    "DroppBox.js",
    "DataTable.js",
    "Carousel.js",
    "Tooltip.js",
    "Pagination.js",
    "TreeView.js",
    "Stepper.js",
    "Skeleton.js",
    "Chart.js",
    "QRCode.js",
    "Slider.js",
    "InstallButton.js",
    "Video.js",
    "Audio.js",
    "CircularBar.js",
    "CircularChart.js",
    "Markdown.js",
  ];

  for (const line of lines) {
    let shouldSkip = false;
    for (const pattern of skip) {
      if (line.includes(pattern)) {
        shouldSkip = true;
        break;
      }
    }
    if (shouldSkip) continue;
    if (line.includes("<anonymous>") && !line.includes("app.js")) continue;
    const match = line.match(/at\s+(.*):(\d+):(\d+)/);
    if (match) {
      const file = match[1];
      const fileName = file.split("/").pop() || file.split("\\").pop() || file;
      if (file.includes("node_modules")) continue;
      return { file, fileName, line: match[2], column: match[3] };
    }
  }

  for (const line of lines) {
    const match = line.match(/at\s+(.*):(\d+):(\d+)/);
    if (match) {
      const file = match[1];
      const fileName = file.split("/").pop() || file.split("\\").pop() || file;
      if (!fileName.includes("node_modules") && !fileName.includes("core")) {
        return { file, fileName, line: match[2], column: match[3] };
      }
    }
  }
  return { file: null, fileName: "unknown", line: "?", column: "?" };
}

function printHeader(label) {
  console.group(
    `%c⚠️  FLETBOX: ${label}`,
    "color: #fbbf24; font-weight: 900; font-size: 18px; background: #1e293b; padding: 6px 12px; border-radius: 6px;",
  );
}

function printProp(name, status = "") {
  console.log(
    `  %c📦 Prop:  %c"${name}"%c  ${status}`,
    "color: #94a3b8; font-size: 13px;",
    "color: #f87171; font-weight: 900; font-size: 16px;",
    "color: #94a3b8; font-size: 13px;",
  );
}

function printLocation(location) {
  if (location.file) {
    console.log(
      `  %c📍 Error at: %c${location.fileName}:${location.line}%c  (click to go to code)`,
      "color: #94a3b8; font-size: 13px;",
      "color: #f87171; font-weight: 700; font-size: 14px; text-decoration: underline; cursor: pointer;",
      "color: #94a3b8; font-size: 13px;",
    );
    console.log(`  🔗 ${location.file}:${location.line}:${location.column}`);
  } else {
    console.log(
      `  %c📍 Error at: %c${location.fileName}:${location.line}`,
      "color: #94a3b8; font-size: 13px;",
      "color: #f87171; font-weight: 700; font-size: 14px;",
    );
  }
}

function printSuggestions(suggestions) {
  if (suggestions.length) {
    console.log(
      `  %c💡 Did you mean?`,
      "color: #fbbf24; font-weight: 700; font-size: 14px;",
    );
    suggestions.forEach((s) =>
      console.log(
        `    %c• "${s}"`,
        "color: #34d399; font-weight: 600; font-size: 14px;",
      ),
    );
  } else {
    console.log(
      `  %c💡 No similar props found. Check spelling.`,
      "color: #94a3b8; font-size: 13px;",
    );
  }
}

function printWidget(name) {
  if (name) {
    console.log(
      `  %c🧩 Widget: %c${name}`,
      "color: #94a3b8; font-size: 13px;",
      "color: #c084fc; font-weight: 600; font-size: 14px;",
    );
  }
}

function printDocs(prop) {
  console.log(
    `  %c📚 Docs:  %chttps://fletbox.dev/docs/props#${prop.toLowerCase()}`,
    "color: #94a3b8; font-size: 13px;",
    "color: #60a5fa; text-decoration: underline; font-weight: 500; font-size: 13px;",
  );
}

export function warnUnknownProp(propName, context = {}) {
  if (!IS_DEV) return;

  const suggestions = getSuggestions(propName);
  const location = getCallLocation();

  printHeader("UNKNOWN PROP");
  printProp(propName, "(not in database)");
  printLocation(location);
  printSuggestions(suggestions);
  printWidget(context.widgetName);
  printDocs(propName);
  console.groupEnd();
}

export function warnDeprecatedProp(propName, replacement = null, context = {}) {
  if (!IS_DEV) return;

  const location = getCallLocation();

  printHeader("DEPRECATED PROP");
  printProp(propName, "is deprecated");
  if (replacement) {
    console.log(
      `  %c🔄 Use:   %c"${replacement}"%c  instead`,
      "color: #94a3b8; font-size: 13px;",
      "color: #34d399; font-weight: 700; font-size: 16px;",
      "color: #94a3b8; font-size: 13px;",
    );
  }
  printLocation(location);
  printWidget(context.widgetName);
  console.groupEnd();
}

export function warnInvalidPropType(propName, expected, actual, context = {}) {
  if (!IS_DEV) return;

  const location = getCallLocation();

  printHeader("INVALID PROP TYPE");
  printProp(propName, "");
  console.log(
    `  %c📊 Expected: %c${expected}`,
    "color: #94a3b8; font-size: 13px;",
    "color: #34d399; font-weight: 600; font-size: 14px;",
  );
  console.log(
    `  %c📊 Got:     %c${typeof actual}`,
    "color: #94a3b8; font-size: 13px;",
    "color: #f87171; font-weight: 600; font-size: 14px;",
  );
  printLocation(location);
  printWidget(context.widgetName);
  console.groupEnd();
}

export function clearSuggestionCache() {
  suggestionCache.clear();
}

export default {
  warnUnknownProp,
  warnDeprecatedProp,
  warnInvalidPropType,
  clearSuggestionCache,
  setPropNames,
};