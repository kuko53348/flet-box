/**
 * @file CodeViewer.js
 * @description Read-only code block with line numbers and syntax highlighting.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { composeUpdate } from "../utils/composeUpdate.js";
import { generateHighlightedHtml, syntaxPaletteFor } from "../utils/syntaxHighlight.js";
import { clipboard } from "../tools/clipboard.js";

import { toREM } from "../utils/units.js";

export const CodeViewer = (props) => {
  const {
code = "",
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
    lineNumberColor,
    ...rest
  } = props;

  // The token map follows the block's own surface: the light theme's #F4F4F5
  // pane needs the light map, and a caller that paints a dark pane on the light
  // theme still gets spans that read.
  const syntaxPalette = syntaxPaletteFor(backgroundColor);
  // The gutter is not a token: it takes the muted ink of the pane's palette, so
  // a custom pane does not get the page theme's grey on top of it.
  const gutterInk = lineNumberColor || syntaxPalette.muted;

  let currentCode =
    typeof code === "string" ? code : JSON.stringify(code, null, 2);
  let currentTitle = title;
  let headerRef = null;
  let headerTitleRef = null;
  let scrollWrapperRef = null;
  let lineNumbersColRef = null;
  let codeColRef = null;
  let codeWrapperRef = null;
  let copyResetTimer = null;

  const refreshContent = () => {
    const lines = currentCode.split("\n");
    const highlightedLines = lines.map((line) => generateHighlightedHtml(line, syntaxPalette));

    if (showLineNumbers) {
      // Update line numbers
      if (lineNumbersColRef) {
        lineNumbersColRef.innerHTML = "";
        for (let i = 0; i < lines.length; i++) {
          const numberDiv = WidgetFactory({
            tag: "div",
            padding: `0 ${toREM(padding / 2)} 0 ${toREM(padding)}`,
            whiteSpace: "pre",
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
            whiteSpace: "pre",
            minHeight: "1.5em",
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
    widgetName: "CodeViewer",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    ...rest,
  });

  // The copy button carries its own solid plate, so it reads on the primary
  // header and on any caller-painted pane, and it never relies on the page ink.
  const copyButtonRef = WidgetFactory({
    tag: "button",
    type: "button",
    textContent: "Copy",
    backgroundColor: colors.card,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: "2px 8px",
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: "1.6",
    flexShrink: 0,
    cursor: "pointer",
    onclick: () => {
      clipboard.copy(currentCode);
      copyButtonRef.textContent = "Copied";
      clearTimeout(copyResetTimer);
      copyResetTimer = setTimeout(() => {
        copyButtonRef.textContent = "Copy";
      }, 1500);
    },
  });

  // Inside the header when there is one; floating over the block otherwise.
  const attachCopyButton = () => {
    if (headerRef) {
      copyButtonRef.style.position = "";
      copyButtonRef.style.top = "";
      copyButtonRef.style.right = "";
      copyButtonRef.style.zIndex = "";
      headerRef.appendChild(copyButtonRef);
    } else {
      copyButtonRef.style.position = "absolute";
      copyButtonRef.style.top = toREM(8);
      copyButtonRef.style.right = toREM(8);
      copyButtonRef.style.zIndex = "3";
      container.appendChild(copyButtonRef);
    }
  };

  // Header. Built through a helper so a later `title` update can create one on a
  // widget that was constructed without it.
  const ensureHeader = (text) => {
    if (!showHeader || !text) return null;
    if (headerRef) {
      headerTitleRef.textContent = text;
      return headerRef;
    }
    headerRef = WidgetFactory({
      tag: "div",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      padding: "8px 12px",
      backgroundColor: colors.primary,
      borderRadius: `${toREM(borderRadius)} ${toREM(borderRadius)} 0 0`,
      // The header is a primary plate; in dark mode that plate is near-white,
      // so a literal white title disappeared into it.
      color: colors.onPrimary,
      fontSize: "14px",
      fontWeight: "bold",
    });
    headerTitleRef = WidgetFactory({
      tag: "span",
      textContent: text,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    });
    headerRef.appendChild(headerTitleRef);
    container.insertBefore(headerRef, container.firstChild);
    attachCopyButton();
    return headerRef;
  };
  ensureHeader(currentTitle);

  // Scroll wrapper
  scrollWrapperRef = WidgetFactory({
    tag: "div",
    backgroundColor,
    borderRadius: currentTitle
      ? `0 0 ${toREM(borderRadius)} ${toREM(borderRadius)}`
      : toREM(borderRadius),
    overflow: "auto",
    maxHeight: toREM(maxHeight),
    overflowX: "auto",
    overflowY: "auto",
  });

  // Build content according to showLineNumbers
  if (showLineNumbers) {
    const flexContainer = WidgetFactory({
      tag: "div",
      display: "flex",
      flexDirection: "row",
      minWidth: "100%",
      width: "fit-content",
    });

    lineNumbersColRef = WidgetFactory({
      tag: "div",
      backgroundColor,
      borderRight: `1px solid ${colors.border}`,
      padding: `${toREM(padding)} 0`,
      fontFamily: "monospace",
      fontSize: toREM(fontSize),
      lineHeight: "1.5",
      textAlign: "right",
      color: gutterInk,
      userSelect: "none",
      width: toREM(lineNumberWidth),
      flexShrink: 0,
    });

    codeColRef = WidgetFactory({
      tag: "div",
      padding: toREM(padding),
      fontFamily: "monospace",
      fontSize: toREM(fontSize),
      lineHeight: "1.5",
      whiteSpace: "pre",
      flex: 1,
      overflowX: "visible",
    });

    flexContainer.appendChild(lineNumbersColRef);
    flexContainer.appendChild(codeColRef);
    scrollWrapperRef.appendChild(flexContainer);

    // Sync scroll
    const syncScroll = () => {
      if (lineNumbersColRef) lineNumbersColRef.scrollTop = codeColRef.scrollTop;
    };
    codeColRef.addEventListener("scroll", syncScroll);

    scrollWrapperRef.onUnmount(() => {
      codeColRef.removeEventListener("scroll", syncScroll);
    });
  } else {
    codeWrapperRef = WidgetFactory({
      tag: "div",
      padding: toREM(padding),
      fontFamily: "monospace",
      fontSize: toREM(fontSize),
      whiteSpace: "pre",
      lineHeight: "1.5",
    });
    scrollWrapperRef.appendChild(codeWrapperRef);
  }

  container.appendChild(scrollWrapperRef);
  if (!headerRef) attachCopyButton();
  container.onUnmount(() => clearTimeout(copyResetTimer));

  // Fill initial content
  const lines = currentCode.split("\n");
  const highlightedLines = lines.map((line) => generateHighlightedHtml(line, syntaxPalette));

  if (showLineNumbers) {
    for (let i = 0; i < lines.length; i++) {
      const numberDiv = WidgetFactory({
        tag: "div",
        padding: `0 ${toREM(padding / 2)} 0 ${toREM(padding)}`,
        whiteSpace: "pre",
        textContent: String(startingLineNumber + i),
      });
      lineNumbersColRef.appendChild(numberDiv);
    }

    for (let i = 0; i < lines.length; i++) {
      const lineDiv = WidgetFactory({
        tag: "div",
        whiteSpace: "pre",
        minHeight: "1.5em",
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
    ensureHeader(currentTitle);
  };

  // `title` is a reactive prop mapped to `textContent` in the prop database, so
  // letting the factory see it would replace the header and the whole code
  // wrapper with a bare text node. Own it and update the header instead.
  composeUpdate(container, ["title"], (props) => {
    if (props.title === undefined) return;
    container.updateTitle(props.title);
    // `makeReactive` rewrites the value into `_originalProps` on every setter
    // call; leaving it there means the next factory update wipes the widget.
    delete container._originalProps.title;
  });

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
