export const DEFAULT_LIST_PAGINATION_LIMIT = 100;
export const MAX_ACTIONABLE_REQUEST_COUNT = 5;
// Use a different limit for Icrc transactions
// the Index canister needs to query the Icrc Ledger canister for each transaction - i.e. it needs an update call
export const DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT = 20;

export const DEFAULT_TOAST_DURATION_MILLIS = 4000;

export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
export const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR;
export const SECONDS_IN_DAY = SECONDS_IN_HOUR * HOURS_IN_DAY;
export const SECONDS_IN_7_DAYS = 7 * SECONDS_IN_DAY;
// Taking into account 1/4 of leap year
export const SECONDS_IN_YEAR = ((4 * 365 + 1) * SECONDS_IN_DAY) / 4;
export const SECONDS_IN_HALF_YEAR = SECONDS_IN_YEAR / 2;
export const SECONDS_IN_MONTH = SECONDS_IN_YEAR / 12;
export const SECONDS_IN_FOUR_YEARS = SECONDS_IN_YEAR * 4;
export const SECONDS_IN_EIGHT_YEARS = SECONDS_IN_YEAR * 8;

export const DAYS_IN_NON_LEAP_YEAR = 365;

export const NANO_SECONDS_IN_MILLISECOND = 1_000_000;
export const NANO_SECONDS_IN_MINUTE = NANO_SECONDS_IN_MILLISECOND * 1_000 * 60;
