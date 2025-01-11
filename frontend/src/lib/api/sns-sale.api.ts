import { createAgent } from "$lib/api/agent.api";
import { wrapper } from "$lib/api/sns-wrapper.api";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { isMethodNotSupportedError } from "$lib/utils/error.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type {
  SnsGetAutoFinalizationStatusResponse,
  SnsRefreshBuyerTokensResponse,
  SnsSwapTicket,
} from "@dfinity/sns";
import { SnsSwapCanister } from "@dfinity/sns";
import { toNullable } from "@dfinity/utils";

export const getOpenTicket = async ({
  identity,
  swapCanisterId,
  certified,
}: {
  identity: Identity;
  swapCanisterId: Principal;
  certified: boolean;
}): Promise<SnsSwapTicket | undefined> => {
  logWithTimestamp(`[sale] getOpenTicket call...`);
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = SnsSwapCanister.create({
    canisterId: swapCanisterId,
    agent,
  });

  const response = await canister.getOpenTicket({ certified });

  logWithTimestamp(`[sale] getOpenTicket complete.`);

  return response;
};

export const newSaleTicket = async ({
  identity,
  rootCanisterId,
  amount_icp_e8s,
  subaccount,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  amount_icp_e8s: bigint;
  subaccount?: Uint8Array;
}): Promise<SnsSwapTicket> => {
  logWithTimestamp(`[sale]newSaleTicket call...`);

  const { newSaleTicket } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  const response = await newSaleTicket({ subaccount, amount_icp_e8s });

  logWithTimestamp(`[sale]newSaleTicket complete.`);

  return response;
};

export const notifyPaymentFailure = async ({
  identity,
  rootCanisterId,
}: {
  identity: Identity;
  rootCanisterId: Principal;
}): Promise<SnsSwapTicket | undefined> => {
  logWithTimestamp(`[sale] notifyPaymentFailure call...`);

  const { notifyPaymentFailure } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  const ticket = await notifyPaymentFailure();

  logWithTimestamp(`[sale] notifyPaymentFailure complete.`);

  return ticket;
};

export const notifyParticipation = async ({
  identity,
  rootCanisterId,
  buyer,
  confirmationText,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  buyer: Principal;
  confirmationText: string | undefined;
}): Promise<SnsRefreshBuyerTokensResponse> => {
  logWithTimestamp(`[sale] notifyParticipation call...`);

  const { notifyParticipation: notifyParticipationApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  const response = await notifyParticipationApi({
    buyer: buyer.toText(),
    confirmation_text: toNullable(confirmationText),
  });

  logWithTimestamp(`[sale] notifyParticipation complete.`);

  return response;
};

export const queryFinalizationStatus = async ({
  identity,
  rootCanisterId,
  certified,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<SnsGetAutoFinalizationStatusResponse | undefined> => {
  logWithTimestamp(`[sale] get finalize status call...`);

  const { getFinalizationStatus } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  try {
    const response = await getFinalizationStatus({});

    return response;
  } catch (err) {
    // If the method is not available, return undefined
    if (isMethodNotSupportedError(err)) {
      return undefined;
    }
    throw err;
  } finally {
    logWithTimestamp(`[sale] get finalize status complete.`);
  }
};
