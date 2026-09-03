import type { QueryAndUpdateStrategy } from "$lib/services/utils.services";
import type { SnsGovernanceDid } from "@icp-sdk/canisters/sns";
import type { Principal } from "@icp-sdk/core/principal";
import type { Readable } from "svelte/store";

/**
 * A store that contains the selected sns neuron.
 *
 * `null` is the initial value.
 * `undefined` means not found
 */
export interface SelectedSnsNeuronStore {
  selected:
    | {
        rootCanisterId: Principal;
        neuronIdHex: string;
      }
    | undefined;
  neuron: SnsGovernanceDid.Neuron | undefined | null;
}

export interface SelectedSnsNeuronContext {
  store: Readable<SelectedSnsNeuronStore>;
  /**
   * Loads the neuron again and writes it to the store.
   *
   * `strategy` selects the calls to make. The default settles on the query
   * response, which is not certified. `"update"` settles on the certified
   * response. A caller that makes a security decision from the neuron must
   * pass `"update"`.
   */
  reload: (params?: { strategy?: QueryAndUpdateStrategy }) => Promise<void>;
}

export const SELECTED_SNS_NEURON_CONTEXT_KEY = Symbol("selected-sns-neuron");
