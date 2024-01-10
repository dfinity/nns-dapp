import { IcrcTransferError } from "@dfinity/ledger-icrc";
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
  if (err instanceof IcrcTransferError) {
    if ("GenericError" in err.errorType) {
      return {
        labelKey: "error.transaction_error",
        err: new Error(err.errorType.GenericError.message),
      };
    }
    if ("TemporarilyUnavailable" in err.errorType) {
      return {
        labelKey: "error__sns.ledger_temporarily_unavailable",
      };
    }
    if ("Duplicate" in err.errorType) {
      return {
        labelKey: "error__sns.ledger_duplicate",
      };
    }
    if ("BadFee" in err.errorType) {
      return {
        labelKey: "error__sns.ledger_bad_fee",
      };
    }
    if ("CreatedInFuture" in err.errorType) {
      return {
        labelKey: "error__sns.ledger_created_future",
      };
    }
    if ("TooOld" in err.errorType) {
      return {
        labelKey: "error__sns.ledger_too_old",
      };
    }
    if ("InsufficientFunds" in err.errorType) {
      return {
        labelKey: "error__sns.ledger_insufficient_funds",
      };
    }
  }

  return toToastError({
    fallbackErrorLabelKey,
    err,
  });
};
