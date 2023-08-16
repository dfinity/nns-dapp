import {
  getOrCreateLifecycleStore,
  resetLiefcycleStoresForTesting,
} from "$lib/stores/sns-lifecycle.store";
import {
  mockLifecycleResponse,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("sns lifecycle store", () => {
  beforeEach(() => {
    resetLiefcycleStoresForTesting();
  });

  it("should create a store for a given root canister id and store lifecycle", () => {
    const rootCanisterId = principal(0);
    const store = getOrCreateLifecycleStore(rootCanisterId);

    store.setData({
      certified: true,
      data: mockLifecycleResponse,
    });

    expect(get(store).data).toEqual(mockLifecycleResponse);
  });

  it("should cache stores per root canister id", () => {
    const rootCanisterId = principal(0);
    const store = getOrCreateLifecycleStore(rootCanisterId);

    const store2 = getOrCreateLifecycleStore(rootCanisterId);
    expect(store).toBe(store2);
  });

  it("should not cache stores for different root canister id", () => {
    const store = getOrCreateLifecycleStore(principal(0));

    const store2 = getOrCreateLifecycleStore(principal(1));
    expect(store).not.toBe(store2);
  });
});
