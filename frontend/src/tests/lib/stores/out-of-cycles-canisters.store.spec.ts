import { outOfCyclesCanistersStore } from "$lib/stores/out-of-cycles-canisters.store";
import { get } from "svelte/store";

describe("out-of-cycles-canisters.store", () => {
  it("should initialize it empty", () => {
    expect(get(outOfCyclesCanistersStore)).toEqual([]);
  });

  it("should set error", () => {
    const canisterId = "canister-id";

    outOfCyclesCanistersStore.add(canisterId);

    expect(get(outOfCyclesCanistersStore)).toEqual([canisterId]);
  });

  it("should remove error", () => {
    const canisterId = "canister-id";

    outOfCyclesCanistersStore.add(canisterId);

    expect(get(outOfCyclesCanistersStore)).toEqual([canisterId]);

    outOfCyclesCanistersStore.delete(canisterId);

    expect(get(outOfCyclesCanistersStore)).toEqual([]);
  });
});
