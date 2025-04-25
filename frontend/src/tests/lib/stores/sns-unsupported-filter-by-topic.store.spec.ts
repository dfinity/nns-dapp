import { unsupportedFilterByTopicCanistersStore } from "$lib/stores/sns-unsupported-filter-by-topic.store";
import { get } from "svelte/store";

describe("unsupportedFilterByTopicCanistersStore", () => {
  it("should initialize with an empty Set", () => {
    const store = get(unsupportedFilterByTopicCanistersStore);

    expect(store.length).toBe(0);
  });

  it("should add canister IDs to the store", () => {
    const canisterId1 = "aaaaa-aa";
    const canisterId2 = "bbbbb-bb";

    unsupportedFilterByTopicCanistersStore.add(canisterId1);
    unsupportedFilterByTopicCanistersStore.add(canisterId2);

    const store = get(unsupportedFilterByTopicCanistersStore);

    expect(store.length).toBe(2);
    expect(store.includes(canisterId1)).toBe(true);
    expect(store.includes(canisterId2)).toBe(true);
  });

  it("should not add duplicate canister IDs", () => {
    const canisterId = "aaaaa-aa";

    unsupportedFilterByTopicCanistersStore.add(canisterId);
    unsupportedFilterByTopicCanistersStore.add(canisterId);

    const store = get(unsupportedFilterByTopicCanistersStore);

    expect(store.length).toBe(1);
    expect(store.includes(canisterId)).toBe(true);
  });

  it("should check if a canister ID exists in the store", () => {
    const canisterId = "aaaaa-aa";
    const nonExistentCanisterId = "bbbbb-bb";

    unsupportedFilterByTopicCanistersStore.add(canisterId);

    const store = get(unsupportedFilterByTopicCanistersStore);

    expect(store.includes(canisterId)).toBe(true);
    expect(store.includes(nonExistentCanisterId)).toBe(false);
  });

  it("should remove canister IDs from the store", () => {
    const canisterId1 = "aaaaa-aa";
    const canisterId2 = "bbbbb-bb";

    unsupportedFilterByTopicCanistersStore.add(canisterId1);
    unsupportedFilterByTopicCanistersStore.add(canisterId2);

    let store = get(unsupportedFilterByTopicCanistersStore);

    expect(store.length).toBe(2);

    unsupportedFilterByTopicCanistersStore.delete(canisterId1);

    store = get(unsupportedFilterByTopicCanistersStore);
    expect(store.length).toBe(1);
    expect(store.includes(canisterId1)).toBe(false);
    expect(store.includes(canisterId2)).toBe(true);
  });

  it("should do nothing when trying to remove a non-existent canister ID", () => {
    const canisterId = "aaaaa-aa";
    const nonExistentCanisterId = "bbbbb-bb";

    unsupportedFilterByTopicCanistersStore.add(canisterId);
    unsupportedFilterByTopicCanistersStore.delete(nonExistentCanisterId);

    const store = get(unsupportedFilterByTopicCanistersStore);

    expect(store.length).toBe(1);
    expect(store.includes(canisterId)).toBe(true);
  });
});
