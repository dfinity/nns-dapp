import type { Identity } from "@dfinity/agent";
import { createSubAccount, loadAccounts } from "../api/accounts.api";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";

/**
 * - sync: load the account data using the ledger and the nns dapp canister itself
 */
export const syncAccounts = async ({
  identity,
}: {
  identity: Identity | undefined | null;
}): Promise<void> => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error("No identity");
  }

  const accounts: AccountsStore = await loadAccounts({ identity });
  accountsStore.set(accounts);
};

export const addSubAccount = async ({
  name,
  identity,
}: {
  name: string;
  identity: Identity | null | undefined;
}): Promise<void> => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error("No identity found to create subaccount");
  }

  await createSubAccount({ name, identity });

  await syncAccounts({ identity });
};
