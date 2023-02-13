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
import { assertEnoughAccountFunds } from "$lib/utils/accounts.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { toToastError } from "$lib/utils/error.utils";
import {
  commitmentExceedsAmountLeft,
  validParticipation,
} from "$lib/utils/projects.utils";
import { ledgerErrorToToastError } from "$lib/utils/sns-ledger.utils";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import { isNullish } from "$lib/utils/utils";
import type { TokenAmount } from "@dfinity/nns";
import { TxDuplicateError } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { Ticket } from "@dfinity/sns/dist/candid/sns_swap";
import {
  GetOpenTicketErrorType,
  NewSaleTicketResponseErrorType,
} from "@dfinity/sns/dist/types/enums/swap.enums";
import {
  SnsSwapGetOpenTicketError,
  SnsSwapNewTicketError,
} from "@dfinity/sns/dist/types/errors/swap.errors";
import type { E8s } from "@dfinity/sns/dist/types/types/common";
import { fromDefinedNullable, fromNullable } from "@dfinity/utils";
import { get } from "svelte/store";

export interface SnsTicket {
  rootCanisterId: Principal;
  ticket: Ticket | undefined;
}

export const getOpenTicket = async ({
  withTicket,
  rootCanisterId,
  certified,
}: {
  withTicket?: boolean; // TODO: for testing purpose only
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<SnsTicket | undefined> => {
  try {
    const identity = await getCurrentIdentity();
    const ticket = await getOpenTicketApi({
      identity,
      rootCanisterId,
      withTicket,
      certified,
    });

    return {
      rootCanisterId,
      ticket,
    };
  } catch (err) {
    let detail = "";

    if (err instanceof SnsSwapGetOpenTicketError) {
      // TODO(GIX-1271): display more details in error message
      detail = GetOpenTicketErrorType[err.errorType];
    }

    toastsShow({
      labelKey: "error__sns.cannot_participate",
      level: "error",
      detail,
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
  try {
    const identity = await getCurrentIdentity();

    const ticket = await newSaleTicketApi({
      identity,
      rootCanisterId,
      subaccount,
      amount_icp_e8s,
    });

    return {
      rootCanisterId,
      ticket,
    };
  } catch (err) {
    let detail = "";

    if (err instanceof SnsSwapNewTicketError) {
      // TODO(GIX-1271): display more details in error message
      switch (err.errorType) {
        case NewSaleTicketResponseErrorType.TYPE_TICKET_EXISTS:
          return {
            rootCanisterId,
            ticket: err.existingTicket,
          };
      }

      detail = NewSaleTicketResponseErrorType[err.errorType];
    }

    toastsShow({
      labelKey: "error__sns.cannot_participate",
      level: "error",
      detail,
    });
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
}): Promise<{ success: boolean }> => {
  console.log(
    "initiateSnsSwapParticipation amount, canister, account",
    amount.toE8s(),
    rootCanisterId.toText(),
    account
  );
  //

  let success = false;
  // validation
  try {
    const transactionFee = get(transactionsFeesStore).main;
    assertEnoughAccountFunds({
      account,
      amountE8s: amount.toE8s() + transactionFee,
    });
    // TODO: Move the logic to the `catch` for a faster participation.
    // At the moment we can't move it to the `catch`
    // because it's hard for us to differentiate when the error comes from stale data or the second notify for the last participation.
    //
    // Reload the sale state before validating the participation.
    // The current state might have change since it was loaded.
    // This might prevent transferring funds that will not be accepted as participation and avoid refunds.

    // TODO(sale): reload only if we don't do the transfer
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

    try {
      // Create a ticket (Sale)
      const subaccount =
        "subAccount" in account ? account.subAccount : undefined;
      const ticket = await newSaleTicket({
        rootCanisterId,
        // TODO(sale): Uint8Array?
        subaccount: isNullish(subaccount)
          ? undefined
          : Uint8Array.from(subaccount),
        amount_icp_e8s: amount.toE8s(),
      });

      if (ticket) {
        await participateInSnsSwap({
          ticket,
        });
      }
    } catch (error: unknown) {
      // The last commitment might trigger this error
      // because the backend is faster than the frontend at notifying the commitment.
      // Backend error line: https://github.com/dfinity/ic/blob/6ccf23ec7096b117c476bdcd34caa6fada84a3dd/rs/sns/swap/src/swap.rs#L461
      const openStateError =
        error instanceof Error &&
        error.message?.includes("OPEN state") === true;
      // If it's the last commitment, it means that one more e8 is not a valid participation.
      const lastCommitment =
        project?.summary !== undefined &&
        commitmentExceedsAmountLeft({
          summary: project?.summary,
          amountE8s: amount.toE8s() + BigInt(1),
        });

      if (!(openStateError && lastCommitment)) {
        throw error;
      }
    }

    success = true;
    await syncAccounts();

    return { success };
  } catch (error: unknown) {
    toastsError(
      toToastError({
        err: error,
        fallbackErrorLabelKey: "error__sns.cannot_participate",
      })
    );
    return { success };
  }
};

/**
 *
 * @description
 *
 * # Error handling
 *
 * | **Request**          | **Error**                                                                                  | **Actions**                                                               | **Description**                                                                                                                 |
 * |----------------------|--------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
 * | sale.get_open_ticket | Ok                                                                                         | ticket.account.owner ≠ caller                                            | Must not happen but should be tested                                                                                            |
 * |                      | SaleError::NotOpen                                                                         | generic error, stop_flow, don't_retry                                    | Should be covered by UI (button disabled)                                                                                       |
 * |                      | SaleError::Closed                                                                          | stop_flow, don't_retry                                                   |                                                                                                                                 |
 * |                      | SaleError::TicketNotFound                                                                  | generic error, stop_flow, don't_retry                                    | can not happen                                                                                                                  |
 * |                      | SaleError                                                                                  | generic error, stop_flow, don't_retry                                    | can not happen                                                                                                                  |
 * | sale.new_sale_ticket | Ok                                                                                         |                                                                          | Frontend should warn the user if amount ≠ actual_amount (This can happen towards the end of the sale if amount > max_increment) |
 * |                      | SaleError::NotOpen                                                                         | do nothing                                                               | Should be covered by UI (button disabled)                                                                                       |
 * |                      | SaleError::Closed                                                                          | message: the sale is already closed, stop_flow, don't_retry              |                                                                                                                                 |
 * |                      | SaleError::TicketExists(ticket)                                                            | info: "Tryingtocompletethe existent flow", continue flow                 | Get ticket from the error details                                                                                               |
 * |                      | SaleError::ICPAllowanceNotAvailable                                                        | generic error, stop_flow, don't_retry                                    | Don't exist anymore                                                                                                             |
 * |                      | SaleError::InvalidUserAmount(actual_min_participant_icp, actual_participant_icp_increment) | Error: invalid amount, probably w/ more info out of the error details),  | Ask to retry creating a new ticket. Will the ticket be removed?                                                                 |
 * |                      | SaleError                                                                                  | generic error, stop_flow, don't_retry                                    |                                                                                                                                 |
 * | icp_ledger.transfer  | Ok                                                                                         |                                                                          |                                                                                                                                 |
 * |                      | TransferError::BadFee(expected_fee)                                                        | generic error, stop_flow, don't_retry                                    | must not happen in the current version of the protocol because we do not specify the fee in the transfer request                |
 * |                      | TransferError::InsufficientFunds(balance)                                                  | error: needs more funds, stop_flow, don't_retry                          |                                                                                                                                 |
 * |                      | TransferError::TooOld                                                                      | error: "the ticket is too old", stop_flow, don't retry                   |                                                                                                                                 |
 * |                      | TransferError::CreatedInFuture(ledger_time)                                                | no error, stop_flow, DO_retry                                            | Frontend should wait until time reaches ledger_time before retrying                                                             |
 * |                      | TransferError::Duplicate(block_id)                                                         | no error, continue_flow                                                  |                                                                                                                                 |
 * |                      | TransferError::TemporarilyUnavailable                                                      | error: "ICPledgeris temporary not available", stop_flow, DO_retry        |                                                                                                                                 |
 * |                      | TransferError::GenericError(error_code,message)                                            | display generic error with the error details,  stop_flow, don't_retry    |                                                                                                                                 |
 * | refresh_buyer_tokens | Ok (current_committed,total_committed)                                                     | warn if current_committed ≠ ticket.amount                                |                                                                                                                                 |
 * |                      | SaleError::NotOpen                                                                         |                                                                          | don’texist                                                                                                                      |
 * |                      | SaleError::Closed                                                                          | message: the sale is already closed, stop_flow, don't_retry              |                                                                                                                                 |
 * |                      | SaleError::TicketNotFound                                                                  |                                                                          | don’texist                                                                                                                      |
 * |                      | SaleError::InvalidUserAmount(actual_min_participant_icp, actual_participant_icp_increment) |                                                                          | dapp can’t get it                                                                                                               |
 * |                      | SaleError::ICPAllowanceNotAvailable                                                        |                                                                          | dapp can’t get it                                                                                                               |
 * |                      | SaleError::CommitmentInProgress                                                            |                                                                          | dapp can’t get it                                                                                                               |
 *
 * @param saleTicket
 */
export const participateInSnsSwap = async ({
  ticket: { ticket: saleTicket, rootCanisterId },
}: {
  ticket: Required<SnsTicket>;
}): Promise<void> => {
  logWithTimestamp("Participating in swap: call...");

  const {
    amount_icp_e8s: amount,
    account,
    creation_time: creationTime,
    ticket_id: ticketId,
  } = saleTicket as Ticket;

  const ticketAccount = fromDefinedNullable(account);
  const ownerPrincipal = fromDefinedNullable(ticketAccount.owner);
  const subaccount = fromNullable(ticketAccount.subaccount);
  const identity = await getCurrentIdentity();

  // TODO: add HW support
  if (identity.getPrincipal().toText() !== ownerPrincipal.toText()) {
    throw new Error("identities don't match");
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
    console.log(err);

    // TODO(GIX-1271): implement more detailed feedback (based on the table)

    if (!(err instanceof TxDuplicateError)) {
      toastsError(
        ledgerErrorToToastError({
          fallbackErrorLabelKey: "error.transaction_error",
          err,
        })
      );

      return;
    }
  }

  // refresh_buyer_tokens
  await notifyParticipation({ buyer: controller.toText() });

  logWithTimestamp("Participating in swap: done");
};
