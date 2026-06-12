import type { Grid } from "@1771technologies/lytenyte-pro";
import type { GridSpec } from "../types";

const formatter = new Intl.NumberFormat("en-Us", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export function VoteAverage({ api, row, column }: Grid.T.CellParams<GridSpec>) {
  const field = api.columnField(column, row) as number;

  return typeof field === "number" ? formatter.format(field) : "-";
}
