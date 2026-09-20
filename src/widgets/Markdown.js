// widgets/Markdown.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

/**
 * Lightweight Markdown-to-HTML parser with no external dependencies.
 *
 * Supports: headings (h1–h3), bold, italic, inline code, code blocks,
 * links, images, unordered/ordered lists, blockquotes, horizontal rules,
 * and basic paragraphs.
 *
 * This is intentionally a simplified implementation — for production use
 * with complex Markdown (tables, nested lists, GFM extensions) consider
 * replacing this with a battle-tested library such as `marked` or `micromark`.
 *
 * @param {string} text - Raw Markdown string to convert.
 * @returns {string} HTML string. Output may contain tags but no `<script>` or event handlers
 *   unless `allowDangerousHtml` is explicitly set on the widget.
 */
const parseMarkdown = (text) => {
  if (!text) return "";

  let html = text;

  // Headings (order matters: h3 before h2 before h1 to avoid partial matches)
  html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");

  // Bold (both ** and __ syntax)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic (both * and _ syntax)
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  // Fenced code blocks (must come after inline code to avoid double-matching)
  html = html.replace(/```(.*?)```/gs, "<pre><code>$1</code></pre>");

  // Links — opens in a new tab with rel="noopener" for security
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  );

  // Images (before link regex would steal the ! prefix)
  html = html.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    '<img src="$2" alt="$1" loading="lazy">',
  );

  // Unordered lists
  html = html.replace(/^\s*-\s(.*$)/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^\s*\d+\.\s(.*$)/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ol>$1</ol>");

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>");

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr>");

  // Wrap bare text lines in <p> tags (skip lines that already start with an HTML tag)
  html = html.replace(/^(?!<[a-z]|$)(.*$)/gm, "<p>$1</p>");

  // Double newlines become line breaks
  html = html.replace(/\n\n/g, "<br>");

  return html;
};

/**
 * @typedef {Object} MarkdownProps
 * @property {string} [text] - Markdown source string. Also aliased as `source` and `content`.
 * @property {string} [source] - Alias for `text`.
 * @property {string} [content] - Alias for `text`.
 * @property {string} [children] - Alias for `text` (supports passing markdown as a child string).
 *
 * @property {number} [fontSize=14] - Base font size in pixels.
 * @property {string} [fontFamily] - CSS font-family for the rendered text.
 * @property {number} [lineHeight=1.6] - Line height multiplier.
 * @property {string} [color] - Default text color.
 *
 * @property {string} [linkColor] - Color of hyperlinks.
 * @property {string} [linkHoverColor] - Color of hyperlinks on hover.
 * @property {boolean} [linkUnderline=false] - Whether to underline links by default.
 *
 * @property {string} [codeBgColor] - Background color for inline `code` spans.
 * @property {string} [codeColor] - Text color for inline `code` spans.
 * @property {number} [codeFontSize=12] - Font size for inline code.
 * @property {string} [codeFontFamily] - Font family for inline code.
 * @property {number} [codeBorderRadius=4] - Border radius for inline code backgrounds.
 * @property {string} [codePadding] - Padding for inline code.
 *
 * @property {string} [preBgColor] - Background color for fenced code blocks.
 * @property {number} [preBorderRadius=8] - Border radius for code block containers.
 * @property {string} [prePadding] - Padding inside code blocks.
 * @property {string} [preMargin] - Margin around code blocks.
 *
 * @property {string} [blockquoteBorderColor] - Left-border color for blockquotes.
 * @property {number} [blockquoteBorderWidth=4] - Left-border width for blockquotes in pixels.
 * @property {string} [blockquoteColor] - Text color inside blockquotes.
 * @property {string} [blockquotePadding] - Padding inside blockquotes.
 * @property {string} [blockquoteMargin] - Margin around blockquotes.
 *
 * @property {string} [headingColor] - Color applied to all heading elements.
 * @property {string} [headingMargin] - Margin applied to all heading elements.
 *
 * @property {string} [listMargin] - Margin around list elements.
 * @property {string} [listPadding] - Padding (left) for list elements.
 * @property {string} [listItemMargin] - Margin for individual list items.
 *
 * @property {string} [imageMaxWidth="100%"] - Max width for rendered images.
 * @property {number} [imageBorderRadius=0] - Border radius for rendered images.
 *
 * @property {number|string} [padding=0] - Padding of the outer container.
 * @property {number} [maxHeight] - Maximum height; enables scrolling when content overflows.
 * @property {string} [overflow="auto"] - CSS overflow value.
 * @property {string} [backgroundColor="transparent"] - Background color of the container.
 * @property {number} [borderRadius=0] - Border radius of the container.
 *
 * @property {boolean} [allowDangerousHtml=false] - When true, parsed HTML is set directly without
 *   sanitization. Only use with fully trusted Markdown sources.
 */

/**
 * Renders a Markdown string as styled HTML inside a widget container.
 *
 * Injects a single `<style id="markdown-styles">` tag into `<head>` the first time
 * a Markdown widget is mounted, so all styling is shared across instances while still
 * respecting the per-instance style props (the styles are regenerated each time a new
 * widget is created — the last one to mount wins for shared rules).
 *
 * Content is sanitized by default: `<script>` tags and inline event handlers (`on*`)
 * are stripped. Set `allowDangerousHtml` to bypass this only when the source is trusted.
 *
 * Public API on the returned element:
 * - `updateContent(newText)` — re-renders with new Markdown source
 * - `getContent()` — returns current inner HTML
 * - `getSource()` — returns the original Markdown string
 *
 * @param {MarkdownProps} props
 * @returns {HTMLElement} The container element with rendered Markdown inside.
 */
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

    // Inline code styling
    codeBgColor = colors.gray100,
    codeColor = colors.danger,
    codeFontSize = 12,
    codeFontFamily = 'monospace, "Courier New", Courier',
    codeBorderRadius = 4,
    codePadding = "0.2em 0.4em",

    // Fenced code block styling
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

    // Safety: set to true only when the Markdown source is fully trusted
    allowDangerousHtml = false,

    ...rest
  } = props;

  // Resolve the markdown source from any of the supported prop aliases
  const markdownText = text || source || content || children || "";

  // Parse Markdown to raw HTML
  const rawHtml = parseMarkdown(markdownText);

  // Outer container
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

  // Inner div that receives the parsed HTML
  const contentDiv = WidgetFactory({
    tag: "div",
    className: "markdown-content",
  });

  if (allowDangerousHtml) {
    contentDiv.innerHTML = rawHtml;
  } else {
    // Basic sanitization: strip <script> tags and inline event handlers.
    // This is NOT a full XSS defense — for untrusted input use a proper sanitizer.
    const sanitized = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/javascript:/gi, "");
    contentDiv.innerHTML = sanitized;
  }

  // Inject global styles scoped to `.markdown-content` the first time any Markdown
  // widget is rendered. Subsequent instances regenerate the tag with their own
  // style values — the last widget to mount wins for shared properties.
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

  /**
   * Re-renders the widget with new Markdown source.
   * @param {string} newText - The updated Markdown string.
   */
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

  /**
   * Returns the currently rendered inner HTML string.
   * @returns {string}
   */
  container.getContent = () => contentDiv.innerHTML;

  /**
   * Returns the original Markdown source string passed to the widget.
   * @returns {string}
   */
  container.getSource = () => markdownText;

  return container;
};

export default Markdown;
