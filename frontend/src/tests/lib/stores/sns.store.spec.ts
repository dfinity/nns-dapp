import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { snsDerivedStateStore } from "$lib/stores/sns-derived-state.store";
import { snsLifecycleStore } from "$lib/stores/sns-lifecycle.store";
import {
  isLoadingSnsProjectsStore,
  openSnsProposalsStore,
  snsProposalsStore,
  snsProposalsStoreIsLoading,
  snsSummariesStore,
  snsSwapCommitmentsStore,
} from "$lib/stores/sns.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import {
  aggregatorSnsMockDto,
  aggregatorSnsMockWith,
} from "$tests/mocks/sns-aggregator.mock";
import {
  mockDerivedResponse,
  mockLifecycleResponse,
  mockSnsSummaryList,
  mockSnsSwapCommitment,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { ProposalStatus } from "@dfinity/nns";
import {
  SnsSwapLifecycle,
  type SnsGetDerivedStateResponse,
  type SnsGetLifecycleResponse,
} from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns.store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    snsAggregatorStore.reset();
    snsDerivedStateStore.reset();
    snsLifecycleStore.reset();
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

  describe("sns proposals", () => {
    it("should store proposals", () => {
      const proposals = [{ ...mockProposalInfo }];
      snsProposalsStore.setProposals({
        proposals,
        certified: false,
      });

      const $snsProposalsStore = get(snsProposalsStore);

      expect($snsProposalsStore?.proposals).toEqual(proposals);
      expect($snsProposalsStore?.certified).toBe(false);
    });

    it("should filter open proposals", () => {
      const nowSeconds = new Date().getTime() / 1000;
      const proposals = [
        {
          ...mockProposalInfo,
          id: BigInt(111),
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds + 10000)),
          status: ProposalStatus.Rejected,
        },
        {
          ...mockProposalInfo,
          id: BigInt(222),
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds - 10000)),
          status: ProposalStatus.Open,
        },
        {
          ...mockProposalInfo,
          id: BigInt(222),
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds + 10000)),
          status: ProposalStatus.Accepted,
        },
      ];

      snsProposalsStore.setProposals({
        proposals,
        certified: false,
      });

      const $openSnsProposalsStore = get(openSnsProposalsStore);

      expect($openSnsProposalsStore.length).toBe(1);
      expect($openSnsProposalsStore[0]).toEqual(proposals[1]);
    });

    it("should set the store as loading state", () => {
      const proposals = {
        proposals: [{ ...mockProposalInfo }],
        certified: false,
      };
      snsProposalsStore.setProposals(proposals);

      expect(get(snsProposalsStoreIsLoading)).toBe(false);

      snsProposalsStore.reset();
      expect(get(snsProposalsStoreIsLoading)).toBe(true);
    });
  });

  describe("isLoadingSnsProjectsStore", () => {
    it("should not be loading if sns aggregator store is set", () => {
      snsAggregatorStore.reset();
      expect(get(isLoadingSnsProjectsStore)).toBe(true);

      snsAggregatorStore.setData([aggregatorSnsMockDto]);
      expect(get(isLoadingSnsProjectsStore)).toBe(false);
    });
  });

  describe("snsSummariesStore", () => {
    const rootCanisterId = rootCanisterIdMock;

    it("uses snsAggregator as source of data", () => {
      snsAggregatorStore.setData([aggregatorSnsMockDto]);

      expect(get(snsSummariesStore)).toHaveLength(1);
    });

    it("returns instances of SnsSummaryWrapper", () => {
      snsAggregatorStore.setData([aggregatorSnsMockDto]);

      expect(get(snsSummariesStore)[0]).toBeInstanceOf(SnsSummaryWrapper);
    });

    it("derived state is overriden with data in snsDerivedStateStore", () => {
      const newSnsTokensPerIcp = 4;
      const aggregatorData = aggregatorSnsMockWith({
        rootCanisterId: rootCanisterId.toText(),
      });
      snsAggregatorStore.setData([aggregatorData]);

      expect(get(snsSummariesStore)[0].derived.sns_tokens_per_icp).not.toBe(
        newSnsTokensPerIcp
      );

      const newDerivedState: SnsGetDerivedStateResponse = {
        ...mockDerivedResponse,
        sns_tokens_per_icp: [newSnsTokensPerIcp],
      };
      snsDerivedStateStore.setDerivedState({
        certified: true,
        rootCanisterId,
        data: newDerivedState,
      });

      expect(get(snsSummariesStore)[0].derived.sns_tokens_per_icp).toBe(
        newSnsTokensPerIcp
      );
    });

    it("lifestate is overriden with data in snsDerivedStateStore", () => {
      const newLifecycle = SnsSwapLifecycle.Open;
      const aggregatorData = aggregatorSnsMockWith({
        rootCanisterId: rootCanisterId.toText(),
      });
      snsAggregatorStore.setData([aggregatorData]);

      expect(get(snsSummariesStore)[0].swap.lifecycle).not.toBe(newLifecycle);

      const newLifecycleResponse: SnsGetLifecycleResponse = {
        ...mockLifecycleResponse,
        lifecycle: [newLifecycle],
      };
      snsLifecycleStore.setData({
        certified: true,
        rootCanisterId,
        data: newLifecycleResponse,
      });

      expect(get(snsSummariesStore)[0].swap.lifecycle).toBe(newLifecycle);
    });
  });
});
