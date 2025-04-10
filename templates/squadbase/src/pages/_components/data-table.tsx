"use client";

import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  MorphLoadDataProps,
  MorphPostDataProps,
} from "@/pages/_lib/data-props";
import { useJsonData } from "@/pages/_hooks/use-json-data";
import {
  CompactSelection,
  GridColumn,
  GridSelection,
} from "@glideapps/glide-data-grid";
import { DataGrid } from "@/pages/_components/ui/data-grid";
import { LoadingSpinner } from "@/pages/_components/ui/spinner";
import { useAlias } from "@/pages/_hooks/use-alias";
import { Callout } from "@/pages/_components/ui/callout";
import { State } from "@morph-data/frontend/api";

type DataTableRowSelectionProps =
  | {
      rowSelectionMode: "single";
      rowSelection: State<Record<string, unknown> | undefined | null>;
    }
  | {
      rowSelectionMode: "multi";
      rowSelection: State<Array<Record<string, unknown>> | undefined | null>;
    }
  | {
      rowSelectionMode: "none";
      rowSelection: undefined;
    };

type DataTableProps = {
  headerKeys?: string[];
  width?: number;
  height?: number;
  // formItems?: FormItemConfig;
  rowNumbers?: boolean;
} & Partial<DataTableRowSelectionProps>;

const DataTable: FC<
  MorphLoadDataProps & Partial<MorphPostDataProps> & DataTableProps
> = ({
  alias,
  loadData,
  loadDataUrl = (loadData: string) =>
    `${window.location.protocol}//${window.location.host}/cli/run/${loadData}/json`,
  // postData,
  variables = {},
  headerKeys,
  height = 500,
  width,
  rowSelectionMode,
  rowSelection,
  rowNumbers,
}) => {
  const _loadData = useAlias({ loadData, alias });

  const { items, count, error, isLoading, goNextPage, hasNext } = useJsonData({
    loadData: _loadData,
    variables,
    loadDataUrl,
  });

  const handleReachedBottom = useCallback(() => {
    if (!hasNext || isLoading) return;

    goNextPage();
  }, [goNextPage, hasNext, isLoading]);

  const dataGridColumns: GridColumn[] = useMemo(() => {
    if (items.length === 0) {
      return [];
    }

    if (headerKeys) {
      return headerKeys.map((key) => {
        return {
          id: key,
          title: key,
        };
      });
    }

    return Object.keys(items[0]).map((key) => {
      return {
        id: key,
        title: key,
      };
    });
  }, [items, headerKeys]);

  /**
   * Selection
   */

  const rowMarkers = useMemo(() => {
    if (rowSelectionMode !== "none") {
      if (rowNumbers) {
        return "both";
      }
      return "checkbox";
    }
    if (rowNumbers) {
      return "number";
    }
    return "none";
  }, [rowNumbers, rowSelectionMode]);

  const [gridSelection, setGridSelection] = useState<GridSelection>({
    columns: CompactSelection.empty(),
    rows: CompactSelection.empty(),
  });

  useEffect(() => {
    if (!rowSelection) return;
    if (!rowSelection.value) {
      setGridSelection({
        columns: CompactSelection.empty(),
        rows: CompactSelection.empty(),
      });
    }
  }, [rowSelection?.value]);

  const handleGridSelectionChange = useCallback(
    (gridSelection: GridSelection) => {
      setGridSelection(gridSelection);

      if (gridSelection.rows.length > 0) {
        const indexes = gridSelection.rows.toArray();

        if (rowSelectionMode === "multi" && rowSelection) {
          const targetIndexes = indexes;
          const targetItems = targetIndexes.map((index) => items[index]);
          rowSelection.update(targetItems);
          return;
        }

        if (rowSelectionMode === "single" && rowSelection) {
          const targetIndex = indexes[0];
          const targetItem = items[targetIndex];
          rowSelection.update(targetItem);
          return;
        }
      }
    },
    [items, rowSelectionMode, rowSelection]
  );

  return (
    <>
      <div className="relative">
        {error ? (
          <DataTableError error={error} height={height} width={width} />
        ) : (
          <>
            <DataGrid
              key={`data-grid-${loadData}`}
              columns={dataGridColumns}
              data={items}
              height={height}
              width={width}
              onReachedBottom={handleReachedBottom}
              rowSelect={rowSelectionMode}
              rowMarkers={rowMarkers}
              gridSelection={gridSelection}
              onGridSelectionChange={handleGridSelectionChange}
              drawFocusRing
              getCellsForSelection
            />
            {count && (
              <div className="text-sm text-gray-500">
                Total Rows: {count.toLocaleString()}
              </div>
            )}
            {isLoading && <LoadingSpinner className="h-4 w-4 text-gray-500" />}
          </>
        )}
      </div>
    </>
  );
};

/**
 * Dummy component for displaying error messages
 */

const columns = [
  {
    title: "XXX",
    id: "001",
  },
  {
    title: "XXX",
    id: "002",
  },
  {
    title: "XXX",
    id: "003",
  },
  {
    title: "XXX",
    id: "004",
  },
  {
    title: "XXX",
    id: "005",
  },
];

const dataPrimitive = {
  "001": "---",
  "002": "---",
  "003": "---",
  "004": "---",
  "005": "---",
};

const data = Array.from({ length: 100 }, () => ({
  ...dataPrimitive,
}));

export const DataTableError = (props: {
  error: Error;
  height?: number;
  width?: number;
}) => {
  const { error, width, height } = props;

  return (
    <div className="relative">
      <DataGrid columns={columns} data={data} width={width} height={height} />
      <div className="absolute top-12 left-0 right-0 flex justify-center items-center">
        <Callout
          title="An error occured with DataTable comopnent."
          className="shadow-lg"
          variant="error"
        >
          <div className="mt-3">Error Message: {error.message}</div>
        </Callout>
      </div>
    </div>
  );
};

export { DataTable };
