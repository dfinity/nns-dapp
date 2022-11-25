/* eslint-disable @typescript-eslint/ban-types */
import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
import { InsufficientAmountError } from "$lib/types/common.errors";
import { LedgerErrorMessage } from "$lib/types/ledger.errors";
import {
  CannotBeMerged,
  InvalidAmountError,
  NotAuthorizedNeuronError,
  NotFoundError,
} from "$lib/types/neurons.errors";
import type { ToastMsg } from "$lib/types/toast";
import { InvalidaTransactionError, RefundedError } from "@dfinity/cmc";
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
import { SnsGovernanceError } from "@dfinity/sns";
import { translate, type I18nSubstitutions } from "./i18n.utils";

export const errorToString = (err?: unknown): string | undefined => {
  const text =
    typeof err === "string"
      ? (err as string)
      : err instanceof GovernanceError
      ? (err as GovernanceError)?.detail?.error_message
      : err instanceof SnsGovernanceError
      ? (err as SnsGovernanceError).message
      : err instanceof Error
      ? (err as Error).message
      : undefined;

  // replace with i18n version if available
  return typeof text === "string" ? translate({ labelKey: text }) : text;
};

const factoryMappingErrorToToastMessage =
  (collection: Array<[Function, string]>) =>
  (error: Error | unknown, fallbackKey?: string): ToastMsg => {
    // Check toToastError first
    const testFallbackKey = "fallback";
    const toastError = toToastError({
      err: error,
      fallbackErrorLabelKey: testFallbackKey,
    });
    if (error instanceof LedgerErrorMessage) {
      return {
        level: "error",
        // Label key not needed, the transation is already in the message of the error
        labelKey: "",
        detail: error.message,
      };
    }
    // Return if error found is not fallback
    if (toastError.labelKey !== testFallbackKey) {
      return {
        level: "error",
        ...toastError,
      };
    }
    const pair = collection.find(([classType]) => error instanceof classType);
    if (pair === undefined) {
      return {
        labelKey: fallbackKey ?? "error.unknown",
        level: "error",
        detail: errorToString(error),
      };
    }
    return {
      labelKey: pair[1],
      detail: errorToString(error),
      level: "error",
    };
  };

// Check GovernanceErrors
const neuronMapper: Array<[Function, string]> = [
  [NotFoundError, "error.neuron_not_found"],
  [NotAuthorizedNeuronError, "error.not_authorized_neuron_action"],
  [InvalidAmountError, "error.amount_not_valid"],
  [InsufficientAmountError, "error.amount_not_enough_stake_neuron"],
  [CouldNotClaimNeuronError, "error.neuron_not_found"],
  [InsufficientAmountNNSError, "error.amount_not_enough_stake_neuron"],
  [InvalidSenderError, "error.invalid_sender"],
  [InsufficientFundsError, "error.insufficient_funds"],
  [InvalidAccountIDError, "error.invalid_account_id"],
  [InvalidPercentageError, "error.invalid_percentage"],
  [GovernanceError, "error.governance_error"],
  [NotFoundError, "error.neuron_not_found"],
  [TransferError, "error.transfer_error"],
  [CannotBeMerged, "error.cannot_merge"],
];
export const mapNeuronErrorToToastMessage =
  factoryMappingErrorToToastMessage(neuronMapper);

// Check CMC and IC Mgt Canister Errors
const canisterMapper: Array<[Function, string]> = [
  [InsufficientAmountError, "error.insufficient_funds"],
  [RefundedError, "error.canister_refund"],
  [InvalidaTransactionError, "error.canister_invalid_transaction"],
  [UserNotTheControllerError, "error.not_canister_controller_to_update"],
];
export const mapCanisterErrorToToastMessage =
  factoryMappingErrorToToastMessage(canisterMapper);

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
  let errorKey = false;
  const message: string | undefined = (err as Error)?.message;

  if (message !== undefined) {
    const label = translate({ labelKey: message });
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
