import {
  snsProjectsActivePadStore,
  snsProjectsAdoptedStore,
  snsProjectsCommittedStore,
  snsProjectsRecordStore,
  snsProjectsStore,
} from "$lib/derived/sns/sns-projects.derived";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("projects.derived", () => {
  beforeEach(() => {
    resetSnsProjects();
  });

  describe("projectsDerived", () => {
    it("should set projects of all statuses", () => {
      setSnsProjects([
        { lifecycle: SnsSwapLifecycle.Open },
        { lifecycle: SnsSwapLifecycle.Committed },
      ]);
      const projects = get(snsProjectsStore);
      expect(projects).toHaveLength(2);
    });
  });

  describe("snsProjectsRecordStore", () => {
    it("should have projects keyed by root canister id", () => {
      setSnsProjects([
        { lifecycle: SnsSwapLifecycle.Open },
        { lifecycle: SnsSwapLifecycle.Committed },
      ]);
      const projects = get(snsProjectsStore);
      const projectsRecord = get(snsProjectsRecordStore);
      expect(projectsRecord).toEqual({
        [projects[0].rootCanisterId.toText()]: projects[0],
        [projects[1].rootCanisterId.toText()]: projects[1],
      });
    });
  });

  describe("filter projects derived", () => {
    it("should filter projects that are active", () => {
      setSnsProjects([{ lifecycle: SnsSwapLifecycle.Open }]);
      const open = get(snsProjectsActivePadStore);
      expect(open.length).toEqual(1);

      setSnsProjects([
        { lifecycle: SnsSwapLifecycle.Open },
        { lifecycle: SnsSwapLifecycle.Committed },
      ]);
      const open2 = get(snsProjectsActivePadStore);
      expect(open2.length).toEqual(2);

      setSnsProjects([{ lifecycle: SnsSwapLifecycle.Unspecified }]);
      const noOpen = get(snsProjectsActivePadStore);
      expect(noOpen.length).toEqual(0);
    });

    it("should filter projects that are committed only", () => {
      setSnsProjects([{ lifecycle: SnsSwapLifecycle.Committed }]);

      const committed = get(snsProjectsCommittedStore);
      expect(committed.length).toEqual(1);

      setSnsProjects([{ lifecycle: SnsSwapLifecycle.Open }]);

      const noCommitted = get(snsProjectsCommittedStore);
      expect(noCommitted.length).toEqual(0);
    });

    it("should filter projects that are adopted only", () => {
      setSnsProjects([{ lifecycle: SnsSwapLifecycle.Adopted }]);

      const adopted = get(snsProjectsAdoptedStore);
      expect(adopted.length).toEqual(1);

      setSnsProjects([{ lifecycle: SnsSwapLifecycle.Open }]);
      const noAdopted = get(snsProjectsAdoptedStore);
      expect(noAdopted.length).toEqual(0);
    });
  });
});
