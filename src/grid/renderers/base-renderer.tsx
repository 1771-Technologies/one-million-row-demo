import type { Grid } from "@1771technologies/lytenyte-pro";
import type { GridSpec } from "../types";

export function BaseRenderer({
  api,
  row,
  column,
}: Grid.T.CellParams<GridSpec>) {
  const field = api.columnField(column, row) as number;

  return field ? `${field}` : "-";
}
