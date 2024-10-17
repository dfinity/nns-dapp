import type { TableNeuron } from "$lib/types/neurons-table";
import type { ResponsiveTableOrder } from "$lib/types/responsive-table";
import { comparators } from "$lib/utils/neurons-table.utils";
import { mergeComparators, negate } from "$lib/utils/responsive-table.utils";
import { derived, type Stores, type StoresValues } from "svelte/store";

export const sortNeuronIds = (
  order: ResponsiveTableOrder,
  neurons: TableNeuron[]
): string[] => {
  const comparatorByColumnId = comparators;
  const comparatorsArray = order
    .map(({ columnId, reversed }) => {
      const comparator = comparatorByColumnId[columnId];
      return comparator
        ? reversed
          ? negate(comparator)
          : comparator
        : undefined;
    })
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  if (comparatorsArray.length === 0) {
    return neurons.map((n) => n.neuronId);
  }

  return [...neurons]
    .sort(mergeComparators(comparatorsArray))
    .map((n) => n.neuronId);
};

export const createNeuronsStore = <T extends Stores>(
  deps: T,
  createNeurons: (...values: StoresValues<T>) => TableNeuron[]
) => {
  return derived(deps, ($deps) => createNeurons(...$deps));
};
