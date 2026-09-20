// widgets/ListTile.js
import { WidgetFactory } from "../widget-factory/index.js";
import { Row } from "./Row.js";
import { Column } from "./Column.js";
import { Text } from "./Text.js";
import { colors, subscribeTheme } from "../utils/themes.js";

/**
 * @typedef {Object} ListTileProps
 * @property {HTMLElement} [leftItem] - Widget rendered on the leading edge (e.g. an avatar or icon).
 * @property {HTMLElement} [rightItem] - Widget rendered on the trailing edge (e.g. a chevron or switch).
 * @property {string} [title] - Primary text line.
 * @property {string} [subtitle] - Secondary text line rendered below the title at reduced size.
 * @property {string} [description] - Tertiary text line rendered below the subtitle, typically muted.
 * @property {Function} [onPress] - Click handler. When provided the tile becomes interactive.
 * @property {boolean} [selected=false] - Highlights the tile with `selectedBgColor` and bolds the title.
 * @property {boolean} [disabled=false] - Reduces opacity and removes interactivity.
 * @property {boolean} [divider=false] - When true, appends a thin horizontal rule below the tile.
 * @property {number} [paddingHorizontal=16] - Horizontal padding in pixels.
 * @property {number} [paddingVertical=12] - Vertical padding in pixels.
 * @property {number} [gap=12] - Gap between the left item, text column, and right item.
 * @property {number} [elevation=0] - Drop-shadow depth. 0 means no shadow.
 * @property {number} [borderRadius=0] - Corner radius of the tile in pixels.
 * @property {string} [bgColor] - Default background color.
 * @property {string} [selectedBgColor] - Background color when `selected` is true.
 * @property {string} [hoverColor] - Background color on mouse hover (only when interactive).
 * @property {Object} [titleProps={}] - Extra props forwarded to the `Text` widget for the title.
 * @property {Object} [subtitleProps={}] - Extra props forwarded to the `Text` widget for the subtitle.
 * @property {Object} [descriptionProps={}] - Extra props forwarded to the `Text` widget for the description.
 */

/**
 * A single-row list item that follows the Material Design ListTile pattern.
 *
 * Composes a leading widget, a text column (title / subtitle / description),
 * and a trailing widget into a horizontally-aligned row. Supports selection
 * highlighting, hover effects, elevation shadows, and an optional divider.
 * Automatically unsubscribes from the theme system when the tile is unmounted.
 *
 * @param {ListTileProps} props
 * @returns {HTMLElement} The tile element (or a wrapper `<div>` when `divider` is true).
 */
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

  // Only add pointer cursor and hover/click behavior when an onPress handler exists
  // and the tile is not disabled.
  const isInteractive = onPress && !disabled;

  // Build text column — only include lines that were actually provided
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

  // Wrap text lines in a Column only when at least one line was provided
  const centerColumn =
    textChildren.length > 0
      ? Column({
          gap: 2,
          alignItems: "flex-start",
          flex: 1,
          minWidth: 0, // allows the column to shrink below its content size in a flex row
          children: textChildren,
        })
      : null;

  // Assemble the main content row: [leftItem] [textColumn] [rightItem]
  const rowChildren = [];
  if (leftItem) rowChildren.push(leftItem);
  if (centerColumn) rowChildren.push(centerColumn);
  if (rightItem) rowChildren.push(rightItem);

  const contentRow = Row({
    alignItems: "center",
    gap: gap,
    padding: `${paddingVertical}px ${paddingHorizontal}px`,
    width: "100%",
    boxSizing: "border-box",
    children: rowChildren,
  });

  // Main tile element
  const tile = WidgetFactory({
    tag: "div",
    backgroundColor: selected ? selectedBgColor : bgColor,
    borderRadius: borderRadius,
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

  // Hover effects — only when the tile can be interacted with
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

  // Theme subscription — keep the background in sync with the active theme.
  // Only subscribe when the caller has not overridden bgColor/selectedBgColor,
  // to avoid fighting with explicit colors.
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

  // Cleanup — unsubscribe from the theme system when the tile is unmounted
  const originalCleanup = tile._cleanup;
  tile._cleanup = () => {
    if (unsubscribeTheme) unsubscribeTheme();
    if (originalCleanup) originalCleanup();
  };

  // When a divider is requested, wrap the tile in a column and append a separator line
  if (divider) {
    const dividerLine = WidgetFactory({
      height: 1,
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

    // Propagate cleanup to the outer container as well
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
