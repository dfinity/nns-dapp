import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import type { Unsubscriber } from "svelte/store";
import { loadIcrcToken } from "./icrc-accounts.services";

export const watchIcrcTokensLoadTokenData = ({
  certified,
}: {
  certified: boolean;
}): Unsubscriber => {
  return icrcCanistersStore.subscribe((canistersData) => {
    Object.values(canistersData).forEach(({ ledgerCanisterId }) => {
      loadIcrcToken({ ledgerCanisterId, certified });
    });
  });
};
