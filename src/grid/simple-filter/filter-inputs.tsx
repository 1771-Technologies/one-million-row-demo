import {
  dateOptions,
  dateValueToLabel,
  numberOptions,
  numberValueToLabel,
  textOptions,
  textValueToLabel,
} from "./filter-options";
import { useMemo } from "react";
import { GridSelect } from "./grid-select";
import { GridInput } from "./grid-input";
import type { FilterDate, FilterNumber, FilterString } from "../types";

export interface FilterInputDate {
  readonly filter: Partial<FilterDate> | null;
  readonly onOperatorChange: (v: FilterDate["operator"]) => void;
  readonly onValueChange: (v: string | null | number) => void;
}

export function FilterDateInput({
  filter,
  onOperatorChange,
  onValueChange,
}: FilterInputDate) {
  const operator = useMemo(() => {
    if (!filter?.operator) return null;

    return { value: filter.operator, label: dateValueToLabel[filter.operator] };
  }, [filter]);

  const value = useMemo(() => {
    if (!filter?.value) return "";

    return filter.value;
  }, [filter]);

  return (
    <>
      <GridSelect
        options={dateOptions}
        value={operator}
        onChange={(v) => {
          onOperatorChange(v.value as "equals");
        }}
      />
      <GridInput
        value={value}
        type="date"
        onChange={(e) => {
          onValueChange(e.target.value);
        }}
      />
    </>
  );
}

export interface FilterInputString {
  readonly filter: Partial<FilterString> | null;
  readonly onOperatorChange: (v: FilterString["operator"]) => void;
  readonly onValueChange: (v: string | null | number) => void;
}

export function FilterStringInput({
  filter,
  onOperatorChange,
  onValueChange,
}: FilterInputString) {
  const operator = useMemo(() => {
    if (!filter?.operator) return null;

    return { value: filter.operator, label: textValueToLabel[filter.operator] };
  }, [filter]);

  const value = useMemo(() => {
    if (!filter?.value) return "";

    return filter.value;
  }, [filter]);

  const operatorIsNumber = filter?.operator?.startsWith("length");

  return (
    <>
      <GridSelect
        options={textOptions}
        value={operator}
        onChange={(v) => {
          const isNumber = v.value.startsWith("length");

          if (isNumber !== operatorIsNumber) onValueChange(null);
          onOperatorChange(v.value);
        }}
      />
      <GridInput
        value={value}
        type={operatorIsNumber ? "number" : "text"}
        onChange={(e) => {
          if (!e.target.value) return onValueChange(null);

          if (operatorIsNumber) {
            const value = Number.parseInt(e.target.value);
            if (Number.isNaN(value)) return onValueChange(null);
            else return onValueChange(value);
          }

          onValueChange(e.target.value);
        }}
      />
    </>
  );
}

export interface FilterInputNumber {
  readonly filter: Partial<FilterNumber> | null;
  readonly onOperatorChange: (v: FilterNumber["operator"]) => void;
  readonly onValueChange: (v: null | number) => void;
}

export function FilterNumberInput({
  filter,
  onOperatorChange,
  onValueChange,
}: FilterInputNumber) {
  const operator = useMemo(() => {
    if (!filter?.operator) return null;

    return {
      value: filter.operator,
      label: numberValueToLabel[filter.operator],
    };
  }, [filter]);

  const value = useMemo(() => {
    if (filter?.value == null) return "";

    return filter.value;
  }, [filter]);

  return (
    <>
      <GridSelect
        options={numberOptions}
        value={operator}
        onChange={(v) => {
          onOperatorChange(v.value);
        }}
      />
      <GridInput
        value={value}
        type="number"
        onChange={(e) => {
          const value = Number.parseFloat(e.target.value);

          if (Number.isNaN(value)) onValueChange(null);
          else onValueChange(value);
        }}
      />
    </>
  );
}
