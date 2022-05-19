import type { NotifyError } from "./cmc.types";

export class RefundedError extends Error {}
export class InvalidaTransactionError extends Error {}
export class CMCError extends Error {}
export class ProcessingError extends Error {}
export class TransactionTooOldError extends Error {}

// Throws one of the errors above
export const throwNotifyError = ({
  Err: error,
}: {
  Err: NotifyError;
}): void => {
  if ("Refunded" in error) {
    throw new RefundedError(error.Refunded.reason);
  }
  if ("InvalidTransaction" in error) {
    throw new InvalidaTransactionError(error.InvalidTransaction);
  }
  if ("Processing" in error) {
    throw new ProcessingError();
  }
  if ("TransactionTooOld" in error) {
    throw new TransactionTooOldError();
  }
};
