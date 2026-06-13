import {
  Grid,
  usePiece,
  useServerDataSource,
} from "@1771technologies/lytenyte-pro";
import { PillManager } from "@1771technologies/lytenyte-pro/components";
import "@1771technologies/lytenyte-pro/pill-manager.css";
import { Mosaic } from "react-loading-indicators";
import { columns as initialColumns } from "./columns";
import type { Model, GridSpec, Movie } from "./types";
import { fetchSlice } from "./fetch-slice";
import { HeaderRenderer } from "./renderers/header-renderer";
import { BaseRenderer } from "./renderers/base-renderer";
import { GroupCellRenderer } from "./renderers/group-cell";
import { GridFrame } from "./grid-frame";
import { MarketRenderer } from "./renderers/marker";
import { useMemo, useState } from "react";

const base: Grid.ColumnBase<GridSpec> = {
  headerRenderer: HeaderRenderer,
  cellRenderer: BaseRenderer,
  widthMin: 150,
  movable: true,
  resizable: true,
};

const marker: Grid.ColumnMarker<GridSpec> = {
  on: true,
  cellRenderer: MarketRenderer,
  headerRenderer: () => <></>,
};

const groupColumn: Grid.RowGroupColumn<GridSpec> = {
  pin: "start",
  cellRenderer: GroupCellRenderer,
  headerRenderer: () => {
    return <div>Groups</div>;
  },
  resizable: true,
};

export function MillionRowGrid({ onReset }: { readonly onReset: () => void }) {
  const [aggregations, setAggregations] = useState<Model["aggregations"]>({
    revenue: { fn: "sum" },
    runtime: { fn: "avg" },
    budget: { fn: "avg" },
    popularity: { fn: "avg" },
    vote_average: { fn: "avg" },
  });
  const aggModel$ = usePiece(aggregations, setAggregations);

  const [columns, setColumns] = useState(initialColumns);

  const [filters, setFilters] = useState<Model["filters"]>({});
  const filters$ = usePiece(filters, setFilters);

  const [sorts, setSorts] = useState<Model["sorts"]>([]);
  const sorts$ = usePiece(sorts, setSorts);

  const [groups, setGroups] = useState<string[]>([]);
  const groups$ = usePiece(groups, setGroups);

  const [rowGroupColumn, setRowGroupColumn] = useState(groupColumn);

  const extension = useMemo<GridSpec["api"]>(() => {
    return {
      aggModel: aggModel$,
      filters: filters$,
      sorts: sorts$,
      groups: groups$,
    };
  }, [aggModel$, filters$, sorts$, groups$]);

  const model = useMemo(() => {
    return [{ filters, groups, aggregations, sorts }];
  }, [filters, groups, aggregations, sorts]);

  const ds = useServerDataSource<Movie, typeof model>({
    queryFn: async ({ requests, queryKey }) => {
      const res = await fetchSlice({ model: queryKey[0], reqs: requests });
      return res;
    },
    queryKey: model,
    hasRowBranches: groups.length > 0,
  });

  const isLoading = ds.isLoading.useValue();

  const rows = useMemo(() => {
    const groupsOn = groups
      .map((x) => columns.find((c) => x === c.id))
      .map((x) => {
        return {
          active: groups.includes(x!.id),
          id: x!.id,
          name: x!.name ?? x!.id,
          movable: true,
          removable: false,
        } satisfies PillManager.T.PillItem;
      });

    const groupsOff = columns
      .filter((x) => x.rowGroupable && !groups.includes(x.id))
      .map((x) => {
        return {
          active: groups.includes(x.id),
          id: x.id,
          name: x.name ?? x.id,
          movable: false,
          removable: false,
        } satisfies PillManager.T.PillItem;
      });

    return [
      {
        id: "row-groups",
        type: "row-pivots",
        label: "Row Groups",
        pills: [...groupsOn, ...groupsOff],
      } satisfies PillManager.T.PillRow,
    ];
  }, [groups, columns]);

  return (
    <div className="w-full h-full flex flex-col ln-grid ln-cell-marker:bg-ln-gray-10 ln-cell:data-[ln-type=date]:justify-end ln-cell:data-[ln-type=number]:tabular-nums">
      <GridFrame
        onReset={onReset}
        title="One Million Rows"
        headerChildren={
          <div className="border-t border-ln-gray-10 bg-ln-gray-02">
            <PillManager
              rows={rows}
              onPillItemActiveChange={(params) => {
                if (params.item.active) {
                  setGroups((prev) => [...prev, params.item.id]);
                } else {
                  setGroups((prev) => prev.filter((x) => x !== params.item.id));
                }
              }}
              onPillRowChange={(params) => {
                setGroups(
                  params.changed[0].pills
                    .filter((x) => x.active)
                    .map((x) => x.id),
                );
              }}
            />
          </div>
        }
      >
        {isLoading && (
          <div className="w-full h-full absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center flex-col">
            <Mosaic color="#32cd32" size="medium" text="" textColor="" />
            Loading...
          </div>
        )}
        <Grid
          apiExtension={extension}
          rowSource={ds}
          columnBase={base}
          columnMarker={marker}
          columns={columns}
          onColumnsChange={setColumns}
          rowGroupColumn={rowGroupColumn}
          onRowGroupColumnChange={setRowGroupColumn}
        />
      </GridFrame>
    </div>
  );
}

