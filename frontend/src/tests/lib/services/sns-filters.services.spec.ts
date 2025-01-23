import { loadSnsFilters } from "$lib/services/sns-filters.services";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { enumSize } from "$lib/utils/enum.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { nativeNervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  SnsProposalDecisionStatus,
  type SnsNervousSystemFunction,
} from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns-filters services", () => {
  const getFiltersStoreData = () =>
    get(snsFiltersStore)[mockPrincipal.toText()];

  describe("loadSnsFilters", () => {
    it("should load the sns decision status filters store but not Unspecified", async () => {
      expect(getFiltersStoreData()?.decisionStatus).toBeUndefined();
      await loadSnsFilters({
        rootCanisterId: mockPrincipal,
        nsFunctions: [nativeNervousSystemFunctionMock],
        snsName: "sns-name",
      });

      expect(getFiltersStoreData().decisionStatus).toHaveLength(
        enumSize(SnsProposalDecisionStatus) - 1
      );
      expect(
        getFiltersStoreData().decisionStatus.map(({ value }) => value)
      ).not.toContainEqual(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_UNSPECIFIED
      );
    });

    it("should not change filters if they are already present", async () => {
      expect(getFiltersStoreData()?.decisionStatus).toBeUndefined();
      const decisionStatus = [];
      snsFiltersStore.setDecisionStatus({
        rootCanisterId: mockPrincipal,
        decisionStatus,
      });

      await loadSnsFilters({
        rootCanisterId: mockPrincipal,
        nsFunctions: [nativeNervousSystemFunctionMock],
        snsName: "sns-name",
      });

      expect(getFiltersStoreData().decisionStatus).toHaveLength(
        decisionStatus.length
      );
    });

    it("should update the types in filters store", async () => {
      expect(getFiltersStoreData()?.types).toBeUndefined();

      await loadSnsFilters({
        rootCanisterId: mockPrincipal,
        nsFunctions: [
          {
            ...nativeNervousSystemFunctionMock,
            id: 1n,
            name: "Motion",
          } as SnsNervousSystemFunction,
        ],
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
