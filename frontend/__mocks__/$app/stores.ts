import type { Page } from "@sveltejs/kit";
import { writable } from "svelte/store";
import { OWN_CANISTER_ID_TEXT } from "../../src/lib/constants/canister-ids.constants";

const initPageStoreMock = () => {
  const { subscribe, set } = writable<Partial<Page>>({
    data: {
      universe: OWN_CANISTER_ID_TEXT,
      path: undefined,
    },
  });

  return {
    subscribe,

    mock: ({
      routeId = undefined,
      data = { universe: OWN_CANISTER_ID_TEXT },
    }: {
      routeId?: string;
      data?: { universe: string } & Record<string, string>;
    }) =>
      set({
        data,
        routeId: `(app)${routeId}`,
      }),
  };
};

export const page = initPageStoreMock();
