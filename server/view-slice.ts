import Database from "better-sqlite3";

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

export function getViewSlice(view: ViewSlice) {
  const db = new Database(`${import.meta.dirname}/database/movies.db`);

  const size = view.end - view.start;

  const limit = `LIMIT ${size} OFFSET ${view.start}`;

  const where = getWhere(view);
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
    ${limit}
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

  const promise = new Promise<{ rows: unknown[]; count: number }>((res) => {
    const rows = db.prepare(query).all();
    const count = (db.prepare(queryCount).get() as { cnt: number }).cnt;

    res({ rows, count });
  });

  return promise;
}

function getOrderBy(sorts: ViewSlice["sort"], groups: string[]) {
  if (!sorts.length) {
    if (groups.length) return `ORDER BY ${groups.join(", ")}`;
    return "ORDER BY budget DESC";
  }

  const sortStr = sorts
    .map((x) => `${x.column} ${x.dir.toUpperCase()}`)
    .join(", ");

  return `ORDER BY ${sortStr}`;
}

function getGroupBy(groups: string[], groupKeys: (string | null)[]) {
  if (!groups.length) return "";

  const groupColumn = groups[groupKeys.length];

  const groupByClause =
    groupKeys.length >= groups.length ? "" : `GROUP BY ${groupColumn}`;

  return groupByClause;
}

function getSelect(
  groups: string[],
  aggregations: { [column: string]: string },
  isLeaf: boolean,
) {
  if (!groups.length || isLeaf) return "*";

  const columnAgs = Object.entries(aggregations).map(([column, fn]) => {
    return `${fn}(${column}) AS ${column}`;
  });

  return [
    `${groups.at(-1)!} AS key`,
    "count(*) AS child_count",
    ...columnAgs,
  ].join(",\n\t");
}

function getWhere(view: ViewSlice) {
  // Filters for supporting groups.
  const groupByFilters: string[] = [];
  for (let i = 0; i < view.groupKeys.length; i++) {
    const column = view.groups[i];
    const key = view.groupKeys[i];
    if (key === null) {
      groupByFilters.push(`${column} IS NULL`);
    } else {
      groupByFilters.push(`${column} = '${key}'`);
    }
  }
  const groupByFilterClause = groupByFilters.join(" AND ");

  // Normal column filters
  const handleFilter = (v: Filter | FilterCombinator): string => {
    if (v.kind !== "combination") {
      let operator!: string;
      let value!: string;
      if (v.operator === "equals") {
        operator = "=";
        value = typeof v.value === "string" ? `'${v.value}'` : String(v.value);
      }
      if (v.operator === "not_equals") {
        operator = "!=";
        value = typeof v.value === "string" ? `'${v.value}'` : String(v.value);
      }
      if (v.operator === "begins_with") {
        operator = "LIKE";
        value = `'${v.value}'%`;
      }
      if (v.operator === "not_beings_with") {
        operator = "NOT LIKE";
        value = `'${v.value}'%`;
      }
      if (v.operator === "ends_with") {
        operator = "LIKE";
        value = `'%${v.value}'`;
      }
      if (v.operator === "not_ends_with") {
        operator = "NOT LIKE";
        value = `'%${v.value}'`;
      }
      if (v.operator === "contains") {
        operator = "LIKE";
        value = `'%${v.value}%'`;
      }
      if (v.operator === "not_contains") {
        operator = "NOT LIKE";
        value = `'%${v.value}%'`;
      }
      if (v.operator === "before" || v.operator === "less_than") {
        operator = "<";
        value = typeof v.value === "string" ? `'${v.value}'` : String(v.value);
      }
      if (v.operator === "after" || v.operator === "greater_than") {
        operator = ">";
        value = typeof v.value === "string" ? `'${v.value}'` : String(v.value);
      }
      if (v.operator === "less_than_or_equal") {
        operator = "<=";
        value = typeof v.value === "string" ? `'${v.value}'` : String(v.value);
      }
      if (v.operator === "greater_than_or_equal") {
        operator = ">=";
        value = typeof v.value === "string" ? `'${v.value}'` : String(v.value);
      }

      const column = v.kind === "string" ? `LOWER(${v.column})` : v.column;

      return `${column} ${operator} ${value.toLowerCase()}`;
    }

    const filters = v.filters.map((f) => handleFilter(f));

    return `(${filters.join(` ${v.operator} `)})`;
  };
  const columnFilterClause = view.filters.map(handleFilter).join(" AND ");

  // In filters
  const inFilters = Object.entries(view.filtersIn)
    .map(([column, filter]) => {
      const values = filter.values.map((x) =>
        typeof x === "string" ? `'${x}'` : x,
      );

      return `${column} ${
        filter.operator === "IN" ? "IN" : "NOT IN"
      } (${values.join(", ")})`;
    })
    .join(" AND ");

  const finalFilters = [];
  if (columnFilterClause) finalFilters.push(columnFilterClause);
  if (groupByFilterClause) finalFilters.push(groupByFilterClause);
  if (inFilters) finalFilters.push(inFilters);

  if (!finalFilters.length) return "";

  return `WHERE\n\t${finalFilters.join("\n\tAND ")}`;
}
