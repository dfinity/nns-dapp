import type { NetworkEconomics } from "@dfinity/nns";
import { writable, type Readable } from "svelte/store";

export interface NetworkEconomicsStoreData {
  parameters: NetworkEconomics | undefined;
  certified: boolean | undefined;
}

export interface NetworkEconomicsStore
  extends Readable<NetworkEconomicsStoreData> {
  setParameters: (data: NetworkEconomicsStoreData) => void;
}

/**
 * A store that contains the [network economics parameters](https://github.com/dfinity/ic/blob/d90e934eb440c730d44d9d9b1ece2cc3f9505d05/rs/nns/governance/proto/ic_nns_governance/pb/v1/governance.proto#L1847).
 */
const initNetworkEconomicsParametersStore = () => {
  const { subscribe, set } = writable<NetworkEconomicsStoreData>({
    parameters: undefined,
    certified: undefined,
  });

  return {
    subscribe,

    setParameters(parameters: NetworkEconomicsStoreData) {
      set(parameters);
    },
  };
};

export const networkEconomicsStore = initNetworkEconomicsParametersStore();
