/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
import { NotEnoughAmountError } from "$lib/types/common.errors";
import { LedgerErrorMessage } from "$lib/types/ledger.errors";
import {
  CannotBeMerged,
  InvalidAmountError,
  NotAuthorizedNeuronError,
  NotFoundError,
} from "$lib/types/neurons.errors";
import type { ToastMsg } from "$lib/types/toast";
import { translate, type I18nSubstitutions } from "$lib/utils/i18n.utils";
import {
  AgentError,
  CertifiedRejectErrorCode,
  UncertifiedRejectErrorCode,
} from "@dfinity/agent";
import { InvalidaTransactionError, RefundedError } from "@dfinity/cmc";
import {
  InsufficientFundsError,
  InvalidAccountIDError,
  InvalidSenderError,
  TransferError,
} from "@dfinity/ledger-icp";
import {
  CouldNotClaimNeuronError,
  GovernanceError,
  InsufficientAmountError as InsufficientAmountNNSError,
} from "@dfinity/nns";
import { SnsGovernanceError, UnsupportedMethodError } from "@dfinity/sns";
import { InvalidPercentageError, isNullish, nonNullish } from "@dfinity/utils";

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

  if (typeof text !== "string") return text;

  // replace with i18n version if available
  const translatedText = translate({ labelKey: text });
  // Instead of showing all the underlying error details,
  // we display only the “Body” section of the error (if any),
  // as it typically contains the information most relevant to the user.
  const matchBody = translatedText.match(/Body:\s*([\s\S]*)/);
  return matchBody ? matchBody[1].trim() : translatedText;
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
  // dapp errors
  [NotEnoughAmountError, "error.amount_not_enough_stake_neuron"],
];
export const mapNeuronErrorToToastMessage =
  factoryMappingErrorToToastMessage(neuronMapper);

// Check CMC and IC Mgt Canister Errors
const canisterMapper: Array<[Function, string]> = [
  [RefundedError, "error.canister_refund"],
  [InvalidaTransactionError, "error.canister_invalid_transaction"],
  [UserNotTheControllerError, "error.not_canister_controller_to_update"],
  // dapp errors
  [NotEnoughAmountError, "error.insufficient_funds"],
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
}): {
  labelKey: string;
  err?: unknown;
  substitutions?: I18nSubstitutions;
  renderAsHtml: boolean;
} => {
  let errorKey = false;
  const error = err as Error | undefined;
  const message: string | undefined = error?.message;

  if (message !== undefined) {
    const label = translate({ labelKey: message });
    errorKey = label !== message;
  }

  const renderAsHtml =
    nonNullish(error) && "renderAsHtml" in error
      ? (error.renderAsHtml as boolean)
      : false;

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
    renderAsHtml,
  };
};

// TODO: Update this to make use of the result property in the error.
/**
 * Identifies errors of payload size at the Replica level.
 *
 * Error message example: "Call failed:
 * Canister: rrkah-fqaaa-aaaaa-aaaaq-cai
 * Method: list_proposals (query)
 * "Status": "rejected"
 * "Code": "CanisterError"
 * "Message": "IC0504: Canister rrkah-fqaaa-aaaaa-aaaaq-cai violated contract: ic0.msg_reply_data_append: application payload size (3824349) cannot be larger than 3145728""
 */
export const isPayloadSizeError = (err: unknown): boolean => {
  if (typeof err === "object" && nonNullish(err) && "message" in err) {
    const message = err.message as string;
    return (
      message.includes("payload size") &&
      message.includes("cannot be larger than")
    );
  }
  return false;
};

export const isMethodNotSupportedError = (err: unknown): boolean =>
  err instanceof UnsupportedMethodError;

// TOOD: Rename the function for generic errors
export const isCanisterOutOfCyclesError = (error: unknown): boolean => {
  if (!(error instanceof AgentError)) return false;

  const { code } = error;

  if (
    !(code instanceof UncertifiedRejectErrorCode) &&
    !(code instanceof CertifiedRejectErrorCode)
  )
    return false;

  const { rejectErrorCode } = code;

  if (isNullish(rejectErrorCode)) return false;

  const errorPrefix = "IC0";
  return rejectErrorCode.startsWith(errorPrefix);
};
