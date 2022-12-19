export const DEFAULT_LIST_PAGINATION_LIMIT = 100;
export const DEFAULT_TRANSACTION_PAGE_LIMIT = 100;
// Use a different limit for SNS transactions
// the Index canister needs to query the SNS Ledger canister for each transaction.
export const DEFAULT_SNS_TRANSACTION_PAGE_LIMIT = 20;

/**
 * The infinite scroll observe an element that finds place after x % of last page.
 */
export const INFINITE_SCROLL_OFFSET = 0.2;

export const DEFAULT_TOAST_DURATION_MILLIS = 4000;

export const SECONDS_IN_MINUTE = 60;
export const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
export const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
// Taking into account 1/4 of leap year
export const SECONDS_IN_YEAR = ((4 * 365 + 1) * SECONDS_IN_DAY) / 4;
export const SECONDS_IN_HALF_YEAR = SECONDS_IN_YEAR / 2;
export const SECONDS_IN_MONTH = SECONDS_IN_YEAR / 12;
export const SECONDS_IN_FOUR_YEARS = SECONDS_IN_YEAR * 4;
export const SECONDS_IN_EIGHT_YEARS = SECONDS_IN_YEAR * 8;

export const NANO_SECONDS_IN_MILLISECOND = 1_000_000;
