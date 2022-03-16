import type { Identity } from "@dfinity/agent";
import { LocalStorage } from "@dfinity/auth-client";
import type { LocalStorageAuth } from "../types/auth";

/**
 * The user is signed in when the identity is not undefined and not null.
 *
 * Note: we do not check if the principal of the identity is anonymous or not.
 * The authStore takes care of applying the correct value according the auth state.
 * It adds only an identity in memory if it is an authenticated one.
 */
export const isSignedIn = (identity: Identity | undefined | null): boolean =>
  identity !== undefined && identity !== null;

export const localStorageAuth = async (): Promise<LocalStorageAuth> => {
  const storage: LocalStorage = new LocalStorage("ic-");

  const identityKey: string | null = await storage.get("identity");
  const delegationChain: string | null = await storage.get("delegation");

  return {
    identityKey,
    delegationChain,
  };
};
