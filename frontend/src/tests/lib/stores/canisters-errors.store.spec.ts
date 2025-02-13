import { canistersErrorsStore } from "$lib/stores/canisters-errors.store";
import { get } from "svelte/store";

describe("canisters-errors.store", () => {
  it("should initialize it empty", () => {
    expect(get(canistersErrorsStore)).toEqual({});
  });

  it("should set error", () => {
    const canisterId = "canister-id";
    const error = "something went wrong";

    canistersErrorsStore.set({ canisterId, rawError: error });

    expect(get(canistersErrorsStore)).toEqual({
      [canisterId]: {
        raw: error,
      },
    });
  });

  it("should remove error", () => {
    const canisterId = "canister-id";
    const anotherCanisterId = "another-canister-id";
    const error = "something went wrong";

    canistersErrorsStore.set({ canisterId, rawError: error });
    canistersErrorsStore.set({
      canisterId: anotherCanisterId,
      rawError: error,
    });

    expect(get(canistersErrorsStore)).toEqual({
      [canisterId]: {
        raw: error,
      },
      [anotherCanisterId]: {
        raw: error,
      },
    });

    canistersErrorsStore.delete(anotherCanisterId);

    expect(get(canistersErrorsStore)).toEqual({
      [canisterId]: {
        raw: error,
      },
    });
  });
});
