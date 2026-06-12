import { DropdownMenu as D } from "radix-ui";
import type { Filter, GridSpec, Model } from "../types";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { tw } from "../../lib/tw";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "../../components/popover";
import { SimpleFilterStringOrCombo } from "../simple-filter/simple-filter-string";
import { useTwoFlowState } from "../simple-filter/use-two-flow-state";
import {
  useMemo,
  type ComponentProps,
  type JSX,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import type { Grid } from "@1771technologies/lytenyte-pro";

export function HeaderRenderer({ column, api }: Grid.T.HeaderParams<GridSpec>) {
  const sort = api.sorts.useValue().find((c) => c.columnId === column.id);

  const isDescending = sort?.isDescending ?? false;

  const filterModel = api.filters.useValue();
  const hasFilter = filterModel[column.id];

  const aggModel = api.aggModel.useValue();
  const hasGroups = api.groups.useValue().length > 0;

  const aggFn = aggModel[column.id]?.fn;

  return (
    <div className="h-full w-full px-1 py-1">
      <div
        className={tw(
          "hover:bg-(--lng1771-gray-10) flex h-full w-full px-2 rounded-lg items-center text-xs transition-colors cursor-pointer gap-0.5 text-nowrap",
          (column.type === "number" || column.type === "date") &&
            "tabular-nums flex-row-reverse",
        )}
        onClick={() => {
          const current = api.sorts.get().find((x) => x.columnId === column.id);

          if (current == null) {
            const columnId = column.id;
            const sort: Model["sorts"][number] = {
              columnId,
              isDescending: false,
            };
            api.sorts.set([sort]);
          } else if (!current.isDescending) {
            api.sorts.set([{ ...current, isDescending: true }]);
          } else {
            api.sorts.set([]);
          }
        }}
      >
        {column.name ?? column.id}

        {aggFn && hasGroups && <AggMenu api={api} column={column} />}

        <Popover>
          <PopoverTrigger
            onClick={(e) => e.stopPropagation()}
            className={tw("relative")}
          >
            <FilterIcon />
            {hasFilter && (
              <div className="absolute top-0 right-0 size-1 bg-(--lng1771-primary-50) rounded-full" />
            )}
          </PopoverTrigger>
          <PopoverContent onClick={(e) => e.stopPropagation()}>
            <PopoverFilterContent api={api} column={column} />
          </PopoverContent>
        </Popover>

        {sort && (
          <span>
            {!isDescending ? (
              <ArrowUpIcon className="size-4" />
            ) : (
              <ArrowDownIcon className="size-4" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function AggMenu({
  column,
  api,
  className,
}: Grid.T.HeaderParams<GridSpec> & { className?: string }) {
  const aggs = api.aggModel.useValue();
  const agg = aggs[column.id];
  const aggName = typeof agg?.fn === "string" ? agg?.fn : "Fn(x)";

  const options = column.aggsAllowed ?? [];

  return (
    <D.Root>
      <D.Trigger className={tw(className)} asChild>
        <button className="focus-visible:ring-(--lng1771-primary-50) rounded px-1 py-1 text-xs text-[var(--lng1771-primary-50)] hover:bg-[var(--lng1771-primary-30)] focus:outline-none focus-visible:ring-1">
          ({aggName as string})
        </button>
      </D.Trigger>
      <D.Portal>
        <GridDropMenuContent>
          <D.Arrow fill="var(--lng1771-gray-30)" />
          <D.DropdownMenuRadioGroup
            value={aggName}
            onValueChange={(c) => {
              api.aggModel.set((prev) => {
                return { ...prev, [column.id]: { fn: c } };
              });
            }}
          >
            {options.map((c) => {
              return <RadioItem key={c} value={c} label={c} className="pl-1" />;
            })}
          </D.DropdownMenuRadioGroup>
        </GridDropMenuContent>
      </D.Portal>
    </D.Root>
  );
}
function GridDropMenuContent(props: PropsWithChildren) {
  return (
    <D.Content
      className={tw(
        "bg-(--lng1771-gray-05) border-(--lng1771-gray-30) z-50 rounded-lg border p-1",
      )}
    >
      {props.children}
    </D.Content>
  );
}
const itemCls =
  "flex items-center text-sm text-(--lng1771-gray-80) cursor-pointer rounded-lg  data-[highlighted]:bg-(--lng1771-gray-30) py-1 pr-2 px-0.5";

const RadioItem = ({
  icon,
  ...props
}: Omit<ComponentProps<typeof D.DropdownMenuRadioItem>, "children"> & {
  icon?: ReactNode;
  label: ReactNode;
}) => {
  return (
    <D.DropdownMenuRadioItem
      {...props}
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={tw(
        props.className,
        itemCls,
        "group",
        "data-[disabled]:text-(--lng1771-gray-30)",
      )}
    >
      {icon && <MenuIcon>{icon}</MenuIcon>}
      {props.label}
      <MenuIcon>
        <TickmarkIcon
          className="stroke-(--lng1771-primary-50) relative hidden group-data-[state='checked']:block"
          style={{ right: -16 }}
        />
      </MenuIcon>
    </D.DropdownMenuRadioItem>
  );
};
const MenuIcon = (props: PropsWithChildren) => {
  return (
    <span className="text-(--lng1771-gray-70) mr-2 flex h-[24px] w-[20px] items-center justify-center">
      {props.children}
    </span>
  );
};

function PopoverFilterContent({ api, column }: Grid.T.HeaderParams<GridSpec>) {
  const filterModel = api.filters.useValue();

  const initialFilter = useMemo(() => {
    const filter = filterModel[column.id];

    if (!filter) return null;

    if (filter.kind === "combination") return filter;

    return {
      kind: "combination",
      filters: [filter],
      operator: "AND",
    };
  }, [filterModel, column]);

  const [tempFilter, setTempFilter] = useTwoFlowState<Partial<
    Partial<Filter>
  > | null>((initialFilter as Filter) ?? null);

  return (
    <div className="flex flex-col gap-2">
      <SimpleFilterStringOrCombo
        column={column}
        filter={tempFilter}
        setFilter={setTempFilter}
      />
      <div className="flex justify-end gap-2 py-2">
        <PopoverClose
          onClick={() => {
            api.filters.set((prev) => {
              const next = { ...prev };
              delete next[column.id];

              return next;
            });

            api.filters.set((prev) => {
              const next = { ...prev };
              delete next[column.id];

              return next;
            });
          }}
          className={tw(
            "text-sm border border-(--lng1771-gray-30) px-3 rounded py-0.5 hover:bg-(--lng1771-gray-10) bg-(--lng1771-gray-00) text-(--lng1771-gray-70) cursor-pointer transition-colors",
          )}
        >
          Clear
        </PopoverClose>
        <PopoverClose
          onClick={() => {
            if (tempFilter) {
              let validFilter;
              if (
                tempFilter.kind === "number" ||
                tempFilter.kind === "date" ||
                tempFilter.kind === "string"
              ) {
                if (tempFilter.operator && tempFilter.value != null)
                  validFilter = tempFilter;
              } else if (tempFilter.kind === "combination") {
                const first = tempFilter.filters?.[0];
                const second = tempFilter.filters?.[1];
                const filters = [];
                if (
                  (first?.kind === "string" ||
                    first?.kind === "date" ||
                    first?.kind === "number") &&
                  first.operator &&
                  first.value != null
                )
                  filters.push(first);
                if (
                  (second?.kind === "string" ||
                    second?.kind === "date" ||
                    second?.kind === "number") &&
                  second.operator &&
                  second.value != null
                )
                  filters.push(second);

                if (filters.length === 1) {
                  validFilter = filters[0];
                } else if (filters.length === 2) {
                  validFilter = { ...tempFilter, filters };
                }
              }

              if (validFilter) {
                api.filters.set((prev) => {
                  return {
                    ...prev,
                    [column.id]: validFilter,
                  };
                });
              }
            }
          }}
          style={{ transform: "scale(0.92)" }}
          className={tw(
            "text-sm  border border-(--lng1771-primary-30) px-3 rounded py-0.5 hover:bg-(--lng1771-primary-70) bg-(--lng1771-primary-50) text-(--lng1771-gray-02) font-semibold cursor-pointer transition-colors",
          )}
        >
          Apply
        </PopoverClose>
      </div>
    </div>
  );
}

function TickmarkIcon(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 10.5588L7.64 15.5L17.5 5"
        stroke="#161616"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterIcon(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M17.212 3.75H2.90761C2.69022 3.75 2.5 3.92744 2.5 4.13022V5.8032C2.5 5.95529 2.55435 6.13273 2.66304 6.25947L7.63587 12.3684C7.77174 12.5205 7.85326 12.7233 7.85326 12.926V17.4634C7.85326 17.6155 8.0163 17.7168 8.15217 17.6408L11.5489 16.4241C11.9022 16.272 12.1196 15.9678 12.1196 15.613V12.926C12.1196 12.7233 12.2011 12.5205 12.337 12.3684L17.337 6.25947C17.4457 6.13273 17.5 5.98064 17.5 5.8032V3.75"
        stroke="#161616"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
