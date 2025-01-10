import { authStore, type AuthStoreData } from "$lib/stores/auth.store";
import type { Identity, SignIdentity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import en from "$tests/mocks/i18n.mock";

export const mockPrincipalText =
  "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe";

export const mockPrincipal = Principal.fromText(mockPrincipalText);

const transformRequest = () => {
  console.error(
    "It looks like the agent is trying to make a request that should have been mocked at",
    new Error().stack
  );
  throw new Error("Not implemented");
};

export const mockIdentity = {
  getPrincipal: () => mockPrincipal,
  transformRequest,
} as unknown as Identity;

export const createMockIdentity = (p: number) => {
  const principal = Principal.fromHex(p.toString(16));
  return {
    getPrincipal: () => principal,
    transformRequest,
  } as Identity;
};

export const mockSignInIdentity = {
  getPrincipal: () => mockPrincipal,
  transformRequest,
} as unknown as SignIdentity;

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
