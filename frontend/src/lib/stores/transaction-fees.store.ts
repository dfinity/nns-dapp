import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import type { Principal } from "@dfinity/principal";
import { derived, writable, type Readable } from "svelte/store";

interface ProjectFeeData {
  fee: bigint;
  certified: boolean;
}

// TODO: Refactor to use the same pattern as the other stores.
type TransactionFeesStoreData = {
  // Main Ledger of IC
  main: bigint;
  // SNS ledgers
  projects: {
    [rootCanisterId: string]: ProjectFeeData;
  };
};

interface SnsProjectFee extends ProjectFeeData {
  rootCanisterId: Principal;
}

export interface TransactionFeesStore
  extends Readable<TransactionFeesStoreData> {
  setFee: (data: SnsProjectFee) => void;
  setFees: (projects: SnsProjectFee[]) => void;
  setMain: (fee: bigint) => void;
  reset: () => void;
}

const defaultTransactionFees: TransactionFeesStoreData = {
  main: BigInt(DEFAULT_TRANSACTION_FEE_E8S),
  projects: {},
};

/**
 * A store that contains the transaction fees of ledgers.
 *
 * - setMain: replace the current fee in `main`.
 */
const initTransactionFeesStore = (): TransactionFeesStore => {
  const store = writable<TransactionFeesStoreData>(defaultTransactionFees);

  const { update } = store;

  return {
    ...store,

    setMain(fee: bigint) {
      update((data) => ({
        ...data,
        main: fee,
      }));
    },

    setFee({ rootCanisterId, fee, certified }: SnsProjectFee) {
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

    setFees(fees: SnsProjectFee[]) {
      update((currentState) =>
        fees.reduce(
          (acc, { rootCanisterId, fee, certified }) => ({
            ...acc,
            projects: {
              ...acc.projects,
              [rootCanisterId.toText()]: {
                fee,
                certified,
              },
            },
          }),
          currentState
        )
      );
    },

    // Used for testing
    reset() {
      update(() => defaultTransactionFees);
    },
  };
};

/**
 * TODO: integrate ckBTC fee
 * @deprecated to be replaced with a derived store of tokensStore
 */
export const transactionsFeesStore = initTransactionFeesStore();

/**
 * @deprecated prefer mainTransactionFeeE8sStore to use e8s for amount of tokens instead of Number.
 */
export const mainTransactionFeeStore = derived(
  transactionsFeesStore,
  ($store) => Number($store.main)
);

export const mainTransactionFeeE8sStore = derived(
  transactionsFeesStore,
  ($store) => $store.main
);
