import { SnsTransferError } from "@dfinity/sns";
import { toToastError } from "./error.utils";
import type { I18nSubstitutions } from "./i18n.utils";

export const ledgerErrorToToastError = ({
  err,
  fallbackErrorLabelKey,
}: {
  err: unknown;
  fallbackErrorLabelKey: string;
}): {
  labelKey: string;
  err?: unknown;
  substitutions?: I18nSubstitutions;
} => {
  if (err instanceof SnsTransferError) {
    const error: SnsTransferError = err;
    if ("GenericError" in error.errorType) {
      return {
        labelKey: "error.transaction_error",
        err: new Error(error.errorType.GenericError.message),
      };
    }
    if ("TemporarilyUnavailable" in error.errorType) {
      return {
        labelKey: "error__sns.ledger_temporarily_unavailable",
      };
    }
    if ("Duplicate" in error.errorType) {
      return {
        labelKey: "error__sns.ledger_duplicate",
      };
    }
    if ("BadFee" in error.errorType) {
      return {
        labelKey: "error__sns.ledger_bad_fee",
      };
    }
    if ("CreatedInFuture" in error.errorType) {
      return {
        labelKey: "error__sns.ledger_created_future",
      };
    }
    if ("TooOld" in error.errorType) {
      return {
        labelKey: "error__sns.ledger_too_old",
      };
    }
    if ("InsufficientFunds" in error.errorType) {
      return {
        labelKey: "error__sns.ledger_unsufficient_funds",
      };
    }
  }

  return toToastError({
    fallbackErrorLabelKey,
    err,
  });
};
