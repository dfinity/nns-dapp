import type { Principal } from "@dfinity/principal";

/**
 * The user is signed in when the principal is not undefined and not null.
 *
 * Note: we do not check if the principal is anonymous or not.
 * The authStore takes care of applying the correct value according the auth state.
 * It adds only a principal in memory if it is an authenticated one.
 */
export const isSignedIn = (principal: Principal | undefined | null): boolean =>
  principal !== undefined && principal !== null;
