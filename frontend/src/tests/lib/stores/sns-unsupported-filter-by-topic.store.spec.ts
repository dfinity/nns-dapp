import { unsupportedFilterByTopicSnsesStore } from "$lib/stores/sns-unsupported-filter-by-topic.store";
import { get } from "svelte/store";

describe("unsupportedFilterByTopicSnsesStore", () => {
  it("should initialize with an empty Set", () => {
    const store = get(unsupportedFilterByTopicSnsesStore);

    expect(store.length).toBe(0);
  });

  it("should add canister IDs to the store", () => {
    const canisterId1 = "aaaaa-aa";
    const canisterId2 = "bbbbb-bb";

    unsupportedFilterByTopicSnsesStore.add(canisterId1);
    unsupportedFilterByTopicSnsesStore.add(canisterId2);

    const store = get(unsupportedFilterByTopicSnsesStore);

    expect(store.length).toBe(2);
    expect(store.includes(canisterId1)).toBe(true);
    expect(store.includes(canisterId2)).toBe(true);
  });

  it("should not add duplicate canister IDs", () => {
    const canisterId = "aaaaa-aa";

    unsupportedFilterByTopicSnsesStore.add(canisterId);
    unsupportedFilterByTopicSnsesStore.add(canisterId);

    const store = get(unsupportedFilterByTopicSnsesStore);

    expect(store.length).toBe(1);
    expect(store.includes(canisterId)).toBe(true);
  });

  it("should check if a canister ID exists in the store", () => {
    const canisterId = "aaaaa-aa";
    const nonExistentCanisterId = "bbbbb-bb";

    unsupportedFilterByTopicSnsesStore.add(canisterId);

    const store = get(unsupportedFilterByTopicSnsesStore);

    expect(store.includes(canisterId)).toBe(true);
    expect(store.includes(nonExistentCanisterId)).toBe(false);
  });

  it("should remove canister IDs from the store", () => {
    const canisterId1 = "aaaaa-aa";
    const canisterId2 = "bbbbb-bb";

    unsupportedFilterByTopicSnsesStore.add(canisterId1);
    unsupportedFilterByTopicSnsesStore.add(canisterId2);

    let store = get(unsupportedFilterByTopicSnsesStore);

    expect(store.length).toBe(2);

    unsupportedFilterByTopicSnsesStore.delete(canisterId1);

    store = get(unsupportedFilterByTopicSnsesStore);
    expect(store.length).toBe(1);
    expect(store.includes(canisterId1)).toBe(false);
    expect(store.includes(canisterId2)).toBe(true);
  });

  it("should do nothing when trying to remove a non-existent canister ID", () => {
    const canisterId = "aaaaa-aa";
    const nonExistentCanisterId = "bbbbb-bb";

    unsupportedFilterByTopicSnsesStore.add(canisterId);
    unsupportedFilterByTopicSnsesStore.delete(nonExistentCanisterId);

    const store = get(unsupportedFilterByTopicSnsesStore);

    expect(store.length).toBe(1);
    expect(store.includes(canisterId)).toBe(true);
  });
});
