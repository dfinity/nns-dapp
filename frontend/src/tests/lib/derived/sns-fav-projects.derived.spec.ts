import { snsFavProjectsToggleVisibleStore } from "$lib/derived/sns-fav-projects.derived";
import { snsFavProjectsStore } from "$lib/stores/sns-fav-projects.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("sns-fav-projects.derived", () => {
  describe("snsFavProjectsToggleVisibleStore", () => {
    it("should be false when fav projects are not loaded", () => {
      snsFavProjectsStore.set({
        rootCanisterIds: undefined,
        certified: undefined,
      });

      expect(get(snsFavProjectsToggleVisibleStore)).toBe(false);
    });

    it("should be false when no fav projects", () => {
      snsFavProjectsStore.set({
        rootCanisterIds: [],
        certified: true,
      });

      expect(get(snsFavProjectsToggleVisibleStore)).toBe(false);
    });

    it("should be true when 1 fav project is loaded", () => {
      snsFavProjectsStore.set({
        rootCanisterIds: [principal(0)],
        certified: true,
      });

      expect(get(snsFavProjectsToggleVisibleStore)).toBe(true);
    });

    it("should be true when multiple fav projects are loaded", () => {
      snsFavProjectsStore.set({
        rootCanisterIds: [principal(0), principal(1), principal(2)],
        certified: true,
      });

      expect(get(snsFavProjectsToggleVisibleStore)).toBe(true);
    });
  });
});
