import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";
import {
  committedProjectsStore,
  openForVotesSnsProposalsStore,
  openProjectsStore,
  snsFullProjectsStore,
  snsProposalsStore,
  snsSummariesStore,
  snsSwapCommitmentsStore,
} from "../../../lib/stores/projects.store";
import type { SnsSwapCommitment } from "../../../lib/types/sns";
import { mockProposalInfo } from "../../mocks/proposal.mock";
import {
  mockSnsSummaryList,
  mockSnsSwapCommitment,
  summaryForLifecycle,
} from "../../mocks/sns-projects.mock";

describe("projects.store", () => {
  describe("snsSummariesStore", () => {
    it("should store summaries", () => {
      snsSummariesStore.setSummaries({
        summaries: mockSnsSummaryList,
        certified: false,
      });

      const $snsSummariesStore = get(snsSummariesStore);

      expect($snsSummariesStore?.summaries).toEqual(mockSnsSummaryList);
      expect($snsSummariesStore?.certified).toBeFalsy();
    });
  });

  describe("snsSwapStatesStore", () => {
    it("should store swap states", () => {
      const swapCommitment = mockSnsSwapCommitment(
        mockSnsSummaryList[0].rootCanisterId
      ) as SnsSwapCommitment;
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment,
        certified: true,
      });

      const $snsSwapStatesStore = get(snsSwapCommitmentsStore);

      expect($snsSwapStatesStore?.[0].swapCommitment).toEqual(swapCommitment);
      expect($snsSwapStatesStore?.[0].certified).toBeTruthy();
    });
  });

  describe("snsFullProjectsStore", () => {
    it("should combine summaries with swap states", () => {
      const principal = mockSnsSummaryList[0].rootCanisterId;

      snsSummariesStore.setSummaries({
        summaries: mockSnsSummaryList,
        certified: false,
      });
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(principal),
        certified: true,
      });

      const $snsFullProjectsStore = get(snsFullProjectsStore);

      expect($snsFullProjectsStore?.[0].rootCanisterId).toEqual(principal);
      expect($snsFullProjectsStore?.[0].summary).toEqual(mockSnsSummaryList[0]);
      expect($snsFullProjectsStore?.[0].swapCommitment).toEqual(
        mockSnsSwapCommitment(principal)
      );
    });
  });

  describe("filter projects store", () => {
    beforeAll(() => {
      snsSummariesStore.reset();
    });

    afterAll(() => {
      snsSummariesStore.reset();
    });

    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principal),
      certified: true,
    });

    it("should filter projects that are open", () => {
      snsSummariesStore.setSummaries({
        summaries: [summaryForLifecycle(SnsSwapLifecycle.Open)],
        certified: false,
      });

      const open = get(openProjectsStore);
      expect(open?.length).toEqual(1);

      snsSummariesStore.setSummaries({
        summaries: [summaryForLifecycle(SnsSwapLifecycle.Committed)],
        certified: false,
      });
      const noOpen = get(openProjectsStore);
      expect(noOpen?.length).toEqual(0);
    });

    it("should filter projects that are committed", () => {
      snsSummariesStore.setSummaries({
        summaries: [summaryForLifecycle(SnsSwapLifecycle.Committed)],
        certified: false,
      });

      const committed = get(committedProjectsStore);
      expect(committed?.length).toEqual(1);

      snsSummariesStore.setSummaries({
        summaries: [summaryForLifecycle(SnsSwapLifecycle.Open)],
        certified: false,
      });
      const noCommitted = get(committedProjectsStore);
      expect(noCommitted?.length).toEqual(0);
    });
  });

  describe("sns proposals", () => {
    it("should store proposals", () => {
      const proposals = [{ ...mockProposalInfo }];
      snsProposalsStore.setProposals({
        proposals,
        certified: false,
      });

      const $snsProposalsStore = get(snsProposalsStore);

      expect($snsProposalsStore?.proposals).toEqual(proposals);
      expect($snsProposalsStore?.certified).toBeFalsy();
    });

    it("should filter open proposals", () => {
      const nowSeconds = new Date().getTime() / 1000;
      const proposals = [
        {
          ...mockProposalInfo,
          id: BigInt(111),
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds + 10000)),
        },
        {
          ...mockProposalInfo,
          id: BigInt(222),
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds - 10000)),
        },
      ];

      snsProposalsStore.setProposals({
        proposals,
        certified: false,
      });

      const $openForVotesSnsProposalsStore = get(openForVotesSnsProposalsStore);

      expect($openForVotesSnsProposalsStore.length).toBe(1);
      expect($openForVotesSnsProposalsStore[0]).toEqual(proposals[0]);
    });
  });
});
