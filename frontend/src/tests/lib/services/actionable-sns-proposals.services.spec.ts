import * as api from "$lib/api/sns-governance.api";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { loadActionableSnsProposals } from "$lib/services/actionable-sns-proposals.services";
import {
  actionableSnsProposalsStore,
  failedActionableSnsesStore,
} from "$lib/stores/actionable-sns-proposals.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { enumValues } from "$lib/utils/enum.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { snsProposalId } from "$lib/utils/sns-proposals.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { silentConsoleErrors } from "$tests/utils/utils.test-utils";
import {
  SnsNeuronPermissionType,
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsVote,
  neuronSubaccount,
  type SnsBallot,
  type SnsListProposalsResponse,
  type SnsNeuron,
  type SnsNeuronId,
  type SnsProposalData,
} from "@dfinity/sns";
import type { Principal } from "@icp-sdk/core/principal";
import type { MockInstance } from "@vitest/spy";
import { get } from "svelte/store";

describe("actionable-sns-proposals.services", () => {
  describe("loadActionableProposalsForSns", () => {
    const allPermissions = Int32Array.from(enumValues(SnsNeuronPermissionType));
    const subaccount = neuronSubaccount({
      controller: mockIdentity.getPrincipal(),
      index: 0,
    });
    const neuronId: SnsNeuronId = { id: subaccount };
    const neuron: SnsNeuron = {
      ...mockSnsNeuron,
      created_timestamp_seconds: 0n,
      id: [neuronId] as [SnsNeuronId],
      permissions: [
        {
          principal: [mockIdentity.getPrincipal()],
          permission_type: allPermissions,
        },
      ],
    };
    const neuronIdHex = getSnsNeuronIdAsHexString(neuron);
    const votableProposalProps = {
      proposalId: 0n,
      createdAt: 1n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
      rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
      ballots: [
        [
          neuronIdHex,
          {
            vote: SnsVote.Unspecified,
            cast_timestamp_seconds: 123n,
            voting_power: 10000n,
          },
        ],
      ] as [string, SnsBallot][],
    };
    const twelveHundredProposals = Array.from(Array(1200))
      .map((_, index) =>
        createSnsProposal({
          ...votableProposalProps,
          proposalId: BigInt(index),
        })
      )
      .reverse();
    const votableProposal1: SnsProposalData = createSnsProposal({
      ...votableProposalProps,
      proposalId: 0n,
    });
    const votableProposal2: SnsProposalData = createSnsProposal({
      ...votableProposalProps,
      proposalId: 1n,
    });
    const votedProposal: SnsProposalData = createSnsProposal({
      ...votableProposalProps,
      proposalId: 123456789n,
      ballots: [
        [
          neuronIdHex,
          {
            vote: SnsVote.Yes,
            cast_timestamp_seconds: 123n,
            voting_power: 10000n,
          },
        ],
      ],
    });
    const rootCanisterId1 = principal(0);
    const rootCanisterId2 = principal(1);

    const mockSnsProjectsCommittedStore = (rootCanisterIds: Principal[]) =>
      setSnsProjects(
        rootCanisterIds.map((rootCanisterId) => ({
          rootCanisterId,
        }))
      );
    const queryProposalsResponse = (proposals: SnsProposalData[]) =>
      ({
        proposals,
        include_ballots_by_caller: [true],
      }) as SnsListProposalsResponse;
    const expectedFilterParams = {
      includeRewardStatus: [
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
      ],
      limit: 100,
    };

    let spyQuerySnsProposals: MockInstance;
    let spyQuerySnsNeurons;
    let spyConsoleError;

    beforeEach(() => {
      resetIdentity();

      resetIdentity();
      vi.spyOn(snsProjectsCommittedStore, "subscribe").mockClear();

      spyQuerySnsNeurons = vi
        .spyOn(api, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([neuron]));
      spyQuerySnsProposals = vi.spyOn(api, "queryProposals").mockImplementation(
        async ({ rootCanisterId }) =>
          ({
            proposals:
              rootCanisterId.toText() === rootCanisterId1.toText()
                ? [votableProposal1, votedProposal]
                : [votableProposal2, votedProposal],
            include_ballots_by_caller: [true],
          }) as SnsListProposalsResponse
      );
    });

    it("should query user neurons per sns", async () => {
      mockSnsProjectsCommittedStore([rootCanisterId1, rootCanisterId2]);
      expect(spyQuerySnsNeurons).not.toHaveBeenCalled();

      expect(get(snsNeuronsStore)).toEqual({});

      await loadActionableSnsProposals();

      expect(spyQuerySnsNeurons).toHaveBeenCalledTimes(2);
      expect(spyQuerySnsNeurons).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId: rootCanisterId1,
        certified: false,
      });
      expect(spyQuerySnsNeurons).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId: rootCanisterId2,
        certified: false,
      });

      expect(get(snsNeuronsStore)).toEqual({
        [rootCanisterId1.toText()]: {
          certified: false,
          neurons: [neuron],
        },
        [rootCanisterId2.toText()]: {
          certified: false,
          neurons: [neuron],
        },
      });
    });

    it("should query proposals per sns with accept rewards status only", async () => {
      mockSnsProjectsCommittedStore([rootCanisterId1, rootCanisterId2]);
      expect(spyQuerySnsProposals).not.toHaveBeenCalled();

      await loadActionableSnsProposals();

      expect(spyQuerySnsProposals).toHaveBeenCalledTimes(2);
      expect(spyQuerySnsProposals).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId: rootCanisterId1,
        certified: false,
        params: expectedFilterParams,
      });
      expect(spyQuerySnsProposals).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId: rootCanisterId2,
        certified: false,
        params: expectedFilterParams,
      });
    });

    it("should save failed canister IDs", async () => {
      const failRootCanisterId = principal(13);
      const snsQueryError = new Error("sns query proposals test fail");
      mockSnsProjectsCommittedStore([
        failRootCanisterId,
        rootCanisterId1,
        rootCanisterId2,
      ]);
      spyQuerySnsProposals = vi
        .spyOn(api, "queryProposals")
        .mockRejectedValueOnce(snsQueryError)
        .mockImplementation(async () => ({
          proposals: [],
          include_ballots_by_caller: [true] as [boolean],
          include_topic_filtering: [],
        }));
      spyConsoleError = silentConsoleErrors();

      expect(spyQuerySnsProposals).not.toHaveBeenCalled();

      await loadActionableSnsProposals();

      expect(spyQuerySnsProposals).toHaveBeenCalledTimes(3);
      expect(spyQuerySnsProposals).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId: failRootCanisterId,
        certified: false,
        params: expectedFilterParams,
      });
      expect(spyQuerySnsProposals).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId: rootCanisterId1,
        certified: false,
        params: expectedFilterParams,
      });
      expect(spyQuerySnsProposals).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId: rootCanisterId2,
        certified: false,
        params: expectedFilterParams,
      });

      // expect a single error to be logged
      expect(spyConsoleError).toHaveBeenCalledTimes(1);
      expect(spyConsoleError).toBeCalledWith(snsQueryError);

      expect(get(failedActionableSnsesStore)).toEqual([
        failRootCanisterId.toText(),
      ]);
    });

    it("should remove failed canister IDs", async () => {
      mockSnsProjectsCommittedStore([rootCanisterId1]);
      spyQuerySnsProposals = vi
        .spyOn(api, "queryProposals")
        .mockImplementation(async () => ({
          proposals: [],
          include_ballots_by_caller: [true] as [boolean],
          include_topic_filtering: [],
        }));
      failedActionableSnsesStore.add(rootCanisterId1.toText());

      expect(spyQuerySnsProposals).not.toHaveBeenCalled();

      await loadActionableSnsProposals();

      expect(spyQuerySnsProposals).toHaveBeenCalledTimes(1);
      expect(get(failedActionableSnsesStore)).toEqual([]);
    });

    it("should query list proposals using multiple calls", async () => {
      mockSnsProjectsCommittedStore([rootCanisterId1]);
      const firstResponse = twelveHundredProposals.slice(0, 100);
      const secondResponse = twelveHundredProposals.slice(100, 150);
      spyQuerySnsProposals = vi
        .spyOn(api, "queryProposals")
        .mockResolvedValueOnce(queryProposalsResponse(firstResponse))
        .mockResolvedValueOnce(queryProposalsResponse(secondResponse));

      expect(spyQuerySnsProposals).not.toHaveBeenCalled();

      await loadActionableSnsProposals();

      expect(spyQuerySnsProposals).toHaveBeenCalledTimes(2);

      expect(spyQuerySnsProposals).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId: rootCanisterId1,
        certified: false,
        params: {
          includeRewardStatus: [
            SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
          ],
          beforeProposal: undefined,
          limit: 100,
        },
      });
      expect(spyQuerySnsProposals).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId: rootCanisterId1,
        certified: false,
        params: {
          includeRewardStatus: [
            SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
          ],
          beforeProposal: {
            id: snsProposalId(firstResponse[firstResponse.length - 1]),
          },
          limit: 100,
        },
      });
      expect(get(actionableSnsProposalsStore)).toEqual({
        [rootCanisterId1.toText()]: {
          proposals: [...firstResponse, ...secondResponse],
          fetchLimitReached: false,
        },
      });
    });

    it("should log an error when request count limit reached", async () => {
      mockSnsProjectsCommittedStore([rootCanisterId1]);
      spyQuerySnsProposals = vi
        .spyOn(api, "queryProposals")
        .mockResolvedValueOnce(
          queryProposalsResponse(twelveHundredProposals.slice(0, 100))
        )
        .mockResolvedValueOnce(
          queryProposalsResponse(twelveHundredProposals.slice(100, 200))
        )
        .mockResolvedValueOnce(
          queryProposalsResponse(twelveHundredProposals.slice(200, 300))
        )
        .mockResolvedValueOnce(
          queryProposalsResponse(twelveHundredProposals.slice(300, 400))
        )
        .mockResolvedValueOnce(
          queryProposalsResponse(twelveHundredProposals.slice(400, 500))
        )
        .mockResolvedValueOnce(
          queryProposalsResponse(twelveHundredProposals.slice(500, 600))
        )
        .mockResolvedValueOnce(
          queryProposalsResponse(twelveHundredProposals.slice(600, 700))
        )
        .mockResolvedValueOnce(
          queryProposalsResponse(twelveHundredProposals.slice(700, 800))
        )
        .mockResolvedValueOnce(
          queryProposalsResponse(twelveHundredProposals.slice(800, 900))
        )
        .mockResolvedValueOnce(
          queryProposalsResponse(twelveHundredProposals.slice(900, 1000))
        )
        .mockResolvedValueOnce(
          queryProposalsResponse(twelveHundredProposals.slice(1000, 1100))
        );
      spyConsoleError = silentConsoleErrors();
      expect(spyQuerySnsProposals).not.toHaveBeenCalled();
      expect(spyConsoleError).not.toHaveBeenCalled();

      await loadActionableSnsProposals();

      expect(spyQuerySnsProposals).toHaveBeenCalledTimes(10);
      // expect an error message
      expect(spyConsoleError).toHaveBeenCalledTimes(1);
      expect(spyConsoleError).toHaveBeenCalledWith(
        "Max actionable sns pages loaded"
      );

      const storeProposals = get(actionableSnsProposalsStore)?.[
        rootCanisterId1.toText()
      ]?.proposals;
      expect(storeProposals).toHaveLength(1000);
      expect(storeProposals).toEqual(twelveHundredProposals.slice(0, 1000));
    });

    it("should update the store with actionable proposal only", async () => {
      mockSnsProjectsCommittedStore([rootCanisterId1, rootCanisterId2]);
      expect(spyQuerySnsProposals).not.toHaveBeenCalled();

      await loadActionableSnsProposals();

      expect(get(actionableSnsProposalsStore)).toEqual({
        [rootCanisterId1.toText()]: {
          proposals: [votableProposal1],
          fetchLimitReached: false,
        },
        [rootCanisterId2.toText()]: {
          proposals: [votableProposal2],
          fetchLimitReached: false,
        },
      });
    });
  });
});
