import type { Identity } from "@dfinity/agent";
import type { AuthClient } from "@dfinity/auth-client";
import { writable } from "svelte/store";
import {
  AUTH_SESSION_DURATION,
  IDENTITY_SERVICE_URL,
} from "../constants/identity.constants";
import { createAuthClient } from "../utils/auth.utils";

export interface AuthStore {
  identity: Identity | undefined | null;
}

// We have to keep the authClient object in memory because calling the `authClient.login` feature should be performed by a user interaction without any async callbacks call before calling `window.open` to open II
// @see agent-js issue [#618](https://github.com/dfinity/agent-js/pull/618)
let authClient: AuthClient | undefined;

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
const initAuthStore = () => {
  const { subscribe, set, update } = writable<AuthStore>({
    identity: undefined,
  });

  return {
    subscribe,

    sync: async () => {
      authClient = authClient ?? await createAuthClient();
      const isAuthenticated: boolean = await authClient.isAuthenticated();

      set({
        identity: isAuthenticated ? authClient.getIdentity() : null,
      });
    },

    signIn: () =>
      new Promise<void>((resolve, reject) => {
        // This is unlikely to happen because above `sync` function of the store is the main function that is called before any components of the UI is rendered
        // @see `Guard.svelte`
        if (authClient === undefined) {
          reject();
          return;
        }

        authClient?.login({
          identityProvider: IDENTITY_SERVICE_URL,
          maxTimeToLive: AUTH_SESSION_DURATION,
          onSuccess: () => {
            update((state: AuthStore) => ({
              ...state,
              identity: authClient?.getIdentity(),
            }));

            resolve();
          },
          onError: reject,
        });
      }),

    signOut: async () => {
      const client: AuthClient = authClient ?? await createAuthClient();

      await client.logout();

      update((state: AuthStore) => ({
        ...state,
        identity: null,
      }));
    },
  };
};

export const authStore = initAuthStore();
