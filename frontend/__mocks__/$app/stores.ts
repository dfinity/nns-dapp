import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { Page } from "@sveltejs/kit";
import { writable } from "svelte/store";

const initPageStoreMock = () => {
  const { subscribe, set } = writable<Partial<Page>>({
    data: {
      universe: OWN_CANISTER_ID_TEXT,
      path: undefined,
    },
    route: {
      id: undefined,
    },
  });

  return {
    subscribe,

    mock: ({
      // routeId is the path
      routeId = undefined,
      data = { universe: OWN_CANISTER_ID_TEXT },
    }: {
      routeId?: string;
      data?: { universe: string | null } & Record<string, string>;
    }) =>
      set({
        data,
        route: { id: `/(app)${routeId}` },
      }),
  };
};

export const page = initPageStoreMock();
