import type { TableNeuron } from "$lib/types/neurons-table";
import type { ResponsiveTableOrder } from "$lib/types/responsive-table";
import { comparatorsByColumnId } from "$lib/utils/neurons-table.utils";
import { mergeComparators, negate } from "$lib/utils/responsive-table.utils";

export const getSortedNeuronIds = (
  order: ResponsiveTableOrder,
  neurons: TableNeuron[]
): string[] => {
  const comparatorsArray = order.map(({ columnId, reversed }) => {
    const comparator = comparatorsByColumnId[columnId];
    return reversed ? negate(comparator) : comparator;
  });

  return [...neurons]
    .sort(mergeComparators(comparatorsArray))
    .map((n) => n.neuronId);
};
