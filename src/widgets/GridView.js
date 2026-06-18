// widgets/GridView.js
import { ListView } from "./ListView.js";

export const GridView = (props) => {
  const { columns = 2, itemHeight = 150, spacing = 8, ...rest } = props;

  return ListView({
    wrapItems: true, // ← activa modo grid
    crossAxisCount: columns, // ← número de columnas
    itemSize: itemHeight, // ← altura de cada celda
    gap: spacing, // ← espacio entre items
    ...rest,
  });
};

export default GridView;
