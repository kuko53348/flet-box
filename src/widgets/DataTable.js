// widgets/DataTable.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const DataTable = (props) => {
  const {
    columns,
    rows,
    striped = true,
    hoverable = true,
    bordered = true,
    onRowClick,

    // ========== COLOR PROPS ==========
    headerBgColor = colors.gray100,
    headerTextColor = colors.text,
    headerFontWeight = "bold",
    headerFontSize = 14,

    rowBgColor = "transparent",
    rowTextColor = colors.text,
    rowFontSize = 13,

    stripedRowBgColor = colors.gray50,

    hoverRowBgColor = `${colors.primary}10`,

    borderColor = colors.border,
    borderWidth = 1,

    cellPadding = "10px 12px",
    headerCellPadding = "12px",

    // ========== OTHER PROPS ==========
    ...rest
  } = props;

  // Main container with WidgetFactory
  const container = WidgetFactory({
    width: "100%",
    overflowX: "auto",
    ...rest,
  });

  // Create table element
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.border = bordered
    ? `${borderWidth}px solid ${borderColor}`
    : "none";

  // ========== HEADER ==========
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  for (const col of columns) {
    const th = document.createElement("th");
    th.textContent = typeof col === "string" ? col : col.label;
    th.style.padding = headerCellPadding;
    th.style.textAlign = "left";
    th.style.borderBottom = `2px solid ${borderColor}`;
    th.style.backgroundColor = headerBgColor;
    th.style.color = headerTextColor;
    th.style.fontWeight = headerFontWeight;
    th.style.fontSize =
      typeof headerFontSize === "number"
        ? `${headerFontSize}px`
        : headerFontSize;

    // Custom alignment per column
    if (typeof col !== "string" && col.align) {
      th.style.textAlign = col.align;
    }

    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // ========== BODY ==========
  const tbody = document.createElement("tbody");

  rows.forEach((row, index) => {
    const tr = document.createElement("tr");

    // Row background color (striped or normal)
    if (striped && index % 2 === 1) {
      tr.style.backgroundColor = stripedRowBgColor;
    } else {
      tr.style.backgroundColor = rowBgColor;
    }

    // Hover effect
    if (hoverable) {
      tr.style.transition = "background-color 0.2s";
      tr.addEventListener("mouseenter", () => {
        tr.style.backgroundColor = hoverRowBgColor;
      });
      tr.addEventListener("mouseleave", () => {
        tr.style.backgroundColor =
          striped && index % 2 === 1 ? stripedRowBgColor : rowBgColor;
      });
    }

    // Row click handler
    if (onRowClick) {
      tr.style.cursor = "pointer";
      tr.addEventListener("click", () => onRowClick(row, index));
    }

    // Cells
    for (const col of columns) {
      const td = document.createElement("td");
      const key = typeof col === "string" ? col : col.key;
      const value = row[key];

      td.textContent = value !== undefined ? String(value) : "";
      td.style.padding = cellPadding;
      td.style.borderBottom = `${borderWidth}px solid ${borderColor}`;
      td.style.color = rowTextColor;
      td.style.fontSize =
        typeof rowFontSize === "number" ? `${rowFontSize}px` : rowFontSize;

      // Custom alignment per column
      if (typeof col !== "string" && col.align) {
        td.style.textAlign = col.align;
      }

      // Custom formatter per column
      if (
        typeof col !== "string" &&
        col.format &&
        typeof col.format === "function"
      ) {
        td.textContent = col.format(value, row);
      }

      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.appendChild(table);

  // ========== PUBLIC METHODS ==========

  // Update table data
  container.updateData = (newRows) => {
    rows.length = 0;
    rows.push(...newRows);

    // Rebuild body
    const newTbody = document.createElement("tbody");

    newRows.forEach((row, index) => {
      const tr = document.createElement("tr");

      if (striped && index % 2 === 1) {
        tr.style.backgroundColor = stripedRowBgColor;
      } else {
        tr.style.backgroundColor = rowBgColor;
      }

      if (hoverable) {
        tr.style.transition = "background-color 0.2s";
        tr.addEventListener("mouseenter", () => {
          tr.style.backgroundColor = hoverRowBgColor;
        });
        tr.addEventListener("mouseleave", () => {
          tr.style.backgroundColor =
            striped && index % 2 === 1 ? stripedRowBgColor : rowBgColor;
        });
      }

      if (onRowClick) {
        tr.style.cursor = "pointer";
        tr.addEventListener("click", () => onRowClick(row, index));
      }

      for (const col of columns) {
        const td = document.createElement("td");
        const key = typeof col === "string" ? col : col.key;
        const value = row[key];

        td.textContent = value !== undefined ? String(value) : "";
        td.style.padding = cellPadding;
        td.style.borderBottom = `${borderWidth}px solid ${borderColor}`;
        td.style.color = rowTextColor;
        td.style.fontSize =
          typeof rowFontSize === "number" ? `${rowFontSize}px` : rowFontSize;

        if (typeof col !== "string" && col.align) {
          td.style.textAlign = col.align;
        }

        if (
          typeof col !== "string" &&
          col.format &&
          typeof col.format === "function"
        ) {
          td.textContent = col.format(value, row);
        }

        tr.appendChild(td);
      }
      newTbody.appendChild(tr);
    });

    table.replaceChild(newTbody, tbody);
  };

  // Update table columns
  container.updateColumns = (newColumns) => {
    columns.length = 0;
    columns.push(...newColumns);

    // Rebuild header
    const newThead = document.createElement("thead");
    const newHeaderRow = document.createElement("tr");

    for (const col of newColumns) {
      const th = document.createElement("th");
      th.textContent = typeof col === "string" ? col : col.label;
      th.style.padding = headerCellPadding;
      th.style.textAlign = "left";
      th.style.borderBottom = `2px solid ${borderColor}`;
      th.style.backgroundColor = headerBgColor;
      th.style.color = headerTextColor;
      th.style.fontWeight = headerFontWeight;
      th.style.fontSize =
        typeof headerFontSize === "number"
          ? `${headerFontSize}px`
          : headerFontSize;

      if (typeof col !== "string" && col.align) {
        th.style.textAlign = col.align;
      }

      newHeaderRow.appendChild(th);
    }
    newThead.appendChild(newHeaderRow);
    table.replaceChild(newThead, thead);

    // Rebuild body with existing rows
    container.updateData(rows);
  };

  return container;
};

export default DataTable;
