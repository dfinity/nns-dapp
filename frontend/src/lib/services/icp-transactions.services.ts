import { getTransactions } from "$lib/api/icp-index.api";
import { INDEX_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { toastsError } from "$lib/stores/toasts.store";
import { toToastError } from "$lib/utils/error.utils";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { getCurrentIdentity } from "./auth.services";

// TODO: Load transactions in store instead of returning them.
export const loadIcpTransactions = async ({
  accountIdentifier,
}: {
  accountIdentifier: string;
}): Promise<TransactionWithId[]> => {
  try {
    const identity = await getCurrentIdentity();
    const { transactions } = await getTransactions({
      identity,
      indexCanisterId: INDEX_CANISTER_ID,
      maxResults: BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
      accountIdentifier,
    });
    return transactions;
  } catch (err) {
    toastsError(
      toToastError({ fallbackErrorLabelKey: "error.fetch_transactions", err })
    );
    return [];
  }
};

// TOOD: Add a function to load next transactions.
