// utils/markdownParser.js
import { DataTable } from "../widgets/DataTable.js";
import { Text } from "../widgets/Text.js";
import { Container } from "../widgets/Container.js";
import { Row } from "../widgets/Row.js";
import { Icon } from "../widgets/Icon.js";
import { CodeViewer } from "../widgets/CodeViewer.js";
import { colors } from "./themes.js";

// ========== TABLAS ==========
const isTableLine = (line) => {
  return (
    line.includes("|") &&
    line.trim().startsWith("|") &&
    line.trim().endsWith("|")
  );
};

const isTableSeparatorLine = (line) => {
  return (
    line.includes("|") &&
    line.includes("-") &&
    /[\s\|]*:?-+:?[\s\|]*/.test(line)
  );
};

const parseTable = (lines, startIndex) => {
  let i = startIndex;
  const headerLine = lines[i].trim();
  const separatorLine = lines[i + 1]?.trim();

  if (!isTableLine(headerLine)) return null;
  if (!isTableSeparatorLine(separatorLine)) return null;

  const headers = headerLine
    .split("|")
    .filter((cell) => cell.trim() !== "")
    .map((cell) => cell.trim());

  if (headers.length === 0) return null;

  i += 2;

  const rows = [];
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!isTableLine(line)) break;

    const cells = line
      .split("|")
      .filter((cell) => cell.trim() !== "")
      .map((cell) => cell.trim());

    if (cells.length === headers.length) {
      const rowData = {};
      headers.forEach((header, idx) => {
        rowData[header] = cells[idx] || "";
      });
      rows.push(rowData);
    }
    i++;
  }

  const columns = headers.map((h) => ({ key: h, label: h }));
  const tableWidget = DataTable({
    columns: columns,
    rows: rows,
    striped: true,
    hoverable: true,
    bordered: true,
    compact: false,
  });

  return { widget: tableWidget, nextIndex: i };
};

// ========== TEXTO INLINE ==========
export const parseInlineToWidgets = (text) => {
  if (!text) return [Text({ text: "" })];

  const parts = [];
  let remaining = text;

  const boldRegex = /\*\*(.*?)\*\*/;
  let match;
  while ((match = boldRegex.exec(remaining)) !== null) {
    const before = remaining.substring(0, match.index);
    if (before) parts.push(Text({ text: before, size: 14 }));
    parts.push(Text({ text: match[1], size: 14, weight: "bold" }));
    remaining = remaining.substring(match.index + match[0].length);
  }
  if (remaining) parts.push(Text({ text: remaining, size: 14 }));

  if (parts.length === 0) return [Text({ text: text, size: 14 })];
  if (parts.length === 1) return parts;

  return [
    Row({ alignItems: "center", gap: 4, children: parts, flexWrap: "wrap" }),
  ];
};

