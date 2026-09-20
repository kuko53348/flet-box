// widgets/Rating.js - Definitive version (mouse + touch + swipe)
import { WidgetFactory } from "../widget-factory/index.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import { colors, subscribeTheme } from "../utils/themes.js";

export const Rating = (props) => {
  const {
    value = 0,
    max = 5,
    onChange,
    readOnly = false,
    size = 20,
    activeColor: propActiveColor,
    inactiveColor: propInactiveColor,
    iconActive = "star",
    iconInactive = "star_border",
    iconHalf = "star_half",
    gap = 2,
    allowHalf = false,
    showValue = false,
    valueColor = colors.textSecondary,
    valueSize,
    ...rest
  } = props;

  // Colors from theme
  let activeColor =
    propActiveColor !== undefined ? propActiveColor : colors.warning;
  let inactiveColor =
    propInactiveColor !== undefined ? propInactiveColor : colors.border;
  let currentValue = Math.min(Math.max(value, 0), max);

  let starIcons = []; // stores the SPAN elements of each star
  let starWrappers = []; // stores the wrappers (for events)
  let valueTextRef = null;
  let unsubscribeTheme = null;
  let touchActive = false; // to avoid conflicts with mouse

  // Update all stars according to currentValue
  const updateStars = () => {
    for (let i = 0; i < max; i++) {
      const starNumber = i + 1;
      const span = starIcons[i];
      if (!span) continue;

      let iconName = iconInactive;
      let color = inactiveColor;

      if (starNumber <= currentValue) {
        iconName = iconActive;
        color = activeColor;
      } else if (allowHalf && starNumber - 0.5 === currentValue) {
        iconName = iconHalf;
        color = activeColor;
      }

      span.textContent = iconName;
      span.style.color = color;
    }
    if (valueTextRef && showValue) {
      valueTextRef.update({ text: currentValue.toFixed(1) });
    }
  };

  // Change the actual value (persistent)
  const setValue = (newValue) => {
    if (readOnly) return;
    let clamped = Math.min(Math.max(newValue, 0), max);
    if (clamped === currentValue) return;
    currentValue = clamped;
    updateStars();
    if (onChange) onChange(currentValue);
  };

  // Temporary preview (hover or touchmove)
  const previewValue = (starIndex) => {
    for (let i = 0; i < max; i++) {
      const span = starIcons[i];
      if (!span) continue;
      if (i <= starIndex) {
        span.textContent = iconActive;
        span.style.color = activeColor;
      } else {
        span.textContent = iconInactive;
        span.style.color = inactiveColor;
      }
    }
  };

  // Restore the display according to the actual value
  const restoreFromPreview = () => {
    updateStars();
  };

  // ========== STAR CREATION ==========
  for (let i = 0; i < max; i++) {
    const icon = Icon({
      name: iconInactive,
      size: size,
      color: inactiveColor,
    });
    const wrapper = WidgetFactory({
      display: "inline-flex",
      cursor: readOnly ? "default" : "pointer",
      transition: "transform 0.1s ease",
      child: icon,
      style: { padding: "4px" }, // larger touch area
    });

    starIcons.push(icon);
    starWrappers.push(wrapper);

    if (!readOnly) {
      // ----- MOUSE EVENTS -----
      wrapper.addEventListener("mouseenter", () => {
        if (touchActive) return; // avoid conflict with touch
        wrapper.style.transform = "scale(1.15)";
        previewValue(i);
      });
      wrapper.addEventListener("mouseleave", () => {
        if (touchActive) return;
        wrapper.style.transform = "scale(1)";
        restoreFromPreview();
      });
      wrapper.addEventListener("click", () => {
        if (touchActive) return;
        let newValue = i + 1;
        if (allowHalf) {
          if (currentValue === newValue) newValue = newValue - 0.5;
          else if (currentValue === newValue - 0.5) newValue = newValue;
          else newValue = newValue;
        }
        setValue(newValue);
      });

      // ----- TOUCH EVENTS -----
      wrapper.addEventListener("touchstart", (e) => {
        e.preventDefault();
        touchActive = true;
        wrapper.style.transform = "scale(1.15)";
        previewValue(i);
      });
      wrapper.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const elemUnderTouch = document.elementFromPoint(
          touch.clientX,
          touch.clientY,
        );
        let targetIndex = -1;
        for (let idx = 0; idx < starWrappers.length; idx++) {
          if (starWrappers[idx].contains(elemUnderTouch)) {
            targetIndex = idx;
            break;
          }
        }
        if (targetIndex !== -1 && targetIndex !== i) {
          previewValue(targetIndex);
        } else if (targetIndex === -1) {
          restoreFromPreview();
        }
      });
      wrapper.addEventListener("touchend", (e) => {
        e.preventDefault();
        wrapper.style.transform = "scale(1)";
        // Determine which star is currently previewed (the one with iconActive)
        let selectedIndex = -1;
        for (let idx = 0; idx < starIcons.length; idx++) {
          if (starIcons[idx].textContent === iconActive) {
            selectedIndex = idx;
            break;
          }
        }
        if (selectedIndex !== -1) {
          let newValue = selectedIndex + 1;
          if (allowHalf) {
            // For touch, we always consider the integer; if you want half a star, it can be adjusted
          }
          setValue(newValue);
        } else {
          restoreFromPreview();
        }
        touchActive = false;
      });
      wrapper.addEventListener("touchcancel", (e) => {
        wrapper.style.transform = "scale(1)";
        restoreFromPreview();
        touchActive = false;
      });
    }
  }

  // Stars container
  const starsContainer = Row({
    alignItems: "center",
    gap: gap,
    flexWrap: "wrap",
    children: starWrappers,
  });

  // Ensure initial state
  updateStars();

  // Final construction
  const children = [starsContainer];
  if (showValue) {
    const valueText = Text({
      text: currentValue.toFixed(1),
      size: valueSize || size * 0.7,
      color: valueColor,
      weight: "bold",
      minWidth: "40px",
      textAlign: "center",
    });
    valueTextRef = valueText;
    children.push(valueText);
  }

  const ratingContainer = WidgetFactory({
    display: "inline-flex",
    alignItems: "center",
    gap: gap * 2,
    children: children,
    ...rest,
  });

  // Dynamic theme
  if (propActiveColor === undefined || propInactiveColor === undefined) {
    unsubscribeTheme = subscribeTheme(() => {
      if (propActiveColor === undefined) activeColor = colors.warning;
      if (propInactiveColor === undefined) inactiveColor = colors.border;
      updateStars();
    });
  }

  const originalCleanup = ratingContainer._cleanup;
  ratingContainer._cleanup = () => {
    if (unsubscribeTheme) unsubscribeTheme();
    if (originalCleanup) originalCleanup();
  };

  ratingContainer.setValue = setValue;
  ratingContainer.getValue = () => currentValue;
  ratingContainer.updateStars = updateStars;

  Object.defineProperty(ratingContainer, "value", {
    get: () => currentValue,
    set: (newValue) => setValue(newValue),
    enumerable: true,
  });

  return ratingContainer;
};

export default Rating;
