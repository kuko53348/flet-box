/**
 * @file Switch.js
 * @description iOS-style toggle switch with controlled/uncontrolled state.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { toREM } from "../utils/units.js";
import { PILL, TAP_MINIMUM } from "../tools/index.js";

export const Switch = (props) => {
  const {
    value = false,
    onToggle,
    onPress: onPressProp,
    disabled = false,
    size = "medium",
    activeColor = colors.success,
    ...rest
  } = props;

  /** @deprecated Use onPress instead */
  // onToggle kept as alias for backward compatibility
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
    if (switchRef) {
      switchRef.style.backgroundColor = newValue ? activeColor : colors.gray300;
    }
    if (knobRef) {
      knobRef.style.transform = newValue ? `translateX(${travel()})` : "translateX(0)";
    }
  };

  // Createste knob
  const knob = WidgetFactory({
    width: sz.knob,
    height: sz.knob,
    backgroundColor: "#ffffff",
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
  const switchContainer = WidgetFactory({
    widgetName: "Switch",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: TAP_MINIMUM,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    child: track,
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
