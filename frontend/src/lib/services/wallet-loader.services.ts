import { getAccount } from "$lib/api/wallet-ledger.api";
import type { Account, AccountType } from "$lib/types/account";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

/**
 * TODO: This function is called `getAccounts` because it was originally refactored from a `getCkBtcAccounts` function. It can be renamed to something more suitable given that this services is a loader that load that from the API to the store.
 */
export const getAccounts = async ({
  identity,
  certified,
  universeId,
}: {
  identity: Identity;
  certified: boolean;
  universeId: Principal;
}): Promise<Account[]> => {
  // TODO: Support subaccounts
  const mainAccount: { owner: Principal; type: AccountType } = {
    owner: identity.getPrincipal(),
    type: "main",
  };

  const account = await getAccount({
    identity,
    certified,
    canisterId: universeId,
    ...mainAccount,
  });

  return [account];
};
