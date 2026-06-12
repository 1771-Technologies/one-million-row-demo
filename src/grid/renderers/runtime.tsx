import type { Grid } from "@1771technologies/lytenyte-pro";
import type { GridSpec } from "../types";

const formatter = new Intl.NumberFormat("en-Us", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
export function Runtime({ api, row, column }: Grid.T.CellParams<GridSpec>) {
  const field = api.columnField(column, row) as number;

  const aggModel = api.aggModel.get();
  const showSign = aggModel[column.id]?.fn !== "count";

  const sign = showSign ? " min" : "";

  return typeof field === "number" ? formatter.format(field) + sign : "-";
}
