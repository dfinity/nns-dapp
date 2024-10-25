import type { NeuronsTableOrder, TableNeuron } from "$lib/types/neurons-table";
import { comparatorsByColumnId } from "$lib/utils/neurons-table.utils";
import { mergeComparators, negate } from "$lib/utils/responsive-table.utils";
import { nonNullish } from "@dfinity/utils";

export const getSortedNeuronIds = (
  order: NeuronsTableOrder,
  neurons: TableNeuron[]
): string[] => {
  const comparatorsArray = order
    .map(({ columnId, reversed }) => {
      const comparator = comparatorsByColumnId[columnId];
      return comparator
        ? reversed
          ? negate(comparator)
          : comparator
        : undefined;
    })
    .filter(nonNullish);

  return [...neurons]
    .sort(mergeComparators(comparatorsArray))
    .map((n) => n.neuronId);
};
