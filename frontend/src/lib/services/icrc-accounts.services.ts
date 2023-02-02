import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import type { Account } from "$lib/types/account";
import type { Identity } from "@dfinity/agent";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getIcrcAccountIdentity = (_: Account): Promise<Identity> => {
  // TODO: Support Hardware Wallets
  return getAuthenticatedIdentity();
};
