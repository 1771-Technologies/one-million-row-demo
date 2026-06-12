import { format } from "date-fns";
import type { GridSpec } from "../types";
import type { Grid } from "@1771technologies/lytenyte-pro";

export function ReleaseDate({ api, row, column }: Grid.T.CellParams<GridSpec>) {
  const field = api.columnField(column, row) as string;

  if (api.rowIsGroup(row)) return "-";

  return typeof field === "string" && field.trim()
    ? format(field, "yyyy MMM dd")
    : "-";
}
