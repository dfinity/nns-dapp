import {
  snsProjectsActivePadStore,
  snsProjectsAdoptedStore,
  snsProjectsCommittedStore,
  snsProjectsStore,
} from "$lib/derived/sns/sns-projects.derived";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import {
  mockSnsSummaryList,
  mockSnsSwapCommitment,
} from "$tests/mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "$tests/mocks/sns-response.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("projects.derived", () => {
  describe("projectsDerived", () => {
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
      const projects = get(snsProjectsStore);
      expect(projects).toHaveLength(2);
    });
  });
  describe("filter projects derived", () => {
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
      const open = get(snsProjectsActivePadStore);
      expect(open.length).toEqual(1);

      snsQueryStore.setData(
        snsResponsesForLifecycle({
          lifecycles: [SnsSwapLifecycle.Open, SnsSwapLifecycle.Committed],
        })
      );
      const open2 = get(snsProjectsActivePadStore);
      expect(open2.length).toEqual(2);

      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Unspecified] })
      );
      const noOpen = get(snsProjectsActivePadStore);
      expect(noOpen.length).toEqual(0);
    });

    it("should filter projects that are committed only", () => {
      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Committed] })
      );

      const committed = get(snsProjectsCommittedStore);
      expect(committed.length).toEqual(1);

      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Open] })
      );
      const noCommitted = get(snsProjectsCommittedStore);
      expect(noCommitted.length).toEqual(0);
    });

    it("should filter projects that are adopted only", () => {
      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Adopted] })
      );

      const adopted = get(snsProjectsAdoptedStore);
      expect(adopted.length).toEqual(1);

      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Open] })
      );
      const noAdopted = get(snsProjectsAdoptedStore);
      expect(noAdopted.length).toEqual(0);
    });
  });
});
