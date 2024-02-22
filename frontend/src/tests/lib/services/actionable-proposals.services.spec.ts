import * as governanceApi from "$lib/api/governance.api";
import * as api from "$lib/api/proposals.api";
import { loadActionableProposals } from "$lib/services/actionable-proposals.services";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { authStore } from "$lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import type { NeuronInfo, ProposalInfo } from "@dfinity/nns";
import { ProposalRewardStatus, Vote } from "@dfinity/nns";
import { get } from "svelte/store";

describe("actionable-proposals.services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateActionableProposals", () => {
    const neuronId = 0n;
    const neuron1: NeuronInfo = {
      ...mockNeuron,
      neuronId,
      recentBallots: [
        {
          vote: Vote.Yes,
          proposalId: 1n,
        },
      ],
    };
    const votableProposal: ProposalInfo = {
      ...mockProposalInfo,
      id: 0n,
    };
    const votedProposal: ProposalInfo = {
      ...mockProposalInfo,
      id: 1n,
    };
    let spyQueryProposals;
    let spyQueryNeurons;

    beforeEach(() => {
      vi.clearAllMocks();
      actionableNnsProposalsStore.reset();
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );
      spyQueryProposals = vi
        .spyOn(api, "queryProposals")
        .mockImplementation(() =>
          Promise.resolve([votableProposal, votedProposal])
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

    it("should query the canister to get list proposals with accept rewards status", async () => {
      expect(spyQueryProposals).not.toHaveBeenCalled();

      await loadActionableProposals();

      expect(spyQueryProposals).toHaveBeenCalledTimes(1);
      expect(spyQueryProposals).toHaveBeenCalledWith(
        expect.objectContaining({
          beforeProposal: undefined,
          certified: false,
          filters: {
            excludeVotedProposals: false,
            lastAppliedFilter: undefined,
            rewards: [ProposalRewardStatus.AcceptVotes],
            status: [],
            topics: [],
          },
        })
      );
    });

    it("should update actionable nns proposals store with votable proposals only", async () => {
      expect(spyQueryProposals).not.toHaveBeenCalled();

      await loadActionableProposals();

      const { proposals } = get(actionableNnsProposalsStore);
      expect(proposals).toHaveLength(1);
      expect(proposals).toEqual([votableProposal]);
    });
  });
});
