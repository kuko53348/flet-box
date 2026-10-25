/**
 * @file Checkbox.js
 * @description Checkbox input with controlled/uncontrolled state.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { Text } from "./Text.js";
import { colors } from "../utils/themes.js";
import { TAP_MINIMUM, LABEL_TEXT } from "../tools/index.js";

export const Checkbox = (props) => {
  const {
    checked = false,
    onCheck,
    onPress: onPressProp,
    disabled = false,
    size = 20,
    activeColor = colors.primary,
    label = null,
    ...rest
  } = props;

  /** @deprecated Use onPress instead */
  // onCheck kept as alias for backward compatibility
  const onPress = onPressProp || onCheck;

  let internalChecked = checked;
  let checkboxRef = null;
  let checkMarkRef = null;

  // The box's "off" rim is a control outline, not a hairline: `colors.border`
  // measured 1.2:1 on the dark card and 1.3:1 on white, so an unchecked box was
  // invisible in both themes. `gray500` is the same #71717A in both palettes and
  // clears the 3:1 non-text minimum on each surface.
  const offColor = disabled ? colors.border : colors.gray500;

  const updateUI = (newChecked) => {
    // The state an assistive technology reads is this attribute, not the tick it
    // cannot see. `updateUI` is the one place the visual state is painted, so the
    // attribute and the box cannot disagree.
    if (checkbox) checkbox.setAttribute("aria-checked", String(Boolean(newChecked)));
    if (checkboxRef) {
      checkboxRef.style.border = `2px solid ${newChecked ? activeColor : offColor}`;
    }
    if (checkMarkRef) {
      checkMarkRef.style.display = newChecked ? "inline-block" : "none";
    }
  };

  // The tick is drawn inside the frame, in the active colour: a filled plate
  // would hide the border the box is supposed to show, and the theme ink it used
  // to carry (white in light, near-black in dark) only read on that plate.
  const checkMark = WidgetFactory({
    tag: "span",
    textContent: "✓",
    color: disabled ? colors.textDisabled : activeColor,
    fontSize: Math.max(12, Math.round(size * 0.65)),
    fontWeight: "bold",
    lineHeight: 1,
    display: internalChecked ? "inline-block" : "none",
  });
  checkMarkRef = checkMark;

  // The visual square. Everything drawn lives here, so the box below can be the
  // finger's target without becoming a 40-unit checkbox.
  const box = WidgetFactory({
    width: size,
    height: size,
    border: `2px solid ${disabled ? colors.border : internalChecked ? activeColor : offColor}`,
    borderRadius: 0,
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    child: checkMark,
  });
  checkboxRef = box;

  // Createste main checkbox container
  //
  // The overhang is given back with a negative margin. A 40-unit box in the
  // layout next to a label stretched the row to 40 and left the text at the top
  // of it, so the box sat ~10 units below the words and the requested `gap` was
  // silently doubled. The press still lands on the full 40-unit box, which now
  // overflows its layout footprint instead of pushing the row around it.
  const overhang = Math.max(0, (TAP_MINIMUM - size) / 2);

  // A `label` is part of the control, not a caption beside it: the whole row is
  // pressable. It also cannot reach the factory as a flat prop, which would set
  // the root's `textContent` and wipe the box it is supposed to describe.
  const isLabelled = label !== null && label !== undefined && label !== "";

  const rootProps = {
    widgetName: "Checkbox",
    // The drawn box is a `span` and the root is a row, so nothing here is a
    // checkbox to an assistive technology unless the widget says so. `role`
    // reaches the factory before `applyEffects`, which is what keeps the engine
    // from labelling the control `button`.
    role: "checkbox",
    "aria-checked": String(Boolean(internalChecked)),
    display: "inline-flex",
    alignItems: "center",
    justifyContent: isLabelled ? "flex-start" : "center",
    gap: isLabelled ? 12 : undefined,
    minWidth: isLabelled ? undefined : TAP_MINIMUM,
    minHeight: TAP_MINIMUM,
    margin: isLabelled ? 0 : -overhang,
    flexShrink: 0,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    child: isLabelled
      ? [
          box,
          Text({
            text: label,
            size: LABEL_TEXT,
            fontWeight: 500,
            color: disabled ? colors.textDisabled : colors.text,
          }),
        ]
      : box,
  };

  // Pressing the words must not scale the words. The box on its own keeps the
  // default press feedback, because there the root *is* the control.
  if (isLabelled) rootProps.disableTransform = true;

  const checkbox = WidgetFactory({ ...rootProps, ...rest });

  // Inline usage (a checkbox dropped mid-paragraph) would otherwise
  // baseline-align the box's bottom edge and lift the square above the text.
  checkbox.style.verticalAlign = "middle";
  if (disabled) checkbox.setAttribute("aria-disabled", "true");

  // Handle click
  if (!disabled) {
    const handleClick = (e) => {
      e.stopPropagation();
      const newChecked = !internalChecked;
      internalChecked = newChecked;
      updateUI(newChecked);
      if (onPress) onPress(newChecked);
    };
    // Route the handler through the factory's props instead of assigning
    // `onclick` directly. `assignProps` clears `onclick` on every update and only
    // re-applies handlers it can see in the merged props, so a direct assignment
    // died on the first `update()` — and every reactive setter (opacity, bgColor,
    // padding…) calls update — leaving the control unable to toggle ever again.
    checkbox.update({ onPress: handleClick });

    // Hover effect — on the drawn square, not the whole labelled row.
    checkbox.addEventListener("mouseenter", () => {
      if (!disabled && !internalChecked) {
        // `color-mix` rather than `activeColor + "20"`: that string concat only
        // produced a valid color for `#rrggbb` hexes and silently broke on
        // `rgba()`, named colors and 3-digit hex `activeColor` values.
        box.style.backgroundColor = `color-mix(in srgb, ${activeColor} 12%, transparent)`;
      }
    });

    checkbox.addEventListener("mouseleave", () => {
      if (!disabled && !internalChecked) {
        box.style.backgroundColor = "transparent";
      }
    });
  }

  // Public methods
  checkbox.setChecked = (newChecked, triggerCallback = true) => {
    if (internalChecked !== newChecked) {
      internalChecked = newChecked;
      updateUI(newChecked);
      if (triggerCallback && onPress) onPress(newChecked);
    }
  };

  checkbox.getChecked = () => internalChecked;

  return checkbox;
};

export default Checkbox;
