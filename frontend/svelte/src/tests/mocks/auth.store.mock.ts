import type { Subscriber } from "svelte/store";
import type { AuthStore } from "../../lib/stores/auth.store";
import type { Principal } from "@dfinity/principal";

class MockPrincipal {
  toText() {
    return "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe";
  }
}

export const mockPrincipal = new MockPrincipal();

export const mockAuthStoreSubscribe = (
  run: Subscriber<AuthStore>
): (() => void) => {
  run({ signedIn: true, principal: mockPrincipal as Principal });

  return () => {};
};
