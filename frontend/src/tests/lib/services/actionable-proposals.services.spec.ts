import * as governanceApi from "$lib/api/governance.api";
import * as api from "$lib/api/proposals.api";
import { loadActionableProposals } from "$lib/services/actionable-proposals.services";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { authStore } from "$lib/stores/auth.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
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
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("updateActionableProposals", () => {
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
      id: 0n,
    };
    const votedProposal: ProposalInfo = {
      ...mockProposalInfo,
      id: votedProposalId,
    };
    const fiveHundredsProposal = Array.from(Array(500))
      .map((_, index) => ({
        ...mockProposalInfo,
        id: BigInt(index),
      }))
      .reverse();
    let spyQueryProposals;
    let spyQueryNeurons;
    let spyConsoleError;

    beforeEach(() => {
      vi.clearAllMocks();
      neuronsStore.reset();
      actionableNnsProposalsStore.reset();
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );
      spyQueryProposals = vi
        .spyOn(api, "queryProposals")
        .mockImplementation((requestData) =>
          requestData.includeRewardStatus?.includes(
            ProposalRewardStatus.AcceptVotes
          )
            ? Promise.resolve([votableProposal, votedProposal])
            : // Return nothing for Topic.ManageNeuron proposals
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
    });

    it("should query list proposals using multiple calls", async () => {
      const firstResponseProposals = fiveHundredsProposal.slice(0, 100);
      const secondResponseProposals = [fiveHundredsProposal[100]];

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
      expect(get(actionableNnsProposalsStore)?.proposals?.length).toEqual(101);
      expect(get(actionableNnsProposalsStore)?.proposals).toEqual([
        ...firstResponseProposals,
        ...secondResponseProposals,
      ]);
    });

    it("should log an error when request count limit reached", async () => {
      spyQueryProposals = vi
        .spyOn(api, "queryProposals")
        .mockResolvedValueOnce(fiveHundredsProposal.slice(0, 100))
        .mockResolvedValueOnce(fiveHundredsProposal.slice(100, 200))
        .mockResolvedValueOnce(fiveHundredsProposal.slice(200, 300))
        .mockResolvedValueOnce(fiveHundredsProposal.slice(300, 400))
        .mockResolvedValueOnce(fiveHundredsProposal.slice(400, 500));
      spyConsoleError = silentConsoleErrors();
      expect(spyQueryProposals).not.toHaveBeenCalled();
      expect(spyConsoleError).not.toHaveBeenCalled();

      await loadActionableProposals();

      expect(spyQueryProposals).toHaveBeenCalledTimes(6);
      // expect an error message
      expect(spyConsoleError).toHaveBeenCalledTimes(1);
      expect(spyConsoleError).toHaveBeenCalledWith(
        "Max actionable pages loaded"
      );

      expect(get(actionableNnsProposalsStore)?.proposals?.length).toEqual(500);
      expect(get(actionableNnsProposalsStore)?.proposals).toEqual(
        fiveHundredsProposal
      );
    });

    it("should update actionable nns proposals store with votable proposals only", async () => {
      expect(get(actionableNnsProposalsStore)).toEqual({
        proposals: undefined,
      });

      await loadActionableProposals();

      expect(get(actionableNnsProposalsStore)).toEqual({
        proposals: [votableProposal],
      });
    });

    describe("ManageNeurons proposals", () => {
      const expectedManageNeuronPayload = {
        identity: mockIdentity,
        beforeProposal: undefined,
        certified: false,
        includeRewardStatus: [ProposalRewardStatus.Ineligible],
        includeStatus: [ProposalStatus.Open],
        includeTopics: [Topic.ManageNeuron],
      };
      const proposal0 = {
        ...mockProposalInfo,
        id: 0n,
      } as ProposalInfo;
      const proposal1 = {
        ...mockProposalInfo,
        id: 1n,
      } as ProposalInfo;
      const proposal2 = {
        ...mockProposalInfo,
        id: 2n,
      } as ProposalInfo;

      /*
      -
      - should log an error when request count limit reached
       */
      it("should query list proposals also with ManageNeurons payload", async () => {
        spyQueryProposals = vi
          .spyOn(api, "queryProposals")
          // Accepting rewards proposals
          .mockResolvedValueOnce([])
          // ManageNeurons proposals
          .mockResolvedValueOnce([proposal1, proposal0]);

        expect(spyQueryProposals).not.toHaveBeenCalled();

        await loadActionableProposals();

        expect(spyQueryProposals).toHaveBeenCalledTimes(2);
        expect(spyQueryProposals.mock.calls[0][0]).toEqual({
          identity: mockIdentity,
          beforeProposal: undefined,
          certified: false,
          includeRewardStatus: [ProposalRewardStatus.AcceptVotes],
        });
        expect(spyQueryProposals.mock.calls[1][0]).toEqual({
          ...expectedManageNeuronPayload,
        });
      });

      it("should combine and sort votable AcceptedRewards with votable ManageNeurons proposals", async () => {
        spyQueryProposals = vi
          .spyOn(api, "queryProposals")
          // Accepting rewards proposals
          .mockResolvedValueOnce([proposal1])
          // ManageNeurons proposals
          .mockResolvedValueOnce([proposal2, proposal0]);

        expect(spyQueryProposals).not.toHaveBeenCalled();

        await loadActionableProposals();

        expect(spyQueryProposals).toHaveBeenCalledTimes(2);

        const storeProposals = get(actionableNnsProposalsStore)?.proposals;
        expect(storeProposals.length).toEqual(3);
        expect(storeProposals).toEqual([proposal2, proposal1, proposal0]);
      });

      it("should request ManageNeurons proposals using multiple calls", async () => {
        const firstResponseProposals = fiveHundredsProposal.slice(0, 100);
        const secondResponseProposals = [fiveHundredsProposal[100]];

        spyQueryProposals = vi
          .spyOn(api, "queryProposals")
          // Accepting rewards proposals
          .mockResolvedValueOnce([])
          // ManageNeurons proposals
          .mockResolvedValueOnce(firstResponseProposals)
          .mockResolvedValueOnce(secondResponseProposals);
        expect(spyQueryProposals).not.toHaveBeenCalled();

        await loadActionableProposals();

        expect(spyQueryProposals).toHaveBeenCalledTimes(3);
        expect(spyQueryProposals.mock.calls[0][0]).toEqual({
          identity: mockIdentity,
          beforeProposal: undefined,
          certified: false,
          includeRewardStatus: [ProposalRewardStatus.AcceptVotes],
        });
        expect(spyQueryProposals.mock.calls[1][0]).toEqual(
          expectedManageNeuronPayload
        );
        expect(spyQueryProposals.mock.calls[2][0]).toEqual({
          ...expectedManageNeuronPayload,
          beforeProposal:
            firstResponseProposals[firstResponseProposals.length - 1].id,
        });
        expect(get(actionableNnsProposalsStore)?.proposals?.length).toEqual(
          101
        );
        expect(get(actionableNnsProposalsStore)?.proposals).toEqual([
          ...firstResponseProposals,
          ...secondResponseProposals,
        ]);
      });

      it("should log an error when request count limit reached", async () => {
        spyQueryProposals = vi
          .spyOn(api, "queryProposals")
          // Accepting rewards proposals
          .mockResolvedValueOnce([])
          // ManageNeurons proposals
          .mockResolvedValueOnce(fiveHundredsProposal.slice(0, 100))
          .mockResolvedValueOnce(fiveHundredsProposal.slice(100, 200))
          .mockResolvedValueOnce(fiveHundredsProposal.slice(200, 300))
          .mockResolvedValueOnce(fiveHundredsProposal.slice(300, 400))
          .mockResolvedValueOnce(fiveHundredsProposal.slice(400, 500));
        spyConsoleError = silentConsoleErrors();
        expect(spyQueryProposals).not.toHaveBeenCalled();
        expect(spyConsoleError).not.toHaveBeenCalled();

        await loadActionableProposals();

        expect(spyQueryProposals).toHaveBeenCalledTimes(6);
        // expect an error message
        expect(spyConsoleError).toHaveBeenCalledTimes(1);
        expect(spyConsoleError).toHaveBeenCalledWith(
          "Max actionable pages loaded"
        );
        expect(get(actionableNnsProposalsStore)?.proposals?.length).toEqual(
          500
        );
        expect(get(actionableNnsProposalsStore)?.proposals).toEqual(
          fiveHundredsProposal
        );
      });

      it("should update actionable nns proposals store only with votable Neuron Management proposals", async () => {
        spyQueryProposals = vi
          .spyOn(api, "queryProposals")
          // Accepting rewards proposals
          .mockResolvedValueOnce([])
          // ManageNeurons proposals
          .mockResolvedValueOnce([votableProposal, votedProposal]);

        expect(get(actionableNnsProposalsStore)).toEqual({
          proposals: undefined,
        });

        await loadActionableProposals();

        expect(get(actionableNnsProposalsStore)).toEqual({
          proposals: [votableProposal],
        });
      });
    });
  });
});
