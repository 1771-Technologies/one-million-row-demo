import type { GridSpec } from "./types";
import { Status } from "./renderers/status";
import { VoteAverage } from "./renderers/vote-average";
import { ReleaseDate } from "./renderers/release-date";
import { Dollar } from "./renderers/dollar";
import { Runtime } from "./renderers/runtime";
import { OriginalLanguage } from "./renderers/flags";
import { Overview } from "./renderers/overview";
import { Popularity } from "./renderers/popularity";
import type { Grid } from "@1771technologies/lytenyte-pro";

export const columns: Grid.Column<GridSpec>[] = [
  { id: "title", name: "Title", width: 400 },
  {
    id: "vote_average",
    name: "Vote Average",
    type: "number",
    cellRenderer: VoteAverage,
    width: 180,
    widthMin: 180,
    resizable: true,
    movable: true,
    aggsAllowed: ["sum", "avg", "min", "max", "count"],
  },
  {
    id: "status",
    name: "Status",
    cellRenderer: Status,
    width: 140,
    widthMin: 140,
    rowGroupable: true,
  },
  {
    id: "release_date",
    name: "Release Date",
    type: "date",
    cellRenderer: ReleaseDate,
    width: 140,
    widthMin: 140,
  },
  {
    id: "revenue",
    name: "Revenue",
    type: "number",
    cellRenderer: Dollar,
    width: 160,
    widthMin: 160,
    resizable: true,
    movable: true,
    aggsAllowed: ["sum", "avg", "min", "max", "count"],
  },
  {
    id: "runtime",
    name: "Runtime",
    type: "number",
    cellRenderer: Runtime,
    width: 120,
    widthMin: 120,
    resizable: true,
    movable: true,
    aggsAllowed: ["sum", "avg", "min", "max", "count"],
  },
  {
    id: "budget",
    name: "Budget",
    type: "number",
    cellRenderer: Dollar,
    width: 150,
    widthMin: 150,
    resizable: true,
    movable: true,
    aggsAllowed: ["sum", "avg", "min", "max", "count"],
  },
  {
    id: "original_language",
    name: "Language",
    cellRenderer: OriginalLanguage,
    width: 120,
    widthMin: 120,
    rowGroupable: true,
    movable: true,
    resizable: true,
  },
  { id: "overview", name: "Synopsis", cellRenderer: Overview },
  {
    id: "popularity",
    name: "Popularity",
    type: "number",
    cellRenderer: Popularity,
    width: 180,
    widthMin: 180,
    resizable: true,
    movable: true,
    aggsAllowed: ["sum", "avg", "min", "max", "count"],
  },
  {
    id: "genre",
    name: "Genre",
    rowGroupable: true,
    resizable: true,
    movable: true,
  },
  {
    id: "sub_genre",
    name: "Sub Genre",
    rowGroupable: true,
    resizable: true,
    movable: true,
  },
  {
    id: "production_company",
    name: "Production Company",
    widthMin: 180,
    rowGroupable: true,
    resizable: true,
    movable: true,
  },
  {
    id: "production_country",
    name: "Country",
    rowGroupable: true,
    resizable: true,
    movable: true,
  },
];
