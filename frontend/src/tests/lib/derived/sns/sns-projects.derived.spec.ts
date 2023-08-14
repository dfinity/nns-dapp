import {
  snsProjectsActivePadStore,
  snsProjectsAdoptedStore,
  snsProjectsCommittedStore,
  snsProjectsStore,
} from "$lib/derived/sns/sns-projects.derived";
import { snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { mockSnsSwapCommitment } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("projects.derived", () => {
  const principalRootCanisterId = rootCanisterIdMock;

  describe("projectsDerived", () => {
    beforeAll(() => {
      resetSnsProjects();
    });

    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principalRootCanisterId),
      certified: true,
    });

    it("should set projects of all statuses", () => {
      setSnsProjects([
        { lifecycle: SnsSwapLifecycle.Open },
        { lifecycle: SnsSwapLifecycle.Committed },
      ]);
      const projects = get(snsProjectsStore);
      expect(projects).toHaveLength(2);
    });
  });
  describe("filter projects derived", () => {
    beforeEach(() => {
      resetSnsProjects();
    });

    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principalRootCanisterId),
      certified: true,
    });

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
