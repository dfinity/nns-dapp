import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
import type { Unsubscriber } from "svelte/store";
import { loadIcrcToken } from "./icrc-accounts.services";

export const watchIcrcTokensLoadTokenData = (): Unsubscriber => {
  return icrcCanistersStore.subscribe((canistersData) => {
    Object.values(canistersData).forEach(({ ledgerCanisterId }) => {
      // `loadIcrcToken` does nothing if the token is already loaded.
      loadIcrcToken({ ledgerCanisterId, certified: false });
    });
  });
};
