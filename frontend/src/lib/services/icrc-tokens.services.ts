import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
import { loadIcrcToken } from "$lib/services/icrc-accounts.services";
import type { Unsubscriber } from "svelte/store";

export const watchIcrcTokensLoadTokenData = (): Unsubscriber => {
  return icrcCanistersStore.subscribe((canistersData) => {
    Object.values(canistersData).forEach(({ ledgerCanisterId }) => {
      // `loadIcrcToken` does nothing if the token is already loaded.
      loadIcrcToken({ ledgerCanisterId, certified: false });
    });
  });
};
