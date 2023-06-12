import type { Identity } from "@dfinity/agent";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export interface AuthStoreData {
  identity: Identity | undefined | null;
}

/**
 * A store to store the identity of the user.
 *
 * The flows are managed in the auth services.
 */
export interface AuthStore extends Readable<AuthStoreData> {
  setIdentity: (identity: Identity | undefined | null) => void;
  setNoIdentity: () => void;
}

const initAuthStore = (): AuthStore => {
  const { subscribe, update } = writable<AuthStoreData>({
    identity: undefined,
  });

  return {
    subscribe,

    setIdentity: (identity: Identity | undefined | null) => {
      update((state: AuthStoreData) => ({
        ...state,
        identity,
      }));
    },

    setNoIdentity: () => {
      update((state: AuthStoreData) => ({
        ...state,
        identity: null,
      }));
    },
  };
};

export const authStore = initAuthStore();

export const authRemainingTimeStore = writable<number | undefined>(undefined);