// export function MillionRowGrid({ onReset }: { onReset: () => void }) {
//   const ds = useServerDataSource<Movie>({
//     dataFetcher: async (req) => {
//       const res = await fetchSlice({ model: req.model, reqs: req.requests });
//       return res;
//     },
//     blockSize: 300,
//   });

//   const { header, rows } = grid.view.useValue();

//   const isLoading = ds.isLoading.useValue();

//   useEffect(() => {
//     return grid.state.viewBounds.watch(() => {
//       const b = grid.state.viewBounds.get();
//       const max = "9".repeat(`${b.rowCenterEnd}`.length);

//       const width = Math.max(
//         measureText(`${max}`, grid.state.viewport.get()!).width + 16,
//         40,
//       );
//       const currentWidth = grid.state.columnMarker.get().width! ?? 40;
//       if (Math.abs(currentWidth - width) > 5) {
//         grid.state.columnMarker.set((prev) => ({
//           ...prev,
//           minWidth: width,
//           maxWidth: width,
//           width,
//         }));
//       }
//     });
//   }, []);

//   return (
//     <div className="w-full h-full flex flex-col">
//       <GridFrame
//         onReset={onReset}
//         title="One Million Rows"
//         headerChildren={<GroupPills grid={grid} />}
//       >
//         {isLoading && (
//           <div className="w-full h-full absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center flex-col">
//             <Mosaic color="#32cd32" size="medium" text="" textColor="" />
//             Loading...
//           </div>
//         )}
//         <Grid.Root grid={grid}>
//           <Grid.Viewport
//             id="grid"
//             style={{ overflowY: "scroll", scrollbarWidth: "thin" }}
//           >
//             <Grid.Header>
//               {header.layout.map((headerRow, index) => {
//                 return (
//                   <Grid.HeaderRow key={index} headerRowIndex={index}>
//                     {headerRow.map((cell) => {
//                       if (cell.kind === "group") return null;

//                       return (
//                         <Grid.HeaderCell
//                           key={cell.id}
//                           cell={cell}
//                           className={tw(
//                             cell.column.id === "lytenyte-marker-column" &&
//                               "bg-(--lng1771-gray-10)!",
//                           )}
//                         />
//                       );
//                     })}
//                   </Grid.HeaderRow>
//                 );
//               })}
//             </Grid.Header>
//             <Grid.RowsContainer>
//               <Grid.RowsCenter>
//                 {rows.center.map((row) => {
//                   if (row.kind === "full-width") return null;

//                   return (
//                     <Grid.Row key={row.id} row={row}>
//                       {row.cells.map((cell) => {
//                         return (
//                           <Grid.Cell
//                             key={cell.id}
//                             cell={cell}
//                             className={tw(
//                               "flex items-center px-2",
//                               (cell.column.type === "number" ||
//                                 cell.column.type === "date") &&
//                                 "justify-end tabular-nums",
//                               cell.column.id === "lytenyte-marker-column" &&
//                                 "px-0 font-mono",
//                             )}
//                           />
//                         );
//                       })}
//                     </Grid.Row>
//                   );
//                 })}
//               </Grid.RowsCenter>
//             </Grid.RowsContainer>
//           </Grid.Viewport>
//         </Grid.Root>
//       </GridFrame>
//     </div>
//   );
// }
