import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { snsLedgerCanisterIdsStore } from "$lib/derived/sns/sns-canisters.derived";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { loadAccounts } from "./icrc-accounts.services";
import type { QueryAndUpdateStrategy } from "./utils.services";

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
