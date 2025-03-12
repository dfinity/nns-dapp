import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { hideZeroNeuronsStore } from "$lib/stores/hide-zero-neurons.store";
import { get } from "svelte/store";

describe("hideZeroNeuronsStore", () => {
  it("should be initialized with the default value", () => {
    expect(get(hideZeroNeuronsStore)).toBe("show");
  });

  it("should update value", () => {
    hideZeroNeuronsStore.set("hide");
    expect(get(hideZeroNeuronsStore)).toBe("hide");

    hideZeroNeuronsStore.set("show");
    expect(get(hideZeroNeuronsStore)).toBe("show");
  });

  it("should write to local storage", () => {
    expect(
      window.localStorage.getItem(StoreLocalStorageKey.HideZeroNeurons)
    ).toBeNull();

    hideZeroNeuronsStore.set("hide");

    expect(
      window.localStorage.getItem(StoreLocalStorageKey.HideZeroNeurons)
    ).toEqual('"hide"');
  });
});
