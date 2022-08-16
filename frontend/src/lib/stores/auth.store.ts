import type { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { writable } from "svelte/store";
import {
  AUTH_SESSION_DURATION,
  IDENTITY_SERVICE_URL,
} from "../constants/identity.constants";

export interface AuthStore {
  identity: Identity | undefined | null;
}

/**
 * Create an AuthClient to manage authentication and identity.
 * - Session duration is 30min (AUTH_SESSION_DURATION).
 * - Disable idle manager that sign-out in case of inactivity after default 10min to avoid UX issues if multiple tabs are used as we observe the storage and sync the delegation on any changes
 */
const createAuthClient = (): Promise<AuthClient> =>
  AuthClient.create({
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    },
  });

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
      const authClient: AuthClient = await createAuthClient();
      const isAuthenticated: boolean = await authClient.isAuthenticated();

      set({
        identity: isAuthenticated ? authClient.getIdentity() : null,
      });
    },

    signIn: () =>
      new Promise<void>((resolve, reject) => {
        createAuthClient().then((authClient: AuthClient) => {
          authClient.login({
            identityProvider: IDENTITY_SERVICE_URL,
            maxTimeToLive: AUTH_SESSION_DURATION,
            onSuccess: () => {
              update((state: AuthStore) => ({
                ...state,
                identity: authClient.getIdentity(),
              }));

              resolve();
            },
            onError: reject,
          });
        });
      }),

    signOut: async () => {
      const authClient: AuthClient = await createAuthClient();

      await authClient.logout();

      update((state: AuthStore) => ({
        ...state,
        identity: null,
      }));
    },
  };
};

export const authStore = initAuthStore();
