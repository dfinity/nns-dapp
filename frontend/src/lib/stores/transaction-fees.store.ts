import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { derived, writable } from "svelte/store";

export type TransactionFeesStore = {
  // Main Ledger of IC
  main: bigint;
  // SNS ledgers
  projects: {
    [rootCanisterId: string]: {
      fee: bigint;
      certified: boolean;
    };
  };
};

const defaultTransactionFees: TransactionFeesStore = {
  main: BigInt(DEFAULT_TRANSACTION_FEE_E8S),
  projects: {},
};

/**
 * A store that contains the transaction fees of ledgers.
 *
 * - setMain: replace the current fee in `main`.
 */
const initTransactionFeesStore = () => {
  const store = writable<TransactionFeesStore>(defaultTransactionFees);

  const { update } = store;

  return {
    ...store,

    setMain(fee: bigint) {
      update((data) => ({
        ...data,
        main: fee,
      }));
    },

    setFee({
      rootCanisterId,
      fee,
      certified,
    }: {
      rootCanisterId: Principal;
      fee: bigint;
      certified: boolean;
    }) {
      update((data) => ({
        ...data,
        projects: {
          ...data.projects,
          [rootCanisterId.toText()]: {
            fee,
            certified,
          },
        },
      }));
    },
  };
};

export const transactionsFeesStore = initTransactionFeesStore();

export const mainTransactionFeeStore = derived(
  transactionsFeesStore,
  ($store) => Number($store.main)
);

export const selectedProjectTransactionFeeStore = derived(
  [snsOnlyProjectStore, transactionsFeesStore],
  ([$snsOnlyProjectStore, $transactionsFeesStore]) =>
    $snsOnlyProjectStore === undefined
      ? undefined
      : $transactionsFeesStore.projects[$snsOnlyProjectStore.toText()]?.fee
);

export const selectedProjectTransactionFeeTokenAmountStore = derived(
  [selectedProjectTransactionFeeStore, snsTokenSymbolSelectedStore],
  ([$selectedProjectTransactionFeeStore, $snsTokenSymbolSelectedStore]) =>
    $selectedProjectTransactionFeeStore === undefined ||
    $snsTokenSymbolSelectedStore === undefined
      ? undefined
      : TokenAmount.fromE8s({
          amount: $selectedProjectTransactionFeeStore,
          token: $snsTokenSymbolSelectedStore,
        })
);
