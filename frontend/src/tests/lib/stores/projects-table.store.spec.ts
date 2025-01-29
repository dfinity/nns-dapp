import { projectsTableOrderStore } from "$lib/stores/projects-table.store";
import { get } from "svelte/store";

describe("projects-table.store", () => {
  describe("projectsTableOrderStore", () => {
    it("should have an initial value", () => {
      expect(get(projectsTableOrderStore)).toEqual([
        {
          columnId: "stake",
        },
        {
          columnId: "title",
        },
      ]);
    });

    it("should set", () => {
      projectsTableOrderStore.set([
        {
          columnId: "title",
        },
      ]);

      expect(get(projectsTableOrderStore)).toEqual([
        {
          columnId: "title",
        },
      ]);
    });
  });
});
