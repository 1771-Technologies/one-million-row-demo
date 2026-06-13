import type { Grid } from "@1771technologies/lytenyte-pro";
import type { GridSpec } from "../types";

export function MarketRenderer(props: Grid.T.CellRendererParams<GridSpec>) {
  return (
    <div className="bg-(--ln-gray-10) w-full h-full flex items-center text-nowrap justify-center">
      {props.rowIndex}
    </div>
  );
}
