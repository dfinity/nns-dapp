import { pageStore } from "$lib/derived/page.derived";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import { definedSnsNeuronStore } from "$lib/derived/sns/sns-sorted-neurons.derived";
import { authStore } from "$lib/stores/auth.store";
import { i18n } from "$lib/stores/i18n";

import {
  createTableNeuronsToSortStore,
  sortNeuronIds,
} from "$lib/utils/neurons-table-order-sorted-neuronids-store.utils";
import { tableNeuronsFromSnsNeurons } from "$lib/utils/neurons-table.utils";
import { nonNullish } from "@dfinity/utils";
import { derived } from "svelte/store";
import { neuronsTableOrderStore } from "./neurons-table.store";

const snsTableNeuronsToSortStore = createTableNeuronsToSortStore(
  [authStore, i18n, definedSnsNeuronStore, snsProjectSelectedStore, pageStore],
  (
    $authStore,
    $i18n,
    $definedSnsNeuronStore,
    $snsProjectSelectedStore,
    $pageStore
  ) => {
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
  [neuronsTableOrderStore, snsTableNeuronsToSortStore],
  ([$order, $neurons]) => sortNeuronIds($order, $neurons)
);
