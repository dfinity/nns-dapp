import type { Subscriber } from "svelte/store";
import type { AuthStore } from "../../lib/stores/auth.store";
import type { Principal } from "@dfinity/principal";

class MockPrincipal {
  toText() {
    return "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe";
  }
}

export const mockPrincipal = new MockPrincipal();

/**
 * A static mock of the auth store. The component that uses it will be rendered for test with a value that is already defined on mount.
 */
export const mockAuthStoreSubscribe = (
  run: Subscriber<AuthStore>
): (() => void) => {
  run({ signedIn: true, principal: mockPrincipal as Principal });

  return () => {};
};

/**
 * A dynamic mock of the auth store. The component that uses it will be rendered for test with an undefined value on mount.
 * Within the test suite, the mock can then be used to trigger state changes to simulate re-render.
 */

export class AuthStoreMock {
  private _store: AuthStore = { signedIn: undefined, principal: undefined };

  private _callback: (store: AuthStore) => void;

  subscribe(callback: (store: AuthStore) => void) {
    this._callback = callback;
    this.emit();
  }

  next(store: AuthStore) {
    this._store = { ...store };
    this.emit();
  }

  private emit() {
    this._callback?.(this._store);
  }
}

export const authStoreMock = new AuthStoreMock();

export const mutableMockAuthStoreSubscribe = (
  run: Subscriber<AuthStore>
): (() => void) => {
  authStoreMock.subscribe((store: AuthStore) => run(store));

  return () => {};
};
