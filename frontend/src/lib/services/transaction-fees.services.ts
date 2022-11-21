import { transactionFee as nnsTransactionFee } from "$lib/api/ledger.api";
import { transactionFee as snsTransactionFee } from "$lib/api/sns-ledger.api";
import { toastsError } from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { Principal } from "@dfinity/principal/lib/cjs";
import { getAuthenticatedIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

export const loadMainTransactionFee = async () => {
  try {
    const identity = await getAuthenticatedIdentity();
    const fee = await nnsTransactionFee({ identity });
    transactionsFeesStore.setMain(fee);
  } catch (error: unknown) {
    // Swallow error and continue with the DEFAULT_TRANSACTION_FEE value
    console.error("Error getting the transaction fee from the ledger");
    console.error(error);
  }
};

export const loadSnsTransactionFee = async (rootCanisterId: Principal) => {
  return queryAndUpdate<bigint, unknown>({
    request: ({ certified, identity }) =>
      snsTransactionFee({
        identity,
        rootCanisterId,
        certified,
      }),
    onLoad: async ({ response: fee, certified }) => {
      transactionsFeesStore.setFee({ certified, rootCanisterId, fee });
    },
    onError: ({ error: err, certified }) => {
      if (certified !== true) {
        return;
      }

      // Explicitly handle only UPDATE errors
      toastsError({
        labelKey: "error.transaction_fee_not_found",
        err,
      });
    },
  });
};
