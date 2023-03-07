import { canistersStore } from "$lib/stores/canisters.store";
import { mockCanisters } from "$tests/mocks/canisters.mock";
import { get } from "svelte/store";

describe("canisters-store", () => {
  describe("canistersStore", () => {
    it("should set canisters", () => {
      canistersStore.setCanisters({
        canisters: mockCanisters,
        certified: true,
      });

      const store = get(canistersStore);
      expect(store.canisters).toEqual(mockCanisters);
    });

    it("should reset canisters", () => {
      canistersStore.setCanisters({
        canisters: mockCanisters,
        certified: true,
      });
      canistersStore.setCanisters({ canisters: undefined, certified: true });

      const store = get(canistersStore);
      expect(store.canisters).toBeUndefined();
    });
  });
});
