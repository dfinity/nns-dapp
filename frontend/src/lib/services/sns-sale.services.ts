import { ledgerCanister } from "$lib/api/ledger.api";
import {
  getOpenTicket as getOpenTicketApi,
  newSaleTicket as newSaleTicketApi,
} from "$lib/api/sns-sale.api";
import { wrapper } from "$lib/api/sns-wrapper.api";
import { querySnsSwapState } from "$lib/api/sns.api";
import {
  snsProjectsStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import { syncAccounts } from "$lib/services/accounts.services";
import {
  getAuthenticatedIdentity,
  getCurrentIdentity,
} from "$lib/services/auth.services";
import { snsQueryStore } from "$lib/stores/sns.store";
import { toastsError, toastsShow } from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { Account } from "$lib/types/account";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
import type { SnsTicket } from "$lib/types/sns";
import { assertEnoughAccountFunds } from "$lib/utils/accounts.utils";
import { toToastError } from "$lib/utils/error.utils";
import { validParticipation } from "$lib/utils/projects.utils";
import { ledgerErrorToToastError } from "$lib/utils/sns-ledger.utils";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import { IcrcTransferError } from "@dfinity/ledger";
import type { TokenAmount } from "@dfinity/nns";
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
import {nanoSecondsToDateTime} from "../utils/date.utils";
import { formatToken } from "../utils/token.utils";
import {DEFAULT_TOAST_DURATION_MILLIS} from "../constants/constants";

export const getOpenTicket = async ({
  rootCanisterId,
  certified,
}: {
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<SnsTicket | undefined> => {
  console.debug("[sale]getOpenTicket start");
  try {
    const identity = await getCurrentIdentity();
    const ticket = await getOpenTicketApi({
      identity,
      rootCanisterId,
      certified,
    });

    console.debug("[sale]getOpenTicket:", ticket);

    return {
      rootCanisterId,
      ticket,
    };
  } catch (err) {
    // TODO(sale): remove extra logs after tests
    console.error("[sale]getOpenTicket", err);

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

export const newSaleTicket = async ({
  rootCanisterId,
  amount_icp_e8s,
  subaccount,
}: {
  rootCanisterId: Principal;
  amount_icp_e8s: E8s;
  subaccount?: Uint8Array;
}): Promise<SnsTicket | undefined> => {
  console.debug("[sale]newSaleTicket:", amount_icp_e8s, subaccount);
  try {
    const identity = await getCurrentIdentity();
    const ticket = await newSaleTicketApi({
      identity,
      rootCanisterId,
      subaccount,
      amount_icp_e8s,
    });

    console.debug("[sale]newSaleTicket: created", ticket);
    return {
      rootCanisterId,
      ticket,
    };
  } catch (err) {
    console.error("[sale]newSaleTicket", err);

    if (!(err instanceof SnsSwapNewTicketError)) {
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
      case NewSaleTicketResponseErrorType.TYPE_SALE_CLOSED:
        toastsError({
          labelKey: "error__sns.sns_sale_closed",
          err,
        });
        return;
      case NewSaleTicketResponseErrorType.TYPE_TICKET_EXISTS: {
        const existingTicket = (err as SnsSwapNewTicketError).existingTicket;
        if (nonNullish(existingTicket)) {
          toastsShow({
            level: "info",
            labelKey: "error__sns.sns_sale_proceed_with_existing_ticket",
            substitutions: {
              $time: nanoSecondsToDateTime(existingTicket.creation_time),
            },
          });

          // Continue the flow with existing ticket (restore the flow)
          return {
            rootCanisterId,
            ticket: existingTicket,
          };
        }
        // break to jump to the generic error message
        break;
      }
      case NewSaleTicketResponseErrorType.TYPE_INVALID_USER_AMOUNT: {
        const { min_amount_icp_e8s_included, max_amount_icp_e8s_included } =
          err.invalidUserAmount as InvalidUserAmount;
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
      case NewSaleTicketResponseErrorType.TYPE_UNSPECIFIED:
        {
          toastsError({
            labelKey: "error__sns.sns_sale_try_later",
          });
          return;
        }

        // generic error
        toastsError({
          labelKey: "error__sns.sns_sale_unexpected_error",
          err,
        });
    }
  }
};

/**
 * Requests swap state and loads it in the store.
 * Ignores possible undefined. This is used only to recheck the data with up-to-date information.
 * This should be used only when the data is already in the store.
 * That's why if an error happens, we want to rely on the data that it's already in the store.
 *
 * @param {Principal} rootCanisterId Root canister id of the project.
 */
const reloadSnsState = async (rootCanisterId: Principal): Promise<void> => {
  try {
    const identity = await getAuthenticatedIdentity();
    const swapData = await querySnsSwapState({
      rootCanisterId: rootCanisterId.toText(),
      identity,
      certified: true,
    });
    snsQueryStore.updateSwapState({
      swapData,
      rootCanisterId: rootCanisterId.toText(),
    });
  } catch (err) {
    // Ignore error
    console.error("Error reloading swap state", err);
  }
};

const getProjectFromStore = (
  rootCanisterId: Principal
): SnsFullProject | undefined =>
  get(snsProjectsStore)?.find(
    ({ rootCanisterId: id }) => id.toText() === rootCanisterId.toText()
  );

/**
 * Creates a ticket and start participation
 * @param amount
 * @param rootCanisterId
 * @param account
 */
export const initiateSnsSwapParticipation = async ({
  amount,
  rootCanisterId,
  account,
}: {
  amount: TokenAmount;
  rootCanisterId: Principal;
  account: Account;
}): Promise<SnsTicket | undefined> => {
  console.debug("[sale]initiateSnsSwapParticipation:", amount, account);
  try {
    // amount validation
    const transactionFee = get(transactionsFeesStore).main;
    assertEnoughAccountFunds({
      account,
      amountE8s: amount.toE8s() + transactionFee,
    });

    // TODO(sale): GIX-1318
    await reloadSnsState(rootCanisterId);
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
    const ticket = await newSaleTicket({
      rootCanisterId,
      subaccount: isNullish(subaccount)
        ? undefined
        : Uint8Array.from(subaccount),
      amount_icp_e8s: amount.toE8s(),
    });

    // no ticket case is covered in `newSaleTicket` function
    if (ticket) {
      return ticket;
    }
  } catch (err: unknown) {
    console.error("[sale]initiateSnsSwapParticipation 2", err);

    // TODO(sale): check if needed in this state?
    toastsError(
      toToastError({
        err: err,
        fallbackErrorLabelKey: "error__sns.sns_sale_unexpected_error",
      })
    );
  }
};

/**
 *
 * @param snsTicket
 * @param rootCanisterId
 */
export const participateInSnsSwap = async ({
  ticket: { ticket: snsTicket, rootCanisterId },
}: {
  ticket: SnsTicket;
}): Promise<{ success: boolean; retry: boolean }> => {
  // should not happen (for ts)
  if (snsTicket === undefined) {
    throw new Error("no ticket");
  }
  console.debug(
    "[sale]participateInSnsSwap:",
    snsTicket,
    rootCanisterId.toText()
  );

  const {
    amount_icp_e8s: amount,
    account,
    creation_time: creationTime,
    ticket_id: ticketId,
  } = snsTicket as Ticket;

  const ticketAccount = fromDefinedNullable(account);
  const ownerPrincipal = fromDefinedNullable(ticketAccount.owner);
  const subaccount = fromNullable(ticketAccount.subaccount);
  const identity = await getCurrentIdentity();

  // TODO: add HW support
  if (identity.getPrincipal().toText() !== ownerPrincipal.toText()) {
    console.error("Sale: identities don't match");
    toastsError({
      labelKey: "error__sns.sns_sale_unexpected_error",
    });
    return { success: false, retry: false };
  }

  const { canister: nnsLedger } = await ledgerCanister({ identity });
  const {
    canisterIds: { swapCanisterId },
    notifyParticipation,
  } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });
  const controller = identity.getPrincipal();
  const accountIdentifier = getSwapCanisterAccount({
    swapCanisterId,
    controller,
  });

  try {
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
    console.error("[sale]participateInSnsSwap", err);

    if (!(err instanceof IcrcTransferError)) {
      toastsError({
        labelKey: "error__sns.sns_sale_unexpected_error",
      });
      return { success: false, retry: false };
    }

    let retry = false;
    const { errorType } = err;

    if (
      "CreatedInFuture" in errorType ||
      "TemporarilyUnavailable" in errorType
    ) {
      retry = true;
    }

    // if duplicated transfer, silently continue the flow
    if (!("Duplicate" in errorType)) {
      toastsError(
        ledgerErrorToToastError({
          fallbackErrorLabelKey: "error.transaction_error",
          err,
        })
      );

      return { success: false, retry };
    }
  }

  try {
    // endpoint: refresh_buyer_tokens
    const { icp_accepted_participation_e8s } = await notifyParticipation({
      buyer: controller.toText(),
    });

    // current_committed ≠ ticket.amount
    if (icp_accepted_participation_e8s !== snsTicket.amount_icp_e8s) {
      toastsShow({
        level: "warn",
        labelKey: "error__sns.sns_sale_committed_not_equal_to_amount",
        substitutions: {
          $amount: formatToken({ value: icp_accepted_participation_e8s }),
        },
        duration: DEFAULT_TOAST_DURATION_MILLIS,
      });
    }
  } catch (err) {
    // unexpected error (probably sale is closed)
    toastsError({
      labelKey: "error__sns.sns_sale_unexpected_error",
    });
  }

  console.debug("Participating in swap: done");

  await syncAccounts();

  return { success: true, retry: false };
};
