export interface Movie {
  id: string;
  title: string;
  vote_average: number;
  vote_count: number;
  status: string;
  release_date: string;
  revenue: number;
  runtime: number;
  adult: 1 | 0;
  backdrop_path: string;
  budget: number;
  homepage: string;
  imdb_id: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  tagline: string;
  genre: string;
  sub_genre: string;
  production_company: string;
  production_country: string;
  spoken_languages: string;
  keywords: string;
}

export interface Filter {
  readonly kind: "string" | "number" | "date";
  readonly column: string;
  readonly operator: string;
  readonly value: string | number | null;
}

export interface FilterCombinator {
  readonly kind: "combination";
  readonly operator: "AND" | "OR";
  readonly filters: (Filter | FilterCombinator)[];
}

export interface FilterIn {
  readonly values: (string | null | number)[];
  readonly operator: "NOT_IN" | "IN";
}

export interface ViewSlice {
  readonly start: number;
  readonly end: number;
  readonly sort: { column: string; dir: "desc" | "asc" }[];
  readonly groups: string[];
  readonly groupKeys: (string | null)[];
  readonly aggregations: { [column: string]: string };
  readonly filters: (Filter | FilterCombinator)[];
  readonly filtersIn: Record<string, FilterIn>;
}

export interface ViewQuery {
  readonly query: string;
  readonly queryCount: string;
  readonly params: unknown[];
  readonly limitParams: readonly [size: number, start: number];
}

// SQL identifiers (column names, function names) can't be bound as query
// parameters, so any of these that come from the client must be checked
// against an allow-list before being interpolated into the query string.
const VALID_COLUMNS = new Set<string>([
  "id",
  "title",
  "vote_average",
  "vote_count",
  "status",
  "release_date",
  "revenue",
  "runtime",
  "adult",
  "backdrop_path",
  "budget",
  "homepage",
  "imdb_id",
  "original_language",
  "original_title",
  "overview",
  "popularity",
  "poster_path",
  "tagline",
  "genre",
  "sub_genre",
  "production_company",
  "production_country",
  "spoken_languages",
  "keywords",
]);

const VALID_AGG_FNS = new Set(["sum", "avg", "min", "max", "count"]);

function assertColumn(column: string) {
  if (!VALID_COLUMNS.has(column)) throw new Error(`Unknown column: ${column}`);
  return column;
}

function assertAggFn(fn: string) {
  if (!VALID_AGG_FNS.has(fn)) throw new Error(`Unknown aggregation: ${fn}`);
  return fn;
}

export function buildViewQuery(view: ViewSlice): ViewQuery {
  const size = view.end - view.start;

  const { clause: where, params } = getWhere(view);
  const groupBy = getGroupBy(view.groups, view.groupKeys);
  const orderBy = getOrderBy(view.sort, view.groups);

  const isLeaf = view.groupKeys.length === view.groups.length;
  const select = getSelect(
    view.groups.slice(0, view.groupKeys.length + 1),
    view.aggregations,
    isLeaf,
  );

  const query = `--sql
    SELECT
        ${select}
    FROM
        movies
    ${where}
    ${groupBy}
    ${orderBy}
    LIMIT ? OFFSET ?
    `;

  const queryCount = groupBy
    ? `--sql
    WITH
      groupQuery AS (
        SELECT
            count(*)
        FROM
            movies
        ${where}
        ${groupBy}
      )
    SELECT count(*) as cnt FROM groupQuery
`
    : `--sql
    SELECT
        count(*) AS cnt
    FROM
        movies
    ${where}
`;

  return { query, queryCount, params, limitParams: [size, view.start] };
}

function getOrderBy(sorts: ViewSlice["sort"], groups: string[]) {
  if (!sorts.length) {
    if (groups.length) return `ORDER BY ${groups.map(assertColumn).join(", ")}`;
    return "ORDER BY budget DESC";
  }

  const sortStr = sorts
    .map((x) => {
      const dir = x.dir.toLowerCase();
      if (dir !== "asc" && dir !== "desc") {
        throw new Error(`Unknown sort direction: ${x.dir}`);
      }
      return `${assertColumn(x.column)} ${dir.toUpperCase()}`;
    })
    .join(", ");

  return `ORDER BY ${sortStr}`;
}

