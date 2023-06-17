import { resetAgents } from "$lib/api/agent.api";
import {
  AUTH_SESSION_DURATION,
  IDENTITY_SERVICE_URL,
  OLD_MAINNET_IDENTITY_SERVICE_URL,
} from "$lib/constants/identity.constants";
import { IS_TEST_ENV } from "$lib/constants/mockable.constants";
import { NNS_IC_APP_DERIVATION_ORIGIN } from "$lib/constants/origin.constants";
import { createAuthClient } from "$lib/utils/auth.utils";
import { isNnsAlternativeOrigin } from "$lib/utils/env.utils";
import type { Identity } from "@dfinity/agent";
import type { AuthClient } from "@dfinity/auth-client";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export interface AuthStoreData {
  identity: Identity | undefined | null;
}

// We have to keep the authClient object in memory because calling the `authClient.login` feature should be triggered by a user interaction without any async callbacks call before calling `window.open` to open II
// @see agent-js issue [#618](https://github.com/dfinity/agent-js/pull/618)
let authClient: AuthClient | undefined | null;

const getIdentityProvider = () => {
  // If we are in mainnet in the old domain, we use the old identity provider.
  if (location.host === "nns.ic0.app") {
    return OLD_MAINNET_IDENTITY_SERVICE_URL;
  }

  return IDENTITY_SERVICE_URL;
};

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
 * note: clearing idb auth keys does not happen in the state management but afterwards in its caller function (see <Logout/>)
 *
 */
export interface AuthStore extends Readable<AuthStoreData> {
  sync: () => Promise<void>;
  setForTesting: (identity: Identity) => void;
  signIn: (onError: (error?: string) => void) => Promise<void>;
  signOut: () => Promise<void>;
}

const initAuthStore = (): AuthStore => {
  const { subscribe, set, update } = writable<AuthStoreData>({
    identity: undefined,
  });

  return {
    subscribe,

    setForTesting: (identity: Identity | undefined | null) => {
      if (!IS_TEST_ENV) {
        throw new Error(
          "This function should only be used in test environment"
        );
      }

      set({ identity });
    },

    sync: async () => {
      authClient = authClient ?? (await createAuthClient());
      const isAuthenticated = await authClient.isAuthenticated();

      set({
        identity: isAuthenticated ? authClient.getIdentity() : null,
      });
    },

    signIn: async (onError: (error?: string) => void) => {
      authClient = authClient ?? (await createAuthClient());

      await authClient?.login({
        identityProvider: getIdentityProvider(),
        ...(isNnsAlternativeOrigin() && {
          derivationOrigin: NNS_IC_APP_DERIVATION_ORIGIN,
        }),
        maxTimeToLive: AUTH_SESSION_DURATION,
        onSuccess: () => {
          update((state: AuthStoreData) => ({
            ...state,
            identity: authClient?.getIdentity(),
          }));
        },
        onError,
      });
    },

    signOut: async () => {
      const client: AuthClient = authClient ?? (await createAuthClient());

      await client.logout();

      resetAgents();

      // We currently do not have issue because the all screen is reloaded after sign-out.
      // But, if we wouldn't, then agent-js auth client would not be able to process next sign-in if object would be still in memory with previous partial information. That's why we reset it.
      // This fix a "sign in -> sign out -> sign in again" flow without window reload.
      authClient = null;

      update((state: AuthStoreData) => ({
        ...state,
        identity: null,
      }));
    },
  };
};

export const authStore = initAuthStore();

export const authRemainingTimeStore = writable<number | undefined>(undefined);
