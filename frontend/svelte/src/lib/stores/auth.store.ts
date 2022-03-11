import type { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { writable } from "svelte/store";
import { MILLISECONDS_IN_MINUTE } from "../constants/constants";
import { identityServiceURL } from "../constants/identity.constants";
import {
  getTimeUntilSessionExpiryMs,
  tryGetIdentity,
} from "../utils/auth.utils";

export interface AuthStore {
  identity: Identity | undefined | null;
}

/**
 * A store to handle authentication and the identity of the user.
 *
 * - sync: query auth-client to get the status of the authentication
 * a. if authenticated only, set identity in the global state
 * b. if not authenticated, set null in store
 *
 * the sync function is performed when the app boots and on any change in the local storage (see <Guard/>)
 *
 * note: auth-client is initialized with an anonymous principal. By querying "isAuthenticated", the library checks for a valid chain and also that the principal is not anonymous.
 *
 * - signIn: log in method flow. started with a user interaction ("click on a button")
 *
 * - signOut: call auth-client log out and set null in the store. started with a user interaction ("click on a button")
 *
 * note: clearing the local storage does not happen in the state management but afterwards in its caller function (see <Logout/>)
 *
 */
const initAuthStore = () => {
  const { subscribe, set, update } = writable<AuthStore>({
    identity: undefined,
  });

  // Source of type: https://stackoverflow.com/a/51040768
  let expireSessionTimeout: ReturnType<typeof setTimeout> | undefined;
  const signOut = async () => {
    const authClient: AuthClient = await AuthClient.create();
    if (expireSessionTimeout !== undefined) {
      clearInterval(expireSessionTimeout);
    }
    await authClient.logout();

    update((state: AuthStore) => ({
      ...state,
      identity: null,
    }));
  };

  const setLogoutOnExpirationTimeout = (identity: Identity) => {
    const durationUntilSessionExpiresMs = getTimeUntilSessionExpiryMs(identity);
    if (
      durationUntilSessionExpiresMs !== undefined &&
      durationUntilSessionExpiresMs > MILLISECONDS_IN_MINUTE
    ) {
      // Log the user out 1 minute before their session expires
      expireSessionTimeout = setTimeout(
        signOut,
        durationUntilSessionExpiresMs - MILLISECONDS_IN_MINUTE
      );
    } else {
      signOut();
    }
  };

  return {
    subscribe,

    sync: async () => {
      const authClient: AuthClient = await AuthClient.create();
      const isAuthenticated: boolean = await authClient.isAuthenticated();
      if (!isAuthenticated) {
        set({
          identity: null,
        });
      } else {
        const identity = tryGetIdentity(authClient);
        if (identity === undefined) {
          set({
            identity: null,
          });
        } else {
          setLogoutOnExpirationTimeout(identity);
          set({
            identity,
          });
        }
      }
    },

    signIn: () =>
      new Promise<void>((resolve, reject) => {
        AuthClient.create().then((authClient: AuthClient) => {
          authClient.login({
            identityProvider: identityServiceURL,
            maxTimeToLive: BigInt(30 * 60 * 1_000_000_000), // 30 minutes
            onSuccess: () => {
              const identity = tryGetIdentity(authClient);
              if (identity) {
                setLogoutOnExpirationTimeout(identity);
                update((state: AuthStore) => ({
                  ...state,
                  identity,
                }));
              }
              resolve();
            },
            onError: reject,
          });
        });
      }),

    signOut,
  };
};

export const authStore = initAuthStore();
