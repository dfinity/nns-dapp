import type { TableNeuron } from "$lib/types/neurons-table";
import type { ResponsiveTableOrder } from "$lib/types/responsive-table";
import { comparators, compareById } from "$lib/utils/neurons-table.utils";
import { mergeComparators, negate } from "$lib/utils/responsive-table.utils";
import { nonNullish } from "@dfinity/utils";
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
    .filter((c) => nonNullish(c));

  return [...neurons]
    .sort(mergeComparators(comparatorsArray))
    .map((n) => n.neuronId);
};

export const createTableNeuronsToSortStore = <T extends Stores>(
  deps: T,
  createTableNeurons: (...values: StoresValues<T>) => TableNeuron[]
) => {
  return derived(deps, ($deps) =>
    createTableNeurons(...$deps).sort(compareById)
  );
};
