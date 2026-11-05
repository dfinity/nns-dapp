import { LEDGER_DEDUPLICATION_WINDOW_NANOS } from "$lib/constants/accounts.constants";
import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { jsonReplacer, jsonReviver, nonNullish } from "@dfinity/utils";

export interface TransferAttempt {
  key: string;
  createdAt: bigint;
  isRetry: boolean;
}

/** Maps a transfer key to the timestamp of an attempt with no definite outcome. */
type TransferAttempts = Record<string, bigint>;

// All reads and writes use local storage directly, so that all tabs share the attempts.
const readAttempts = (): TransferAttempts => {
  try {
    const stored = localStorage.getItem(StoreLocalStorageKey.TransferAttempts);
    return nonNullish(stored) ? JSON.parse(stored, jsonReviver) : {};
  } catch (err: unknown) {
    console.error(err);
    return {};
  }
};

const writeAttempts = (attempts: TransferAttempts) => {
  try {
    localStorage.setItem(
      StoreLocalStorageKey.TransferAttempts,
      JSON.stringify(attempts, jsonReplacer)
    );
  } catch (err: unknown) {
    console.error(err);
  }
};

const filterAttempts = (
  attempts: TransferAttempts,
  predicate: (entry: [string, bigint]) => boolean
): TransferAttempts =>
  Object.fromEntries(Object.entries(attempts).filter(predicate));

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

/**
 * Saves the attempt before the call, so that it survives a page reload during the call.
 * A retry reuses the timestamp, so the ledger rejects it if an earlier attempt executed.
 */
export const startTransferAttempt = (key: string): TransferAttempt => {
  const attempts = filterAttempts(
    readAttempts(),
    ([, createdAt]) =>
      nowInBigIntNanoSeconds() - createdAt < LEDGER_DEDUPLICATION_WINDOW_NANOS
  );
  const savedCreatedAt = attempts[key];
  const createdAt = savedCreatedAt ?? nowInBigIntNanoSeconds();

  writeAttempts({ ...attempts, [key]: createdAt });

  return { key, createdAt, isRetry: nonNullish(savedCreatedAt) };
};

export const clearTransferAttempt = (key: string) =>
  writeAttempts(
    filterAttempts(readAttempts(), ([entryKey]) => entryKey !== key)
  );
