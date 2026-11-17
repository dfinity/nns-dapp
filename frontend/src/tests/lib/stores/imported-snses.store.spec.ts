import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { importedSnsesStore } from "$lib/stores/imported-snses.store";
import { get } from "svelte/store";

describe("importedSnsesStore", () => {
  const rootCanisterId1 = "zxeu2-7aaaa-aaaaq-aaafa-cai";
  const rootCanisterId2 = "3e3x2-xyaaa-aaaaq-aaalq-cai";

  beforeEach(() => {
    importedSnsesStore.resetForTesting();
  });

  it("should be initialized with an empty list", () => {
    expect(get(importedSnsesStore)).toEqual([]);
  });

  it("should add root canister IDs in order", () => {
    importedSnsesStore.add(rootCanisterId1);
    importedSnsesStore.add(rootCanisterId2);

    expect(get(importedSnsesStore)).toEqual([rootCanisterId1, rootCanisterId2]);
  });

  it("should not add the same root canister ID twice", () => {
    importedSnsesStore.add(rootCanisterId1);
    importedSnsesStore.add(rootCanisterId1);

    expect(get(importedSnsesStore)).toEqual([rootCanisterId1]);
  });

  it("should remove a root canister ID", () => {
    importedSnsesStore.add(rootCanisterId1);
    importedSnsesStore.add(rootCanisterId2);

    importedSnsesStore.remove(rootCanisterId1);

    expect(get(importedSnsesStore)).toEqual([rootCanisterId2]);
  });

  it("should write to local storage", () => {
    importedSnsesStore.add(rootCanisterId1);

    expect(
      window.localStorage.getItem(StoreLocalStorageKey.ImportedSnses)
    ).toEqual(JSON.stringify([rootCanisterId1]));
  });
});
