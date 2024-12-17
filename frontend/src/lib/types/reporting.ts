export type ReportingDateRange = "all" | "last-year" | "year-to-date";

export type TransactionsDateRange = {
  from?: bigint;
  to?: bigint;
};
