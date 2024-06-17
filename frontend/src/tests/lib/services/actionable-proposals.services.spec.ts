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
import type { NeuronInfo, ProposalInfo } from "@dfinity/nns";
import { ProposalRewardStatus, Vote } from "@dfinity/nns";
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

      expect(spyQueryProposals).toHaveBeenCalledTimes(1);
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

      expect(spyQueryProposals).toHaveBeenCalledTimes(2);
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

      expect(spyQueryProposals).toHaveBeenCalledTimes(5);
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
  });
});
