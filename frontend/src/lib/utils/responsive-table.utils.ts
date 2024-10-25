import type {
  Comparator,
  ResponsiveTableColumn,
  ResponsiveTableOrder,
  ResponsiveTableRowData,
} from "$lib/types/responsive-table";

export const getCellGridAreaName = (index: number) => `cell-${index}`;

// Takes a list of comparators and returns a single comparator by first applying
// the first comparator and using subsequent comparators to break ties.
export const mergeComparators = <RowDataType>(
  comparators: Comparator<RowDataType>[]
): Comparator<RowDataType> => {
  return (a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
};

// Creates a comparator for sorting in descending order based on the value
// returned by the getter function.
export const createDescendingComparator = <RowDataType, Comparable>(
  getter: (rowData: RowDataType) => Comparable
): Comparator<RowDataType> => {
  return (a, b) => {
    const valueA = getter(a);
    const valueB = getter(b);
    if (valueA < valueB) return 1;
    if (valueA > valueB) return -1;
    return 0;
  };
};

export const negate = <T>(comparator: Comparator<T>): Comparator<T> => {
  // `|| 0` is to avoid the value `-0`.
  return (a, b) => -comparator(a, b) || 0;
};

// Same as createDescendingComparator but returns a comparator for sorting in
// ascending order.
export const createAscendingComparator = <RowDataType, Comparable>(
  getter: (rowData: RowDataType) => Comparable
): Comparator<RowDataType> => negate(createDescendingComparator(getter));

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
