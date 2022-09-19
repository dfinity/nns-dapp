import type { Principal } from "@dfinity/principal";
import { getSnsAccounts } from "../api/sns-ledger.api";
import { snsAccountsStore } from "../stores/sns-accounts.store";
import type { Account } from "../types/account";
import { queryAndUpdate } from "./utils.services";

export const loadSnsAccounts = async (
  rootCanisterId: Principal
): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    request: ({ certified, identity }) =>
      getSnsAccounts({ rootCanisterId, identity, certified }),
    onLoad: ({ response: accounts, certified }) =>
      snsAccountsStore.setAccounts({
        accounts,
        rootCanisterId,
        certified,
      }),
    onError: (error) => {
      // TODO: Manage errors https://dfinity.atlassian.net/browse/GIX-1026
      console.error("in da error", error);
    },
  });
};
