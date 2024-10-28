import type { NeuronsTableOrder, TableNeuron } from "$lib/types/neurons-table";
import { comparatorsByColumnId } from "$lib/utils/neurons-table.utils";
import { mergeComparators, negate } from "$lib/utils/responsive-table.utils";

export const getSortedNeuronIds = (
  order: NeuronsTableOrder,
  neurons: TableNeuron[]
): string[] => {
  const comparatorsArray = order.map(({ columnId, reversed }) => {
    const comparator = comparatorsByColumnId[columnId];

    if (!comparator) {
      throw new Error(`No comparator found for column: ${columnId}`);
    }

    return reversed ? negate(comparator) : comparator;
  });

  return [...neurons]
    .sort(mergeComparators(comparatorsArray))
    .map((n) => n.neuronId);
};
