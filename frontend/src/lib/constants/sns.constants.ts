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

export const FEATURED_SNS_PROJECTS = [
  "ormnc-tiaaa-aaaaq-aadyq-cai",
  "csyra-haaaa-aaaaq-aacva-cai",
  "tw2vt-hqaaa-aaaaq-aab6a-cai",
  "x4kx5-ziaaa-aaaaq-aabeq-cai",
  "7jkta-eyaaa-aaaaq-aaarq-cai",
  "jmod6-4iaaa-aaaaq-aadkq-cai",
  "3e3x2-xyaaa-aaaaq-aaalq-cai",
];
