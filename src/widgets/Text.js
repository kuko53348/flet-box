// widgets/Text.js (fixed)
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

const styleMap = {
  bold: "strong",
  italic: "em",
  underline: "u",
  strikethrough: "del",
  mark: "mark",
  small: "small",
  code: "code",
};

export const Text = (props) => {
  let {
    text,
    value,
    children,
    size = 16, // ✅ default value
    color = colors.textSecondary,
    backgroundColor = "transparent",
    weight = "normal",
    align,
    type,
    styles: textStyles = [],
    ...rest
  } = props;

  const textContent = text || value || children || "";

  let baseTag = "span";
  const headingTags = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    p: "p",
  };
  if (type && headingTags[type]) baseTag = headingTags[type];

  const cssStyles = {
    fontSize: size,
    fontWeight: weight,
    color: color,
    backgroundColor: backgroundColor,
    textAlign: align,
    margin: 0,
    padding: 0,
  };

  if (type === "h1" || type === "h2") cssStyles.marginBottom = "0.5em";
  if (type === "p") cssStyles.marginBottom = "1em";

  if (
    textStyles.includes("underline") &&
    textStyles.includes("strikethrough")
  ) {
    cssStyles.textDecoration = "underline line-through";
  } else if (textStyles.includes("underline")) {
    cssStyles.textDecoration = "underline";
  } else if (textStyles.includes("strikethrough")) {
    cssStyles.textDecoration = "line-through";
  }

  // ✅ Instead of 'textContent', use 'text' (which is in translateProps)
  let element = WidgetFactory({
    tag: baseTag,
    text: textContent, // ✅ CHANGED: text instead of textContent
    ...cssStyles,
    ...rest,
  });

  const orderedStyles = [...textStyles].reverse();
  for (const style of orderedStyles) {
    const tag = styleMap[style];
    if (tag && style !== "underline" && style !== "strikethrough") {
      const wrapper = WidgetFactory({
        tag: tag,
        margin: 0,
        padding: 0,
        child: element,
      });
      element = wrapper;
    }
  }

  return element;
};

export default Text;
