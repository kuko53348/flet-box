/**
 * @file Rating.js
 * @description Star rating supporting mouse, touch and swipe interactions.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import { colors, subscribeTheme } from "../utils/themes.js";
import { TAP_MINIMUM } from "../tools/index.js";

export const Rating = (props) => {
  const {
    value = 0,
    max = 5,
    onChange,
    onPress,
    readOnly = false,
    size = 20,
    activeColor: propActiveColor,
    inactiveColor: propInactiveColor,
    iconActive = "star",
    iconInactive = "star_border",
    iconHalf = "star_half",
    gap = 4,
    allowHalf = false,
    showValue = false,
    valueColor = colors.textSecondary,
    valueSize,
    ...rest
  } = props;

  // Colors from theme
  //
  // Both inks are the readable end of their own hue, for the same reason Radio's
  // off-ring is: `colors.border` measured 1.27:1 on a white card and 1.19:1 on a
  // dark one, so the empty stars were not a dim state but an absent one, and
  // `colors.warning` (#F59E0B) measured 2.15:1 on white, which made a 4-out-of-5
  // score harder to see than the label next to it. `gray500` is the neutral
  // control outline (4.83:1 light, 3.67:1 dark) and `warningStrong` is the amber
  // the palette already declares for words (5.02:1 light, 12.29:1 dark).
  let activeColor =
    propActiveColor !== undefined ? propActiveColor : colors.warningStrong;
  let inactiveColor =
    propInactiveColor !== undefined ? propInactiveColor : colors.gray500;
  let currentValue = Math.min(Math.max(value, 0), max);

  let starIcons = []; // stores the SPAN elements of each star
  let starWrappers = []; // stores the wrappers (for events)
  let valueTextRef = null;
  let unsubscribeTheme = null;
  let touchActive = false; // to avoid conflicts with mouse

  /** The score as one sentence, which is what the group is named by. */
  const groupLabel = () => `${currentValue} out of ${max}`;

  // Update all stars according to currentValue
  const updateStars = () => {
    for (let i = 0; i < max; i++) {
      const starNumber = i + 1;
      const span = starIcons[i];
      if (!span) continue;

      let iconName = iconInactive;
      let color = inactiveColor;

      // A score like 4.4 must still show a half star. Matching `starNumber - 0.5
      // === currentValue` only covered exact halves, so every fractional score
      // fell through and the last star stayed empty.
      const whole = Math.floor(currentValue);
      const fraction = currentValue - whole;
      if (starNumber <= whole) {
        iconName = iconActive;
        color = activeColor;
      } else if (allowHalf && starNumber === whole + 1) {
        if (fraction >= 0.75) {
          iconName = iconActive;
          color = activeColor;
        } else if (fraction >= 0.25) {
          iconName = iconHalf;
          color = activeColor;
        }
      }

      span.textContent = iconName;
      span.style.color = color;
    }
    if (valueTextRef && showValue) {
      valueTextRef.update({ text: currentValue.toFixed(1) });
    }

    // The announced state and the roving stop follow the drawn stars, so a score
    // set from the keyboard, from a pointer or by `rating.value = 3` is heard the
    // same way.
    if (!readOnly) {
      const selected = Math.round(currentValue);
      for (let i = 0; i < max; i++) {
        const wrapper = starWrappers[i];
        if (!wrapper) continue;
        wrapper.setAttribute("aria-checked", String(selected === i + 1));
        wrapper.tabIndex = tabIndexFor(i);
      }
    }
    if (starsContainer) starsContainer.setAttribute("aria-label", groupLabel());
  };

  // Change the actual value (persistent)
  const setValue = (newValue) => {
    if (readOnly) return;
    let clamped = Math.min(Math.max(newValue, 0), max);
    if (clamped === currentValue) return;
    currentValue = clamped;
    updateStars();
    const cb = onChange || onPress;
    if (cb) cb(currentValue);
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
  /**
   * The star a keyboard stop sits on: the one carrying the score, or the first
   * when nothing is chosen yet. A group where every star is a stop makes Tab
   * walk five times through one control.
   */
  const tabIndexFor = (i) =>
    i === (currentValue > 0 ? Math.min(Math.round(currentValue), max) - 1 : 0)
      ? 0
      : -1;

  /**
   * Pick star `i + 1`. With `allowHalf`, pressing the star that is already the
   * whole score turns it into the half between it and the last one.
   */
  const pickStar = (i) => {
    let newValue = i + 1;
    if (allowHalf && currentValue === newValue) newValue -= 0.5;
    setValue(newValue);
  };

  /** Move the keyboard and the score to star `index`. */
  const focusStar = (index) => {
    const clamped = Math.min(Math.max(index, 0), max - 1);
    starWrappers[clamped]?.focus();
    setValue(clamped + 1);
  };

  for (let i = 0; i < max; i++) {
    const icon = Icon({
      name: iconInactive,
      size: size,
      color: inactiveColor,
    });
    const wrapper = WidgetFactory({
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: readOnly ? "default" : "pointer",
      transition: "transform 0.1s ease",
      child: icon,
      // A star is picked with a thumb, so the cell — not the glyph — is the
      // target: 20 units of star inside a 40-unit box. A read-only rating shows a
      // score instead of a control, so it keeps its compact 4-unit gutter.
      ...(readOnly
        ? { padding: 4 }
        : { minWidth: TAP_MINIMUM, minHeight: TAP_MINIMUM }),
      // A score shown as filled stars is the only place that state lives: the
      // glyph is decorative and the number is not rendered when `showValue` is
      // off. Each star is one choice of a group, which is what `radio` means.
      ...(readOnly
        ? {}
        : {
            role: "radio",
            "aria-label": `Star ${i + 1} of ${max}`,
            "aria-checked": "false",
            tabIndex: tabIndexFor(i),
            // The press is a prop, so the engine turns Enter and Space into this
            // click instead of leaving a star only a finger can light up. The
            // gesture stays the widget's own `scale(1.15)` above: the engine's
            // press scale would overwrite it on the same frame.
            disableTransform: true,
            onclick: () => pickStar(i),
            onKeyDown: (e) => {
              switch (e.key) {
                case "ArrowRight":
                case "ArrowDown":
                  e.preventDefault();
                  focusStar(i + 1);
                  break;
                case "ArrowLeft":
                case "ArrowUp":
                  e.preventDefault();
                  focusStar(i - 1);
                  break;
                case "Home":
                  e.preventDefault();
                  focusStar(0);
                  break;
                case "End":
                  e.preventDefault();
                  focusStar(max - 1);
                  break;
              }
            },
          }),
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
      // The click itself is the `onclick` prop above — that is what lets the
      // engine reach this star without a pointer, and a listener here would run
      // the same pick twice.
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
      wrapper.addEventListener("touchcancel", () => {
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
    // One control, not five stops: the group is what a reader lands on and the
    // score is what they hear there. A read-only rating has no choice to make,
    // so it is a picture of a number rather than a group of radios.
    role: readOnly ? "img" : "radiogroup",
    "aria-label": groupLabel(),
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
    widgetName: "Rating",
    display: "inline-flex",
    alignItems: "center",
    gap: gap * 2,
    children: children,
    ...rest,
  });

  // Dynamic theme
  if (propActiveColor === undefined || propInactiveColor === undefined) {
    unsubscribeTheme = subscribeTheme(() => {
      if (propActiveColor === undefined) activeColor = colors.warningStrong;
      if (propInactiveColor === undefined) inactiveColor = colors.gray500;
      updateStars();
    });
  }

  ratingContainer.onUnmount(() => {
    if (unsubscribeTheme) unsubscribeTheme();
  });

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
