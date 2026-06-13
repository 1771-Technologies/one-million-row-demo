import {
  FilterDateInput,
  FilterNumberInput,
  FilterStringInput,
} from "./filter-inputs";
import type { Dispatch, SetStateAction } from "react";
import type {
  Filter,
  FilterCombination,
  FilterDate,
  FilterNumber,
  FilterString,
  GridSpec,
} from "../types";
import { tw } from "../../lib/tw";
import type { Grid } from "@1771technologies/lytenyte-pro";

export interface SimpleFilterStringOrCombo {
  readonly column: Grid.Column<GridSpec>;
  readonly filter: Partial<Filter> | null;
  readonly setFilter: Dispatch<SetStateAction<Partial<Filter> | null>>;
}

export function SimpleFilterStringOrCombo({
  column,
  filter,
  setFilter,
}: SimpleFilterStringOrCombo) {
  const filterType =
    filter?.kind ||
    (column.type == "number"
      ? "number"
      : column.type === "date"
        ? "date"
        : "string");

  if (
    filterType === "string" ||
    filterType === "number" ||
    filterType === "date"
  ) {
    return (
      <SimpleFilter
        isRoot
        filter={filter as SimpleFilter}
        setFilter={setFilter as (v: (prev: SimpleFilter) => void) => void}
        typeFallback={filterType}
      />
    );
  }

  if (filterType === "combination") {
    const filterCombo = filter as FilterCombination;

    const first = filterCombo.filters[0] as FilterString | FilterNumber;
    const second = filterCombo.filters[1] as FilterString | FilterNumber;
    const typeFallback =
      column.type === "number"
        ? "number"
        : column.type === "date"
          ? "date"
          : "string";

    return (
      <>
        <SimpleFilter
          filter={first}
          setFilter={(setter) => {
            const next = setter(first);

            const nextFilters = [...filterCombo.filters];
            nextFilters[0] = next as FilterNumber;

            setFilter({ ...filterCombo, filters: nextFilters });
          }}
          typeFallback={typeFallback}
        />
        <div className="flex items-center justify-center gap-2 md:col-span-2">
          <div className="flex gap-1 items-center justify-end text-sm text-(--ln-gray-80)">
            <label className="flex gap-2 items-center">
              <input
                type="radio"
                checked={filterCombo.operator === "AND"}
                onChange={(e) => {
                  if (e.target.checked)
                    setFilter(
                      (prev) => ({ ...prev, operator: "AND" }) as SimpleFilter,
                    );
                }}
                className={tw(
                  "appearance-none h-4 w-4 rounded-full border border-(--ln-gray-40) checked:border-(--ln-primary-50) checked:border-[5px] cursor-pointer select-none",
                  "focus-visible:outline-offset-1 focus-visible:outline-(--ln-primary-50)",
                )}
              />
              And
            </label>
          </div>
          <div className="px-2 text-sm text-(--ln-gray-80)">
            <label className="flex gap-2 items-center">
              <input
                type="radio"
                checked={filterCombo.operator === "OR"}
                onChange={(e) => {
                  if (e.target.checked)
                    setFilter(
                      (prev) => ({ ...prev, operator: "OR" }) as SimpleFilter,
                    );
                }}
                className={tw(
                  "appearance-none h-4 w-4 rounded-full border border-(--ln-gray-40) checked:border-(--ln-primary-50) checked:border-[5px] cursor-pointer select-none",
                  "focus-visible:outline-offset-1 focus-visible:outline-(--ln-primary-50)",
                )}
              />
              Or
            </label>
          </div>
        </div>
        <SimpleFilter
          filter={second}
          setFilter={(setter) => {
            const next = setter(second);

            const nextFilters = [...filterCombo.filters];
            nextFilters[1] = next as FilterString;

            setFilter({ ...filterCombo, filters: nextFilters });
          }}
          typeFallback={typeFallback}
        />
      </>
    );
  }

  return null;
}

