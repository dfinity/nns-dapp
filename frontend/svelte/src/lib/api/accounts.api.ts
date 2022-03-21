import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import { NNSDappCanister } from "../canisters/nns-dapp/nns-dapp.canister";
import type {
  AccountDetails,
  SubAccountDetails,
} from "../canisters/nns-dapp/nns-dapp.types";
import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID,
} from "../constants/canister-ids.constants";
import { identityServiceURL } from "../constants/identity.constants";
import type { AccountsStore } from "../stores/accounts.store";
import type { Account } from "../types/account";
import { createAgent } from "../utils/agent.utils";

// export const transferIcpstest = async () => {
//   const auth = get(authStore);
//   if (auth.identity) {
//     const agent = await createAgent({
//       identity: auth.identity,
//       host: identityServiceURL,
//     });
//     const ledger: LedgerCanister = LedgerCanister.create({
//       agent,
//       canisterId: LEDGER_CANISTER_ID,
//     });
//     const accounts = get(accountsStore);
//     if (accounts.subAccounts && accounts.subAccounts.length > 0) {
//       const firstSubaccount = accounts.subAccounts[0];
//       console.log("subaccount", firstSubaccount);
//       try {
//         await ledger.transfer({
//           to: AccountIdentifier.fromHex(firstSubaccount.identifier),
//           amount: ICP.fromString("5") as ICP,
//         });
//         console.log("after da transfer");
//       } catch (error) {
//         console.error(error);
//       }
//     }
//   }
// };

export const loadAccounts = async ({
  identity,
}: {
  identity: Identity;
}): Promise<AccountsStore> => {
  const agent = await createAgent({ identity, host: identityServiceURL });
  // ACCOUNTS
  const nnsDapp: NNSDappCanister = NNSDappCanister.create({
    agent,
    canisterId: OWN_CANISTER_ID,
  });
  // Ensure account exists in NNSDapp Canister
  // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L271
  // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L232
  await nnsDapp.addAccount();

  const mainAccount: AccountDetails = await nnsDapp.getAccount();

  // ACCOUNT BALANCES
  const ledger: LedgerCanister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  const getAccountBalance = async (
    account: AccountDetails | SubAccountDetails
  ): Promise<Account> => {
    const balance: ICP = await ledger.accountBalance({
      accountIdentifier: AccountIdentifier.fromHex(account.account_identifier),
      certified: true,
    });
    return {
      identifier: account.account_identifier,
      balance,
      subAccount: "sub_account" in account ? account.sub_account : undefined,
      // Account does not have "name" property. Typescript needed a check like this.
      name: "name" in account ? account.name : undefined,
    };
  };

  const [main, ...subAccounts] = await Promise.all([
    getAccountBalance(mainAccount),
    ...mainAccount.sub_accounts.map(getAccountBalance),
  ]);

  return {
    main,
    subAccounts,
  };
};

export const createSubAccount = async ({
  name,
  identity,
}: {
  name: string;
  identity: Identity;
}): Promise<void> => {
  const nnsDapp: NNSDappCanister = NNSDappCanister.create({
    agent: await createAgent({ identity, host: identityServiceURL }),
    canisterId: OWN_CANISTER_ID,
  });

  await nnsDapp.createSubAccount({
    subAccountName: name,
  });
};
