"use client";

import * as React from "react";
import {
  DataEditor,
  GridCell,
  GridCellKind,
  GridColumn,
  Item,
  Rectangle,
  DataEditorProps,
} from "@glideapps/glide-data-grid";
import { rowHeaderRenderer } from "./data-grid-row-header";
import "@glideapps/glide-data-grid/dist/index.css";

function testIfIntOrFloat(value: string) {
  return value.match(/^[0-9]+$/) || value.match(/^[0-9]+\.[0-9]+$/);
}

function testIfBoolean(value: string) {
  return value.toUpperCase() === "TRUE" || value.toUpperCase() === "FALSE";
}

function testIfImageUrl(value: string) {
  return value.match(/\.(jpeg|jpg|gif|png)$/);
}

function testIfUrl(value: string) {
  return value.match(/^(http|https):\/\/[^ "]+$/);
}

export const estimateCellType = (value: string): GridCellKind => {
  if (testIfIntOrFloat(value)) {
    return GridCellKind.Number;
  } else if (testIfBoolean(value)) {
    return GridCellKind.Boolean;
  } else if (testIfImageUrl(value)) {
    return GridCellKind.Image;
  } else if (testIfUrl(value)) {
    return GridCellKind.Uri;
  } else {
    return GridCellKind.Text;
  }
};

export type DataGridProps<Row> = {
  columns: GridColumn[];
  data: Row[];
  openable?: boolean;
  onOpen?: (data: Row) => void;
  onReachedBottom?: () => void;
  width?: number;
  height?: number;
} & Partial<DataEditorProps>;

const DataGrid = <Row extends Record<string, unknown>>(
  props: DataGridProps<Row>
) => {
  const {
    columns,
    data,
    openable = false,
    onOpen,
    onReachedBottom,
    width,
    height,
    ...dataEditorProps
  } = props;

  // states
  const [colsSizes, setColsSizes] = React.useState<Record<string, number>>({});

  // computed
  const _columns = React.useMemo(() => {
    if (openable) {
      return [{ title: "", id: "morphRowHeader", width: 50 }, ...columns];
    }
    return columns;
  }, [columns, openable]);
  const _sizeMergedColumns = React.useMemo(() => {
    return _columns.map((column) => {
      const colId = column.id as string;
      if (colsSizes[colId]) {
        return { ...column, width: colsSizes[colId] };
      }
      return column;
    });
  }, [_columns, colsSizes]);

  const getCellContent = React.useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell;
      const dataRow = data[row];

      if (openable && col === 0) {
        return {
          kind: GridCellKind.Custom,
          allowOverlay: true,
          data: {
            kind: "row-header",
            value: dataRow,
            onClick: () => onOpen?.(dataRow),
          },
          copyData: "",
        };
      }

      // dumb but simple way to do this
      const indexes: (keyof Row)[] = _columns.map(
        (column) => column.id as keyof Row
      );
      const d = dataRow[indexes[col]];
      const kind = estimateCellType(String(d));
      if (kind === GridCellKind.Text) {
        return {
          kind: GridCellKind.Text,
          allowOverlay: false,
          displayData: d ? String(d) : "",
          data: d ? String(d) : "",
        };
      }
      if (kind === GridCellKind.Uri) {
        return {
          kind: GridCellKind.Uri,
          allowOverlay: false,
          displayData: d ? String(d) : "",
          data: d ? String(d) : "",
          readonly: true,
          hoverEffect: true,
          onClickUri: () => {
            window?.open(String(d), "_blank");
          },
        };
      }
      if (kind === GridCellKind.Number) {
        return {
          kind: GridCellKind.Number,
          allowOverlay: false,
          displayData: d ? String(d) : "",
          data: d ? Number(d) : undefined,
        };
      }
      if (kind === GridCellKind.Image) {
        return {
          kind: GridCellKind.Image,
          allowOverlay: false,
          displayData: [d ? String(d) : ""],
          data: [d ? String(d) : ""],
          readonly: true,
        };
      }
      if (kind === GridCellKind.Boolean) {
        return {
          kind: GridCellKind.Boolean,
          allowOverlay: false,
          data: d ? Boolean(d) : false,
          readonly: true,
        };
      }

      // fallback
      return {
        kind: GridCellKind.Text,
        allowOverlay: false,
        displayData: String(d),
        data: String(d),
      };
    },
    [_columns, data, onOpen, openable]
  );

  // event: onReachedBottom
  const handleVisibleRegionChanged = React.useCallback(
    (region: Rectangle) => {
      const bottomItem = region.y + region.height - 1;
      if (bottomItem >= data.length - 5) {
        onReachedBottom?.();
      }
    },
    [data.length, onReachedBottom]
  );

  // event: columnResize
  const handleOnColumnResize = React.useCallback(
    (data: GridColumn, newSize: number) => {
      if (data.id) {
        const colId: string = data.id;
        setColsSizes((prev) => {
          return {
            ...prev,
            [colId]: newSize,
          };
        });
      }
    },
    []
  );

  return (
    <>
      <DataEditor
        {...dataEditorProps}
        getCellContent={getCellContent}
        columns={_sizeMergedColumns}
        rows={data.length}
        width={width || "100%"}
        height={height}
        freezeColumns={openable ? 1 : 0}
        customRenderers={[rowHeaderRenderer]}
        onVisibleRegionChanged={handleVisibleRegionChanged}
        onColumnResize={handleOnColumnResize}
        maxColumnAutoWidth={500}
        maxColumnWidth={800}
        overscrollX={200}
        overscrollY={200}
        theme={{
          accentColor: "#111827",
          accentLight: "#f3f4f6",
        }}
      />
    </>
  );
};

export { DataGrid };
