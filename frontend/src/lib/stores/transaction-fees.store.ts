import { ICP } from "@dfinity/nns";
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
  const { subscribe, update } = writable<TransactionFeesStore>(
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
  };
};

export const transactionsFeesStore = initTransactionFeesStore();

export const mainTransactionFeeStore = derived(
  transactionsFeesStore,
  ($store) => Number($store.main)
);

export const mainTransactionFeeStoreAsIcp = derived(
  transactionsFeesStore,
  ($store) => ICP.fromE8s($store.main)
);
