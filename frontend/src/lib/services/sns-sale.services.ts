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
import { toastsError } from "$lib/stores/toasts.store";
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
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import { isNullish } from "$lib/utils/utils";
import type { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { Ticket } from "@dfinity/sns/dist/candid/sns_swap";
import type { E8s } from "@dfinity/sns/dist/types/types/common";
import { fromDefinedNullable, fromNullable } from "@dfinity/utils";

export interface SnsTicket {
  rootCanisterId: Principal;
  ticket: Ticket | undefined;
}

export const getOpenTicket = async ({
  withTicket,
  rootCanisterId,
  certified,
}: {
  withTicket: boolean; // TODO: for testing purpose only
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<SnsTicket | undefined> => {
  try {
    const identity = await getCurrentIdentity();
    const { result } = await getOpenTicketApi({
      identity,
      rootCanisterId,
      withTicket,
      certified,
    });

    const resultData = fromDefinedNullable(result);

    if ("Ok" in resultData) {
      return {
        rootCanisterId,
        ticket: fromNullable(resultData.Ok.ticket),
      };
    }

    // toastsError(
    //   toToastError({
    //     err: error,
    //     fallbackErrorLabelKey: "error__sns.cannot_participate",
    //   })
    // );
  } catch (error: unknown) {
    // TODO: add error handling
    console.error(error);
    throw error;
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
}): Promise<Required<SnsTicket>> => {
  try {
    const identity = await getCurrentIdentity();

    const { result } = await newSaleTicketApi({
      identity,
      rootCanisterId,
      subaccount,
      amount_icp_e8s,
    });

    const resultData = fromDefinedNullable(result);

    if ("Ok" in resultData) {
      return {
        rootCanisterId,
        ticket: fromDefinedNullable(resultData.Ok.ticket),
      };
    }

    // toastsError(
    //   toToastError({
    //     err: error,
    //     fallbackErrorLabelKey: "error__sns.cannot_participate",
    //   })
    // );
  } catch (error: unknown) {
    // TODO: add error handling
    console.error(error);
    throw error;
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
    // TODO(sale): is it icp transaction fee only?
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

    // const accountIdentity = await getAccountIdentity(account.identifier);

    try {
      // Create a ticket (Sale)
      const subaccount =
        "subAccount" in account ? account.subAccount : undefined;
      const ticket = await newSaleTicket({
        rootCanisterId,
        // TODO(sale): Uint8Array?
        subaccount: isNullish(subaccount) ? undefined : Uint8Array.from(subaccount),
        amount_icp_e8s: amount.toE8s(),
      });

      await participateInSnsSwap({
        ticket,
        // rootCanisterId,
        // identity: accountIdentity,
        // amount,
        // controller: accountIdentity.getPrincipal(),
        // fromSubAccount:
        //   "subAccount" in account ? account.subAccount : undefined,
      });
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

  // TODO(sale): provide more precise identity source
  const identity = await getCurrentIdentity();

  // TODO(Sale): if the current identity principal is not ticket principal (panik)
  // TODO: add HW support
  if (identity.getPrincipal().toText() !== ownerPrincipal.toText()) {
    // TODO(sale): add the check
    throw new Error("IDENTITY_DONT_MATCH");
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

  // get account controller
  // TODO(sale): be sure account are preloaded at this point
  /*
  const accounts = get(snsAccountsStore)[rootCanisterId.toText()]?.accounts ?? [];

  const accountIdentity = await getAccountIdentity(ownerPrincipal);
    let controller

    // identity: accountIdentity,
    // controller: accountIdentity.getPrincipal(),
    // fromSubAccount: "subAccount" in account ? account.subAccount : undefined,
  */
  // /get account controller

  // TODO(sale): controller should be calculated using only ticket data?
  const controller = identity.getPrincipal();

  const accountIdentifier = getSwapCanisterAccount({
    swapCanisterId,
    controller,
  });

  // // Create a ticket (Sale)
  // const ticket: Ticket = await newSaleTicket({
  //   rootCanisterId,
  //   subaccount: nonNullish(fromSubAccount)
  //     ? Uint8Array.from(fromSubAccount)
  //     : undefined,
  //   amount_icp_e8s: amount.toE8s(),
  // });
  console.log("newSaleTicket: ticket", saleTicket);

  // If the client disconnects after the transfer, the participation will still be notified.
  // const { canister: nnsDapp } = await nnsDappCanister({ identity });
  // TODO(sale): be sure this is not needed anymore
  // await nnsDapp.addPendingNotifySwap({
  //   swap_canister_id: swapCanisterId,
  //   buyer: controller,
  //   buyer_sub_account: toNullable(fromSubAccount),
  // });

  // Send amount to the ledger
  await nnsLedger.transfer({
    amount,
    fromSubAccount: isNullish(subaccount) ? undefined : Array.from(subaccount),
    to: accountIdentifier,
    createdAt: creationTime,
    memo: ticketId,
  });

  // Notify participation (refresh_buyer_tokens)
  await notifyParticipation({ buyer: controller.toText() });

  logWithTimestamp("Participating in swap: done");
};

// TODO(Sale): do we need it?
export const notifyApproveFailure = async () => {
  // notify_approve_failure
  console.log(`💸PaymentFlow::notify_approve_failure`);
};