function getGroupBy(groups: string[], groupKeys: (string | null)[]) {
  if (!groups.length) return "";

  const groupColumn = groups[groupKeys.length];

  const groupByClause =
    groupKeys.length >= groups.length
      ? ""
      : `GROUP BY ${assertColumn(groupColumn)}`;

  return groupByClause;
}

function getSelect(
  groups: string[],
  aggregations: { [column: string]: string },
  isLeaf: boolean,
) {
  if (!groups.length || isLeaf) return "*";

  const columnAgs = Object.entries(aggregations).map(([column, fn]) => {
    return `${assertAggFn(fn)}(${assertColumn(column)}) AS ${column}`;
  });

  return [
    `${assertColumn(groups.at(-1)!)} AS key`,
    "count(*) AS child_count",
    ...columnAgs,
  ].join(",\n\t");
}

function getWhere(view: ViewSlice): { clause: string; params: unknown[] } {
  const params: unknown[] = [];

  // Filters for supporting groups.
  const groupByFilters: string[] = [];
  for (let i = 0; i < view.groupKeys.length; i++) {
    const column = assertColumn(view.groups[i]);
    const key = view.groupKeys[i];
    if (key === null) {
      groupByFilters.push(`${column} IS NULL`);
    } else {
      groupByFilters.push(`${column} = ?`);
      params.push(key);
    }
  }
  const groupByFilterClause = groupByFilters.join(" AND ");

  // Normal column filters
  const handleFilter = (v: Filter | FilterCombinator): string => {
    if (v.kind !== "combination") {
      const column = assertColumn(v.column);

      let operator: string | undefined;
      let value: string | number | null = v.value;

      if (v.operator === "equals") {
        operator = "=";
      }
      if (v.operator === "not_equals") {
        operator = "!=";
      }
      if (v.operator === "begins_with") {
        operator = "LIKE";
        value = `${v.value}%`;
      }
      if (v.operator === "not_begins_with") {
        operator = "NOT LIKE";
        value = `${v.value}%`;
      }
      if (v.operator === "ends_with") {
        operator = "LIKE";
        value = `%${v.value}`;
      }
      if (v.operator === "not_ends_with") {
        operator = "NOT LIKE";
        value = `%${v.value}`;
      }
      if (v.operator === "contains") {
        operator = "LIKE";
        value = `%${v.value}%`;
      }
      if (v.operator === "not_contains") {
        operator = "NOT LIKE";
        value = `%${v.value}%`;
      }
      if (v.operator === "before" || v.operator === "less_than") {
        operator = "<";
      }
      if (v.operator === "after" || v.operator === "greater_than") {
        operator = ">";
      }
      if (v.operator === "less_than_or_equal") {
        operator = "<=";
      }
      if (v.operator === "greater_than_or_equal") {
        operator = ">=";
      }

      if (!operator) throw new Error(`Unknown filter operator: ${v.operator}`);

      const columnExpr = v.kind === "string" ? `LOWER(${column})` : column;
      if (typeof value === "string") value = value.toLowerCase();

      params.push(value);
      return `${columnExpr} ${operator} ?`;
    }

    const filters = v.filters.map((f) => handleFilter(f));

    return `(${filters.join(` ${v.operator} `)})`;
  };
  const columnFilterClause = view.filters.map(handleFilter).join(" AND ");

  // In filters
  const inFilters = Object.entries(view.filtersIn)
    .map(([column, filter]) => {
      const col = assertColumn(column);
      const placeholders = filter.values.map(() => "?").join(", ");
      params.push(...filter.values);

      return `${col} ${
        filter.operator === "IN" ? "IN" : "NOT IN"
      } (${placeholders})`;
    })
    .join(" AND ");

  const finalFilters = [];
  if (columnFilterClause) finalFilters.push(columnFilterClause);
  if (groupByFilterClause) finalFilters.push(groupByFilterClause);
  if (inFilters) finalFilters.push(inFilters);

  if (!finalFilters.length) return { clause: "", params: [] };

  return { clause: `WHERE\n\t${finalFilters.join("\n\tAND ")}`, params };
}
