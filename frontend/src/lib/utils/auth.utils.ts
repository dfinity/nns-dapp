import type { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";

/**
 * The user is signed in when the identity is not undefined and not null.
 *
 * Note: we do not check if the principal of the identity is anonymous or not.
 * The authStore takes care of applying the correct value according the auth state.
 * It adds only an identity in memory if it is an authenticated one.
 */
export const isSignedIn = (identity: Identity | undefined | null): boolean =>
  identity !== undefined && identity !== null;

/**
 * Create an AuthClient to manage authentication and identity.
 * - Session duration is 30min (AUTH_SESSION_DURATION).
 * - Disable idle manager that sign-out in case of inactivity after default 10min to avoid UX issues if multiple tabs are used as we observe the storage and sync the delegation on any changes
 */
export const createAuthClient = (): Promise<AuthClient> =>
  AuthClient.create({
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    },
  });
