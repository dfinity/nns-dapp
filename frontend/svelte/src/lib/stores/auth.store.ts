import { writable } from "svelte/store";
import { AuthClient } from "@dfinity/auth-client";
import type { Principal } from "@dfinity/principal";

export interface AuthStore {
  signedIn: boolean | undefined;
  principal: Principal | undefined;
}

const identityProvider: string = process.env.IDENTITY_SERVICE_URL;

// TODO(L2-178): refactor and comment auth store

export const initAuthStore = () => {
  const { subscribe, set, update } = writable<AuthStore>({
    signedIn: undefined,
    principal: undefined,
  });

  return {
    subscribe,

    init: async () => {
      const authClient: AuthClient = await AuthClient.create();

      set({
        signedIn: await authClient.isAuthenticated(),
        principal: authClient.getIdentity().getPrincipal(),
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
              signedIn: true,
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
        signedIn: false,
        principal: undefined,
      }));
    },
  };
};

export const authStore = initAuthStore();
