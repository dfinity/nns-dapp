import { sendICP } from "$lib/api/ledger.api";
import {
  getOpenTicket as getOpenTicketApi,
  newSaleTicket as newSaleTicketApi,
  notifyParticipation,
  notifyPaymentFailure as notifyPaymentFailureApi,
} from "$lib/api/sns-sale.api";
import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import {
  snsProjectsStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import { getConditionsToAccept } from "$lib/getters/sns-summary";
import { loadBalance } from "$lib/services/accounts.services";
import { getCurrentIdentity } from "$lib/services/auth.services";
import { toastsError, toastsHide, toastsShow } from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { Account } from "$lib/types/account";
import { ApiErrorKey } from "$lib/types/api.errors";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
import { SaleStep } from "$lib/types/sale";
import { assertEnoughAccountFunds } from "$lib/utils/accounts.utils";
import { toToastError } from "$lib/utils/error.utils";
import { validParticipation } from "$lib/utils/projects.utils";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import {
  getSwapCanisterAccount,
  isInternalRefreshBuyerTokensError,
} from "$lib/utils/sns.utils";
import {
  cancelPoll,
  poll,
  pollingCancelled,
  pollingLimit,
} from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import {
  ICPToken,
  InsufficientFundsError,
  TokenAmount,
  TransferError,
  TxCreatedInFutureError,
  TxDuplicateError,
  TxTooOldError,
  type BlockHeight,
} from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type {
  SnsInvalidUserAmount,
  SnsRefreshBuyerTokensResponse,
  SnsSwapTicket,
} from "@dfinity/sns";
import {
  GetOpenTicketErrorType,
  NewSaleTicketResponseErrorType,
  SnsSwapGetOpenTicketError,
  SnsSwapNewTicketError,
} from "@dfinity/sns";
import {
  assertNonNullish,
  fromDefinedNullable,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
import { get } from "svelte/store";
import { DEFAULT_TOAST_DURATION_MILLIS } from "../constants/constants";
import { SALE_PARTICIPATION_RETRY_SECONDS } from "../constants/sns.constants";
import { snsTicketsStore } from "../stores/sns-tickets.store";
import { toastsSuccess } from "../stores/toasts.store";
import { nanoSecondsToDateTime } from "../utils/date.utils";
import { logWithTimestamp } from "../utils/dev.utils";
import { formatToken } from "../utils/token.utils";

let toastId: symbol | undefined;
export const hidePollingToast = (): void => {
  if (nonNullish(toastId)) {
    toastsHide(toastId);
    toastId = undefined;
  }
};

const shouldStopPollingTicket = (err: unknown): boolean => {
  // We want to stop polling if the error is a known error
  if (err instanceof SnsSwapGetOpenTicketError) {
    return true;
  }
  // Generic error, maybe a network error
  // We want to keep trying.
  if (isNullish(toastId)) {
    toastId = toastsShow({
      labelKey: "sns_project_detail.getting_sns_open_ticket",
      level: "info",
      spinner: true,
    });
  }
  return false;
};

const WAIT_FOR_TICKET_MILLIS = SALE_PARTICIPATION_RETRY_SECONDS * 1_000;
// TODO: Solve problem with importing from sns.constants.ts
const MAX_ATTEMPS_FOR_TICKET = 50;
const SALE_FAILURES_BEFORE_HIGHlOAD_MESSAGE = 6;
const pollGetOpenTicketId = Symbol("poll-open-ticket");
// Export for testing purposes
export const cancelPollGetOpenTicket = () => cancelPoll(pollGetOpenTicketId);
const pollGetOpenTicket = async ({
  swapCanisterId,
  identity,
  certified,
  maxAttempts,
}: {
  swapCanisterId: Principal;
  identity: Identity;
  certified: boolean;
  maxAttempts?: number;
}): Promise<SnsSwapTicket | undefined> => {
  // Reset polling toast
  toastId = undefined;
  try {
    return await poll({
      fn: (): Promise<SnsSwapTicket | undefined> =>
        getOpenTicketApi({
          identity,
          swapCanisterId,
          certified,
        }),
      shouldExit: shouldStopPollingTicket,
      millisecondsToWait: WAIT_FOR_TICKET_MILLIS,
      maxAttempts,
      useExponentialBackoff: true,
      pollId: pollGetOpenTicketId,
      failuresBeforeHighLoadMessage: SALE_FAILURES_BEFORE_HIGHlOAD_MESSAGE,
    });
  } catch (error: unknown) {
    if (pollingLimit(error)) {
      throw new ApiErrorKey("error.limit_exceeded_getting_open_ticket");
    }
    throw error;
  }
};

const getTicketErrorMapper: Record<GetOpenTicketErrorType, string> = {
  [GetOpenTicketErrorType.TYPE_SALE_CLOSED]: "error__sns.sns_sale_closed",
  [GetOpenTicketErrorType.TYPE_SALE_NOT_OPEN]: "error__sns.sns_sale_not_open",
  [GetOpenTicketErrorType.TYPE_UNSPECIFIED]: "error__sns.sns_sale_final_error",
};

/**
 * **SHOULD NOT BE CALLED FROM UI**
 * (exported only for testing purposes)
 *
 * @param rootCanisterId
 * @param certified
 */
export const loadOpenTicket = async ({
  rootCanisterId,
  swapCanisterId,
  certified,
  maxAttempts = MAX_ATTEMPS_FOR_TICKET,
}: {
  rootCanisterId: Principal;
  swapCanisterId: Principal;
  certified: boolean;
  maxAttempts?: number;
}): Promise<void> => {
  try {
    const identity = await getCurrentIdentity();
    const ticket = await pollGetOpenTicket({
      identity,
      swapCanisterId,
      certified,
      maxAttempts,
    });
    // Reset the polling toast
    hidePollingToast();

    if (ticket === undefined) {
      // set explicitly null to mark the ticket absence
      snsTicketsStore.setNoTicket(rootCanisterId);
    } else {
      snsTicketsStore.setTicket({
        rootCanisterId,
        ticket,
      });
    }

    logWithTimestamp("[sale]loadOpenTicket:", ticket);
  } catch (err) {
    // Don't show error if polling was cancelled
    if (pollingCancelled(err)) {
      return;
    }

    // Set explicitly `null` to mark the ticket absence
    // Stop polling
    snsTicketsStore.setTicket({
      rootCanisterId,
      ticket: null,
    });

    if (err instanceof SnsSwapGetOpenTicketError) {
      // handle custom errors
      const { errorType } = err;
      const labelKey = getTicketErrorMapper[errorType];
      toastsError({
        labelKey,
      });
    } else if (err instanceof ApiErrorKey) {
      toastsError({
        labelKey: err.message,
      });
    } else {
      toastsError({
        labelKey: "error__sns.sns_sale_final_error",
        err,
      });
    }
  } finally {
    // There is an issue with toastStore.hide if we show a new toast right after.
    // The workaround was to show the error toast first and then hide the info toast.
    // TODO: solve the issue with toastStore.hide
    hidePollingToast();
  }
};

const handleNewSaleTicketError = ({
  err,
  rootCanisterId,
}: {
  err: unknown;
  rootCanisterId: Principal;
}): void => {
  // enable participate button
  snsTicketsStore.setNoTicket(rootCanisterId);

  try {
    const newSaleTicketError = err as SnsSwapNewTicketError;

    // handle custom errors
    switch (newSaleTicketError.errorType) {
      case NewSaleTicketResponseErrorType.TYPE_SALE_CLOSED:
        toastsError({
          labelKey: "error__sns.sns_sale_closed",
          err,
        });
        return;
      case NewSaleTicketResponseErrorType.TYPE_SALE_NOT_OPEN:
        toastsError({
          labelKey: "error__sns.sns_sale_not_open",
          err,
        });
        return;
      case NewSaleTicketResponseErrorType.TYPE_TICKET_EXISTS: {
        const existingTicket = newSaleTicketError.existingTicket;
        if (nonNullish(existingTicket)) {
          // Show error so that it shows above the modal in case the user is participating and has the modal open
          toastsError({
            labelKey: "error__sns.sns_sale_proceed_with_existing_ticket",
            substitutions: {
              $time: nanoSecondsToDateTime(existingTicket.creation_time),
            },
          });

          // Continue the flow with existing ticket (restore the flow)
          snsTicketsStore.setTicket({
            rootCanisterId,
            ticket: existingTicket,
          });
        }
        return;
      }
      case NewSaleTicketResponseErrorType.TYPE_INVALID_USER_AMOUNT: {
        const { min_amount_icp_e8s_included, max_amount_icp_e8s_included } =
          newSaleTicketError.invalidUserAmount as SnsInvalidUserAmount;
        toastsError({
          labelKey: "error__sns.sns_sale_invalid_amount",
          substitutions: {
            $min: formatToken({ value: min_amount_icp_e8s_included }),
            $max: formatToken({ value: max_amount_icp_e8s_included }),
          },
        });
        return;
      }
      case NewSaleTicketResponseErrorType.TYPE_INVALID_SUBACCOUNT: {
        toastsError({
          labelKey: "error__sns.sns_sale_invalid_subaccount",
        });
        return;
      }
      case NewSaleTicketResponseErrorType.TYPE_UNSPECIFIED: {
        toastsError({
          labelKey: "error__sns.sns_sale_try_later",
        });
        return;
      }
    }
  } catch (unexpectedError) {
    console.error(unexpectedError);
    console.error(err);
  }

  // generic error and polling limit reached
  toastsError({
    labelKey: "error__sns.sns_sale_unexpected_error",
    err,
  });
};

// Any known error we stop polling
const shoulStopPollingNewTicket = (err: unknown): boolean =>
  err instanceof SnsSwapNewTicketError;

const pollNewSaleTicket = async (params: {
  identity: Identity;
  rootCanisterId: Principal;
  amount_icp_e8s: bigint;
  subaccount?: Uint8Array;
}) =>
  poll({
    fn: (): Promise<SnsSwapTicket> => newSaleTicketApi(params),
    shouldExit: shoulStopPollingNewTicket,
    millisecondsToWait: WAIT_FOR_TICKET_MILLIS,
    useExponentialBackoff: true,
    failuresBeforeHighLoadMessage: SALE_FAILURES_BEFORE_HIGHlOAD_MESSAGE,
  });

/**
 * **SHOULD NOT BE CALLED FROM UI**
 * (exported only for testing purposes)
 *
 * @param {Principal} rootCanisterId
 * @param {E8s} amount_icp_e8s
 * @param {Uint8Array} subaccount
 */
export const loadNewSaleTicket = async ({
  rootCanisterId,
  amount_icp_e8s,
  subaccount,
}: {
  rootCanisterId: Principal;
  amount_icp_e8s: bigint;
  subaccount?: Uint8Array;
}): Promise<void> => {
  logWithTimestamp("[sale]newSaleTicket:", amount_icp_e8s, Boolean(subaccount));
  try {
    const identity = await getCurrentIdentity();
    const ticket = await pollNewSaleTicket({
      identity,
      rootCanisterId,
      subaccount,
      amount_icp_e8s,
    });

    logWithTimestamp("[sale]newSaleTicket:", ticket);

    snsTicketsStore.setTicket({
      rootCanisterId,
      ticket,
    });
  } catch (err) {
    handleNewSaleTicketError({
      err,
      rootCanisterId,
    });
  }
};

const getProjectFromStore = (
  rootCanisterId: Principal
): SnsFullProject | undefined =>
  get(snsProjectsStore).find(
    ({ rootCanisterId: id }) => id.toText() === rootCanisterId.toText()
  );

export interface ParticipateInSnsSaleParameters {
  rootCanisterId: Principal;
  userCommitment: bigint;
  postprocess: () => Promise<void>;
  updateProgress: (step: SaleStep) => void;
}

export const restoreSnsSaleParticipation = async ({
  rootCanisterId,
  swapCanisterId,
  userCommitment,
  postprocess,
  updateProgress,
}: ParticipateInSnsSaleParameters & {
  swapCanisterId: Principal;
}): Promise<void> => {
  // avoid concurrent restores
  if (nonNullish(get(snsTicketsStore)[rootCanisterId?.toText()]?.ticket)) {
    return;
  }

  await loadOpenTicket({
    swapCanisterId,
    rootCanisterId,
    certified: true,
  });

  const ticket: SnsSwapTicket | undefined | null =
    get(snsTicketsStore)[rootCanisterId?.toText()]?.ticket;

  // no open tickets
  if (isNullish(ticket)) {
    return;
  }

  await participateInSnsSale({
    rootCanisterId,
    swapCanisterId,
    userCommitment,
    postprocess,
    updateProgress,
    ticket,
  });
};

/**
 * Does participation validation and creates an open ticket.
 */
export const initiateSnsSaleParticipation = async ({
  amount,
  rootCanisterId,
  account,
  userCommitment,
  postprocess,
  updateProgress,
}: ParticipateInSnsSaleParameters & {
  amount: TokenAmount;
  account: Account;
}): Promise<{ success: boolean }> => {
  logWithTimestamp("[sale]initiateSnsSaleParticipation:", amount?.toE8s());
  try {
    updateProgress(SaleStep.INITIALIZATION);

    // amount validation
    const transactionFee = get(transactionsFeesStore).main;
    assertEnoughAccountFunds({
      account,
      amountE8s: amount.toE8s() + transactionFee,
    });

    const project = getProjectFromStore(rootCanisterId);
    const { valid, labelKey, substitutions } = validParticipation({
      project,
      amount,
    });

    if (!valid) {
      // TODO: Rename LedgerErroKey to NnsDappErrorKey?
      throw new LedgerErrorKey(labelKey, substitutions);
    }

    // Step 1.
    // Create a sale ticket
    const subaccount = "subAccount" in account ? account.subAccount : undefined;
    await loadNewSaleTicket({
      rootCanisterId,
      subaccount: isNullish(subaccount)
        ? undefined
        : Uint8Array.from(subaccount),
      amount_icp_e8s: amount.toE8s(),
    });

    const swapCanisterId = project?.summary.swapCanisterId;
    // Edge case: `initiateSnsSaleParticipation` can't be called if there is no swap canister id
    assertNonNullish(swapCanisterId);
    const ticket = get(snsTicketsStore)[rootCanisterId?.toText()]?.ticket;
    if (nonNullish(ticket)) {
      // Step 2. to finish
      const { success } = await participateInSnsSale({
        rootCanisterId,
        swapCanisterId,
        userCommitment,
        postprocess,
        updateProgress,
        ticket,
      });

      return { success };
    }
  } catch (err: unknown) {
    toastsError(
      toToastError({
        fallbackErrorLabelKey: "error__sns.sns_sale_unexpected_error",
        err: err,
      })
    );

    // enable participate button
    snsTicketsStore.setNoTicket(rootCanisterId);
  }

  return { success: false };
};

const pollNotifyParticipation = async ({
  buyer,
  identity,
  rootCanisterId,
}: {
  buyer: Principal;
  rootCanisterId: Principal;
  identity: Identity;
}) => {
  try {
    const project = getProjectFromStore(rootCanisterId);
    const confirmationText = project && getConditionsToAccept(project.summary);

    return await poll({
      fn: (): Promise<SnsRefreshBuyerTokensResponse> =>
        notifyParticipation({
          buyer,
          rootCanisterId,
          identity,
          confirmationText,
        }),
      shouldExit: isInternalRefreshBuyerTokensError,
      millisecondsToWait: WAIT_FOR_TICKET_MILLIS,
      useExponentialBackoff: true,
      failuresBeforeHighLoadMessage: SALE_FAILURES_BEFORE_HIGHlOAD_MESSAGE,
    });
  } catch (error: unknown) {
    if (pollingLimit(error)) {
      throw new ApiErrorKey("error.limit_exceeded_getting_open_ticket");
    }
    throw error;
  }
};

/**
 * Manually remove the open ticket
 *
 * @param rootCanisterId
 * @param identity
 */
const removeOpenTicket = async ({
  rootCanisterId,
  identity,
}: {
  rootCanisterId: Principal;
  identity: Identity;
}): Promise<void> => {
  try {
    // force to remove ticket
    await notifyPaymentFailureApi({
      rootCanisterId,
      identity,
    });
  } catch (err) {
    console.error("[sale] notifyPaymentFailure", err);
  }
};

/**
 * Calls notifyParticipation (refresh_buyer_tokens api) and handles response errors.
 * Should be called to refresh the amount of ICP a buyer has contributed from the ICP ledger canister.
 * It is assumed that prior to calling this method, tokens have been transfer by the buyer to a subaccount of the swap canister on the ICP ledger.
 */
const notifyParticipationAndRemoveTicket = async ({
  rootCanisterId,
  identity,
  hasTooOldError,
  ticket,
  userCommitment,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  hasTooOldError: boolean;
  ticket: SnsSwapTicket;
  userCommitment: bigint;
}): Promise<{ success: boolean }> => {
  try {
    logWithTimestamp("[sale] 2. refresh_buyer_tokens");
    const controller = identity.getPrincipal();
    // endpoint: refresh_buyer_tokens
    const { icp_accepted_participation_e8s } = await pollNotifyParticipation({
      buyer: controller,
      rootCanisterId,
      identity,
    });

    // current_committed (the sum of all) ≠ ticket.amount + previous commitment
    if (
      icp_accepted_participation_e8s !==
      ticket.amount_icp_e8s + userCommitment
    ) {
      toastsShow({
        level: "warn",
        labelKey: "error__sns.sns_sale_committed_not_equal_to_amount",
        substitutions: {
          $amount: formatToken({ value: icp_accepted_participation_e8s }),
        },
        duration: DEFAULT_TOAST_DURATION_MILLIS,
      });
    }

    // At this point the participation is done and the open ticket is removed
    return { success: true };
  } catch (err) {
    console.error("[sale] notifyParticipation", err);
    const internalError = isInternalRefreshBuyerTokensError(err);

    // process `TxTooOldError`
    if (hasTooOldError) {
      if (internalError) {
        await removeOpenTicket({
          rootCanisterId,
          identity,
        });
        // jump to unexpected_error
      }
    }

    // unexpected error (probably sale is closed)
    // do not remove the ticket to not enable the button
    // unknown error: ask to refresh and stop the flow
    toastsError({
      labelKey: "error__sns.sns_sale_unexpected_and_refresh",
      err,
    });

    return { success: false };
  }
};

const isTransferError = (err: unknown): boolean => err instanceof TransferError;
const pollTransfer = ({
  identity,
  to,
  amount,
  fromSubAccount,
  memo,
  createdAt,
}: {
  identity: Identity;
  to: string;
  amount: TokenAmount;
  fromSubAccount?: SubAccountArray | undefined;
  memo?: bigint;
  createdAt?: bigint;
}) =>
  poll({
    fn: (): Promise<BlockHeight> =>
      sendICP({
        identity,
        to,
        amount,
        fromSubAccount,
        createdAt,
        memo,
      }),
    // Should still just retry in case of TxCreatedInFutureError
    // (this error should be gone in a couple of seconds)
    shouldExit: (err: unknown) =>
      isTransferError(err) && !(err instanceof TxCreatedInFutureError),
    millisecondsToWait: WAIT_FOR_TICKET_MILLIS,
    useExponentialBackoff: true,
    failuresBeforeHighLoadMessage: SALE_FAILURES_BEFORE_HIGHlOAD_MESSAGE,
  });

/**
 * **SHOULD NOT BE CALLED FROM UI**
 * (exported only for testing purposes)
 *
 * Do the participation using sns ticket
 *
 * 1. nnsLedger.transfer
 * 2. snsSale.notifyParticipation (refresh_buyer_tokens)
 * 3. load new balance in store
 *
 * @param snsTicket
 * @param rootCanisterId
 */
export const participateInSnsSale = async ({
  rootCanisterId,
  swapCanisterId,
  postprocess,
  userCommitment,
  updateProgress,
  ticket,
}: ParticipateInSnsSaleParameters & {
  ticket: SnsSwapTicket;
  swapCanisterId: Principal;
}): Promise<{
  success: boolean;
}> => {
  let hasTooOldError = false;
  logWithTimestamp(
    "[sale]participateInSnsSale:",
    ticket,
    rootCanisterId.toText()
  );

  updateProgress(SaleStep.TRANSFER);

  const {
    amount_icp_e8s: amount,
    account,
    creation_time: creationTime,
    ticket_id: ticketId,
  } = ticket;

  const ticketAccount = fromDefinedNullable(account);
  const ownerPrincipal = fromDefinedNullable(ticketAccount.owner);
  const subaccount = fromNullable(ticketAccount.subaccount);
  const identity = await getCurrentIdentity();

  // TODO: add HW support
  if (identity.getPrincipal().toText() !== ownerPrincipal.toText()) {
    console.error("[sale] identities don't match");
    toastsError({
      labelKey: "error__sns.sns_sale_unexpected_error",
    });
    return { success: false };
  }

  const controller = identity.getPrincipal();

  try {
    const accountIdentifier = getSwapCanisterAccount({
      swapCanisterId,
      controller,
    });

    logWithTimestamp("[sale] 1. transfer (time,id):", creationTime, ticketId);

    // Step 2.
    // Send amount to the ledger
    await pollTransfer({
      amount: TokenAmount.fromE8s({ amount, token: ICPToken }),
      fromSubAccount: isNullish(subaccount)
        ? undefined
        : Array.from(subaccount),
      to: accountIdentifier.toHex(),
      createdAt: creationTime,
      memo: ticketId,
      identity,
    });
  } catch (err) {
    console.error("[sale] on transfer", err);

    switch ((err as object)?.constructor) {
      // if duplicated transfer, silently continue the flow
      case TxDuplicateError:
        break;
      case InsufficientFundsError: {
        await removeOpenTicket({
          rootCanisterId,
          identity,
        });

        toastsError({
          labelKey: "error__sns.ledger_insufficient_funds",
          err,
        });

        // enable participate button
        snsTicketsStore.setNoTicket(rootCanisterId);

        // stop the flow since the ticket was removed
        return { success: false };
      }
      case TxTooOldError: {
        /* After 24h ledger returns TxTooOldError and the user will be blocked because there will be an open ticket that can not be used
         * - continue the flow:
         *  - refresh_buyer_tokens // internal errors are ignored
         *  - notify_payment_failure
         */
        hasTooOldError = true;
        break;
      }
      default: {
        toastsError({
          labelKey: "error__sns.sns_sale_unexpected_error",
          err,
        });

        // enable participate button
        snsTicketsStore.setNoTicket(rootCanisterId);

        // stop the flow since the ticket was removed
        return { success: false };
      }
    }
  }

  // Step 3.
  updateProgress(SaleStep.NOTIFY);

  const { success } = await notifyParticipationAndRemoveTicket({
    rootCanisterId,
    identity,
    hasTooOldError,
    ticket,
    userCommitment,
  });

  if (!success) {
    return { success: false };
  }

  // Step 4.
  logWithTimestamp("[sale] 3. loadBalance");

  updateProgress(SaleStep.RELOAD);

  // Ticket return the account as ICRC. We can't compare identifiers directly.
  // If there is no subaccount, then the account is the main account.
  // Otherwise, we look for the matching subaccount.
  const sourceAccount = get(nnsAccountsListStore).find((account) => {
    if (isNullish(subaccount)) {
      return account.type === "main";
    }
    if (nonNullish(account.subAccount)) {
      return (
        subaccountToHexString(subaccount) ===
        subaccountToHexString(Uint8Array.from(account.subAccount))
      );
    }
  });
  if (nonNullish(sourceAccount)) {
    await loadBalance({ accountIdentifier: sourceAccount.identifier });
  }

  logWithTimestamp("[sale] done");

  // reload
  await postprocess?.();

  toastsSuccess({
    labelKey: "sns_project_detail.participate_success",
  });

  // remove the ticket when it's complete to enable increase participation button
  snsTicketsStore.setNoTicket(rootCanisterId);

  updateProgress(SaleStep.DONE);

  return { success: true };
};
