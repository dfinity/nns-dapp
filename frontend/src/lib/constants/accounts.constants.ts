import {
  NANO_SECONDS_IN_MINUTE,
  SECONDS_IN_DAY,
  SECONDS_IN_MINUTE,
} from "$lib/constants/constants";

export const HARDWARE_WALLET_NAME_MIN_LENGTH = 2;
export const SYNC_ACCOUNTS_RETRY_SECONDS = 2;
export const SYNC_ACCOUNTS_RETRY_MAX_ATTEMPTS = 50;

// The time in which a ledger rejects a repeated transfer as a duplicate.
export const LEDGER_DEDUPLICATION_WINDOW_NANOS = BigInt(
  (SECONDS_IN_DAY / SECONDS_IN_MINUTE) * NANO_SECONDS_IN_MINUTE
);

// Workers
export const SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS =
  (SECONDS_IN_MINUTE / 2) * 1000; // 30 seconds in milliseconds
