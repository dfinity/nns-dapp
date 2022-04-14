import {
  CouldNotClaimNeuronError,
  GovernanceError,
  InsufficientAmountError as InsufficientAmountNNSError,
  InsufficientFundsError,
  InvalidSenderError,
  TransferError,
} from "@dfinity/nns";
import {
  InsufficientAmountError,
  InvalidAmountError,
  NotAuthorizedError,
  NotFoundError,
} from "../types/errors";

export const errorToString = (err?: unknown): string | undefined =>
  typeof err === "string"
    ? (err as string)
    : err instanceof GovernanceError
    ? (err as GovernanceError)?.detail?.error_message
    : err instanceof Error
    ? (err as Error).message
    : undefined;

export const mapNeuronErrorToToastMessage = (error: Error): string => {
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
    [TransferError, "error.transfer_error"],
  ];
  const pair = collection.find(([classType]) => error instanceof classType);
  if (pair === undefined) {
    return "error.unknown";
  }
  return pair[1];
};
