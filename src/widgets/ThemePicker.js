/**
 * @file ThemePicker.js
 * @description A grid of two-tone swatches that picks the screen's accent color.
 *
 * One control, twelve choices, no color theory. Each swatch is a square split
 * down its diagonal: the upper-left half is the family's accent in the light
 * theme, the lower-right half is the same family in the dark one. That is the
 * iOS Settings shape, and it is the only honest way to show a *pair* — a FletBox
 * accent is not one color but the two stops one hue wears in the two themes, and
 * a reader who sees both knows what the app will look like before tapping.
 *
 * Tapping calls `setAccent`, which repaints every widget already on screen and
 * writes the choice to `localStorage`, so the next visit opens in the same color.
 * The picker subscribes to the theme, so a toggle somewhere else on the screen
 * moves the selection here without this widget being asked.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import {
  colors,
  getAccent,
  setAccent,
  listAccents,
  subscribeTheme,
} from "../utils/themes.js";
import { readableInk } from "../utils/readableInk.js";
import { composeUpdate } from "../utils/composeUpdate.js";
import { TAP_MINIMUM, LABEL_TEXT, PILL } from "../tools/scale.js";

/**
 * @param {Object} props
 * @returns {HTMLElement} The picker's root row.
 */
export const ThemePicker = (props) => {
  const {
    accents = listAccents(),
    size = TAP_MINIMUM,
    showLabels = false,
    label = "Accent color",
    disabled = false,
    onChange,
    ...rest
  } = props;

  // What the cells are built from, and what a rebuild replaces. Reading these from
  // the closure instead of the destructured props is what lets `update()` change
  // the list: a cell built at construction time would keep painting the family it
  // was born with.
  let choices = accents;
  let labelled = showLabels;
  let off = disabled;

  // The diagonal split. `135deg` runs from the top-left corner, so the first stop
  // owns the half a reader's eye reaches first — which is the light theme, the one
  // a picker is usually opened under.
  const swatchPaint = (accent) =>
    `linear-gradient(135deg, ${accent.light} 0 50%, ${accent.dark} 50% 100%)`;

  // The rim is the only thing that says "this one is on", so it is the one thing
  // that must not be a color nobody can see: `colors.border` measures 1.3:1 on
  // white and 1.2:1 on a dark card. An unselected swatch wears `gray500` — 3:1 on
  // both surfaces, the same choice `Checkbox` makes for an empty box — and the
  // selected one wears the page's own ink, the strongest value the theme has. The
  // tick badge is ink too, and `readableInk` picks whichever of black and white
  // reads on it, so the selected state is unmistakable without spending the accent
  // on it — which rule 28 forbids anyway.
  const rimFor = (selected) =>
    selected ? colors.text : off ? colors.border : colors.gray500;

  const cells = [];

  const paintCell = (cell, selected) => {
    cell.swatch.style.border = `2px solid ${rimFor(selected)}`;
    cell.badge.style.display = selected ? "flex" : "none";
    cell.root.setAttribute("aria-checked", String(selected));
  };

  const paintAll = () => {
    const active = getAccent();
    cells.forEach((cell) => paintCell(cell, cell.accent.id === active));
  };

  const buildCell = (accent) => {
    const tickSize = Math.max(14, Math.round(size * 0.42));

    // The tick only ever paints on its own badge, so the pair it has to clear is
    // badge ink on badge plate — a value this file controls, not a user's color.
    const badge = WidgetFactory({
      tag: "span",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      width: tickSize,
      height: tickSize,
      borderRadius: PILL,
      backgroundColor: colors.text,
      child: Icon({
        name: "check",
        size: Math.max(10, Math.round(size * 0.28)),
        color: readableInk(colors.text, colors.onPrimary),
      }),
    });

    const swatch = WidgetFactory({
      tag: "span",
      width: size,
      height: size,
      gradient: swatchPaint(accent),
      border: `2px solid ${rimFor(false)}`,
      borderRadius: 8,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "border-color 0.2s ease",
      child: badge,
    });

    const root = WidgetFactory({
      // The square is a `span` inside a row, so nothing here is a radio unless the
      // widget says so. `role` reaches the factory before `applyEffects`, which is
      // what keeps the engine from labelling the control `button`.
      role: "radio",
      "aria-checked": "false",
      "aria-label": accent.label,
      widgetName: "ThemePicker",
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      gap: labelled ? 4 : undefined,
      minWidth: size,
      minHeight: size,
      padding: labelled ? 4 : 0,
      cursor: off ? "not-allowed" : "pointer",
      opacity: off ? 0.5 : 1,
      // Pressing a caption must not scale the caption: the root is the hit box and
      // the square is the thing that reads as selected.
      disableTransform: labelled || undefined,
      child: labelled
        ? [
            swatch,
            Text({
              text: accent.label,
              size: LABEL_TEXT,
              color: off ? colors.textDisabled : colors.textSecondary,
            }),
          ]
        : swatch,
    });

    const cell = { accent, root, swatch, badge };

    if (off) {
      root.setAttribute("aria-disabled", "true");
    } else {
      // Routed through the factory rather than assigned to `onclick`: `applyEffects`
      // is what gives this cell Enter, Space and a Tab stop, and it only sees
      // handlers that arrive as props.
      root.update({
        onPress: () => {
          if (getAccent() === accent.id) return;
          setAccent(accent.id);
          if (onChange) onChange(accent.id);
        },
      });
    }

    return cell;
  };

  const rebuild = () => {
    cells.forEach((cell) => cell.root.remove());
    cells.length = 0;
    choices.forEach((accent) => {
      const cell = buildCell(accent);
      cells.push(cell);
      group.appendChild(cell.root);
    });
    paintAll();
  };

  const group = WidgetFactory({
    widgetName: "ThemePicker",
    // A row of colored squares is not a control. Named, it is one, and the twelve
    // radios inside it are read as options of a single question.
    role: "radiogroup",
    "aria-label": label,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 8,
    ...rest,
  });

  rebuild();

  // The selection is the theme's state, not this widget's. A toggle in the app bar,
  // an OS flip, or a `setAccent` from a settings screen all move what is checked
  // here, and none of them can be reached by a prop.
  const unsubscribe = subscribeTheme(paintAll);
  group.onUnmount(() => {
    unsubscribe();
    cells.length = 0;
  });

  composeUpdate(group, ["accents", "showLabels", "label", "disabled"], (next) => {
    if (next.label !== undefined) group.setAttribute("aria-label", next.label);
    if (next.accents !== undefined) choices = next.accents;
    if (next.showLabels !== undefined) labelled = next.showLabels;
    if (next.disabled !== undefined) off = next.disabled;
    if (next.accents || next.showLabels || next.disabled) rebuild();
  });

  return group;
};

export default ThemePicker;
