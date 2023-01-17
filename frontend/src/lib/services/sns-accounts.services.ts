import { getSnsAccounts, transfer } from "$lib/api/sns-ledger.api";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { snsTransactionsStore } from "$lib/stores/sns-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import { ledgerErrorToToastError } from "$lib/utils/sns-ledger.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { decodeSnsAccount } from "@dfinity/sns";
import { getAuthenticatedIdentity } from "./auth.services";
import { loadAccountTransactions } from "./sns-transactions.services";
import { loadSnsTransactionFee } from "./transaction-fees.services";
import { queryAndUpdate } from "./utils.services";

export const loadSnsAccounts = async ({
  rootCanisterId,
  handleError,
}: {
  rootCanisterId: Principal;
  handleError?: () => void;
}): Promise<void> => {
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
      snsTransactionsStore.resetProject(rootCanisterId);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.sns_accounts_load",
        })
      );

      handleError?.();
    },
    logMessage: "Syncing Sns Accounts",
  });
};

export const syncSnsAccounts = async (params: {
  rootCanisterId: Principal;
  handleError?: () => void;
}) => {
  await Promise.all([loadSnsAccounts(params), loadSnsTransactionFee(params)]);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getSnsAccountIdentity = async (_: Account): Promise<Identity> => {
  // TODO: Support Hardware Wallets
  const identity = await getAuthenticatedIdentity();
  return identity;
};

export const snsTransferTokens = async ({
  rootCanisterId,
  source,
  destinationAddress,
  amount,
  loadTransactions,
}: {
  rootCanisterId: Principal;
  source: Account;
  destinationAddress: string;
  amount: number;
  loadTransactions: boolean;
}): Promise<{ success: boolean }> => {
  try {
    const e8s = numberToE8s(amount);
    const identity: Identity = await getSnsAccountIdentity(source);
    const to = decodeSnsAccount(destinationAddress);

    await transfer({
      identity,
      to,
      fromSubAccount: source.subAccount,
      e8s,
      rootCanisterId,
    });

    await Promise.all([
      loadSnsAccounts({ rootCanisterId }),
      loadTransactions
        ? loadAccountTransactions({ account: source, rootCanisterId })
        : Promise.resolve(),
    ]);

    return { success: true };
  } catch (err) {
    toastsError(
      ledgerErrorToToastError({
        fallbackErrorLabelKey: "error.transaction_error",
        err,
      })
    );
    return { success: false };
  }
};
