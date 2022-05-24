import { writable } from "svelte/store";
import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";

export interface CanistersStore {
  canisters: CanisterDetails[];
  certified: boolean | undefined;
}

/**
 * A store that contains the canisters of the users
 *
 * - setCanisters: replace the current list of canisters with a new list (can be the effective list of canisters or empty)
 */
const initCanistersStore = () => {
  const { subscribe, set } = writable<CanistersStore>({
    canisters: [],
    certified: undefined,
  });

  return {
    subscribe,

    setCanisters({ canisters, certified }: CanistersStore) {
      set({ canisters: [...canisters], certified });
    },
  };
};

export const canistersStore = initCanistersStore();
