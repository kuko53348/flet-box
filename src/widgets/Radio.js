/**
 * @file Radio.js
 * @description Radio input with controlled/uncontrolled selection state.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { Text } from "./Text.js";
import { colors } from "../utils/themes.js";
import { TAP_MINIMUM, LABEL_TEXT } from "../tools/index.js";

export const Radio = (props) => {
  const {
    selected = false,
    /** @deprecated Use `onPress` instead — it receives the same boolean. */
    onSelect,
    onPress: onPressProp,
    disabled = false,
    size = 20,
    name,
    activeColor = colors.primary,
    label = null,
    ...rest
  } = props;

  const onPress = onPressProp || onSelect;

  let internalSelected = selected;
  let radioRef = null;
  let dotRef = null;

  // The ring's "off" rim is a control outline, not a hairline: `colors.border`
  // measured 1.2:1 on the dark card and 1.3:1 on white, so an unselected radio
  // was invisible in both themes. `gray500` is the same #71717A in both
  // palettes and clears the 3:1 non-text minimum on each surface.
  const offColor = disabled ? colors.border : colors.gray500;

  const updateUI = (newSelected) => {
    if (radio) radio.setAttribute("aria-checked", String(Boolean(newSelected)));
    if (radioRef) {
      radioRef.style.backgroundColor = newSelected ? activeColor : "transparent";
      radioRef.style.border = `2px solid ${newSelected ? activeColor : offColor}`;
    }
    if (dotRef) {
      dotRef.style.display = newSelected ? "block" : "none";
    }
  };

  // Createste dot
  const dot = WidgetFactory({
    width: Math.max(8, Math.round(size * 0.4)),
    height: Math.max(8, Math.round(size * 0.4)),
    backgroundColor: colors.onPrimary,
    borderRadius: "50%",
    display: internalSelected ? "block" : "none",
  });
  dotRef = dot;

  // The visual circle: a 2-unit ring and the fill, nothing else.
  const circle = WidgetFactory({
    width: size,
    height: size,
    border: `2px solid ${disabled ? colors.border : internalSelected ? activeColor : offColor}`,
    borderRadius: "50%",
    backgroundColor: internalSelected ? activeColor : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    child: dot,
  });
  radioRef = circle;

  // Createste main radio container — the finger's box, larger than the ring it
  // centres, because radios are chosen with a thumb and a 20-unit circle is not
  // something a thumb hits reliably.
  //
  // The overhang is given back with a negative margin. A 40-unit box in the
  // layout next to a label stretched the row to 40 and left the text at the top
  // of it, so the ring sat ~10 units below the words and the requested `gap` was
  // silently doubled. The press still lands on the full 40-unit box, which now
  // overflows its layout footprint instead of pushing the row around it.
  const overhang = Math.max(0, (TAP_MINIMUM - size) / 2);

  // A `label` is part of the control, not a caption beside it: the whole row is
  // pressable. It also cannot reach the factory as a flat prop, which would set
  // the root's `textContent` and render the words *before* the ring it describes,
  // outside the hit box, while leaving the requested `gap` unused.
  const isLabelled = label !== null && label !== undefined && label !== "";

  const rootProps = {
    widgetName: "Radio",
    // A ring and a dot are drawing instructions, not a control. The role names it
    // and `aria-checked` is the state; both are set before the factory runs so the
    // engine does not settle for `button`.
    role: "radio",
    "aria-checked": String(Boolean(internalSelected)),
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
          circle,
          Text({
            text: label,
            size: LABEL_TEXT,
            fontWeight: 500,
            color: disabled ? colors.textDisabled : colors.text,
          }),
        ]
      : circle,
  };

  // Pressing the words must not scale the words. The ring on its own keeps the
  // default press feedback, because there the root *is* the control.
  if (isLabelled) rootProps.disableTransform = true;

  const radio = WidgetFactory({ ...rootProps, ...rest });

  // Inline usage (a radio dropped mid-paragraph) would otherwise baseline-align
  // the box's bottom edge and lift the ring above the text.
  radio.style.verticalAlign = "middle";
  if (disabled) radio.setAttribute("aria-disabled", "true");

  // Handle click
  if (!disabled) {
    const handleClick = (e) => {
      e.stopPropagation();
      if (internalSelected) return;

      const newSelected = true;
      internalSelected = newSelected;
      updateUI(newSelected);

      if (name) {
        const allRadios = document.querySelectorAll(
          `[data-radio-group="${name}"]`,
        );
        allRadios.forEach((otherRadio) => {
          if (otherRadio !== radio && otherRadio.unselect) {
            otherRadio.unselect();
          }
        });
      }

      if (onPress) onPress(true);
    };
    // Routed through the factory props: `assignProps` clears `onclick` on every
    // update and only re-applies handlers present in the merged props, so a
    // direct assignment died on the first `update()` or reactive setter.
    radio.update({ onPress: handleClick });

    // Hover effect — on the drawn ring, not the hit box around it.
    radio.addEventListener("mouseenter", () => {
      if (!disabled && !internalSelected) {
        circle.style.backgroundColor = `color-mix(in srgb, ${activeColor} 12%, transparent)`;
      }
    });

    radio.addEventListener("mouseleave", () => {
      if (!disabled && !internalSelected) {
        circle.style.backgroundColor = "transparent";
      }
    });
  }

  // Public methods
  radio.select = () => {
    if (!disabled && !internalSelected) {
      internalSelected = true;
      updateUI(true);
      if (onPress) onPress(true);
    }
  };

  radio.unselect = () => {
    if (!disabled && internalSelected) {
      internalSelected = false;
      updateUI(false);
      if (onPress) onPress(false);
    }
  };

  radio.isSelected = () => internalSelected;

  if (name) {
    radio.setAttribute("data-radio-group", name);
  }

  return radio;
};

export default Radio;
