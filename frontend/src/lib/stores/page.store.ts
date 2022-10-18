import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { writable } from "svelte/store";

export interface Page {
  universe: string;
}

const initPageStore = () => {
  const { subscribe, set } = writable<Page>({
    universe: OWN_CANISTER_ID_TEXT,
  });

  return {
    subscribe,

    load: ({ universe }: Partial<Page>) =>
      set({
        universe: universe ?? OWN_CANISTER_ID_TEXT,
      }),
  };
};

export const pageStore = initPageStore();
