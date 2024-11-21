export type Comparator<DataType> = (a: DataType, b: DataType) => number;

// Takes a list of comparators and returns a single comparator by first applying
// the first comparator and using subsequent comparators to break ties.
export const mergeComparators = <DataType>(
  comparators: Comparator<DataType>[]
): Comparator<DataType> => {
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

export const negate = <DataType>(
  comparator: Comparator<DataType>
): Comparator<DataType> => {
  // `|| 0` is to avoid the value `-0`.
  return (a, b) => -comparator(a, b) || 0;
};

// Creates a comparator for sorting in descending order based on the value
// returned by the getter function.
export const createDescendingComparator = <DataType, Comparable>(
  getter: (rowData: DataType) => Comparable
): Comparator<DataType> => {
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
export const createAscendingComparator = <DataType, Comparable>(
  getter: (rowData: DataType) => Comparable
): Comparator<DataType> => negate(createDescendingComparator(getter));
