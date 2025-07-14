export const AGGREGATOR_CANISTER_VERSION = "v1";
export const AGGREGATOR_PAGE_SIZE = 10;
export const SALE_PARTICIPATION_RETRY_SECONDS = 2;
export const WATCH_SALE_STATE_EVERY_MILLISECONDS = 10_000;
/**
 * Approximately 2 months in seconds
 *
 * ref: https://github.com/dfinity/nns-dapp/blob/38c66bafd1130be921fe9b27296b9d8e5338b6ff/rs/sns_aggregator/src/upstream.rs#L19
 */
export const AGGREGATOR_METRICS_TIME_WINDOW_SECONDS = 2 * 30 * 24 * 3600;
