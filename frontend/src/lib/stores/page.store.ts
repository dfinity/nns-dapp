import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { writable } from "svelte/store";

export interface Page {
  universe: string;
  id: string | undefined | null;
}

const initPageStore = () => {
  const { subscribe, set } = writable<Page>({
    universe: OWN_CANISTER_ID_TEXT,
    id: undefined,
  });

  return {
    subscribe,

    load: ({ universe, id }: Partial<Page>) =>
      set({
        universe: universe ?? OWN_CANISTER_ID_TEXT,
        id: id ?? null,
      }),
  };
};

export const pageStore = initPageStore();
