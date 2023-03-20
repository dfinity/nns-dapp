export enum SaleStep {
  INITIALIZATION = "initialization",
  TRANSFER = "transfer",
  NOTIFY = "notify",
  RELOAD = "reload",
  DONE = "done",
}

export type TicketStatus = "unknown" | "open" | "none" | "loading";
