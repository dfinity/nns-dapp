import type { Principal } from "@dfinity/principal/lib/cjs";
import { transactionFee as nnsTransactionFee } from "../api/ledger.api";
import { transactionFee as snsTransactionFee } from "../api/sns-ledger.api";
import { transactionsFeesStore } from "../stores/transaction-fees.store";
import { getIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

export const loadMainTransactionFee = async () => {
  try {
    const identity = await getIdentity();
    const fee = await nnsTransactionFee({ identity });
    transactionsFeesStore.setMain(fee);
  } catch (error) {
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
    onError: ({ error, certified }) => {
      if (certified !== true) {
        return;
      }

      // Explicitly handle only UPDATE errors
      // TODO: Manage errors gracefully https://dfinity.atlassian.net/browse/GIX-1026
      console.error(
        `Error loading sns transaction fee for ${rootCanisterId.toText()}`
      );
      console.error(error);
    },
  });
};
