import { loadSnsFilters } from "$lib/services/sns-filters.services";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { enumSize } from "$lib/utils/enum.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { nativeNervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { topicInfoDtoMock } from "$tests/mocks/sns-topics.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import {
  SnsProposalDecisionStatus,
  type SnsNervousSystemFunction,
} from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns-filters services", () => {
  const getFiltersStoreData = () =>
    get(snsFiltersStore)[mockPrincipal.toText()];

  describe("loadSnsFilters", () => {
    describe("when there is no stored data", () => {
      it("should initialize the filter store by type with default value", async () => {
        expect(getFiltersStoreData()).toEqual(undefined);

        await loadSnsFilters({
          rootCanisterId: mockPrincipal,
          nsFunctions: [],
          snsName: "sns-name",
        });

        expect(getFiltersStoreData().types).toEqual([]);
      });

      it("should initialize the filter store by topic with default value", async () => {
        expect(getFiltersStoreData()).toEqual(undefined);

        await loadSnsFilters({
          rootCanisterId: mockPrincipal,
          nsFunctions: [],
          snsName: "sns-name",
        });

        expect(getFiltersStoreData().topics).toEqual([]);
      });

      it("should load the sns decision status filters store but not Unspecified", async () => {
        expect(getFiltersStoreData()).toEqual(undefined);

        await loadSnsFilters({
          rootCanisterId: mockPrincipal,
          nsFunctions: [],
          snsName: "sns-name",
        });

        expect(getFiltersStoreData().decisionStatus.length).toBe(
          enumSize(SnsProposalDecisionStatus) - 1
        );
        expect(
          getFiltersStoreData().decisionStatus.map(({ value }) => value)
        ).not.toContainEqual(
          SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_UNSPECIFIED
        );
      });
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

    it("should update the topics in filters store", async () => {
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
          topics: {
            topics: [
              topicInfoDtoMock({
                topic: "DaoCommunitySettings",
                name: "Topic1",
                description: "This is a description",
                isCritical: false,
              }),
            ],
            uncategorized_functions: [],
          },
        },
      ]);
      expect(getFiltersStoreData()).toBe(undefined);

      await loadSnsFilters({
        rootCanisterId: mockPrincipal,
        nsFunctions: [],
        snsName: "sns-name",
      });

      expect(getFiltersStoreData().topics).toEqual([
        {
          checked: false,
          id: "DaoCommunitySettings",
          isCritical: false,
          name: "Topic1",
          value: "DaoCommunitySettings",
        },
        {
          checked: false,
          id: "all_sns_proposals_without_topic",
          name: "Proposals without a topic",
          value: "all_sns_proposals_without_topic",
        },
      ]);
    });
  });
});