// ========== PARSEADOR PRINCIPAL ==========
export const markdownToWidgets = (text, options = {}) => {
  if (!text) return [];

  const widgets = [];
  const lines = text.split("\n");
  let i = 0;
  let inCodeBlock = false;
  let codeContent = [];
  let codeLang = "";

  while (i < lines.length) {
    const line = lines[i];

    // CODE BLOCKS
    if (!inCodeBlock && line.trim().startsWith("```")) {
      inCodeBlock = true;
      codeLang = line.trim().replace(/```/g, "").trim();
      i++;
      continue;
    }
    if (inCodeBlock && line.trim().startsWith("```")) {
      inCodeBlock = false;
      const codeWidget = CodeViewer({
        code: codeContent.join("\n"),
        language: codeLang || "javascript",
        maxHeight: options.codeMaxHeight || 300,
        fontSize: options.codeFontSize || 12,
        showHeader: false,
        showLineNumbers: true,
      });
      widgets.push(codeWidget);
      codeContent = [];
      codeLang = "";
      i++;
      continue;
    }
    if (inCodeBlock) {
      codeContent.push(line);
      i++;
      continue;
    }

    // TABLES
    if (
      isTableLine(line) &&
      i + 1 < lines.length &&
      isTableSeparatorLine(lines[i + 1])
    ) {
      const result = parseTable(lines, i);
      if (result) {
        widgets.push(result.widget);
        i = result.nextIndex;
        continue;
      }
    }

    // HEADERS
    if (line.match(/^### /)) {
      widgets.push(
        Text({
          text: line.substring(4),
          size: 18,
          weight: "bold",
          marginTop: 16,
          marginBottom: 8,
        }),
      );
      i++;
      continue;
    }
    if (line.match(/^## /)) {
      widgets.push(
        Text({
          text: line.substring(3),
          size: 22,
          weight: "bold",
          marginTop: 20,
          marginBottom: 10,
        }),
      );
      i++;
      continue;
    }
    if (line.match(/^# /)) {
      widgets.push(
        Text({
          text: line.substring(2),
          size: 28,
          weight: "bold",
          marginTop: 24,
          marginBottom: 12,
        }),
      );
      i++;
      continue;
    }

    // HORIZONTAL RULE
    if (line.match(/^---$/) || line.match(/^\*\*\*$/)) {
      widgets.push(
        Container({ height: 1, bgColor: colors.border, marginVertical: 16 }),
      );
      i++;
      continue;
    }

    // BLOCKQUOTE
    if (line.match(/^> /)) {
      const content = line.substring(2);
      const innerWidgets = parseInlineToWidgets(content);
      widgets.push(
        Container({
          padding: 12,
          bgColor: `${colors.primary}10`,
          borderRadius: 8,
          borderLeft: `4px solid ${colors.primary}`,
          marginVertical: 8,
          child: Row({ alignItems: "center", gap: 8, children: innerWidgets }),
        }),
      );
      i++;
      continue;
    }

    // UNORDERED LIST
    if (line.match(/^\s*[-*+]\s/)) {
      const content = line.replace(/^\s*[-*+]\s/, "");
      const innerWidgets = parseInlineToWidgets(content);
      widgets.push(
        Row({
          alignItems: "center",
          gap: 8,
          marginVertical: 4,
          children: [
            Icon({ name: "circle", size: 8, color: colors.primary }),
            ...innerWidgets,
          ],
        }),
      );
      i++;
      continue;
    }

    // ORDERED LIST
    if (line.match(/^\s*\d+\.\s/)) {
      const number = line.match(/^\s*(\d+)\.\s/)[1];
      const content = line.replace(/^\s*\d+\.\s/, "");
      const innerWidgets = parseInlineToWidgets(content);
      widgets.push(
        Row({
          alignItems: "center",
          gap: 8,
          marginVertical: 4,
          children: [
            Text({
              text: `${number}.`,
              size: 14,
              weight: "bold",
              color: colors.primary,
            }),
            ...innerWidgets,
          ],
        }),
      );
      i++;
      continue;
    }

    // EMPTY LINE
    if (line.trim() === "") {
      widgets.push(Container({ height: 8 }));
      i++;
      continue;
    }

    // PARAGRAPH
    const paragraphWidgets = parseInlineToWidgets(line);
    if (paragraphWidgets.length === 1) {
      widgets.push(paragraphWidgets[0]);
    } else {
      widgets.push(
        Row({
          alignItems: "center",
          gap: 4,
          children: paragraphWidgets,
          flexWrap: "wrap",
          marginVertical: 4,
        }),
      );
    }
    i++;
  }

  return widgets;
};

// ========== EXPORTACIONES PRINCIPALES ==========
export const parseMarkdownToWidgets = markdownToWidgets;
export const parseMarkdown = (text) => text;
export const parseInlineMarkdown = (text) => text;
export const escapeHtml = (text) => text;

// Exportación por defecto
export default {
  markdownToWidgets,
  parseMarkdownToWidgets,
  parseInlineToWidgets,
  parseMarkdown,
  parseInlineMarkdown,
  escapeHtml,
};
