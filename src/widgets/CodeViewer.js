// widgets/CodeViewer.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { generateHighlightedHtml } from "../utils/syntaxHighlight.js";

export const CodeViewer = (props) => {
  const {
    code,
    title,
    maxHeight = 400,
    fontSize = 12,
    backgroundColor = colors.gray100,
    padding = 12,
    borderRadius = 8,
    showHeader = true,
    showLineNumbers = false,
    startingLineNumber = 1,
    lineNumberWidth = 40,
    lineNumberColor = colors.secondary,
    ...rest
  } = props;

  let currentCode =
    typeof code === "string" ? code : JSON.stringify(code, null, 2);
  let currentTitle = title;
  let headerRef = null;
  let scrollWrapperRef = null;
  let lineNumbersColRef = null;
  let codeColRef = null;
  let codeWrapperRef = null;

  const refreshContent = () => {
    const lines = currentCode.split("\n");
    const highlightedLines = lines.map((line) => generateHighlightedHtml(line));

    if (showLineNumbers) {
      // Update line numbers
      if (lineNumbersColRef) {
        lineNumbersColRef.innerHTML = "";
        for (let i = 0; i < lines.length; i++) {
          const numberDiv = WidgetFactory({
            tag: "div",
            style: {
              padding: `0 ${padding / 2}px 0 ${padding}px`,
              whiteSpace: "pre",
            },
            textContent: String(startingLineNumber + i),
          });
          lineNumbersColRef.appendChild(numberDiv);
        }
      }

      // Update code
      if (codeColRef) {
        codeColRef.innerHTML = "";
        for (let i = 0; i < lines.length; i++) {
          const lineDiv = WidgetFactory({
            tag: "div",
            style: { whiteSpace: "pre", minHeight: "1.5em" },
          });
          lineDiv.innerHTML = highlightedLines[i] || "&nbsp;";
          codeColRef.appendChild(lineDiv);
        }
      }
    } else {
      // Update code without line numbers
      if (codeWrapperRef) {
        codeWrapperRef.innerHTML = highlightedLines.join("\n");
      }
    }
  };

  const container = WidgetFactory({
    tag: "div",
    style: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      ...rest.style,
    },
    ...rest,
  });

  // Header
  if (currentTitle && showHeader) {
    headerRef = WidgetFactory({
      tag: "div",
      style: {
        padding: "8px 12px",
        backgroundColor: colors.primary,
        borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
        color: "#fff",
        fontSize: "14px",
        fontWeight: "bold",
      },
      textContent: currentTitle,
    });
    container.appendChild(headerRef);
  }

  // Scroll wrapper
  scrollWrapperRef = WidgetFactory({
    tag: "div",
    style: {
      backgroundColor,
      borderRadius: currentTitle
        ? `0 0 ${borderRadius}px ${borderRadius}px`
        : `${borderRadius}px`,
      overflow: "auto",
      maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
      overflowX: "auto",
      overflowY: "auto",
    },
  });

  // Build content according to showLineNumbers
  if (showLineNumbers) {
    const flexContainer = WidgetFactory({
      tag: "div",
      style: {
        display: "flex",
        flexDirection: "row",
        minWidth: "100%",
        width: "fit-content",
      },
    });

    lineNumbersColRef = WidgetFactory({
      tag: "div",
      style: {
        backgroundColor,
        borderRight: `1px solid ${colors.border}`,
        padding: `${padding}px 0`,
        fontFamily: "monospace",
        fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
        lineHeight: "1.5",
        textAlign: "right",
        color: lineNumberColor,
        userSelect: "none",
        width: `${lineNumberWidth}px`,
        flexShrink: 0,
      },
    });

    codeColRef = WidgetFactory({
      tag: "div",
      style: {
        padding: `${padding}px`,
        fontFamily: "monospace",
        fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
        lineHeight: "1.5",
        whiteSpace: "pre",
        flex: 1,
        overflowX: "visible",
      },
    });

    flexContainer.appendChild(lineNumbersColRef);
    flexContainer.appendChild(codeColRef);
    scrollWrapperRef.appendChild(flexContainer);

    // Sync scroll
    const syncScroll = () => {
      if (lineNumbersColRef) lineNumbersColRef.scrollTop = codeColRef.scrollTop;
    };
    codeColRef.addEventListener("scroll", syncScroll);

    const originalCleanup = scrollWrapperRef._cleanup;
    scrollWrapperRef._cleanup = () => {
      if (originalCleanup) originalCleanup();
      codeColRef.removeEventListener("scroll", syncScroll);
    };
  } else {
    codeWrapperRef = WidgetFactory({
      tag: "div",
      style: {
        padding: typeof padding === "number" ? `${padding}px` : padding,
        fontFamily: "monospace",
        fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
        whiteSpace: "pre",
        lineHeight: "1.5",
      },
    });
    scrollWrapperRef.appendChild(codeWrapperRef);
  }

  container.appendChild(scrollWrapperRef);

  // Fill initial content
  const lines = currentCode.split("\n");
  const highlightedLines = lines.map((line) => generateHighlightedHtml(line));

  if (showLineNumbers) {
    for (let i = 0; i < lines.length; i++) {
      const numberDiv = WidgetFactory({
        tag: "div",
        style: {
          padding: `0 ${padding / 2}px 0 ${padding}px`,
          whiteSpace: "pre",
        },
        textContent: String(startingLineNumber + i),
      });
      lineNumbersColRef.appendChild(numberDiv);
    }

    for (let i = 0; i < lines.length; i++) {
      const lineDiv = WidgetFactory({
        tag: "div",
        style: { whiteSpace: "pre", minHeight: "1.5em" },
      });
      lineDiv.innerHTML = highlightedLines[i] || "&nbsp;";
      codeColRef.appendChild(lineDiv);
    }
  } else {
    codeWrapperRef.innerHTML = highlightedLines.join("\n");
  }

  // ========== PUBLIC METHODS ==========
  container.updateCode = (newCode) => {
    currentCode =
      typeof newCode === "string" ? newCode : JSON.stringify(newCode, null, 2);
    refreshContent();
  };

  container.updateTitle = (newTitle) => {
    currentTitle = newTitle;
    if (headerRef) {
      headerRef.textContent = currentTitle;
    }
  };

  container.scrollTo = (x, y) => {
    if (scrollWrapperRef) {
      scrollWrapperRef.scrollLeft = x;
      scrollWrapperRef.scrollTop = y;
    }
  };

  container.scrollToStart = () => {
    if (scrollWrapperRef) scrollWrapperRef.scrollLeft = 0;
  };

  container.scrollToEnd = () => {
    if (scrollWrapperRef)
      scrollWrapperRef.scrollLeft = scrollWrapperRef.scrollWidth;
  };

  return container;
};

export default CodeViewer;
