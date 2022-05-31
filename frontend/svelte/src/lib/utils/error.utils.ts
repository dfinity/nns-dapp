import {
  CouldNotClaimNeuronError,
  GovernanceError,
  InsufficientAmountError as InsufficientAmountNNSError,
  InsufficientFundsError,
  InvalidAccountIDError,
  InvalidPercentageError,
  InvalidSenderError,
  TransferError,
} from "@dfinity/nns";
import {
  CannotBeMerged,
  InsufficientAmountError,
  InvalidAmountError,
  NotAuthorizedError,
  NotFoundError,
} from "../types/neurons.errors";
import type { ToastMsg } from "../types/toast";
import { translate, type I18nSubstitutions } from "./i18n.utils";

export const errorToString = (err?: unknown): string | undefined =>
  typeof err === "string"
    ? (err as string)
    : err instanceof GovernanceError
    ? (err as GovernanceError)?.detail?.error_message
    : err instanceof Error
    ? (err as Error).message
    : undefined;

export const mapNeuronErrorToToastMessage = (error: Error): ToastMsg => {
  // Check toToastError first
  const fallbackKey = "fallback";
  const toastError = toToastError({
    err: error,
    fallbackErrorLabelKey: fallbackKey,
  });
  // Return if error found is not fallback
  if (toastError.labelKey !== fallbackKey) {
    return {
      level: "error",
      ...toastError,
    };
  }

  // Check GovernanceErrors
  /* eslint-disable-next-line @typescript-eslint/ban-types */
  const collection: Array<[Function, string]> = [
    [NotFoundError, "error.neuron_not_found"],
    [NotAuthorizedError, "error.not_authorized"],
    [InvalidAmountError, "error.amount_not_valid"],
    [InsufficientAmountError, "error.amount_not_enough"],
    [CouldNotClaimNeuronError, "error.neuron_not_found"],
    [InsufficientAmountNNSError, "error.amount_not_enough"],
    [InvalidSenderError, "error.invalid_sender"],
    [InsufficientFundsError, "error.insufficient_funds"],
    [InvalidAccountIDError, "error.invalid_account_id"],
    [InvalidPercentageError, "error.invalid_percentage"],
    [GovernanceError, "error.governance_error"],
    [NotFoundError, "error.neuron_not_found"],
    [TransferError, "error.transfer_error"],
    [CannotBeMerged, "error.cannot_merge"],
  ];
  const pair = collection.find(([classType]) => error instanceof classType);
  if (pair === undefined) {
    return {
      labelKey: "error.unknown",
      level: "error",
      detail: errorToString(error),
    };
  }
  return { labelKey: pair[1], detail: errorToString(error), level: "error" };
};

/**
 * The "message" of some type of errors that extends Error is used to map an i18n label.
 * This helper map such "message" to the "labelKey" of the toast.
 * If the error does not contain a matching "message", it fallbacks to the "fallbackErrorLabelKey" and add the error as details of the toast.
 */
export const toToastError = ({
  err,
  fallbackErrorLabelKey,
}: {
  err: unknown | undefined;
  fallbackErrorLabelKey: string;
}): { labelKey: string; err?: unknown; substitutions?: I18nSubstitutions } => {
  let errorKey: boolean = false;
  const message: string | undefined = (err as Error)?.message;

  if (message !== undefined) {
    const label: string = translate({ labelKey: message });
    errorKey = label !== message;
  }

  type ErrorSubstitutions = { substitutions?: I18nSubstitutions };

  return {
    labelKey: errorKey
      ? (err as { message: string }).message
      : fallbackErrorLabelKey,
    ...(!errorKey && { err }),
    ...((err as ErrorSubstitutions | undefined)?.substitutions !==
      undefined && {
      substitutions: (err as ErrorSubstitutions).substitutions,
    }),
  };
};
