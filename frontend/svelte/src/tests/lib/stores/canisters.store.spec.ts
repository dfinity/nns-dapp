import { get } from "svelte/store";
import { canistersStore } from "../../../lib/stores/canisters.store";
import { mockCanisters } from "../../mocks/canisters.mock";

describe("canisters-store", () => {
  it("should set canisters", () => {
    canistersStore.setCanisters({ canisters: mockCanisters, certified: true });

    const store = get(canistersStore);
    expect(store.canisters).toEqual(mockCanisters);
  });

  it("should reset canisters", () => {
    canistersStore.setCanisters({ canisters: mockCanisters, certified: true });
    canistersStore.setCanisters({ canisters: [], certified: true });

    const store = get(canistersStore);
    expect(store.canisters).toEqual([]);
  });
});
