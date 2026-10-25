/**
 * @file Stepper.js
 * @description Multi-step progress indicator with a horizontally scrollable track.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { Container } from "./Container.js";
import { Row } from "./Row.js";
import { Column } from "./Column.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import { Button } from "./Button.js";
import { colors } from "../utils/themes.js";

import { toREM } from "../utils/units.js";

// Nodes already reported by the shared-content warning below. A screen that
// reuses one `steps` array steals it once per stepper per render, and a wall of
// identical warnings is a warning nobody reads.
const warnedContent = new WeakSet();

export const Stepper = (props) => {
  const {
    steps = [],
    activeStep = 0,
    onStepChange,
    orientation = "horizontal",
    variant = "circles",
    showLabels = true,
    showNavigation = true,
    nextLabel = "Next",
    backLabel = "Back",
    finishLabel = "Finish",
    onFinish,

    // Styling props
    bgColor = colors.surface,
    borderRadius = 16,
    border,
    borderColor = colors.border,
    borderWidth = 1,
    shadow,
    padding = 24,
    margin = 0,
    width = "100%",
    ...rest
  } = props;

  let currentStep = Math.min(Math.max(activeStep, 0), steps.length - 1);
  // The two orientations share the marker, the state and the press, and disagree
  // about everything else — so the branch is decided once, here.
  const vertical = orientation !== "horizontal";
  let stepsContainer = null;
  let contentContainer = null;
  let navContainer = null;

  const goToStep = (index) => {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    if (onStepChange) onStepChange(currentStep);
    updateUI();
  };

  const next = () => goToStep(currentStep + 1);
  const back = () => goToStep(currentStep - 1);
  const finish = () => onFinish?.();

  const updateUI = () => {
    if (!stepsContainer) return;

    // Clear steps container
    while (stepsContainer.firstChild) {
      stepsContainer.removeChild(stepsContainer.firstChild);
    }

    // Calculatesteste if we need to wrap or scroll
    const stepWidth = 80;
    const totalSteps = steps.length;
    const availableWidth = stepsContainer.parentElement?.offsetWidth || 800;
    const needsWrap =
      orientation === "horizontal" && totalSteps * stepWidth > availableWidth;

    // Draw each step
    steps.forEach((step, idx) => {
      const isActive = idx === currentStep;
      const isCompleted = idx < currentStep;
      const isLast = idx === steps.length - 1;

      // Step indicator
      let indicator;
      if (variant === "circles") {
        indicator = Container({
          width: 32,
          height: 32,
          borderRadius: 16,
          bgColor: isActive
            ? colors.primary
            : isCompleted
              ? colors.successPlate
              : colors.gray300,
          justifyContent: "center",
          alignItems: "center",
          child: isCompleted
            ? Icon({ name: "check", size: 18, color: colors.onSecondary })
            : Text({
                text: String(idx + 1),
                size: 14,
                weight: "bold",
                // On the grey step plate, `textSecondary` measured 4.07:1 in
                // dark; gray700 stays muted and clears AA on both themes.
                color: isActive ? colors.onPrimary : colors.gray700,
              }),
        });
      } else if (variant === "numbers") {
        indicator = Text({
          text: String(idx + 1),
          size: 16,
          weight: "bold",
          color: isActive ? colors.primary : colors.gray700,
        });
      } else {
        indicator = Icon({
          name: step.icon || "circle",
          size: 24,
          color: isActive ? colors.primary : colors.gray500,
        });
      }

      // The label, in the ink the stage decides, placed where the orientation
      // puts it: under the marker in the horizontal track, beside it in the
      // vertical one. Both branches used to draw their own, so a vertical step
      // read "Account" twice — once under the circle and once stranded at the far
      // edge of a row the marker column had already stretched across.
      const labelColor = isActive ? colors.primary : colors.textSecondary;
      const label = showLabels
        ? vertical
          ? Text({ text: step.label, size: 14, color: labelColor })
          : Text({
              text: step.label,
              size: 12,
              color: labelColor,
              marginTop: 4,
              align: "center",
            })
        : null;

      // The number, the check and the accent carry the stage, and all three are
      // drawn: the check is a decorative glyph and the label alone does not say
      // whether the step is behind, ahead or where you are. The state goes in
      // the name, and `aria-current` marks the step you are on. The press lives
      // on this box, so the whole strip answers — not only the circle.
      const press = {
        cursor: "pointer",
        "aria-label": `${step.label || `Step ${idx + 1}`} (${
          isCompleted ? "completed" : isActive ? "current" : "upcoming"
        })`,
        "aria-current": isActive ? "step" : undefined,
        onclick: () => goToStep(idx),
      };

      stepsContainer.appendChild(
        vertical
          ? Row({
              alignItems: "center",
              gap: 12,
              width: "100%",
              ...press,
              children: [indicator, label].filter(Boolean),
            })
          : Column({
              alignItems: "center",
              flex: needsWrap ? "auto" : 1,
              minWidth: needsWrap ? "80px" : "0",
              ...press,
              children: [indicator, label].filter(Boolean),
            }),
      );

      // Only the horizontal track links its markers; a vertical list is already
      // read in order, and the Column's own gap is the separation.
      if (!vertical && !isLast) {
        stepsContainer.appendChild(
          needsWrap
            ? Container({ width: 8 })
            : Container({
                flex: 1,
                height: "2px",
                minWidth: "10px",
                backgroundColor:
                  idx < currentStep ? colors.success : colors.gray300,
              }),
        );
      }
    });

    // Update content. One place owns the slot, and it only rewrites it when the
    // node already there is not this step's: `appendChild` of the node that is
    // already the child is a detach and a re-attach, which throws away the
    // content's layout, the caret of a field being typed in, and any transition
    // it was mid-way through.
    if (contentContainer) {
      const stepContent = steps[currentStep]?.content;
      if (contentContainer.firstChild !== stepContent) {
        while (contentContainer.firstChild) {
          contentContainer.removeChild(contentContainer.firstChild);
        }
        if (stepContent) {
          // A DOM node has one parent, so the same `content` cannot show in two
          // steppers: the second `appendChild` moves it and leaves the first with
          // an empty slot that reads as "the widget is invisible". Nothing else
          // says so, and the stepper that lost it looks like it never rendered.
          if (
            stepContent.parentElement &&
            stepContent.parentElement !== contentContainer &&
            !warnedContent.has(stepContent)
          ) {
            warnedContent.add(stepContent);
            console.warn(
              "Stepper: this step's content is already mounted in another tree, " +
                "so that stepper is now empty — a widget node has one parent. Build " +
                "the steps array where the Stepper is built; do not share one array " +
                "between steppers.",
            );
          }
          contentContainer.appendChild(stepContent);
        }
      }
    }

    // Update navigation buttons
    if (navContainer) {
      while (navContainer.firstChild) {
        navContainer.removeChild(navContainer.firstChild);
      }

      const buttons = [];
      if (currentStep > 0) {
        buttons.push(
          Button({
            text: backLabel,
            variant: "outlined",
            onPress: back,
          }),
        );
      }
      // One filled call, not a filled call per branch: the last step swaps the
      // label, the plate and the handler, and never paints two primaries.
      const isLast = currentStep === steps.length - 1;
      buttons.push(
        Button({
          text: isLast ? finishLabel : nextLabel,
          variant: "filled",
          bgColor: isLast ? colors.successPlate : colors.primary,
          onPress: isLast ? finish : next,
        }),
      );

      const navRow = Row({
        justifyContent: "flex-end",
        gap: 12,
        children: buttons,
      });
      navContainer.appendChild(navRow);
    }
  };

  // Build style for main container using WidgetFactory
  let style = {
    width: toREM(width),
    backgroundColor: bgColor,
    borderRadius:
      toREM(borderRadius),
    padding: toREM(padding),
    margin: toREM(margin),
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    boxSizing: "border-box",
    overflow: "hidden",
  };

  if (border) {
    style.border = border;
  } else if (borderWidth !== undefined) {
    style.borderWidth = `${borderWidth}px`;
    style.borderStyle = "solid";
    style.borderColor = borderColor;
  }

  if (shadow) {
    style.boxShadow = shadow;
  }

  const container = WidgetFactory({
    widgetName: "Stepper",
    ...style,
    ...rest,
  });

  // Steps wrapper with horizontal scroll
  const stepsWrapper = WidgetFactory({
    tag: "div",
    overflowX: "auto",
    overflowY: "visible",
    width: "100%",
  });

  stepsContainer =
    orientation === "horizontal"
      ? Row({
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          minWidth: "min-content",
          width: "100%",
        })
      : Column({ gap: 16 });

  stepsWrapper.appendChild(stepsContainer);

  // Content container — built empty. `updateUI()` below is the only writer of
  // this slot, so the first paint goes through the same code as every
  // navigation, instead of mounting the node here and detaching it a line later
  // to mount the same node again.
  contentContainer = Container({
    width: "100%",
    overflow: "auto",
  });

  // Navigation container — only built when the stepper is allowed to drive itself.
  // `updateUI()` below skips the whole nav branch while `navContainer` is null.
  navContainer = showNavigation ? Container({ width: "100%" }) : null;

  container.appendChild(stepsWrapper);
  container.appendChild(contentContainer);
  if (navContainer) container.appendChild(navContainer);

  // Initial render
  updateUI();

  // Public methods
  container.goTo = goToStep;
  container.next = next;
  container.back = back;
  container.getActiveStep = () => currentStep;

  return container;
};

export default Stepper;
