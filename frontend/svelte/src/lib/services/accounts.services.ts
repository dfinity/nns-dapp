import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import { createAgent } from "../utils/agent.utils";

/**
 * - sync: load or reset the account data
 * a. If no `principal` is provided to sync the account, for example on app init or after a sign-out, the data is set to undefined
 * b. If a `principal` is provided, e.g. after sign-in, then the information are loaded using the ledger and the nns dapp canister itself
 */
export const syncAccounts = async ({
  principal,
}: {
  principal: Principal;
}): Promise<void> => {
  if (!principal) {
    accountsStore.set(undefined);
    return;
  }

  const accounts: AccountsStore = await loadAccounts({ principal });
  accountsStore.set(accounts);
};

const loadAccounts = async ({
  principal,
}: {
  principal: Principal;
}): Promise<AccountsStore> => {
  const ledger: LedgerCanister = LedgerCanister.create({
    agent: createAgent(),
  });

  const accountIdentifier: AccountIdentifier = AccountIdentifier.fromPrincipal({
    principal,
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
