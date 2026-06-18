// widgets/Markdown.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

/**
 * Simple Markdown parser (lightweight, no dependencies)
 */
const parseMarkdown = (text) => {
  if (!text) return "";

  let html = text;

  // Headers
  html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Code inline
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  // Code block
  html = html.replace(/```(.*?)```/gs, "<pre><code>$1</code></pre>");

  // Links
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  );

  // Images
  html = html.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    '<img src="$2" alt="$1" loading="lazy">',
  );

  // Lists
  html = html.replace(/^\s*-\s(.*$)/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  html = html.replace(/^\s*\d+\.\s(.*$)/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ol>$1</ol>");

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>");

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr>");

  // Paragraphs
  html = html.replace(/^(?!<[a-z]|$)(.*$)/gm, "<p>$1</p>");

  // Line breaks
  html = html.replace(/\n\n/g, "<br>");

  return html;
};

export const Markdown = (props) => {
  const {
    text,
    source, // alias for text
    content, // alias for text
    children,

    // Font styling
    fontSize = 14,
    fontFamily = "system-ui, -apple-system, sans-serif",
    lineHeight = 1.6,
    color = colors.text,

    // Link styling
    linkColor = colors.primary,
    linkHoverColor = colors.primary,
    linkUnderline = false,

    // Code styling
    codeBgColor = colors.gray100,
    codeColor = colors.danger,
    codeFontSize = 12,
    codeFontFamily = 'monospace, "Courier New", Courier',
    codeBorderRadius = 4,
    codePadding = "0.2em 0.4em",

    // Code block styling
    preBgColor = colors.gray100,
    preBorderRadius = 8,
    prePadding = "1em",
    preMargin = "1em 0",

    // Blockquote styling
    blockquoteBorderColor = colors.primary,
    blockquoteBorderWidth = 4,
    blockquoteColor = colors.textSecondary,
    blockquotePadding = "0 1em",
    blockquoteMargin = "1em 0",

    // Heading styling
    headingColor = colors.text,
    headingMargin = "0.67em 0",

    // List styling
    listMargin = "1em 0",
    listPadding = "0 0 0 2em",
    listItemMargin = "0.25em 0",

    // Image styling
    imageMaxWidth = "100%",
    imageBorderRadius = 0,

    // Container styling
    padding = 0,
    maxHeight,
    overflow = "auto",
    backgroundColor = "transparent",
    borderRadius = 0,

    // Other
    allowDangerousHtml = false,

    ...rest
  } = props;

  // Get markdown source from props
  const markdownText = text || source || content || children || "";

  // Parse markdown to HTML
  const rawHtml = parseMarkdown(markdownText);

  // Create main container with WidgetFactory
  const container = WidgetFactory({
    tag: "div",
    fontFamily: fontFamily,
    fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
    lineHeight: lineHeight,
    color: color,
    padding: typeof padding === "number" ? `${padding}px` : padding,
    maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
    overflow: overflow,
    backgroundColor: backgroundColor,
    borderRadius:
      typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
    ...rest,
  });

  // Create content div with HTML
  const contentDiv = WidgetFactory({
    tag: "div",
    className: "markdown-content",
  });

  if (allowDangerousHtml) {
    contentDiv.innerHTML = rawHtml;
  } else {
    // Sanitize HTML (basic)
    const sanitized = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/javascript:/gi, "");
    contentDiv.innerHTML = sanitized;
  }

  // Add custom styles (injected only once)
  if (!document.querySelector("#markdown-styles")) {
    const style = document.createElement("style");
    style.id = "markdown-styles";
    style.textContent = `
            .markdown-content h1, 
            .markdown-content h2, 
            .markdown-content h3,
            .markdown-content h4,
            .markdown-content h5,
            .markdown-content h6 {
                color: ${headingColor};
                margin: ${headingMargin};
                font-weight: bold;
            }
            .markdown-content h1 { font-size: 2em; }
            .markdown-content h2 { font-size: 1.5em; }
            .markdown-content h3 { font-size: 1.17em; }
            .markdown-content h4 { font-size: 1em; }
            .markdown-content h5 { font-size: 0.83em; }
            .markdown-content h6 { font-size: 0.67em; }
            
            .markdown-content p { margin: 1em 0; }
            
            .markdown-content ul, 
            .markdown-content ol {
                margin: ${listMargin};
                padding: ${listPadding};
            }
            .markdown-content li {
                margin: ${listItemMargin};
            }
            
            .markdown-content code {
                background-color: ${codeBgColor};
                color: ${codeColor};
                padding: ${codePadding};
                border-radius: ${typeof codeBorderRadius === "number" ? `${codeBorderRadius}px` : codeBorderRadius};
                font-family: ${codeFontFamily};
                font-size: ${typeof codeFontSize === "number" ? `${codeFontSize}px` : codeFontSize};
            }
            
            .markdown-content pre {
                background-color: ${preBgColor};
                padding: ${prePadding};
                border-radius: ${typeof preBorderRadius === "number" ? `${preBorderRadius}px` : preBorderRadius};
                overflow: auto;
                margin: ${preMargin};
            }
            .markdown-content pre code {
                background: none;
                padding: 0;
            }
            
            .markdown-content a {
                color: ${linkColor};
                text-decoration: ${linkUnderline ? "underline" : "none"};
            }
            .markdown-content a:hover {
                color: ${linkHoverColor};
                text-decoration: underline;
            }
            
            .markdown-content blockquote {
                border-left: ${blockquoteBorderWidth}px solid ${blockquoteBorderColor};
                margin: ${blockquoteMargin};
                padding: ${blockquotePadding};
                color: ${blockquoteColor};
            }
            
            .markdown-content img {
                max-width: ${imageMaxWidth};
                height: auto;
                border-radius: ${typeof imageBorderRadius === "number" ? `${imageBorderRadius}px` : imageBorderRadius};
            }
            
            .markdown-content hr {
                border: none;
                border-top: 1px solid ${colors.border};
                margin: 1em 0;
            }
            
            .markdown-content table {
                border-collapse: collapse;
                width: 100%;
                margin: 1em 0;
            }
            .markdown-content th,
            .markdown-content td {
                border: 1px solid ${colors.border};
                padding: 8px;
                text-align: left;
            }
            .markdown-content th {
                background-color: ${colors.gray100};
            }
        `;
    document.head.appendChild(style);
  }

  container.appendChild(contentDiv);

  // ========== PUBLIC METHODS ==========

  // Update markdown content
  container.updateContent = (newText) => {
    const newHtml = parseMarkdown(newText);
    if (allowDangerousHtml) {
      contentDiv.innerHTML = newHtml;
    } else {
      const sanitized = newHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/javascript:/gi, "");
      contentDiv.innerHTML = sanitized;
    }
  };

  // Get raw HTML content
  container.getContent = () => contentDiv.innerHTML;

  // Get markdown source
  container.getSource = () => markdownText;

  return container;
};

export default Markdown;
