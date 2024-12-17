export type ReportingDateRange = "all" | "last-year" | "year-to-date";

export type TransactionsDateRange = {
  /** Start of the date range (inclusive) - timestamp in nanoseconds */
  from?: bigint;
  /** End of the date range (exclusive) - timestamp in nanoseconds */
  to?: bigint;
};
