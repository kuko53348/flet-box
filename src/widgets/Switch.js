/**
 * @file Switch.js
 * @description iOS-style toggle switch with controlled/uncontrolled state.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { Text } from "./Text.js";
import { colors } from "../utils/themes.js";
import { toREM } from "../utils/units.js";
import { PILL, TAP_MINIMUM, LABEL_TEXT } from "../tools/index.js";

export const Switch = (props) => {
  const {
    value = false,
    /** @deprecated Use `onPress` instead — it receives the same boolean. */
    onToggle,
    onPress: onPressProp,
    disabled = false,
    size = "medium",
    activeColor = colors.success,
    label = null,
    ...rest
  } = props;

  const onPress = onPressProp || onToggle;

  // Sizes. Track height is knob + 2 x pad, so the knob can never be asked to sit
  // outside the pill it lives in.
  const sizes = {
    small: { width: 40, height: 24, knob: 16 },
    medium: { width: 48, height: 32, knob: 24 },
    large: { width: 64, height: 40, knob: 32 },
  };
  const sz = sizes[size] || sizes.medium;
  const PAD = 4;
  /** The knob's travel, in framework units. It has to be rem, like the track: a
   *  `px` offset here slides the knob short of the edge the moment the reader
   *  raises their font and the (rem) track grows around it. */
  const travel = () => toREM(sz.width - sz.knob - PAD * 2);

  let internalValue = value;
  let switchRef = null;
  let knobRef = null;

  const updateUI = (newValue) => {
    if (switchContainer) switchContainer.setAttribute("aria-checked", String(Boolean(newValue)));
    if (switchRef) {
      switchRef.style.backgroundColor = newValue ? activeColor : colors.gray300;
    }
    if (knobRef) {
      knobRef.style.transform = newValue ? `translateX(${travel()})` : "translateX(0)";
    }
  };

  // Createste knob
  // The knob is a white plate in every theme: it sits on a track whose colour
  // the caller picks (`activeColor`), so it cannot borrow `onPrimary` — in dark
  // that token is page ink and the knob would vanish into the grey track.
  // `onSecondary` is the palette's own answer for a white surface.
  const knob = WidgetFactory({
    width: sz.knob,
    height: sz.knob,
    backgroundColor: colors.onSecondary,
    borderRadius: "50%",
    transform: internalValue ? `translateX(${travel()})` : "translateX(0)",
    transition: "transform 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  });
  knobRef = knob;

  // The visible pill. Everything the reader sees is painted here.
  const track = WidgetFactory({
    width: sz.width,
    height: sz.height,
    backgroundColor: internalValue ? activeColor : colors.gray300,
    borderRadius: PILL,
    display: "flex",
    alignItems: "center",
    padding: PAD,
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    child: knob,
  });
  switchRef = track;

  // The pressable box is the track's parent, not the track: a 32-unit pill is not
  // a Fitts target, and stretching the pill to 40 would make it look like a
  // button. The hit area grows, the switch does not.
  //
  // With a `label` the box grows further into the whole row, because a reader
  // aiming at the words must still land on the toggle: the label is part of the
  // control, not a caption beside it.
  const isLabelled = label !== null && label !== undefined && label !== "";

  const switchContainer = WidgetFactory({
    widgetName: "Switch",
    // A track and a knob say "toggle" to an eye and nothing at all to a screen
    // reader; the role names the control and `aria-checked` is its state.
    role: "switch",
    "aria-checked": String(Boolean(internalValue)),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: isLabelled ? "space-between" : "center",
    gap: 12,
    width: isLabelled ? "100%" : undefined,
    minHeight: TAP_MINIMUM,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    // The root carries the click, so the default press effect scaled whatever
    // the root happens to be — with a label that is the whole row, and the words
    // shrank with the switch. The knob's slide is this control's feedback; the
    // row must not behave like a button.
    disableTransform: true,
    child: isLabelled
      ? [
          Text({
            text: label,
            size: LABEL_TEXT,
            fontWeight: 500,
            color: disabled ? colors.textDisabled : colors.text,
          }),
          track,
        ]
      : track,
    ...rest,
  });

  // Handle click
  if (!disabled) {
    const handleClick = (e) => {
      e.stopPropagation();
      const newValue = !internalValue;
      internalValue = newValue;
      updateUI(newValue);
      if (onPress) onPress(newValue);
    };
    // Routed through the factory props: `assignProps` clears `onclick` on every
    // update and only re-applies handlers present in the merged props, so a
    // direct assignment died on the first `update()` or reactive setter.
    switchContainer.update({ onPress: handleClick });
  }

  // Public methods
  switchContainer.updateValue = (newValue) => {
    internalValue = newValue;
    updateUI(newValue);
  };

  switchContainer.getValue = () => internalValue;

  return switchContainer;
};

export default Switch;
