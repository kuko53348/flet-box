/**
 * @file GridView.js
 * @description Grid layout, implemented as a `ListView` with `wrapItems`.
 *
 * The grid takes its items either way a list can be written: as data plus a
 * builder, or as the cells themselves. `columns` is the only decision that
 * cannot be inferred — the number of columns is fixed, and each cell is a
 * percentage of the container, so the grid adapts to the width it is given
 * rather than to a breakpoint.
 */
import { ListView } from "./ListView.js";

export const GridView = (props) => {
  const { columns = 2, itemHeight = 150, spacing = 8, children, data, renderItem, ...rest } = props;

  // Cells written as `children` are the same contract read the other way round:
  // the items are already built, so the builder is the identity. Dropping them
  // into `...rest` instead painted them as the factory's own children, which is a
  // vertical stack — a `columns: 3` grid that showed three rows of full-width
  // cells and never formed a column.
  const items =
    data ?? (children == null ? [] : Array.isArray(children) ? children : [children]);

  return ListView({
    widgetName: "GridView",
    wrapItems: true, // ← enables grid mode
    crossAxisCount: columns, // ← number of columns
    itemSize: itemHeight, // ← height of each cell
    gap: spacing, // ← spacing between items
    data: items,
    renderItem: renderItem ?? ((cell) => cell),
    ...rest,
  });
};

export default GridView;
