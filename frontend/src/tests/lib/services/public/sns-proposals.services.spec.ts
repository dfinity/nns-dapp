import * as api from "$lib/api/sns-governance.api";
import { DEFAULT_LIST_PAGINATION_LIMIT } from "$lib/constants/constants";
import {
  getSnsProposalById,
  loadSnsProposals,
  registerVote,
} from "$lib/services/public/sns-proposals.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { unsupportedFilterByTopicSnsesStore } from "$lib/stores/sns-unsupported-filter-by-topic.store";
import type {
  Filter,
  SnsProposalTopicFilterId,
  SnsProposalTypeFilterId,
} from "$lib/types/filters";
import { ALL_SNS_GENERIC_PROPOSAL_TYPES_ID } from "$lib/types/filters";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import {
  mockIdentity,
  mockPrincipal,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  genericNervousSystemFunctionMock,
  nativeNervousSystemFunctionMock,
} from "$tests/mocks/sns-functions.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { topicInfoDtoMock } from "$tests/mocks/sns-topics.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { AnonymousIdentity } from "@dfinity/agent";
import { toastsStore } from "@dfinity/gix-components";
import {
  SnsProposalDecisionStatus,
  SnsVote,
  type SnsProposalData,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("sns-proposals services", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockRestore();
  });
  const proposal1: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 1n }],
  };
  const proposal2: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 2n }],
  };
  const proposal3: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 3n }],
  };
  const proposals = [proposal1, proposal2, proposal3];

  describe("loadSnsProposals", () => {
    let queryProposalsSpy;

    beforeEach(() => {
      queryProposalsSpy = vi.spyOn(api, "queryProposals").mockResolvedValue({
        proposals,
        include_ballots_by_caller: [true],
        include_topic_filtering: [],
      });
    });

    describe("not logged in", () => {
      beforeEach(() => {
        setNoIdentity();
      });

      it("should call queryProposals with the default params", async () => {
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
          snsFunctions: [],
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_LIST_PAGINATION_LIMIT,
            beforeProposal: undefined,
            includeStatus: [],
            excludeType: [],
            includeTopics: [],
          },
          identity: new AnonymousIdentity(),
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });

      it("should call queryProposals with the last proposal id params", async () => {
        const proposalId = { id: 1n };
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
          beforeProposalId: proposalId,
          snsFunctions: [],
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_LIST_PAGINATION_LIMIT,
            beforeProposal: proposalId,
            includeStatus: [],
            excludeType: [],
            includeTopics: [],
          },
          identity: new AnonymousIdentity(),
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });

      it("should call queryProposals with selected decision status filters", async () => {
        const proposalId = { id: 1n };
        const rootCanisterId = mockPrincipal;
        const decisionStatus = [
          {
            id: "1",
            value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
            name: "Adopted",
            checked: true,
          },
          {
            id: "2",
            value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
            name: "Open",
            checked: false,
          },
        ];
        const selectedDecisionStatus = decisionStatus
          .filter(({ checked }) => checked)
          .map(({ value }) => value);
        snsFiltersStore.setDecisionStatus({
          rootCanisterId,
          decisionStatus,
        });
        await loadSnsProposals({
          rootCanisterId,
          beforeProposalId: proposalId,
          snsFunctions: [],
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_LIST_PAGINATION_LIMIT,
            beforeProposal: proposalId,
            includeStatus: selectedDecisionStatus,
            excludeType: [],
            includeTopics: [],
          },
          identity: new AnonymousIdentity(),
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });

      it("should call queryProposals with selected types filters", async () => {
        const proposalId = { id: 1n };
        const rootCanisterId = mockPrincipal;
        const snsFunctions = [
          nativeNervousSystemFunctionMock,
          genericNervousSystemFunctionMock,
        ];
        const typesFilterState = [
          {
            id: `${nativeNervousSystemFunctionMock.id}`,
            name: "Motion",
            value: `${nativeNervousSystemFunctionMock.id}`,
            checked: true,
          },
          {
            id: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
            name: "Motion",
            value: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
            checked: false,
          },
        ];
        snsFiltersStore.setTypes({
          rootCanisterId,
          types: [...typesFilterState],
        });

        expect(queryProposalsSpy).not.toHaveBeenCalled();

        await loadSnsProposals({
          rootCanisterId,
          beforeProposalId: proposalId,
          snsFunctions,
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_LIST_PAGINATION_LIMIT,
            beforeProposal: proposalId,
            includeStatus: [],
            excludeType: [genericNervousSystemFunctionMock.id],
            includeTopics: [],
          },
          identity: new AnonymousIdentity(),
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });

      it("should call queryProposals with empty excludeType if Project supports topics", async () => {
        const proposalId = { id: 1n };
        const rootCanisterId = mockPrincipal;

        // types state
        const snsFunctions = [
          nativeNervousSystemFunctionMock,
          genericNervousSystemFunctionMock,
        ];
        const typesFilterState = [
          {
            id: `${nativeNervousSystemFunctionMock.id}`,
            name: "Motion",
            value: `${nativeNervousSystemFunctionMock.id}`,
            checked: true,
          },
          {
            id: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
            name: "Motion",
            value: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
            checked: false,
          },
        ];
        snsFiltersStore.setTypes({
          rootCanisterId,
          types: [...typesFilterState],
        });

        // topics state
        overrideFeatureFlagsStore.setFlag("ENABLE_SNS_TOPICS", true);
        setSnsProjects([
          {
            rootCanisterId: mockPrincipal,
            topics: {
              topics: [
                topicInfoDtoMock({
                  topic: "DaoCommunitySettings",
                  name: "Topic1",
                  description: "This is a description",
                }),
              ],
              uncategorized_functions: [],
            },
          },
        ]);

        const topicsFilterState: Filter<SnsProposalTopicFilterId>[] = [
          {
            id: "1",
            name: "Governance",
            value: "Governance",
            checked: true,
          },
          {
            id: "2",
            name: "Finance",
            value: "TreasuryAssetManagement",
            checked: true,
          },
          {
            id: "3",
            name: "Management",
            value: "DappCanisterManagement",
            checked: false,
          },
        ];

        const expectedTopics = [
          { Governance: null },
          { TreasuryAssetManagement: null },
        ];

        snsFiltersStore.setTopics({
          rootCanisterId,
          topics: topicsFilterState,
        });

        await loadSnsProposals({
          rootCanisterId,
          beforeProposalId: proposalId,
          snsFunctions,
        });

        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_LIST_PAGINATION_LIMIT,
            beforeProposal: proposalId,
            includeStatus: [],
            excludeType: [],
            includeTopics: expectedTopics,
          },
          identity: new AnonymousIdentity(),
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });

      it("should call queryProposals with selected topics filters", async () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_SNS_TOPICS", true);
        setSnsProjects([
          {
            rootCanisterId: mockPrincipal,
            topics: {
              topics: [
                topicInfoDtoMock({
                  topic: "DaoCommunitySettings",
                  name: "Topic1",
                  description: "This is a description",
                }),
              ],
              uncategorized_functions: [],
            },
          },
        ]);

        const proposalId = { id: 1n };
        const rootCanisterId = mockPrincipal;
        const topicsFilterState: Filter<SnsProposalTopicFilterId>[] = [
          {
            id: "1",
            name: "Governance",
            value: "Governance",
            checked: true,
          },
          {
            id: "2",
            name: "Finance",
            value: "TreasuryAssetManagement",
            checked: true,
          },
          {
            id: "3",
            name: "Management",
            value: "DappCanisterManagement",
            checked: false,
          },
        ];

        const expectedTopics = [
          { Governance: null },
          { TreasuryAssetManagement: null },
        ];

        snsFiltersStore.setTopics({
          rootCanisterId,
          topics: topicsFilterState,
        });

        await loadSnsProposals({
          rootCanisterId,
          beforeProposalId: proposalId,
          snsFunctions: [],
        });

        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_LIST_PAGINATION_LIMIT,
            beforeProposal: proposalId,
            includeStatus: [],
            excludeType: [],
            includeTopics: expectedTopics,
          },
          identity: new AnonymousIdentity(),
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });

      it("should load the proposals in the store", async () => {
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
          snsFunctions: [],
        });
        await waitFor(() => {
          const storeData = get(snsProposalsStore);
          return expect(storeData[mockPrincipal.toText()]?.proposals).toEqual(
            proposals
          );
        });
      });

      it("set completed to true if response has less than page size", async () => {
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
          snsFunctions: [],
        });
        await waitFor(() => {
          const storeData = get(snsProposalsStore);
          return expect(storeData[mockPrincipal.toText()]?.completed).toEqual(
            true
          );
        });
      });

      describe("filter by topic capability", () => {
        it("should mark canister as unsupported when include_topic_filtering is null/undefined", async () => {
          vi.spyOn(api, "queryProposals").mockResolvedValue({
            proposals,
            include_ballots_by_caller: [true],
            include_topic_filtering: [],
          });

          await loadSnsProposals({
            rootCanisterId: mockPrincipal,
            snsFunctions: [],
          });

          expect(
            unsupportedFilterByTopicSnsesStore.has(mockPrincipal.toText())
          ).toBe(true);
        });

        it("should mark canister as unsupported when include_topic_filtering is false", async () => {
          vi.spyOn(api, "queryProposals").mockResolvedValue({
            proposals,
            include_ballots_by_caller: [true],
            include_topic_filtering: [false],
          });

          await loadSnsProposals({
            rootCanisterId: mockPrincipal,
            snsFunctions: [],
          });

          expect(
            unsupportedFilterByTopicSnsesStore.has(mockPrincipal.toText())
          ).toBe(true);
        });

        it("should remove canister from unsupported list when include_topic_filtering is true", async () => {
          unsupportedFilterByTopicSnsesStore.add(mockPrincipal.toText());

          vi.spyOn(api, "queryProposals").mockResolvedValue({
            proposals,
            include_ballots_by_caller: [true],
            include_topic_filtering: [true],
          });

          await loadSnsProposals({
            rootCanisterId: mockPrincipal,
            snsFunctions: [],
          });

          expect(
            unsupportedFilterByTopicSnsesStore.has(mockPrincipal.toText())
          ).toBe(false);
        });
      });
    });

    describe("logged in", () => {
      beforeEach(() => {
        resetIdentity();
      });

      it("should call queryProposals with user's identity", async () => {
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
          snsFunctions: [],
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_LIST_PAGINATION_LIMIT,
            beforeProposal: undefined,
            includeStatus: [],
            excludeType: [],
            includeTopics: [],
          },
          identity: mockIdentity,
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });

      it("should call queryProposals with excludeType parameter", async () => {
        const nativeFunctionId = nativeNervousSystemFunctionMock.id;
        const genericFunctionId = genericNervousSystemFunctionMock.id;
        const nativeFilterEntryChecked: Filter<SnsProposalTypeFilterId> = {
          id: `${nativeFunctionId}`,
          name: "string",
          value: `${nativeFunctionId}`,
          checked: true,
        };
        snsFiltersStore.setTypes({
          rootCanisterId: mockPrincipal,
          types: [nativeFilterEntryChecked],
        });
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
          snsFunctions: [
            nativeNervousSystemFunctionMock,
            genericNervousSystemFunctionMock,
          ],
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            params: expect.objectContaining({
              // exclude generic type, because only native was selected
              excludeType: [genericFunctionId],
            }),
          })
        );
      });
    });
  });

  describe("registerVote", () => {
    const neuronId = { id: arrayOfNumberToUint8Array([1, 2, 3]) };
    const proposalId = mockSnsProposal.id[0];
    const vote = SnsVote.Yes;

    beforeEach(() => {
      resetIdentity();
    });

    it("should call registerVote api", async () => {
      const registerVoteApiSpy = vi
        .spyOn(api, "registerVote")
        .mockResolvedValue(undefined);
      const result = await registerVote({
        rootCanisterId: mockPrincipal,
        neuronId,
        proposalId,
        vote,
      });

      expect(registerVoteApiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          rootCanisterId: mockPrincipal,
          neuronId,
          proposalId,
          vote,
        })
      );

      expect(result).toEqual({ success: true });
    });

    it("should handle errors", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      vi.spyOn(api, "registerVote").mockRejectedValue(new Error());
      expect(get(toastsStore)).toEqual([]);

      const result = await registerVote({
        rootCanisterId: mockPrincipal,
        neuronId,
        proposalId,
        vote,
      });

      expect(result).toEqual({ success: false });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "There was an error while registering vote (Neuron: 010203). ",
        },
      ]);
    });
  });

  describe("getSnsProposalById", () => {
    const rootCanisterId = mockPrincipal;
    const proposalId = mockSnsProposal.id[0];

    describe("not logged in", () => {
      beforeEach(() => {
        setNoIdentity();
      });

      it("should call api regardless of having a certified proposal in store", () =>
        new Promise<void>((done) => {
          const queryProposalSpy = vi
            .spyOn(api, "queryProposal")
            .mockResolvedValue(mockSnsProposal);

          snsProposalsStore.setProposals({
            rootCanisterId,
            proposals: [mockSnsProposal],
            certified: true,
            completed: true,
          });
          getSnsProposalById({
            rootCanisterId,
            proposalId,
            setProposal: () => {
              expect(queryProposalSpy).toBeCalledWith({
                identity: new AnonymousIdentity(),
                certified: false,
                rootCanisterId,
                proposalId,
              });
              expect(queryProposalSpy).toBeCalledTimes(1);
              done();
            },
          });
        }));
    });

    describe("logged in", () => {
      beforeEach(() => {
        resetIdentity();
      });

      it("should call api regardless of having a certified proposal in store", async () => {
        const queryProposalSpy = vi
          .spyOn(api, "queryProposal")
          .mockResolvedValue(mockSnsProposal);
        snsProposalsStore.setProposals({
          rootCanisterId,
          proposals: [mockSnsProposal],
          certified: true,
          completed: true,
        });
        let dataCertified = false;
        getSnsProposalById({
          rootCanisterId,
          proposalId,
          setProposal: ({ certified, proposal }) => {
            if (certified) {
              dataCertified = true;
              expect(proposal).toEqual(mockSnsProposal);
            }
          },
        });

        await waitFor(() => expect(dataCertified).toBe(true));
        expect(queryProposalSpy).toBeCalledWith({
          identity: mockIdentity,
          certified: false,
          rootCanisterId,
          proposalId,
        });
        expect(queryProposalSpy).toBeCalledWith({
          identity: mockIdentity,
          certified: true,
          rootCanisterId,
          proposalId,
        });
        expect(queryProposalSpy).toBeCalledTimes(2);
      });

      it("should call handle error if api call fails", async () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        vi.spyOn(api, "queryProposal").mockRejectedValue(new Error("error"));
        const handleErrorSpy = vi.fn();
        const setProposalSpy = vi.fn();
        getSnsProposalById({
          rootCanisterId,
          proposalId,
          setProposal: setProposalSpy,
          handleError: handleErrorSpy,
        });

        await waitFor(() => expect(handleErrorSpy).toBeCalledTimes(2));
      });

      it("should show error if api call fails", async () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        vi.spyOn(api, "queryProposal").mockRejectedValue(new Error("error"));
        const handleErrorSpy = vi.fn();
        const setProposalSpy = vi.fn();
        getSnsProposalById({
          rootCanisterId,
          proposalId,
          setProposal: setProposalSpy,
          handleError: handleErrorSpy,
        });

        await waitFor(() => expect(handleErrorSpy).toBeCalledTimes(2));
        expect(get(toastsStore)[0]).toMatchObject({
          level: "error",
          text: replacePlaceholders(en.error.get_proposal, {
            $proposalId: proposalId.id.toString(),
          }),
        });
      });
    });
  });
});
