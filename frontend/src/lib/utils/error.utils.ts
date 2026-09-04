/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
import {
  AccountTranslateError,
  HardwareWalletAttachError,
  SubAccountLimitExceededError,
} from "$lib/canisters/nns-dapp/nns-dapp.errors";
import { ApiErrorKey } from "$lib/types/api.errors";
import { NotEnoughAmountError } from "$lib/types/common.errors";
import { LedgerErrorKey, LedgerErrorMessage } from "$lib/types/ledger.errors";
import {
  CannotBeMerged,
  InvalidAmountError,
  NotAuthorizedNeuronError,
  NotFoundError,
} from "$lib/types/neurons.errors";
import type { ToastMsg } from "$lib/types/toast";
import { translate, type I18nSubstitutions } from "$lib/utils/i18n.utils";
import { InvalidPercentageError, isNullish, nonNullish } from "@dfinity/utils";
import {
  InvalidaTransactionError,
  RefundedError,
} from "@icp-sdk/canisters/cmc";
import {
  InsufficientFundsError,
  InvalidAccountIDError,
  InvalidSenderError,
  TransferError,
} from "@icp-sdk/canisters/ledger/icp";
import {
  CouldNotClaimNeuronError,
  GovernanceError,
  InsufficientAmountError as InsufficientAmountNNSError,
} from "@icp-sdk/canisters/nns";
import {
  SnsGovernanceError,
  UnsupportedMethodError,
} from "@icp-sdk/canisters/sns";
import {
  AgentError,
  CertifiedRejectErrorCode,
  UncertifiedRejectErrorCode,
} from "@icp-sdk/core/agent";

// A constructor of an Error subclass. Used instead of the built-in Function
// type, so I18N_KEY_ERRORS cannot hold a non-constructor such as an arrow
// function.
type ErrorClass = abstract new (...args: never[]) => Error;

// The error classes that the app throws with an i18n label key as their
// message. Every other error carries free text, which can come from a
// third-party canister, so its message must never select an application text.
const I18N_KEY_ERRORS: Array<ErrorClass> = [
  AccountTranslateError,
  SubAccountLimitExceededError,
  HardwareWalletAttachError,
  LedgerErrorKey,
  ApiErrorKey,
  NotEnoughAmountError,
];

export const isI18nKeyError = (err: unknown): err is Error =>
  I18N_KEY_ERRORS.some((errorClass) => err instanceof errorClass);

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

  // Replace with the i18n version if the error carries a label key.
  return typeof text === "string" && isI18nKeyError(err)
    ? translate({ labelKey: text })
    : text;
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
 * The "message" of the error classes listed in I18N_KEY_ERRORS is an i18n label key.
 * This helper maps such a "message" to the "labelKey" of the toast.
 * Every other error, and a listed error whose key is absent from the catalog,
 * falls back to the "fallbackErrorLabelKey" and is added as details of the toast.
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

  if (isI18nKeyError(err) && message !== undefined) {
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
