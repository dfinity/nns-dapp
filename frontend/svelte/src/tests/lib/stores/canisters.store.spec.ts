import { get } from "svelte/store";
import { canistersStore } from "../../../lib/stores/canisters.store";
import { mockCanisters } from "../../mocks/canisters.mock";

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
