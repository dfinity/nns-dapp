import { writable } from "svelte/store";
import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";

/**
 * A store that contains the canisters of the users
 *
 * - setCanisters: replace the current list of canisters with a new list (can be the effective list of canisters or empty)
 */
const initCanistersStore = () => {
  const { subscribe, set } = writable<CanisterDetails[]>([]);

  return {
    subscribe,

    setCanisters(canisters: CanisterDetails[]) {
      set([...canisters]);
    },
  };
};

export const canistersStore = initCanistersStore();
