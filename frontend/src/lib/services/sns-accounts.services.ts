import { getTransactions } from "$lib/api/sns-index.api";
import { getSnsAccounts, transfer } from "$lib/api/sns-ledger.api";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { decodeSnsAccount } from "@dfinity/sns";
import { getIdentity } from "./auth.services";
import { loadSnsTransactionFee } from "./transaction-fees.services";
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
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      snsAccountsStore.resetProject(rootCanisterId);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.sns_accounts_load",
        })
      );
    },
    logMessage: "Syncing Sns Accounts",
  });
};

export const syncSnsAccounts = async (rootCanisterId: Principal) => {
  await Promise.all([
    loadSnsAccounts(rootCanisterId),
    loadSnsTransactionFee(rootCanisterId),
  ]);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAccountIdentity = async (_: Account): Promise<Identity> => {
  // TODO: Support Hardware Wallets
  const identity = await getIdentity();
  return identity;
};

export const snsTransferTokens = async ({
  rootCanisterId,
  source,
  destinationAddress,
  e8s,
}: {
  rootCanisterId: Principal;
  source: Account;
  destinationAddress: string;
  e8s: bigint;
}): Promise<{ success: boolean }> => {
  try {
    const identity: Identity = await getAccountIdentity(source);
    const to = decodeSnsAccount(destinationAddress);

    await transfer({
      identity,
      to,
      fromSubAccount: source.subAccount,
      e8s,
      rootCanisterId,
    });

    await loadSnsAccounts(rootCanisterId);

    return { success: true };
  } catch (err) {
    toastsError(
      toToastError({ fallbackErrorLabelKey: "error.transaction_error", err })
    );
    return { success: false };
  }
};

// TODO: Pass rootcanister id and use wrapper https://dfinity.atlassian.net/browse/GIX-1093
export const loadAccountTransactions = async ({
  account,
  rootCanisterId,
}: {
  account: Account;
  rootCanisterId: Principal;
}) => {
  // Only load transactions for one SNS project which we know the index canister id
  if (rootCanisterId.toText() !== "su63m-yyaaa-aaaaa-aaala-cai") {
    return;
  }
  const identity = await getAccountIdentity(account);
  const snsAccount = decodeSnsAccount(account.identifier);
  const transactions = await getTransactions({
    identity,
    account: {
      ...snsAccount,
      subaccount: [],
    },
    maxResults: BigInt(50),
  });
  console.log(transactions);
};
