import { LEDGER_DEDUPLICATION_WINDOW_NANOS } from "$lib/constants/accounts.constants";
import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

/** Maps a transfer key to the timestamp of a transfer with an unknown outcome. */
export type UnknownTransfersStoreData = Record<string, bigint>;

export interface TransferAttempt {
  key: string;
  createdAt: bigint;
  isRetry: boolean;
}

/** Uses the fields that the ledger compares, except the timestamp, to detect a duplicate. */
export const toTransferKey = ({
  ledgerCanisterId,
  source,
  destination,
  amount,
  fee,
  memo,
}: {
  ledgerCanisterId: string;
  source: string;
  destination: string;
  amount: bigint;
  fee: bigint;
  memo?: string;
}): string =>
  JSON.stringify([
    ledgerCanisterId,
    source,
    destination,
    amount.toString(),
    fee.toString(),
    memo,
  ]);

const isInDeduplicationWindow = (createdAt: bigint): boolean =>
  nowInBigIntNanoSeconds() - createdAt < LEDGER_DEDUPLICATION_WINDOW_NANOS;

const initUnknownTransfersStore = () => {
  const store = writableStored<UnknownTransfersStoreData>({
    key: StoreLocalStorageKey.UnknownTransfers,
    defaultValue: {},
  });
  const { subscribe, update, resetForTesting } = store;

  const filter = (
    data: UnknownTransfersStoreData,
    predicate: (entry: [string, bigint]) => boolean
  ): UnknownTransfersStoreData =>
    Object.fromEntries(Object.entries(data).filter(predicate));

  return {
    subscribe,
    resetForTesting,

    add: ({ key, createdAt }: { key: string; createdAt: bigint }) =>
      update((data) => ({
        ...filter(data, ([, value]) => isInDeduplicationWindow(value)),
        [key]: createdAt,
      })),

    remove: (key: string) =>
      update((data) => filter(data, ([entryKey]) => entryKey !== key)),

    /** A retry reuses the timestamp, so the ledger rejects it if the first attempt executed. */
    startAttempt: (key: string): TransferAttempt => {
      const createdAt = get(store)[key];
      return nonNullish(createdAt) && isInDeduplicationWindow(createdAt)
        ? { key, createdAt, isRetry: true }
        : { key, createdAt: nowInBigIntNanoSeconds(), isRetry: false };
    },
  };
};

export const unknownTransfersStore = initUnknownTransfersStore();
