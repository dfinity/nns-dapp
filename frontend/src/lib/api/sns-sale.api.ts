import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { GetOpenTicketResponse } from "@dfinity/sns/dist/candid/sns_swap";
import type { E8s } from "@dfinity/sns/dist/types/types/common";
import { wrapper } from "./sns-wrapper.api";

export const getOpenTicket = async ({
  identity,
  rootCanisterId,
  withTicket,
  certified,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  withTicket?: boolean;
  certified: boolean;
}): Promise<GetOpenTicketResponse> => {
  logWithTimestamp(`getOpenTicket call...`);

  const { getOpenTicket } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const response = await getOpenTicket({ withTicket });

  logWithTimestamp(`getOpenTicket complete.`);

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
}) => {
  logWithTimestamp(`newSaleTicket call...`);

  const { newSaleTicket } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  const response = await newSaleTicket({ subaccount, amount_icp_e8s });

  logWithTimestamp(`newSaleTicket complete.`);

  return response;
};
