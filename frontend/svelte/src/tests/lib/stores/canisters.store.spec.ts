import { get } from "svelte/store";
import { canistersStore } from "../../../lib/stores/canisters.store";
import { mockCanisters } from "../../mocks/canisters.mock";

describe("proposals", () => {
  it("should set canisters", () => {
    canistersStore.setCanisters(mockCanisters);

    const proposals = get(canistersStore);
    expect(proposals).toEqual(mockCanisters);
  });

  it("should reset proposals", () => {
    canistersStore.setCanisters(mockCanisters);
    canistersStore.setCanisters([]);

    const proposals = get(canistersStore);
    expect(proposals).toEqual([]);
  });
});
