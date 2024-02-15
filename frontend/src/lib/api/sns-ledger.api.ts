import {
  executeIcrcTransfer as transferIcrcApi,
  type IcrcTransferParams,
} from "$lib/api/icrc-ledger.api";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcBlockIndex } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import { wrapper } from "./sns-wrapper.api";

export const snsTransfer = async ({
  identity,
  rootCanisterId,
  ...rest
}: {
  identity: Identity;
  rootCanisterId: Principal;
} & IcrcTransferParams): Promise<IcrcBlockIndex> => {
  logWithTimestamp("Getting Sns transfer: call...");

  const { transfer: transferApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  const blockIndex = await transferIcrcApi({
    ...rest,
    transfer: transferApi,
  });

  logWithTimestamp("Getting Sns transfer: done");

  return blockIndex;
};
