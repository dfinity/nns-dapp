import { get } from "svelte/store";
import { canistersStore } from "../../../lib/stores/canisters.store";
import { mockCanisters } from "../../mocks/canisters.mock";

describe("canisters-store", () => {
  it("should set canisters", () => {
    canistersStore.setCanisters(mockCanisters);

    const canisters = get(canistersStore);
    expect(canisters).toEqual(mockCanisters);
  });

  it("should reset canisters", () => {
    canistersStore.setCanisters(mockCanisters);
    canistersStore.setCanisters([]);

    const canisters = get(canistersStore);
    expect(canisters).toEqual([]);
  });
});
