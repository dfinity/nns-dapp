import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
import { pageStore } from "$lib/derived/page.derived";
import { snsTopicsStore } from "$lib/derived/sns-topics.derived";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import { definedSnsNeuronStore } from "$lib/derived/sns/sns-sorted-neurons.derived";
import { authStore } from "$lib/stores/auth.store";
import { i18n } from "$lib/stores/i18n";
import { neuronsTableOrderStore } from "$lib/stores/neurons-table.store";
import { stakingRewardsStore } from "$lib/stores/staking-rewards.store";
import { getSortedNeuronIds } from "$lib/utils/neurons-table-order-sorted-neuron-ids-store.utils";
import {
  compareById,
  tableNeuronsFromSnsNeurons,
} from "$lib/utils/neurons-table.utils";
import { getSnsTopicsByProject } from "$lib/utils/sns-topics.utils";
import { nonNullish } from "@dfinity/utils";
import { Principal } from "@icp-sdk/core/principal";
import { derived } from "svelte/store";

const snsTableNeuronsToSortStore = derived(
  [
    authStore,
    i18n,
    definedSnsNeuronStore,
    snsProjectSelectedStore,
    pageStore,
    icpSwapUsdPricesStore,
    snsTopicsStore,
    stakingRewardsStore,
  ],
  ([
    $authStore,
    $i18n,
    $definedSnsNeuronStore,
    $snsProjectSelectedStore,
    $pageStore,
    $icpSwapUsdPricesStore,
    $snsTopicsStore,
    $stakingRewardsStore,
  ]) => {
    const summary = $snsProjectSelectedStore?.summary;
    const topicInfos =
      getSnsTopicsByProject({
        rootCanisterId: Principal.fromText($pageStore.universe),
        snsTopicsStore: $snsTopicsStore,
      }) ?? [];
    const tableNeurons = nonNullish(summary)
      ? tableNeuronsFromSnsNeurons({
          universe: $pageStore.universe,
          token: summary.token,
          identity: $authStore.identity,
          i18n: $i18n,
          snsNeurons: $definedSnsNeuronStore,
          icpSwapUsdPrices: $icpSwapUsdPricesStore,
          ledgerCanisterId: summary.ledgerCanisterId,
          topicInfos,
          stakingRewardsResult: $stakingRewardsStore,
        })
      : [];
    return tableNeurons.sort(compareById);
  }
);

export const snsNeuronsTableOrderSortedNeuronIdsStore = derived(
  [neuronsTableOrderStore, snsTableNeuronsToSortStore],
  ([$order, $neurons]) => getSortedNeuronIds($order, $neurons)
);
