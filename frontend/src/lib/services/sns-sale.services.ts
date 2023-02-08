import { ledgerCanister } from "$lib/api/ledger.api";
import { nnsDappCanister } from "$lib/api/nns-dapp.api";
import {
  getOpenTicket as getOpenTicketApi,
  newSaleTicket as newSaleTicketApi,
} from "$lib/api/sns-sale.api";
import { wrapper } from "$lib/api/sns-wrapper.api";
import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { getCurrentIdentity } from "$lib/services/auth.services";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import { nonNullish } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import type { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { Ticket } from "@dfinity/sns/dist/candid/sns_swap";
import type { E8s } from "@dfinity/sns/dist/types/types/common";
import { fromDefinedNullable, fromNullable, toNullable } from "@dfinity/utils";

export const getOpenTicket = async ({
  withTicket,
  rootCanisterId,
  certified,
}: {
  withTicket: boolean; // TODO: for testing purpose only
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<Ticket | undefined> => {
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
      return fromNullable(resultData.Ok.ticket);
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
}): Promise<Ticket | undefined> => {
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
      return fromNullable(resultData.Ok.ticket);
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

// Sale
export const notifyApproveFailure = async () => {
  // notify_approve_failure
  console.log(`💸PaymentFlow::notify_approve_failure`);
};

export const participateInSnsSwap = async ({
  amount,
  controller,
  identity,
  rootCanisterId,
  fromSubAccount,
}: {
  amount: TokenAmount;
  controller: Principal;
  identity: Identity;
  rootCanisterId: Principal;
  fromSubAccount?: SubAccountArray;
}): Promise<void> => {
  logWithTimestamp("Participating in swap: call...");

  const { canister: nnsLedger } = await ledgerCanister({ identity });
  const {
    canisterIds: { swapCanisterId },
    notifyParticipation,
  } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });
  const accountIdentifier = getSwapCanisterAccount({
    swapCanisterId,
    controller,
  });

  // Create a ticket (Sale)
  const ticket: Ticket = await newSaleTicket({
    rootCanisterId,
    subaccount: nonNullish(fromSubAccount)
      ? Uint8Array.from(fromSubAccount)
      : undefined,
    amount_icp_e8s: amount.toE8s(),
  });
  console.log("newSaleTicket: ticket", ticket);

  // if (!ticket) {
  //   throw
  // }

  // If the client disconnects after the transfer, the participation will still be notified.
  const { canister: nnsDapp } = await nnsDappCanister({ identity });
  await nnsDapp.addPendingNotifySwap({
    swap_canister_id: swapCanisterId,
    buyer: controller,
    buyer_sub_account: toNullable(fromSubAccount),
  });

  const { ticket_id: memo, creation_time: createdAt } = ticket;
  // Send amount to the ledger
  await nnsLedger.transfer({
    amount: amount.toE8s(),
    fromSubAccount,
    to: accountIdentifier,
    createdAt,
    memo,
  });

  // Notify participation (refresh_buyer_tokens)
  await notifyParticipation({ buyer: controller.toText() });

  logWithTimestamp("Participating in swap: done");
};
