import {
  getOrCreateDerivedStateStore,
  resetDerivedStateStoresForTesting,
} from "$lib/stores/sns-derived-state.store";
import { mockDerivedResponse, principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("sns derived state store", () => {
  beforeEach(() => {
    resetDerivedStateStoresForTesting();
  });

  it("should create a store for a given root canister id and store derived state", () => {
    const rootCanisterId = principal(0);
    const store = getOrCreateDerivedStateStore(rootCanisterId);

    store.setDerivedState({
      certified: true,
      derivedState: mockDerivedResponse,
    });

    expect(get(store).derivedState).toEqual(mockDerivedResponse);
  });

  it("should cache stores per root canister id", () => {
    const rootCanisterId = principal(0);
    const store = getOrCreateDerivedStateStore(rootCanisterId);

    const store2 = getOrCreateDerivedStateStore(rootCanisterId);
    expect(store).toBe(store2);
  });

  it("should not cache stores for different root canister id", () => {
    const store = getOrCreateDerivedStateStore(principal(0));

    const store2 = getOrCreateDerivedStateStore(principal(1));
    expect(store).not.toBe(store2);
  });
});
