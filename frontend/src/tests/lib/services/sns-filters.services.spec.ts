import {
  loadSnsFilters,
  updateSnsTypeFilter,
} from "$lib/services/sns-filters.services";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { enumSize } from "$lib/utils/enum.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { nativeNervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
} from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns-filters services", () => {
  const getFiltersStoreData = () =>
    get(snsFiltersStore)[mockPrincipal.toText()];

  describe("loadSnsFilters", () => {
    beforeEach(() => {
      snsFiltersStore.reset();
    });
    it("should load the sns decision status filters store but not Unspecified", async () => {
      expect(getFiltersStoreData()?.decisionStatus).toBeUndefined();
      await loadSnsFilters(mockPrincipal);

      expect(getFiltersStoreData().decisionStatus).toHaveLength(
        enumSize(SnsProposalDecisionStatus) - 1
      );
      expect(
        getFiltersStoreData().decisionStatus.map(({ value }) => value)
      ).not.toContainEqual(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_UNSPECIFIED
      );
    });

    it("should load the sns reward status filters store but not Unspecified", async () => {
      expect(getFiltersStoreData()?.rewardStatus).toBeUndefined();
      await loadSnsFilters(mockPrincipal);

      expect(getFiltersStoreData().rewardStatus).toHaveLength(
        enumSize(SnsProposalRewardStatus) - 1
      );
      expect(
        getFiltersStoreData().rewardStatus.map(({ value }) => value)
      ).not.toContainEqual(
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_UNSPECIFIED
      );
    });

    it("should not change filters if they are already present", async () => {
      expect(getFiltersStoreData()?.decisionStatus).toBeUndefined();
      const decisionStatus = [];
      snsFiltersStore.setDecisionStatus({
        rootCanisterId: mockPrincipal,
        decisionStatus,
      });

      await loadSnsFilters(mockPrincipal);

      expect(getFiltersStoreData().decisionStatus).toHaveLength(
        decisionStatus.length
      );
    });
  });

  describe("updateSnsTypeFilter", () => {
    beforeEach(() => {
      snsFiltersStore.reset();
    });

    it("should fill up the sns type filter store", async () => {
      expect(getFiltersStoreData()?.types).toBeUndefined();

      updateSnsTypeFilter({
        rootCanisterId: mockPrincipal,
        nsFunctions: [nativeNervousSystemFunctionMock],
        snsName: "sns-name",
      });

      expect(getFiltersStoreData().types).toEqual([
        {
          checked: true,
          id: "1",
          name: "Motion",
          value: "1",
        },
      ]);
    });
  });
});
