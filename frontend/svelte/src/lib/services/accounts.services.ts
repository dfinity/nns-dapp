import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import { identityServiceURL } from "../constants/identity.constants";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import { createAgent } from "../utils/agent.utils";

/**
 * - sync: load or reset the account data
 * a. If no `principal` is provided to sync the account, for example on app init or after a sign-out, the data is set to undefined
 * b. If a `principal` is provided, e.g. after sign-in, then the information are loaded using the ledger and the nns dapp canister itself
 */
export const syncAccounts = async ({
  identity,
}: {
  identity: Identity | undefined | null;
}): Promise<void> => {
  if (!identity) {
    accountsStore.set(undefined);
    return;
  }

  const accounts: AccountsStore = await loadAccounts({ identity });
  accountsStore.set(accounts);
};

const loadAccounts = async ({
  identity,
}: {
  identity: Identity;
}): Promise<AccountsStore> => {
  const ledger: LedgerCanister = LedgerCanister.create({
    agent: await createAgent({ identity, host: identityServiceURL }),
  });

  const accountIdentifier: AccountIdentifier = AccountIdentifier.fromPrincipal({
    principal: identity.getPrincipal(),
  });

  const balance: ICP = await ledger.accountBalance({
    accountIdentifier,
    certified: false,
  });

  return {
    main: {
      identifier: accountIdentifier.toHex(),
      balance,
    },
  };
};
