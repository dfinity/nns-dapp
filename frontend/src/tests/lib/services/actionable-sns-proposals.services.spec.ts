import * as api from "$lib/api/sns-governance.api";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { loadActionableSnsProposals } from "$lib/services/actionable-sns-proposals.services";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { authStore } from "$lib/stores/auth.store";
import { enumValues } from "$lib/utils/enum.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import type { Principal } from "@dfinity/principal";
import {
  SnsNeuronPermissionType,
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsVote,
  neuronSubaccount,
  type SnsListProposalsResponse,
  type SnsNeuron,
  type SnsNeuronId,
  type SnsProposalData,
} from "@dfinity/sns";
import { get } from "svelte/store";

describe("actionable-sns-proposals.services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    const votableProposal: SnsProposalData = {
      ...createSnsProposal({
        proposalId: 0n,
        createdAt: 1n,
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        rewardStatus:
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
        ballots: [
          [
            neuronIdHex,
            {
              vote: SnsVote.Unspecified,
              cast_timestamp_seconds: 123n,
              voting_power: 10000n,
            },
          ],
        ],
      }),
    };
    const votedProposal: SnsProposalData = {
      ...createSnsProposal({
        proposalId: 1n,
        createdAt: 1n,
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        rewardStatus:
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
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
      }),
    };
    const rootCanisterId1 = principal(0);
    const rootCanisterId2 = principal(1);

    const mockSnsProjectsCommittedStore = (rootCanisterIds: Principal[]) =>
      vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
        mockProjectSubscribe(
          rootCanisterIds.map((rootCanisterId) => ({
            ...mockSnsFullProject,
            rootCanisterId,
          }))
        )
      );

    let spyQuerySnsProposals;
    let spyQuerySnsNeurons;
    let includeBallotsByCaller = true;

    beforeEach(() => {
      vi.clearAllMocks();
      actionableSnsProposalsStore.resetForTesting();

      resetIdentity();
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );

      vi.spyOn(snsProjectsCommittedStore, "subscribe").mockClear();

      spyQuerySnsNeurons = vi
        .spyOn(api, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([neuron]));
      includeBallotsByCaller = true;
      spyQuerySnsProposals = vi.spyOn(api, "queryProposals").mockImplementation(
        async () =>
          ({
            proposals: [votableProposal, votedProposal],
            include_ballots_by_caller: [includeBallotsByCaller],
          }) as SnsListProposalsResponse
      );
    });

    it("should query user neurons per sns", async () => {
      mockSnsProjectsCommittedStore([rootCanisterId1, rootCanisterId2]);
      expect(spyQuerySnsNeurons).not.toHaveBeenCalled();

      await loadActionableSnsProposals();

      expect(spyQuerySnsNeurons).toHaveBeenCalledTimes(2);
      expect(spyQuerySnsNeurons).toHaveBeenCalledWith(
        expect.objectContaining({
          rootCanisterId: rootCanisterId1,
          certified: false,
        })
      );
      expect(spyQuerySnsNeurons).toHaveBeenCalledWith(
        expect.objectContaining({
          rootCanisterId: rootCanisterId2,
          certified: false,
        })
      );
    });

    it("should query proposals per sns with accept rewards status only", async () => {
      mockSnsProjectsCommittedStore([rootCanisterId1, rootCanisterId2]);
      expect(spyQuerySnsProposals).not.toHaveBeenCalled();

      await loadActionableSnsProposals();

      expect(spyQuerySnsProposals).toHaveBeenCalledTimes(2);
      const expectedFilterParams = {
        includeRewardStatus: [
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
        ],
        limit: 20,
      };
      expect(spyQuerySnsProposals).toHaveBeenCalledWith(
        expect.objectContaining({
          rootCanisterId: rootCanisterId1,
          certified: false,
          params: expectedFilterParams,
        })
      );
      expect(spyQuerySnsProposals).toHaveBeenCalledWith(
        expect.objectContaining({
          rootCanisterId: rootCanisterId2,
          certified: false,
          params: expectedFilterParams,
        })
      );
    });

    it("should update the store with actionable proposal only", async () => {
      mockSnsProjectsCommittedStore([rootCanisterId1, rootCanisterId2]);
      expect(spyQuerySnsProposals).not.toHaveBeenCalled();

      await loadActionableSnsProposals();

      expect(get(actionableSnsProposalsStore)).toEqual({
        [rootCanisterId1.toText()]: [votableProposal],
        [rootCanisterId2.toText()]: [votableProposal],
      });
    });

    it("should not query data when already in the store", async () => {
      mockSnsProjectsCommittedStore([rootCanisterId1]);

      expect(spyQuerySnsNeurons).not.toHaveBeenCalled();
      expect(spyQuerySnsProposals).not.toHaveBeenCalled();

      await loadActionableSnsProposals();

      expect(spyQuerySnsNeurons).toHaveBeenCalledTimes(1);
      expect(spyQuerySnsProposals).toHaveBeenCalledTimes(1);

      await loadActionableSnsProposals();

      expect(spyQuerySnsNeurons).toHaveBeenCalledTimes(1);
      expect(spyQuerySnsProposals).toHaveBeenCalledTimes(1);
    });

    it("should not query proposals when the user has no neurons", async () => {
      mockSnsProjectsCommittedStore([rootCanisterId1]);
      spyQuerySnsNeurons = vi
        .spyOn(api, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([]));

      await loadActionableSnsProposals();

      expect(spyQuerySnsNeurons).toHaveBeenCalledTimes(1);
      expect(spyQuerySnsProposals).toHaveBeenCalledTimes(0);
    });
  });
});
