/**
 * @file GridView.js
 * @description Grid layout, implemented as a `ListView` with `wrapItems`.
 */
import { ListView } from "./ListView.js";

export const GridView = (props) => {
  const { columns = 2, itemHeight = 150, spacing = 8, ...rest } = props;

  return ListView({
    widgetName: "GridView",
    wrapItems: true, // ← enables grid mode
    crossAxisCount: columns, // ← number of columns
    itemSize: itemHeight, // ← height of each cell
    gap: spacing, // ← spacing between items
    ...rest,
  });
};

export default GridView;
