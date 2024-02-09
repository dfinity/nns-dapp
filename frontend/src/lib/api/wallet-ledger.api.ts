import { queryIcrcToken } from "$lib/api/icrc-ledger.api";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

/**
 * TODO: replace with icrc-index queryIcrcToken once Sns migrated to icrcStore
 */
export const getToken = async (params: {
  identity: Identity;
  certified: boolean;
  canisterId: Principal;
}): Promise<IcrcTokenMetadata> => {
  logWithTimestamp("Getting ckBTC token: call...");

  const token = await queryIcrcToken(params);

  logWithTimestamp("Getting ckBTC token: done");

  return token;
};
