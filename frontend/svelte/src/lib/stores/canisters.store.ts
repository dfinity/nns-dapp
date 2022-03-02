import { writable } from "svelte/store";
import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";

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
