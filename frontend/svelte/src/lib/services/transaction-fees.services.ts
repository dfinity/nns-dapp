import { transactionFee } from "../api/ledger.api";
import { transactionsFeesStore } from "../stores/transaction-fees.store";
import { getIdentity } from "./auth.services";

export const loadMainTransactionFee = async () => {
  try {
    const identity = await getIdentity();
    const fee = await transactionFee({ identity });
    transactionsFeesStore.setMain(fee);
  } catch (error) {
    // Swallow error and continue with the DEFAULT_TRANSACTION_FEE value
    console.error("Error getting the transaction fee from the ledger");
    console.error(error);
  }
};
