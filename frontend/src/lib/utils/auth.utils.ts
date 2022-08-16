import type { Identity } from "@dfinity/agent";
import { clear, createStore, get } from "idb-keyval";

/**
 * The user is signed in when the identity is not undefined and not null.
 *
 * Note: we do not check if the principal of the identity is anonymous or not.
 * The authStore takes care of applying the correct value according the auth state.
 * It adds only an identity in memory if it is an authenticated one.
 */
export const isSignedIn = (identity: Identity | undefined | null): boolean =>
  identity !== undefined && identity !== null;

const customStore = createStore("auth-client-db", "ic-keyval");

export const getIdbAuthKey = <T>(key: string): Promise<T | undefined> =>
  get<T>(key, customStore);

export const clearIdbAuthKeys = async () => clear(customStore);
