import { authStore, type AuthStoreData } from "$lib/stores/auth.store";
import type { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";
import { get } from "svelte/store";
import en from "./i18n.mock";

export const mockPrincipalText =
  "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe";

export const mockPrincipal = Principal.fromText(mockPrincipalText);

export const mockIdentity = {
  getPrincipal: () => mockPrincipal,
} as unknown as Identity;

export const createMockIdentity = (p: number) => {
  const principal = Principal.fromHex(p.toString(16));
  return {
    getPrincipal: () => principal,
  } as Identity;
};

export const mockIdentityErrorMsg = en.error.missing_identity;

export const setNoIdentity = () => authStore.setForTesting(null);
export const resetIdentity = () => authStore.setForTesting(mockIdentity);

export const mockGetIdentity = async () => {
  const identity = get(authStore).identity;
  if (!identity) {
    throw new Error(mockIdentityErrorMsg);
  }

  return identity;
};

/**
 * A static mock of the auth store. The component that uses it will be rendered for test with a value that is already defined on mount.
 */
export const mockAuthStoreSubscribe = (
  run: Subscriber<AuthStoreData>
): (() => void) => {
  run({ identity: mockIdentity });

  return () => undefined;
};

export const mockAuthStoreNoIdentitySubscribe = (
  run: Subscriber<AuthStoreData>
): (() => void) => {
  run({ identity: undefined });

  return () => undefined;
};

/**
 * A dynamic mock of the auth store. The component that uses it will be rendered for test with an undefined value on mount.
 * Within the test suite, the mock can then be used to trigger state changes to simulate re-render.
 */

export class AuthStoreMock {
  private _store: AuthStoreData = { identity: undefined };

  private _callback: (store: AuthStoreData) => void;

  subscribe(callback: (store: AuthStoreData) => void) {
    this._callback = callback;
    this.emit();
  }

  next(store: AuthStoreData) {
    this._store = { ...store };
    this.emit();
  }

  private emit() {
    this._callback?.(this._store);
  }
}

export const authStoreMock = new AuthStoreMock();

export const mutableMockAuthStoreSubscribe = (
  run: Subscriber<AuthStoreData>
): (() => void) => {
  authStoreMock.subscribe((store: AuthStoreData) => run(store));

  return () => undefined;
};
