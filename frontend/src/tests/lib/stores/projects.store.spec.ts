import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";
import {
  activePadProjectsStore,
  committedProjectsStore,
  projectsStore,
} from "../../../lib/stores/projects.store";
import {
  snsQueryStore,
  snsSwapCommitmentsStore,
} from "../../../lib/stores/sns.store";
import {
  mockSnsSummaryList,
  mockSnsSwapCommitment,
} from "../../mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "../../mocks/sns-response.mock";

describe("projects.store", () => {
  describe("projectsStore", () => {
    beforeAll(() => {
      snsQueryStore.reset();
    });

    afterAll(() => {
      snsQueryStore.reset();
    });

    const principalRootCanisterId = mockSnsSummaryList[0].rootCanisterId;

    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principalRootCanisterId),
      certified: true,
    });

    it("should set projects of all statuses", () => {
      snsQueryStore.setData(
        snsResponsesForLifecycle({
          lifecycles: [SnsSwapLifecycle.Open, SnsSwapLifecycle.Committed],
        })
      );
      const projects = get(projectsStore);
      expect(projects).toHaveLength(2);
    });
  });
  describe("filter projects store", () => {
    beforeAll(() => {
      snsQueryStore.reset();
    });

    afterAll(() => {
      snsQueryStore.reset();
    });

    const principalRootCanisterId = mockSnsSummaryList[0].rootCanisterId;

    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principalRootCanisterId),
      certified: true,
    });

    it("should filter projects that are active", () => {
      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Open] })
      );
      const open = get(activePadProjectsStore);
      expect(open?.length).toEqual(1);

      snsQueryStore.setData(
        snsResponsesForLifecycle({
          lifecycles: [SnsSwapLifecycle.Open, SnsSwapLifecycle.Committed],
        })
      );
      const open2 = get(activePadProjectsStore);
      expect(open2?.length).toEqual(2);

      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Unspecified] })
      );
      const noOpen = get(activePadProjectsStore);
      expect(noOpen?.length).toEqual(0);
    });

    it("should filter projects that are committed only", () => {
      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Committed] })
      );

      const committed = get(committedProjectsStore);
      expect(committed?.length).toEqual(1);

      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Open] })
      );
      const noCommitted = get(committedProjectsStore);
      expect(noCommitted?.length).toEqual(0);
    });
  });
});
