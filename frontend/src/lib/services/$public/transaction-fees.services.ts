import { transactionFee as nnsTransactionFee } from "$lib/api/ledger.api";
import { getAnonymousIdentity } from "$lib/services/auth.services";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";

export const loadMainTransactionFee = async () => {
  try {
    const identity = getAnonymousIdentity();
    const fee = await nnsTransactionFee({ identity });
    transactionsFeesStore.setMain(fee);
  } catch (error: unknown) {
    // Swallow error and continue with the DEFAULT_TRANSACTION_FEE value
    console.error("Error getting the transaction fee from the ledger");
    console.error(error);
  }
};
