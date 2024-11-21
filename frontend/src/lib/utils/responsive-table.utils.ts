import type {
  ResponsiveTableColumn,
  ResponsiveTableOrder,
  ResponsiveTableRowData,
} from "$lib/types/responsive-table";
import { mergeComparators, negate } from "$lib/utils/sort.utils";

export const getCellGridAreaName = (index: number) => `cell-${index}`;

// Creates the new table order resulting from clicking on a column header.  This
// means reversing the order if the selected column is already the primary
// order, or making the selected column the primary order if it is not.
export const selectPrimaryOrder = ({
  order,
  selectedColumnId,
}: {
  order: ResponsiveTableOrder;
  selectedColumnId: string;
}): ResponsiveTableOrder => {
  if (order[0].columnId === selectedColumnId) {
    return [
      {
        columnId: order[0].columnId,
        ...(order[0].reversed ? {} : { reversed: true }),
      },
      ...order.slice(1),
    ];
  }
  return [
    { columnId: selectedColumnId },
    ...order.filter((order) => order.columnId !== selectedColumnId),
  ];
};

// Sorts rows based on a provided custom ordering.
export const sortTableData = <RowDataType extends ResponsiveTableRowData>({
  tableData,
  order,
  columns,
}: {
  tableData: RowDataType[];
  order: ResponsiveTableOrder;
  columns: ResponsiveTableColumn<RowDataType>[];
}): RowDataType[] => {
  const comparatorByColumnId = Object.fromEntries(
    columns.filter((c) => c.id && c.comparator).map((c) => [c.id, c.comparator])
  );
  const comparators = order.map(({ columnId, reversed }) => {
    const comparator = comparatorByColumnId[columnId];
    return reversed ? negate(comparator) : comparator;
  });
  return [...tableData].sort(mergeComparators(comparators));
};
