import type { Page } from "@sveltejs/kit";
import { writable } from "svelte/store";
import { OWN_CANISTER_ID_TEXT } from "../../src/lib/constants/canister-ids.constants";

const initPageStoreMock = () => {
  const { subscribe, set } = writable<Partial<Page>>({
    data: {
      universe: OWN_CANISTER_ID_TEXT,
    },
  });

  return {
    subscribe,

    mock: (params: Record<string, string>) =>
      set({
        data: {
          universe: params.universe ?? OWN_CANISTER_ID_TEXT,
        },
      }),
  };
};

export const page = initPageStoreMock();
