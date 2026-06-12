interface FilterNumber {
  readonly kind: "number";
  readonly column: string;
  readonly operator: string;
  readonly value: number;
}

interface FilterString {
  readonly kind: "string";
  readonly column: string;
  readonly operator: string;
  readonly value: string;
}

interface FilterDate {
  readonly kind: "date";
  readonly column: string;
  readonly operator: string;
  readonly value: string;
}

interface FilterCombination {
  readonly kind: "combination";
  readonly filters: Filter[];
  readonly operator: "AND" | "OR";
}

type Filter = FilterNumber | FilterString | FilterDate | FilterCombination;

export interface DataRequestModel {
  readonly filters: Record<string, Filter>;
  readonly groups: string[];
  readonly aggregations: Record<string, { fn: string }>;
  readonly sorts: {
    readonly columnId: string;
    readonly isDescending?: boolean;
  }[];
}
