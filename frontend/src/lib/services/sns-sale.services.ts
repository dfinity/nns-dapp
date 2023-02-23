import { ledgerCanister } from "$lib/api/ledger.api";
import {
  getOpenTicket as getOpenTicketApi,
  newSaleTicket as newSaleTicketApi,
  notifyPaymentFailure,
} from "$lib/api/sns-sale.api";
import { wrapper } from "$lib/api/sns-wrapper.api";
import {
  snsProjectsStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import { syncAccounts } from "$lib/services/accounts.services";
import { getCurrentIdentity } from "$lib/services/auth.services";
import { toastsError, toastsShow } from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { Account } from "$lib/types/account";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
import { assertEnoughAccountFunds } from "$lib/utils/accounts.utils";
import { toToastError } from "$lib/utils/error.utils";
import { validParticipation } from "$lib/utils/projects.utils";
import {
  getSwapCanisterAccount,
  isInternalRefreshBuyerTokensError,
} from "$lib/utils/sns.utils";
import type { Identity } from "@dfinity/agent";
import type { TokenAmount } from "@dfinity/nns";
import {
  InsufficientFundsError,
  TxCreatedInFutureError,
  TxDuplicateError,
  TxTooOldError,
} from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import {
  GetOpenTicketErrorType,
  NewSaleTicketResponseErrorType,
  SnsSwapGetOpenTicketError,
  SnsSwapNewTicketError,
} from "@dfinity/sns";
import type {
  InvalidUserAmount,
  Ticket,
} from "@dfinity/sns/dist/candid/sns_swap";
import type { E8s } from "@dfinity/sns/dist/types/types/common";
import {
  fromDefinedNullable,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
import { get } from "svelte/store";
import { DEFAULT_TOAST_DURATION_MILLIS } from "../constants/constants";
import { SALE_PARTICIPATION_RETRY_SECONDS } from "../constants/sns.constants";
import { startBusy, stopBusy } from "../stores/busy.store";
import { snsTicketsStore } from "../stores/sns-tickets.store";
import { toastsSuccess } from "../stores/toasts.store";
import { nanoSecondsToDateTime, secondsToDuration } from "../utils/date.utils";
import { logWithTimestamp } from "../utils/dev.utils";
import { formatToken } from "../utils/token.utils";

/**
 * **SHOULD NOT BE CALLED FROM UI**
 * (exported only for testing purposes)
 *
 * @param rootCanisterId
 * @param certified
 */
export const loadOpenTicket = async ({
  rootCanisterId,
  certified,
}: {
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<void> => {
  try {
    const identity = await getCurrentIdentity();
    const ticket = await getOpenTicketApi({
      identity,
      rootCanisterId,
      certified,
    });

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
    // enable participate button
    snsTicketsStore.setNoTicket(rootCanisterId);

    if (!(err instanceof SnsSwapGetOpenTicketError)) {
      // not expected error
      toastsError({
        labelKey: "error__sns.sns_sale_unexpected_error",
        err,
      });
      return;
    }

    // handle custom errors
    const { errorType } = err;
    switch (errorType) {
      case GetOpenTicketErrorType.TYPE_SALE_CLOSED:
        toastsError({
          labelKey: "error__sns.sns_sale_closed",
        });
        return;
    }

    // generic error
    toastsError({
      labelKey: "error__sns.sns_sale_unexpected_error",
      err,
    });
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
      case NewSaleTicketResponseErrorType.TYPE_TICKET_EXISTS: {
        const existingTicket = newSaleTicketError.existingTicket;
        if (nonNullish(existingTicket)) {
          toastsShow({
            level: "info",
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
        // break to jump to the generic error message
        break;
      }
      case NewSaleTicketResponseErrorType.TYPE_INVALID_USER_AMOUNT: {
        const { min_amount_icp_e8s_included, max_amount_icp_e8s_included } =
          newSaleTicketError.invalidUserAmount as InvalidUserAmount;
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

  // generic error
  toastsError({
    labelKey: "error__sns.sns_sale_unexpected_error",
    err,
  });
};

// TODO(sale): rename to loadNewSaleTicket
/**
 * **SHOULD NOT BE CALLED FROM UI**
 * (exported only for testing purposes)
 *
 * @param {Principal} rootCanisterId
 * @param {E8s} amount_icp_e8s
 * @param {Uint8Array} subaccount
 */
export const newSaleTicket = async ({
  rootCanisterId,
  amount_icp_e8s,
  subaccount,
}: {
  rootCanisterId: Principal;
  amount_icp_e8s: E8s;
  subaccount?: Uint8Array;
}): Promise<void> => {
  logWithTimestamp("[sale]newSaleTicket:", amount_icp_e8s, Boolean(subaccount));
  try {
    const identity = await getCurrentIdentity();
    const ticket = await newSaleTicketApi({
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
  get(snsProjectsStore)?.find(
    ({ rootCanisterId: id }) => id.toText() === rootCanisterId.toText()
  );

export const restoreSnsSaleParticipation = async ({
  rootCanisterId,
  postprocess,
}: {
  rootCanisterId: Principal;
  postprocess: () => Promise<void>;
}): Promise<void> => {
  // avoid concurrent restores
  if (nonNullish(get(snsTicketsStore)[rootCanisterId?.toText()]?.ticket)) {
    return;
  }

  await loadOpenTicket({
    rootCanisterId,
    certified: true,
  });

  const ticket: Ticket | undefined | null =
    get(snsTicketsStore)[rootCanisterId?.toText()]?.ticket;

  // no open tickets
  if (isNullish(ticket)) {
    return;
  }

  // TODO(sale): recheck why it's there
  toastsShow({
    level: "info",
    labelKey: "error__sns.sns_sale_proceed_with_existing_ticket",
    substitutions: {
      $time: nanoSecondsToDateTime(ticket.creation_time),
    },
    duration: DEFAULT_TOAST_DURATION_MILLIS,
  });

  startBusy({
    initiator: "project-participate",
    labelKey: "neurons.may_take_while",
  });

  await participateInSnsSale({
    rootCanisterId,
    postprocess,
  });

  stopBusy("project-participate");
};

/**
 * Does participation validation and creates an open ticket.
 *
 * @param amount
 * @param rootCanisterId
 * @param account
 */
export const initiateSnsSaleParticipation = async ({
  amount,
  rootCanisterId,
  account,
  postprocess,
}: {
  amount: TokenAmount;
  rootCanisterId: Principal;
  account: Account;
  postprocess: () => Promise<void>;
}): Promise<void> => {
  logWithTimestamp("[sale]initiateSnsSaleParticipation:", amount?.toE8s());
  try {
    startBusy({
      initiator: "project-participate",
      labelKey: "neurons.may_take_while",
    });

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

    // Create a sale ticket
    const subaccount = "subAccount" in account ? account.subAccount : undefined;
    await newSaleTicket({
      rootCanisterId,
      subaccount: isNullish(subaccount)
        ? undefined
        : Uint8Array.from(subaccount),
      amount_icp_e8s: amount.toE8s(),
    });

    const ticket = get(snsTicketsStore)[rootCanisterId?.toText()]?.ticket;
    if (nonNullish(ticket)) {
      await participateInSnsSale({
        rootCanisterId,
        postprocess,
      });
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

  stopBusy("project-participate");
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
}: {
  rootCanisterId: Principal;
  identity: Identity;
  hasTooOldError: boolean;
  ticket: Ticket;
}): Promise<{ success: boolean }> => {
  const { notifyParticipation: notifyParticipationApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  try {
    logWithTimestamp("[sale] 2. refresh_buyer_tokens");
    const controller = identity.getPrincipal();
    // endpoint: refresh_buyer_tokens
    const { icp_accepted_participation_e8s } = await notifyParticipationApi({
      buyer: controller.toText(),
    });

    // current_committed ≠ ticket.amount
    if (icp_accepted_participation_e8s !== ticket.amount_icp_e8s) {
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
        try {
          // TODO(sale): test to call this w/o refresh_bayers_tockents (expected the ticket is removed)
          // force to remove ticket
          await notifyPaymentFailure({
            rootCanisterId,
            identity,
          });
        } catch (err) {
          console.error("[sale] notifyPaymentFailure", err);
        }
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

/**
 * **SHOULD NOT BE CALLED FROM UI**
 * (exported only for testing purposes)
 *
 * Do the participation using sns ticket
 *
 * 1. nnsLedger.transfer
 * 2. snsSale.notifyParticipation (refresh_buyer_tokens)
 * 3. syncAccounts
 *
 * @param snsTicket
 * @param rootCanisterId
 */
export const participateInSnsSale = async ({
  rootCanisterId,
  postprocess,
}: {
  rootCanisterId: Principal;
  postprocess: () => Promise<void>;
}): Promise<void> => {
  let hasTooOldError = false;
  const ticket = get(snsTicketsStore)[rootCanisterId.toText()]?.ticket;
  // skip if there is no more ticket (e.g. on retry)
  if (isNullish(ticket)) {
    logWithTimestamp("[sale] skip participation - no ticket");
    return;
  }

  logWithTimestamp(
    "[sale]participateInSnsSale:",
    ticket,
    rootCanisterId?.toText()
  );

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
    return;
  }

  const { canister: nnsLedger } = await ledgerCanister({ identity });
  const {
    canisterIds: { swapCanisterId },
  } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });
  const controller = identity.getPrincipal();

  try {
    const accountIdentifier = getSwapCanisterAccount({
      swapCanisterId,
      controller,
    });

    logWithTimestamp("[sale] 1. transfer (time,id):", creationTime, ticketId);

    // Send amount to the ledger
    await nnsLedger.transfer({
      amount,
      fromSubAccount: isNullish(subaccount)
        ? undefined
        : Array.from(subaccount),
      to: accountIdentifier,
      createdAt: creationTime,
      memo: ticketId,
    });
  } catch (err) {
    console.error("[sale] on transfer", err);

    // Frontend should auto retry participation
    // (in theory this error should be gone in a couple of seconds)
    if (err instanceof TxCreatedInFutureError) {
      const retryIn = SALE_PARTICIPATION_RETRY_SECONDS;

      setTimeout(() => {
        participateInSnsSale({
          rootCanisterId,
          postprocess,
        });
      }, retryIn * 1000);

      toastsShow({
        level: "error",
        labelKey: "error__sns.sns_sale_retry_in",
        substitutions: {
          $time: secondsToDuration(BigInt(retryIn)),
        },
        duration: DEFAULT_TOAST_DURATION_MILLIS,
      });

      return;
    }

    // if duplicated transfer, silently continue the flow
    if (!(err instanceof TxDuplicateError)) {
      let labelKey = "error__sns.sns_sale_unexpected_error";

      if (err instanceof InsufficientFundsError) {
        labelKey = "error__sns.ledger_insufficient_funds";
      }

      if (err instanceof TxTooOldError) {
        /* After 24h ledger returns TxTooOldError and the user will be blocked because there will be an open ticket that can not be used
         * - continue the flow:
         *  - refresh_buyer_tokens // internal errors are ignored
         *  - notify_payment_failure
         */
        hasTooOldError = true;
      } else {
        toastsError({
          labelKey,
          err,
        });

        // enable participate button
        snsTicketsStore.setNoTicket(rootCanisterId);

        return;
      }
    }
  }

  const { success } = await notifyParticipationAndRemoveTicket({
    rootCanisterId,
    identity,
    hasTooOldError,
    ticket,
  });

  if (!success) {
    return;
  }

  logWithTimestamp("[sale] 3. syncAccounts");
  await syncAccounts();

  logWithTimestamp("[sale] done");

  // reload
  await postprocess?.();

  toastsSuccess({
    labelKey: "sns_project_detail.participate_success",
  });

  // remove the ticket when it's complete to enable increase participation button
  snsTicketsStore.setNoTicket(rootCanisterId);
};
