import { SECONDS_IN_MINUTE } from "$lib/constants/constants";

export const HARDWARE_WALLET_NAME_MIN_LENGTH = 2;
export const SYNC_ACCOUNTS_RETRY_SECONDS = 2;
export const SYNC_ACCOUNTS_RETRY_MAX_ATTEMPTS = 50;

// Workers
export const SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS =
  (SECONDS_IN_MINUTE / 2) * 1000; // 30 seconds in milliseconds