type SimpleFilter =
  | Partial<FilterString>
  | Partial<FilterNumber>
  | Partial<FilterDate>
  | Partial<FilterCombination>
  | null;

interface SimpleFilterProps {
  readonly isRoot?: boolean;
  readonly filter: SimpleFilter;
  readonly typeFallback: "number" | "string" | "date";
  readonly setFilter: (v: (prev: SimpleFilter) => SimpleFilter) => void;
}

function SimpleFilter({
  isRoot,
  filter,
  setFilter,
  typeFallback,
}: SimpleFilterProps) {
  const filterType = filter?.kind || typeFallback;

  if (filterType === "date") {
    const dateFilter = filter as Partial<FilterDate> | null;
    return (
      <FilterDateInput
        filter={dateFilter}
        onValueChange={(v) => {
          setFilter((prev) => {
            const next = prev
              ? {
                  ...prev,
                  kind: "date",
                  value: v,
                  options: { caseInsensitive: true },
                }
              : {
                  kind: "date",
                  value: v,
                  options: { caseInsensitive: true },
                };

            if (isRoot) {
              if (next.operator && next.value) {
                return {
                  kind: "combination",
                  filters: [next],
                  operator: "AND",
                } as FilterCombination;
              }
            }

            return next as FilterString;
          });
        }}
        onOperatorChange={(v) => {
          setFilter((prev) => {
            const next = (
              prev
                ? {
                    ...prev,
                    kind: "date",
                    operator: v,
                  }
                : {
                    kind: "date",
                    operator: v,
                  }
            ) as FilterDate;

            if (isRoot) {
              if (next.operator && next.value) {
                return {
                  kind: "combination",
                  filters: [next],
                  operator: "AND",
                } as FilterCombination;
              }
            }

            return next;
          });
        }}
      />
    );
  }

  if (filterType === "string") {
    const stringFilter = filter as Partial<FilterString> | null;

    return (
      <FilterStringInput
        filter={stringFilter}
        onValueChange={(v) => {
          setFilter((prev) => {
            const next = prev
              ? {
                  ...prev,
                  kind: "string",
                  value: v,
                  options: { caseInsensitive: true },
                }
              : {
                  kind: "string",
                  value: v,
                  options: { caseInsensitive: true },
                };

            if (isRoot) {
              if (next.operator && next.value) {
                return {
                  kind: "combination",
                  filters: [next],
                  operator: "AND",
                } as FilterCombination;
              }
            }

            return next as FilterString;
          });
        }}
        onOperatorChange={(v) => {
          setFilter((prev) => {
            const next = (
              prev
                ? {
                    ...prev,
                    kind: "string",
                    operator: v,
                  }
                : {
                    kind: "string",
                    operator: v,
                  }
            ) as FilterString;

            if (isRoot) {
              if (next.operator && next.value) {
                return {
                  kind: "combination",
                  filters: [next],
                  operator: "AND",
                } as FilterCombination;
              }
            }

            return next;
          });
        }}
      />
    );
  }

  if (filterType === "number") {
    const numberFilter = filter as Partial<FilterNumber> | null;

    return (
      <FilterNumberInput
        filter={numberFilter}
        onValueChange={(v) => {
          setFilter((prev) => {
            const next = prev
              ? { ...prev, kind: "number", value: v }
              : { kind: "number", value: v };

            if (isRoot) {
              if (next.operator && next.value != null) {
                return {
                  kind: "combination",
                  filters: [next],
                  operator: "AND",
                } as FilterCombination;
              }
            }

            return next as FilterNumber;
          });
        }}
        onOperatorChange={(v) => {
          setFilter((prev) => {
            const next = (
              prev
                ? { ...prev, kind: "number", operator: v }
                : { kind: "number", operator: v }
            ) as FilterNumber;

            if (isRoot) {
              if (next.operator && next.value) {
                return {
                  kind: "combination",
                  filters: [next],
                  operator: "AND",
                } as FilterCombination;
              }
            }

            return next as FilterNumber;
          });
        }}
      />
    );
  }

  return null;
}
