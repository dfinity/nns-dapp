import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { snsLedgerCanisterIdsStore } from "$lib/derived/sns/sns-canisters.derived";
import { loadAccounts } from "$lib/services/icrc-accounts.services";
import type { QueryAndUpdateStrategy } from "$lib/services/utils.services";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

export const loadSnsAccounts = async ({
  rootCanisterId,
  handleError,
  strategy = FORCE_CALL_STRATEGY,
}: {
  rootCanisterId: Principal;
  handleError?: () => void;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  const ledgerCanisterId = get(snsLedgerCanisterIdsStore)[
    rootCanisterId.toText()
  ];
  return loadAccounts({
    ledgerCanisterId,
    handleError,
    strategy,
  });
};
