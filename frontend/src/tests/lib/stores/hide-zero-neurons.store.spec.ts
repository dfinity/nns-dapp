import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { hideZeroNeuronsStore } from "$lib/stores/hide-zero-neurons.store";
import { get } from "svelte/store";

describe("hideZeroNeuronsStore", () => {
  it("should be initialized with the default value", () => {
    expect(get(hideZeroNeuronsStore)).toBe("hide");
  });

  it("should update value", () => {
    hideZeroNeuronsStore.set("show");
    expect(get(hideZeroNeuronsStore)).toBe("show");

    hideZeroNeuronsStore.set("hide");
    expect(get(hideZeroNeuronsStore)).toBe("hide");
  });

  it("should write to local storage", () => {
    expect(
      window.localStorage.getItem(StoreLocalStorageKey.HideZeroNeurons)
    ).toBeNull();

    hideZeroNeuronsStore.set("show");

    expect(
      window.localStorage.getItem(StoreLocalStorageKey.HideZeroNeurons)
    ).toEqual('"show"');
  });
});
