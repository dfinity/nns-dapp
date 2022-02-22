import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { NNSDappCanister } from "../canisters/nns-dapp/nns-dapp.canister";
import { AccountNotFoundError } from "../canisters/nns-dapp/nns-dapp.errors";
import type { SubAccountDetails } from "../canisters/nns-dapp/nns-dapp.types";
import { identityServiceURL } from "../constants/identity.constants";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import { AuthStore, authStore } from "../stores/auth.store";
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
    subAccounts: [],
  };
};

export const createSubAccount = async (name: string): Promise<void> => {
  const { identity }: AuthStore = get(authStore);
  const nnsDapp: NNSDappCanister = NNSDappCanister.create({
    agent: await createAgent({ identity, host: identityServiceURL }),
    canisterId: Principal.fromText("qhbym-qaaaa-aaaaa-aaafq-cai"),
  });

  const MAX_TRIES = 2;
  let tries: number = 0;
  let newSubAccount: SubAccountDetails | undefined;
  let error: Error | undefined;
  while (tries < MAX_TRIES && newSubAccount === undefined) {
    tries += 1;
    try {
      newSubAccount = await nnsDapp.createSubAccount({
        subAccountName: name,
      });
    } catch (currentError) {
      error = currentError;
      if (currentError.kind !== AccountNotFoundError.kind) {
        break;
      }
      await nnsDapp.addAccount();
    }
  }

  if (error) {
    throw error;
  }

  accountsStore.addSubAccount(newSubAccount);
};
