// widgets/ProgressBar.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const ProgressBar = (props) => {
  const {
    value = 0,
    max = 100,
    height = 8,
    width = "100%",
    color = colors.primary,
    backgroundColor = colors.border,
    borderRadius,
    label,
    showValue = false,
    valuePosition = "right",
    indeterminate = false,
    striped = false,
    animatedStripes = false,
    ...rest
  } = props;

  let progressValue = Math.min(Math.max(value, 0), max);
  let percentage = (progressValue / max) * 100;
  const finalBorderRadius =
    borderRadius !== undefined ? borderRadius : height / 2;
  const isColumn = valuePosition === "top" || valuePosition === "bottom";

  // Create fill bar
  const fill = WidgetFactory({
    width: indeterminate ? "100%" : `${percentage}%`,
    height: "100%",
    backgroundColor: color,
    borderRadius:
      typeof finalBorderRadius === "number"
        ? `${finalBorderRadius}px`
        : finalBorderRadius,
    transition: indeterminate ? "none" : "width 0.3s ease",
    position: "relative",
    ...(striped || indeterminate
      ? {
          backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 10px, transparent 10px, transparent 20px)`,
          backgroundSize: "28px 28px",
        }
      : {}),
  });

  // Animated stripes
  if (animatedStripes || indeterminate) {
    fill.style.animation = `progress-stripes ${indeterminate ? "1.5s" : "0.5s"} linear infinite`;

    if (!document.querySelector("#progress-stripes-style")) {
      const style = document.createElement("style");
      style.id = "progress-stripes-style";
      style.textContent = `
                @keyframes progress-stripes {
                    0% { background-position: 0 0; }
                    100% { background-position: 28px 0; }
                }
            `;
      document.head.appendChild(style);
    }
  }

  // Indeterminate animation
  if (indeterminate) {
    fill.style.width = "50%";
    fill.style.transform = "translateX(-100%)";
    fill.style.animation = "indeterminate-progress 1.5s ease-in-out infinite";

    if (!document.querySelector("#indeterminate-progress-style")) {
      const style = document.createElement("style");
      style.id = "indeterminate-progress-style";
      style.textContent = `
                @keyframes indeterminate-progress {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }
            `;
      document.head.appendChild(style);
    }
  }

  // Track background
  const track = WidgetFactory({
    flex: 1,
    height: typeof height === "number" ? `${height}px` : height,
    backgroundColor: backgroundColor,
    borderRadius:
      typeof finalBorderRadius === "number"
        ? `${finalBorderRadius}px`
        : finalBorderRadius,
    overflow: "hidden",
    position: "relative",
    child: fill,
  });

  // Build children array for main container
  const children = [];

  // Label (left or top)
  if (label && (valuePosition === "left" || valuePosition === "top")) {
    children.push(
      WidgetFactory({
        tag: "span",
        textContent: label,
        fontSize: "12px",
        color: colors.textSecondary,
        whiteSpace: "nowrap",
      }),
    );
  }

  children.push(track);

  // Label (right or bottom)
  if (label && (valuePosition === "right" || valuePosition === "bottom")) {
    children.push(
      WidgetFactory({
        tag: "span",
        textContent: label,
        fontSize: "12px",
        color: colors.textSecondary,
        whiteSpace: "nowrap",
      }),
    );
  }

  // Value percentage
  if (showValue && !indeterminate) {
    const valueEl = WidgetFactory({
      tag: "span",
      textContent: `${Math.round(percentage)}%`,
      fontSize: "12px",
      color: colors.textSecondary,
      fontWeight: "500",
      whiteSpace: "nowrap",
      minWidth: "40px",
      textAlign: "right",
    });

    if (valuePosition === "left" || valuePosition === "top") {
      children.unshift(valueEl);
    } else {
      children.push(valueEl);
    }
  }

  // Main container
  const container = WidgetFactory({
    display: "flex",
    flexDirection: isColumn ? "column" : "row",
    alignItems: "center",
    gap: "8px",
    width: typeof width === "number" ? `${width}px` : width,
    children: children,
    ...rest,
  });

  // Public methods
  const updateProgress = (newValue) => {
    if (indeterminate) return;
    progressValue = Math.min(Math.max(newValue, 0), max);
    percentage = (progressValue / max) * 100;
    fill.style.width = `${percentage}%`;

    if (showValue) {
      const valueEl = container.querySelector("span:last-child");
      if (valueEl && valueEl !== label) {
        valueEl.textContent = `${Math.round(percentage)}%`;
      }
    }
  };

  Object.defineProperty(container, "value", {
    get: () => progressValue,
    set: (newVal) => updateProgress(newVal),
    enumerable: true,
  });

  container.updateProgress = updateProgress;
  container.getValue = () => progressValue;
  container.setValue = updateProgress;

  return container;
};

export default ProgressBar;
