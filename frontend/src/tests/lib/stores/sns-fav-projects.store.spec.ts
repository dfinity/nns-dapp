import { snsFavProjectsStore } from "$lib/stores/sns-fav-projects.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("sns-fav-projects-store", () => {
  describe("snsFavProjectsStore", () => {
    const projectA: Principal = principal(0);
    const projectB: Principal = principal(2);

    it("should set fav projects", () => {
      const rootCanisterIds = [projectA, projectB];
      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: undefined,
        certified: undefined,
      });

      snsFavProjectsStore.set({ rootCanisterIds, certified: true });

      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds,
        certified: true,
      });
    });

    it("should remove from fav projects", () => {
      snsFavProjectsStore.set({
        rootCanisterIds: [projectA, projectB],
        certified: true,
      });
      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: [projectA, projectB],
        certified: true,
      });

      snsFavProjectsStore.remove(projectA);
      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: [projectB],
        certified: true,
      });

      snsFavProjectsStore.remove(projectB);
      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: [],
        certified: true,
      });
    });

    it("should reset fav projects", () => {
      const favProjects = [projectA, projectB];
      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: undefined,
        certified: undefined,
      });

      snsFavProjectsStore.set({
        rootCanisterIds: favProjects,
        certified: true,
      });

      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: favProjects,
        certified: true,
      });
      snsFavProjectsStore.reset();

      expect(get(snsFavProjectsStore)).toEqual({
        rootCanisterIds: undefined,
        certified: undefined,
      });
    });
  });
});
