/**
 * @file Icon.js
 * @description Material icon glyph rendered as a `<span class="material-icons">`.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

import { toREM } from "../utils/units.js";

export const Icon = (props) => {
  const {
    icon,
    name,
    size = 24,
    color = colors.textSecondary,
    ...rest
  } = props;
  const iconName = icon || name || "";

  // The glyph is TEXT — a ligature the font draws — so a reader says the
  // characters it finds: an accordion header reads "Payments expand_more" and a
  // close control reads "close". An icon is therefore decoration unless the app
  // names it with `aria-label`, and a generic `<span>` only carries a name when it
  // has a role to put it on, which is why a named one becomes an image.
  //
  // A pressable icon is the exception: the engine gives it `role="button"`, and
  // that is a better role than "image" for something you activate.
  const label = rest["aria-label"];
  const isNamed = typeof label === "string" && label.trim() !== "";
  const isPressable =
    typeof rest.onclick === "function" ||
    typeof rest.onClick === "function" ||
    typeof rest.onPress === "function";

  return WidgetFactory({
    tag: "span",
    widgetName: "Icon",
    className: "material-icons",
    text: iconName, // ✅ CHANGED: text instead of textContent
    fontSize: toREM(size),
    color: color,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    ...(isNamed
      ? isPressable
        ? null
        : { role: "img" }
      : // An app that hid it deliberately keeps its own answer.
        rest["aria-hidden"] === undefined ? { "aria-hidden": "true" } : null),
    ...rest,
  });
};

export default Icon;
