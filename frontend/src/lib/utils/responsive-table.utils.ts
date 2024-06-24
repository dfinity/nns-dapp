import type { Comparator } from "$lib/types/responsive-table";

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

// Same as createDescendingComparator but returns a comparator for sorting in
// ascending order.
export const createAscendingComparator = <RowDataType, Comparable>(
  getter: (rowData: RowDataType) => Comparable
): Comparator<RowDataType> => {
  const descendingComparator = createDescendingComparator(getter);
  // `|| 0` is to avoid the value `-0`.
  return (a, b) => -descendingComparator(a, b) || 0;
};

// Sorts rows based on a provided custom ordering.
export const sortTableData = <RowDataType>({
  tableData,
  order,
}: {
  tableData: RowDataType[];
  order: Comparator<RowDataType>[];
}): RowDataType[] => {
  return [...tableData].sort(mergeComparators(order));
};
