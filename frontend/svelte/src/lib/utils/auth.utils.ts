import type { Identity } from "@dfinity/agent";
import type { AuthClient } from "@dfinity/auth-client";
import { DelegationIdentity, SignedDelegation } from "@dfinity/identity";
import { MILLISECONDS_IN_MINUTE } from "../constants/constants";

/**
 * The user is signed in when the identity is not undefined and not null.
 *
 * Note: we do not check if the principal of the identity is anonymous or not.
 * The authStore takes care of applying the correct value according the auth state.
 * It adds only an identity in memory if it is an authenticated one.
 */
export const isSignedIn = (identity: Identity | undefined | null): boolean =>
  identity !== undefined && identity !== null;

export const getTimeUntilSessionExpiryMs = (
  identity: Identity
): number | undefined => {
  if (identity instanceof DelegationIdentity) {
    const expiryDateTimestampMs = Number(
      identity
        .getDelegation()
        .delegations.map(
          (signedDelegation: SignedDelegation) =>
            signedDelegation.delegation.expiration
        )
        .reduce((current: bigint, next: bigint) =>
          next < current ? next : current
        ) / BigInt(1_000_000)
    );

    return expiryDateTimestampMs - Date.now();
  }
  return;
};

export const tryGetIdentity = (client: AuthClient): Identity | undefined => {
  const identity = client.getIdentity();
  if (identity.getPrincipal().isAnonymous()) {
    return undefined;
  }

  const timeUntilSessionExpiryMs = getTimeUntilSessionExpiryMs(identity);
  if (timeUntilSessionExpiryMs !== undefined) {
    // If the identity will expire in less than 5 minutes, don't return the identity
    const durationUntilLogout =
      timeUntilSessionExpiryMs - MILLISECONDS_IN_MINUTE;
    if (durationUntilLogout <= 5 * MILLISECONDS_IN_MINUTE) {
      return undefined;
    }
  }

  return identity;
};
