import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { ROUTE_ID_GROUP_APP } from "$lib/constants/routes.constants";
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
        // We mock only ROUTE_ID_GROUP_APP and no other sub-group-ids because we do not need these for our test suite and it simplifies the usage of the mock calls
        route: { id: `${ROUTE_ID_GROUP_APP}${routeId}` },
      }),
  };
};

export const page = initPageStoreMock();
