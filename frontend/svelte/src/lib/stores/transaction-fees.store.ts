import { derived, writable } from "svelte/store";
import { DEFAULT_TRANSACTION_FEE_E8S } from "../constants/icp.constants";

export type TransactionFeesStore = {
  // Main Ledger of IC
  main: bigint;
};

const defaultTransactionFees = {
  main: BigInt(DEFAULT_TRANSACTION_FEE_E8S),
};

/**
 * A store that contains the transaction fees of ledgers.
 *
 * - setMain: replace the current fee in `main`.
 */
const initTransactionFeesStore = () => {
  const { subscribe, update, set } = writable<TransactionFeesStore>(
    defaultTransactionFees
  );

  return {
    subscribe,

    setMain(fee: bigint) {
      update((data) => ({
        ...data,
        main: fee,
      }));
    },

    // Used in the tests
    reset() {
      set(defaultTransactionFees);
    },
  };
};

export const transactionsFeesStore = initTransactionFeesStore();

export const mainTransactionFeeStore = derived(
  transactionsFeesStore,
  ($store) => Number($store.main)
);
