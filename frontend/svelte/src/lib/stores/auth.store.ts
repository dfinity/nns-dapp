import { writable } from "svelte/store";
import { AuthClient } from "@dfinity/auth-client";
import type { Principal } from "@dfinity/principal";

export interface AuthStore {
  principal: Principal | undefined | null;
}

const identityProvider: string = process.env.IDENTITY_SERVICE_URL;

/**
 * A store to handle authentication and the principal of the user.
 *
 * - sync: query auth-client to get the status of the authentication
 * a. if authenticated only, set principal in the global state
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
    principal: undefined,
  });

  return {
    subscribe,

    sync: async () => {
      const authClient: AuthClient = await AuthClient.create();
      const isAuthenticated: boolean = await authClient.isAuthenticated();

      set({
        principal: isAuthenticated
          ? authClient.getIdentity().getPrincipal()
          : null,
      });
    },

    signIn: () =>
      new Promise<void>(async (resolve, reject) => {
        const authClient: AuthClient = await AuthClient.create();

        await authClient.login({
          identityProvider,
          maxTimeToLive: BigInt(30 * 60 * 1_000_000_000), // 30 minutes
          onSuccess: () => {
            update((state: AuthStore) => ({
              ...state,
              principal: authClient.getIdentity().getPrincipal(),
            }));

            resolve();
          },
          onError: reject,
        });
      }),

    signOut: async () => {
      const authClient: AuthClient = await AuthClient.create();

      await authClient.logout();

      update((state: AuthStore) => ({
        ...state,
        principal: null,
      }));
    },
  };
};

export const authStore = initAuthStore();
