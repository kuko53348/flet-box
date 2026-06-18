// widgets/ListTile.js
import { WidgetFactory } from "../widget-factory/index.js";
import { Row } from "./Row.js";
import { Column } from "./Column.js";
import { Text } from "./Text.js";
import { colors, subscribeTheme } from "../utils/themes.js";

export const ListTile = (props) => {
  const {
    leftItem,
    rightItem,
    title,
    subtitle,
    description,
    onPress,
    selected = false,
    disabled = false,
    divider = false,
    paddingHorizontal = 16,
    paddingVertical = 12,
    gap = 12,
    elevation = 0,
    borderRadius = 0,
    bgColor = colors.surface,
    selectedBgColor = `${colors.primary}20`,
    hoverColor = colors.border,
    titleProps = {},
    subtitleProps = {},
    descriptionProps = {},
    ...rest
  } = props;

  const isInteractive = onPress && !disabled;

  // Build text column
  const textChildren = [];

  if (title) {
    textChildren.push(
      Text({
        text: title,
        size: 16,
        weight: selected ? "600" : "500",
        color: selected ? colors.primary : colors.primary,
        ...titleProps,
      }),
    );
  }

  if (subtitle) {
    textChildren.push(
      Text({
        text: subtitle,
        size: 13,
        color: colors.textSecondary,
        marginTop: 2,
        ...subtitleProps,
      }),
    );
  }

  if (description) {
    textChildren.push(
      Text({
        text: description,
        size: 12,
        color: colors.textDisabled,
        marginTop: 2,
        ...descriptionProps,
      }),
    );
  }

  const centerColumn =
    textChildren.length > 0
      ? Column({
          gap: 2,
          alignItems: "flex-start",
          style: { flex: 1, minWidth: 0 },
          children: textChildren,
        })
      : null;

  // Build main row
  const rowChildren = [];
  if (leftItem) rowChildren.push(leftItem);
  if (centerColumn) rowChildren.push(centerColumn);
  if (rightItem) rowChildren.push(rightItem);

  const contentRow = Row({
    alignItems: "center",
    gap: gap,
    style: {
      padding: `${paddingVertical}px ${paddingHorizontal}px`,
      width: "100%",
      boxSizing: "border-box",
    },
    children: rowChildren,
  });

  // Main tile using WidgetFactory
  const tile = WidgetFactory({
    backgroundColor: selected ? selectedBgColor : bgColor,
    borderRadius:
      typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
    cursor: isInteractive ? "pointer" : "default",
    opacity: disabled ? 0.6 : 1,
    boxShadow:
      elevation > 0
        ? `0 ${elevation}px ${elevation * 2}px rgba(0,0,0,0.1)`
        : "none",
    transition: "all 0.2s ease",
    width: "100%",
    child: contentRow,
    onclick: isInteractive ? onPress : null,
    ...rest,
  });

  // Hover effects
  if (isInteractive) {
    tile.addEventListener("mouseenter", () => {
      if (!selected) tile.style.backgroundColor = hoverColor;
      if (elevation > 0) {
        tile.style.transform = "translateY(-2px)";
        tile.style.boxShadow = `0 ${elevation + 2}px ${(elevation + 2) * 2}px rgba(0,0,0,0.15)`;
      }
    });
    tile.addEventListener("mouseleave", () => {
      if (!selected) tile.style.backgroundColor = bgColor;
      if (elevation > 0) {
        tile.style.transform = "translateY(0)";
        tile.style.boxShadow = `0 ${elevation}px ${elevation * 2}px rgba(0,0,0,0.1)`;
      }
    });
  }

  // Theme subscription
  let unsubscribeTheme = null;
  if (!props.bgColor && !props.selectedBgColor) {
    unsubscribeTheme = subscribeTheme(() => {
      if (!selected) {
        tile.style.backgroundColor = colors.surface;
      } else {
        tile.style.backgroundColor = `${colors.primary}20`;
      }
    });
  }

  // Cleanup
  const originalCleanup = tile._cleanup;
  tile._cleanup = () => {
    if (unsubscribeTheme) unsubscribeTheme();
    if (originalCleanup) originalCleanup();
  };

  // Add divider if needed
  if (divider) {
    const dividerLine = WidgetFactory({
      height: "1px",
      backgroundColor: colors.border,
      marginLeft: `${paddingHorizontal}px`,
      width: `calc(100% - ${paddingHorizontal}px)`,
    });

    const container = WidgetFactory({
      width: "100%",
      display: "flex",
      flexDirection: "column",
      children: [tile, dividerLine],
    });

    const originalContainerCleanup = container._cleanup;
    container._cleanup = () => {
      if (unsubscribeTheme) unsubscribeTheme();
      if (originalContainerCleanup) originalContainerCleanup();
    };

    return container;
  }

  return tile;
};

export default ListTile;
