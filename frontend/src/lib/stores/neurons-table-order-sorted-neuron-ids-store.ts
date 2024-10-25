import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { authStore } from "$lib/stores/auth.store";
import { i18n } from "$lib/stores/i18n";
import { neuronsTableOrderStore } from "$lib/stores/neurons-table.store";
import { definedNeuronsStore } from "$lib/stores/neurons.store";
import { getSortedNeuronIds } from "$lib/utils/neurons-table-order-sorted-neuron-ids-store.utils";
import {
  compareById,
  tableNeuronsFromNeuronInfos,
} from "$lib/utils/neurons-table.utils";
import { derived } from "svelte/store";

const tableNeuronsToSortStore = derived(
  [authStore, icpAccountsStore, i18n, definedNeuronsStore],
  ([$authStore, $icpAccountsStore, $i18n, $definedNeuronsStore]) => {
    const tableNeurons = tableNeuronsFromNeuronInfos({
      identity: $authStore.identity,
      accounts: $icpAccountsStore,
      i18n: $i18n,
      neuronInfos: $definedNeuronsStore,
    });
    return tableNeurons.sort(compareById);
  }
);

export const neuronsTableOrderSortedNeuronIdsStore = derived(
  [neuronsTableOrderStore, tableNeuronsToSortStore],
  ([$order, $neurons]) => getSortedNeuronIds($order, $neurons)
);
