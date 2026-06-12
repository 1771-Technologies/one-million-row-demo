import type { GridSpec } from "../types";
import Tooltip from "../../components/tooltip";
import type { Grid } from "@1771technologies/lytenyte-pro";

export function Overview({ api, row, column }: Grid.T.CellParams<GridSpec>) {
  const field = api.columnField(column, row);

  if (api.rowIsGroup(row)) return "-";

  if (typeof field !== "string" || !field.trim()) return "-";

  return (
    <Tooltip
      className="max-w-[20vw]"
      trigger={
        <button className="w-full h-ful flex items-center justify-center overflow-hidden text-ellipsis">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {field}
          </span>
        </button>
      }
    >
      {field}
    </Tooltip>
  );
}
