import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { snsFavProjectsVisibilityStore } from "$lib/stores/sns-fav-projects-visibility.store";
import { get } from "svelte/store";

describe("snsFavProjectsVisibilityStore", () => {
  it("should be initialized with the default value", () => {
    expect(get(snsFavProjectsVisibilityStore)).toBe("all");
  });

  it("should update value", () => {
    snsFavProjectsVisibilityStore.set("fav");
    expect(get(snsFavProjectsVisibilityStore)).toBe("fav");

    snsFavProjectsVisibilityStore.set("all");
    expect(get(snsFavProjectsVisibilityStore)).toBe("all");
  });

  it("should write to local storage", () => {
    snsFavProjectsVisibilityStore.set("fav");

    expect(
      window.localStorage.getItem(StoreLocalStorageKey.SnsFavProjectsOnly)
    ).toEqual('"fav"');
  });
});
