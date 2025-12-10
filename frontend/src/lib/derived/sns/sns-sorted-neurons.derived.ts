import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import {
  hasValidStake,
  isCommunityFund,
  sortSnsNeuronsByStake,
  totalDisbursingMaturity,
} from "$lib/utils/sns-neuron.utils";
import { isNullish } from "@dfinity/utils";
import type { SnsGovernanceDid } from "@icp-sdk/canisters/sns";
import { derived, type Readable } from "svelte/store";

// A neuron is considered "non-empty" if it has a non-zero stake, non-zero maturity,
// or if a maturity disbursement is currently in progress.
export const nonEmptySnsNeuronStore: Readable<SnsGovernanceDid.Neuron[]> =
  derived(
    [snsNeuronsStore, selectedUniverseIdStore],
    ([store, selectedSnsRootCanisterId]) => {
      const projectStore = store[selectedSnsRootCanisterId.toText()];
      return isNullish(projectStore)
        ? []
        : projectStore.neurons.filter(
            (neuron) =>
              // Once a neuron's stake and maturity have been disbursed, it no longer has any remaining stake.
              // However, if the maturity disbursement is still ongoing (7 days),
              // the neuron should still be considered available to the user.
              hasValidStake(neuron) || totalDisbursingMaturity(neuron) > 0n
          );
    }
  );

export const definedSnsNeuronStore: Readable<SnsGovernanceDid.Neuron[]> =
  derived(nonEmptySnsNeuronStore, (store) => store.filter(hasValidStake));
export const snsSortedNeuronStore: Readable<SnsGovernanceDid.Neuron[]> =
  derived(definedSnsNeuronStore, (store) => sortSnsNeuronsByStake(store));

export const sortedSnsUserNeuronsStore: Readable<SnsGovernanceDid.Neuron[]> =
  derived([snsSortedNeuronStore], ([sortedNeurons]) =>
    sortedNeurons.filter((neuron) => !isCommunityFund(neuron))
  );

export const sortedSnsCFNeuronsStore: Readable<SnsGovernanceDid.Neuron[]> =
  derived([snsSortedNeuronStore], ([sortedNeurons]) =>
    sortedNeurons.filter(isCommunityFund)
  );
