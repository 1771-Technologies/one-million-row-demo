import type { PieceWritable } from "@1771technologies/lytenyte-pro";

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
  genres: string;
  production_companies: string;
  production_countries: string;
  spoken_languages: string;
  keywords: string;
}

export interface AggModel {
  readonly [colId: string]: { fn: string };
}

export interface GridSpec {
  readonly data: Movie;
  readonly column: {
    readonly aggsAllowed?: string[];
    readonly rowGroupable?: boolean;
  };
  readonly api: {
    readonly groups: PieceWritable<string[]>;
    readonly aggModel: PieceWritable<AggModel>;
    readonly filters: PieceWritable<Record<string, Filter>>;
    readonly sorts: PieceWritable<Model["sorts"]>;
  };
}

export interface FilterNumber {
  readonly kind: "number";
  readonly column: string;
  readonly operator: string;
  readonly value: number;
}

export interface FilterString {
  readonly kind: "string";
  readonly column: string;
  readonly operator: string;
  readonly value: string;
}

export interface FilterDate {
  readonly kind: "date";
  readonly column: string;
  readonly operator: string;
  readonly value: string;
}

export interface FilterCombination {
  readonly kind: "combination";
  readonly filters: Filter[];
  readonly operator: "AND" | "OR";
}

export type Filter =
  | FilterNumber
  | FilterString
  | FilterDate
  | FilterCombination;

export interface Model {
  readonly filters: Record<string, Filter>;
  readonly groups: string[];
  readonly aggregations: Record<string, { fn: string }>;
  readonly sorts: {
    readonly columnId: string;
    readonly isDescending?: boolean;
  }[];
}
