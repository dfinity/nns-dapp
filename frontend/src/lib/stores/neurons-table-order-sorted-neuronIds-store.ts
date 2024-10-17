import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { authStore } from "$lib/stores/auth.store";
import { i18n } from "$lib/stores/i18n";

import { neuronsTableOrderStore } from "$lib/stores/neurons-table.store";
import { definedNeuronsStore } from "$lib/stores/neurons.store";
import {
  comparators,
  tableNeuronsFromNeuronInfos,
} from "$lib/utils/neurons-table.utils";
import { mergeComparators, negate } from "$lib/utils/responsive-table.utils";

import { derived } from "svelte/store";

export const neuronsStore = derived(
  [authStore, icpAccountsStore, i18n, definedNeuronsStore],
  ([$authStore, $icpAccountsStore, $i18n, $definedNeuronsStore]) =>
    tableNeuronsFromNeuronInfos({
      identity: $authStore.identity,
      accounts: $icpAccountsStore,
      i18n: $i18n,
      neuronInfos: $definedNeuronsStore,
    })
);

export const neuronsTableOrderSortedNeuronIdsStore = derived(
  [neuronsTableOrderStore, neuronsStore],
  ([$order, $neurons]) => {
    const comparatorByColumnId = comparators;
    const comparatorsArray = $order
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
      return $neurons.map((n) => n.neuronId);
    }

    return [...$neurons]
      .sort(mergeComparators(comparatorsArray))
      .map((n) => n.neuronId);
  }
);
