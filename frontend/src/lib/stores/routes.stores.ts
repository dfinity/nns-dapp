import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { writable } from "svelte/store";

export interface RoutesStore {
  universe: string;
  id: string | undefined | null;
}

const initRoutesStore = () => {
  const { subscribe, set } = writable<RoutesStore>({
    universe: undefined,
    id: undefined,
  });

  return {
    subscribe,

    load: ({ universe, id }: RoutesStore) =>
      set({
        universe: universe ?? OWN_CANISTER_ID_TEXT,
        id: id ?? null,
      }),
  };
};

export const routesStore = initRoutesStore();
