import { createAgent } from "$lib/api/agent.api";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { SnsSwapCanister } from "@dfinity/sns";
import type {
  RefreshBuyerTokensResponse,
  Ticket,
} from "@dfinity/sns/dist/candid/sns_swap";
import type { E8s } from "@dfinity/sns/dist/types/types/common";
import { wrapper } from "./sns-wrapper.api";

export const getOpenTicket = async ({
  identity,
  swapCanisterId,
  certified,
}: {
  identity: Identity;
  swapCanisterId: Principal;
  certified: boolean;
}): Promise<Ticket | undefined> => {
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
  amount_icp_e8s: E8s;
  subaccount?: Uint8Array;
}): Promise<Ticket> => {
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
}): Promise<Ticket | undefined> => {
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
}: {
  identity: Identity;
  rootCanisterId: Principal;
  buyer: Principal;
}): Promise<RefreshBuyerTokensResponse> => {
  logWithTimestamp(`[sale] notifyParticipation call...`);

  const { notifyParticipation: notifyParticipationApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  const response = await notifyParticipationApi({ buyer: buyer.toText() });

  logWithTimestamp(`[sale] notifyParticipation complete.`);

  return response;
};
