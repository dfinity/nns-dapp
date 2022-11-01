import { getTransactions } from "$lib/api/sns-index.api";
import { DEFAULT_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { snsTransactionsStore } from "$lib/stores/sns-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import type { Principal } from "@dfinity/principal";
import { decodeSnsAccount } from "@dfinity/sns";
import { getSnsAccountIdentity } from "./sns-accounts.services";

export const loadAccountNextTransactions = async ({
  account,
  rootCanisterId,
}: {
  account: Account;
  rootCanisterId: Principal;
}) => {
  try {
    const identity = await getSnsAccountIdentity(account);
    const snsAccount = decodeSnsAccount(account.identifier);
    const { transactions, oldestTxId } = await getTransactions({
      identity,
      account: snsAccount,
      maxResults: BigInt(DEFAULT_TRANSACTION_PAGE_LIMIT),
      rootCanisterId,
    });
    snsTransactionsStore.addTransactions({
      accountIdentifier: account.identifier,
      rootCanisterId,
      transactions,
      oldestTxId,
    });
  } catch (err) {
    toastsError(
      toToastError({ fallbackErrorLabelKey: "error.fetch_transactions", err })
    );
  }
};
