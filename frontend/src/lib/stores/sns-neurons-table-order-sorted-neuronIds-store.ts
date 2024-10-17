import { pageStore } from "$lib/derived/page.derived";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import { definedSnsNeuronStore } from "$lib/derived/sns/sns-sorted-neurons.derived";
import { authStore } from "$lib/stores/auth.store";
import { i18n } from "$lib/stores/i18n";
import {
  comparators,
  tableNeuronsFromSnsNeurons,
} from "$lib/utils/neurons-table.utils";
import { mergeComparators, negate } from "$lib/utils/responsive-table.utils";
import { nonNullish } from "@dfinity/utils";
import { derived } from "svelte/store";
import { neuronsTableOrderStore } from "./neurons-table.store";

export const snsNeuronsStore = derived(
  [authStore, i18n, definedSnsNeuronStore, snsProjectSelectedStore, pageStore],
  ([
    $authStore,
    $i18n,
    $definedSnsNeuronStore,
    $snsProjectSelectedStore,
    $pageStore,
  ]) => {
    const summary = $snsProjectSelectedStore?.summary;
    return nonNullish(summary)
      ? tableNeuronsFromSnsNeurons({
          universe: $pageStore.universe,
          token: summary.token,
          identity: $authStore.identity,
          i18n: $i18n,
          snsNeurons: $definedSnsNeuronStore,
        })
      : [];
  }
);

export const snsNeuronsTableOrderSortedNeuronIdsStore = derived(
  [neuronsTableOrderStore, snsNeuronsStore],
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
