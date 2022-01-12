import type { Subscriber } from "svelte/store";
import type { AuthStore } from "../../lib/stores/auth.store";
import type { Principal } from "@dfinity/principal";

class MockPrincipal {
  toText() {
    return "principal_id";
  }
}

export const mockPrincipal = new MockPrincipal();

export const mockAuthStoreSubscribe = (
  run: Subscriber<AuthStore>
): (() => void) => {
  run({ signedIn: true, principal: mockPrincipal as Principal });

  return () => {};
};
