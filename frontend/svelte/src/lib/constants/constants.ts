export const DEFAULT_LIST_PAGINATION_LIMIT = 100;
export const DEFAULT_TRANSACTION_PAGE_LIMIT = 100;

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
export const SECONDS_IN_FOUR_YEARS = SECONDS_IN_YEAR * 4;
export const SECONDS_IN_EIGHT_YEARS = SECONDS_IN_YEAR * 8;
