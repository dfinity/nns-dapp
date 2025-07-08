import * as governanceApi from "$lib/api/governance.api";
import * as api from "$lib/api/proposals.api";
import { loadActionableProposals } from "$lib/services/actionable-proposals.services";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { silentConsoleErrors } from "$tests/utils/utils.test-utils";
import {
  ProposalRewardStatus,
  ProposalStatus,
  Topic,
  Vote,
  type NeuronInfo,
  type ProposalInfo,
} from "@dfinity/nns";
import { get } from "svelte/store";

describe("actionable-proposals.services", () => {
  describe("updateActionableProposals", () => {
    const expectedQueryManageNeuronProposalsParams = {
      identity: mockIdentity,
      beforeProposal: undefined,
      certified: false,
      includeStatus: [ProposalStatus.Open],
      includeTopics: [Topic.NeuronManagement],
      includeRewardStatus: [ProposalRewardStatus.Ineligible],
    };
    const callLoadActionableProposals = async ({
      queryProposalsResponses,
      expectedQueryProposalsParams = [],
    }: {
      queryProposalsResponses: ProposalInfo[][];
      expectedQueryProposalsParams?: Array<unknown>;
    }) => {
      spyQueryProposals = vi.spyOn(api, "queryProposals");
      for (const response of queryProposalsResponses) {
        spyQueryProposals.mockResolvedValueOnce(response);
      }

      await loadActionableProposals();

      for (const params of expectedQueryProposalsParams) {
        expect(spyQueryProposals).toHaveBeenCalledWith(params);
      }
    };
    const votedProposalId = 1234n;
    const neuronId = 0n;
    const neuron1: NeuronInfo = {
      ...mockNeuron,
      neuronId,
      recentBallots: [
        {
          vote: Vote.Yes,
          proposalId: votedProposalId,
        },
      ],
    };
    const votableProposal: ProposalInfo = {
      ...mockProposalInfo,
      ballots: [
        {
          neuronId,
          vote: Vote.Unspecified,
          votingPower: 1n,
        },
      ],
      id: 0n,
    };
    const votedProposal: ProposalInfo = {
      ...mockProposalInfo,
      ballots: [
        {
          neuronId,
          vote: Vote.Yes,
          votingPower: 1n,
        },
      ],
      id: votedProposalId,
    };
    const twelveHundredsProposal = Array.from(Array(1200))
      .map((_, index) => ({
        ...mockProposalInfo,
        id: BigInt(index),
        ballots: [
          {
            neuronId,
            vote: Vote.Unspecified,
            votingPower: 1n,
          },
        ],
      }))
      .reverse();
    let spyQueryProposals;
    let spyQueryNeurons;
    let spyConsoleError;

    beforeEach(() => {
      resetIdentity();
      spyQueryProposals = vi
        .spyOn(api, "queryProposals")
        .mockImplementation((requestData) =>
          requestData.includeRewardStatus?.includes(
            ProposalRewardStatus.AcceptVotes
          )
            ? Promise.resolve([votableProposal, votedProposal])
            : // Return nothing for Topic.NeuronManagement proposals
              Promise.resolve([])
        );
      spyQueryNeurons = vi
        .spyOn(governanceApi, "queryNeurons")
        .mockResolvedValue([neuron1]);
    });

    it("should query user neurons", async () => {
      expect(spyQueryNeurons).not.toHaveBeenCalled();

      await loadActionableProposals();

      expect(spyQueryNeurons).toHaveBeenCalledTimes(1);
      expect(spyQueryNeurons).toHaveBeenCalledWith(
        expect.objectContaining({
          certified: false,
        })
      );
    });

    it("should load neurons in the neuron store", async () => {
      expect(get(neuronsStore)).toEqual(
        expect.objectContaining({ neurons: undefined })
      );

      await loadActionableProposals();

      expect(get(neuronsStore)).toEqual(
        expect.objectContaining({ neurons: [neuron1] })
      );
    });

    it("should query the canister to get list proposals with accept rewards status", async () => {
      expect(spyQueryProposals).not.toHaveBeenCalled();

      await loadActionableProposals();

      expect(spyQueryProposals).toHaveBeenCalledTimes(2);
      expect(spyQueryProposals).toHaveBeenCalledWith(
        expect.objectContaining({
          beforeProposal: undefined,
          certified: false,
          includeRewardStatus: [ProposalRewardStatus.AcceptVotes],
        })
      );
      expect(spyQueryProposals).toHaveBeenCalledWith(
        expectedQueryManageNeuronProposalsParams
      );
    });

    it("should query list proposals using multiple calls", async () => {
      const firstResponseProposals = twelveHundredsProposal.slice(0, 100);
      const secondResponseProposals = twelveHundredsProposal.slice(100, 150);

      spyQueryProposals = vi
        .spyOn(api, "queryProposals")
        .mockResolvedValueOnce(firstResponseProposals)
        .mockResolvedValueOnce(secondResponseProposals);
      expect(spyQueryProposals).not.toHaveBeenCalled();

      await loadActionableProposals();

      expect(spyQueryProposals).toHaveBeenCalledTimes(3);
      expect(spyQueryProposals).toHaveBeenCalledWith({
        identity: mockIdentity,
        beforeProposal: undefined,
        certified: false,
        includeRewardStatus: [ProposalRewardStatus.AcceptVotes],
      });
      expect(spyQueryProposals).toHaveBeenCalledWith({
        identity: mockIdentity,
        beforeProposal:
          firstResponseProposals[firstResponseProposals.length - 1].id,
        certified: false,
        includeRewardStatus: [ProposalRewardStatus.AcceptVotes],
      });
      expect(spyQueryProposals).toHaveBeenCalledWith(
        expectedQueryManageNeuronProposalsParams
      );
      expect(get(actionableNnsProposalsStore)?.proposals?.length).toEqual(150);
      expect(get(actionableNnsProposalsStore)?.proposals).toEqual([
        ...firstResponseProposals,
        ...secondResponseProposals,
      ]);
    });

    it("should log an error when request count limit reached", async () => {
      spyQueryProposals = vi
        .spyOn(api, "queryProposals")
        .mockResolvedValueOnce(twelveHundredsProposal.slice(0, 100))
        .mockResolvedValueOnce(twelveHundredsProposal.slice(100, 200))
        .mockResolvedValueOnce(twelveHundredsProposal.slice(200, 300))
        .mockResolvedValueOnce(twelveHundredsProposal.slice(300, 400))
        .mockResolvedValueOnce(twelveHundredsProposal.slice(400, 500))
        .mockResolvedValueOnce(twelveHundredsProposal.slice(500, 600))
        .mockResolvedValueOnce(twelveHundredsProposal.slice(600, 700))
        .mockResolvedValueOnce(twelveHundredsProposal.slice(700, 800))
        .mockResolvedValueOnce(twelveHundredsProposal.slice(800, 900))
        .mockResolvedValueOnce(twelveHundredsProposal.slice(900, 1000))
        .mockResolvedValueOnce(twelveHundredsProposal.slice(1000, 1100))
        .mockResolvedValueOnce(twelveHundredsProposal.slice(1100, 1150));
      spyConsoleError = silentConsoleErrors();
      expect(spyQueryProposals).not.toHaveBeenCalled();
      expect(spyConsoleError).not.toHaveBeenCalled();

      await loadActionableProposals();
      expect(spyQueryProposals).toHaveBeenCalledTimes(12);

      // expect an error message
      expect(spyConsoleError).toHaveBeenCalledTimes(1);
      expect(spyConsoleError).toHaveBeenCalledWith(
        "Max actionable pages loaded"
      );

      expect(get(actionableNnsProposalsStore)?.proposals?.length).toEqual(1150);
      expect(get(actionableNnsProposalsStore)?.proposals).toEqual(
        twelveHundredsProposal.slice(0, 1150)
      );
    });

    it("should update actionable nns proposals store with votable proposals only", async () => {
      expect(get(actionableNnsProposalsStore)).toEqual({
        proposals: undefined,
        fetchLimitReached: false,
      });

      await loadActionableProposals();

      expect(get(actionableNnsProposalsStore)).toEqual({
        proposals: [votableProposal],
        fetchLimitReached: false,
      });
    });

    describe("ManageNeurons proposals", () => {
      const proposal0 = {
        ...mockProposalInfo,
        id: 0n,
        ballots: [
          {
            neuronId,
            vote: Vote.Unspecified,
            votingPower: 1n,
          },
        ],
      } as ProposalInfo;
      const proposal1 = {
        ...mockProposalInfo,
        id: 1n,
        ballots: [
          {
            neuronId,
            vote: Vote.Unspecified,
            votingPower: 1n,
          },
        ],
      } as ProposalInfo;
      const proposal2 = {
        ...mockProposalInfo,
        id: 2n,
        ballots: [
          {
            neuronId,
            vote: Vote.Unspecified,
            votingPower: 1n,
          },
        ],
      } as ProposalInfo;

      it("should query list proposals also with ManageNeurons payload", async () => {
        await callLoadActionableProposals({
          queryProposalsResponses: [[], [proposal1, proposal0]],
          expectedQueryProposalsParams: [
            {
              identity: mockIdentity,
              beforeProposal: undefined,
              certified: false,
              includeRewardStatus: [ProposalRewardStatus.AcceptVotes],
            },
            expectedQueryManageNeuronProposalsParams,
          ],
        });

        expect(spyQueryProposals).toHaveBeenCalledTimes(2);
      });

      it("should combine and sort votable AcceptedRewards with votable ManageNeurons proposals", async () => {
        await callLoadActionableProposals({
          queryProposalsResponses: [[proposal1], [proposal2, proposal0]],
        });

        expect(spyQueryProposals).toHaveBeenCalledTimes(2);

        const storeProposals = get(actionableNnsProposalsStore)?.proposals;
        expect(storeProposals.length).toEqual(3);
        expect(storeProposals).toEqual([proposal2, proposal1, proposal0]);
      });

      it("should request ManageNeurons proposals using multiple calls", async () => {
        const firstResponseProposals = twelveHundredsProposal.slice(0, 100);
        const secondResponseProposals = [twelveHundredsProposal[100]];

        await callLoadActionableProposals({
          queryProposalsResponses: [
            [],
            firstResponseProposals,
            secondResponseProposals,
          ],
          expectedQueryProposalsParams: [
            {
              identity: mockIdentity,
              beforeProposal: undefined,
              certified: false,
              includeRewardStatus: [ProposalRewardStatus.AcceptVotes],
            },
            expectedQueryManageNeuronProposalsParams,
            {
              ...expectedQueryManageNeuronProposalsParams,
              beforeProposal:
                firstResponseProposals[firstResponseProposals.length - 1].id,
            },
          ],
        });

        expect(spyQueryProposals).toHaveBeenCalledTimes(3);
        expect(get(actionableNnsProposalsStore)?.proposals?.length).toEqual(
          101
        );
        expect(get(actionableNnsProposalsStore)?.proposals).toEqual([
          ...firstResponseProposals,
          ...secondResponseProposals,
        ]);
      });

      it("should log an error when request count limit reached", async () => {
        spyConsoleError = silentConsoleErrors();
        expect(spyConsoleError).not.toHaveBeenCalled();

        await callLoadActionableProposals({
          queryProposalsResponses: [
            [],
            twelveHundredsProposal.slice(0, 100),
            twelveHundredsProposal.slice(100, 200),
            twelveHundredsProposal.slice(200, 300),
            twelveHundredsProposal.slice(300, 400),
            twelveHundredsProposal.slice(400, 500),
            twelveHundredsProposal.slice(500, 600),
            twelveHundredsProposal.slice(600, 700),
            twelveHundredsProposal.slice(700, 800),
            twelveHundredsProposal.slice(800, 900),
            twelveHundredsProposal.slice(900, 1000),
            twelveHundredsProposal.slice(1000, 1100),
            twelveHundredsProposal.slice(1100, 1200),
          ],
        });

        expect(spyQueryProposals).toHaveBeenCalledTimes(11);
        // expect an error message
        expect(spyConsoleError).toHaveBeenCalledTimes(1);
        expect(spyConsoleError).toHaveBeenCalledWith(
          "Max actionable pages loaded"
        );
        expect(get(actionableNnsProposalsStore)?.proposals?.length).toEqual(
          1000
        );
        expect(get(actionableNnsProposalsStore)?.proposals).toEqual(
          twelveHundredsProposal.slice(0, 1000)
        );
      });

      it("should update actionable nns proposals store only with votable Neuron Management proposals", async () => {
        expect(get(actionableNnsProposalsStore)).toEqual({
          proposals: undefined,
          fetchLimitReached: false,
        });

        await callLoadActionableProposals({
          queryProposalsResponses: [[], [votableProposal, votedProposal]],
        });

        expect(get(actionableNnsProposalsStore)).toEqual({
          proposals: [votableProposal],
          fetchLimitReached: false,
        });
      });
    });
  });
});
