import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import { get } from "svelte/store";
import { NNSDappCanister } from "../canisters/nns-dapp/nns-dapp.canister";
import { OWN_CANISTER_ID } from "../constants/canister-ids.constants";
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
    canisterId: OWN_CANISTER_ID,
  });

  // const MAX_TRIES = 2;
  // let tries: number = 0;
  // let newSubAccount: SubAccountDetails | undefined;
  // let error: Error | undefined;
  // TODO: Remove and understand L2-301
  // while (tries < MAX_TRIES && newSubAccount === undefined) {
  //   tries += 1;
  //   error = undefined;
  //   try {
  //     newSubAccount = await nnsDapp.createSubAccount({
  //       subAccountName: name,
  //     });
  //   } catch (currentError) {
  //     error = currentError;
  //     if (!(currentError instanceof AccountNotFoundError)) {
  //       break;
  //     }
  //     await nnsDapp.addAccount();
  //   }
  // }

  // if (error) {
  //   throw error;
  // }

  // TODO: Call sync accounts in L2-301
  // accountsStore.addSubAccount(newSubAccount);
};
