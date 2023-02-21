import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { Ticket } from "@dfinity/sns/dist/candid/sns_swap";
import type { E8s } from "@dfinity/sns/dist/types/types/common";
import { fromNullable } from "@dfinity/utils";
import { wrapper } from "./sns-wrapper.api";

export const getOpenTicket = async ({
  identity,
  rootCanisterId,
  certified,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<Ticket | undefined> => {
  logWithTimestamp(`[sale] getOpenTicket call...`);

  const { getOpenTicket } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const response = await getOpenTicket({});

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

  const response = await notifyPaymentFailure();
  const ticket = fromNullable(response?.ticket);

  logWithTimestamp(`[sale] notifyPaymentFailure complete.`);

  return ticket;
};
