import type { Identity } from "@dfinity/agent";

/**
 * The user is signed in when the identity is not undefined and not null.
 *
 * Note: we do not check if the principal of the identity is anonymous or not.
 * The authStore takes care of applying the correct value according the auth state.
 * It adds only an identity in memory if it is an authenticated one.
 */
export const isSignedIn = (identity: Identity | undefined | null): boolean =>
  identity !== undefined && identity !== null;
