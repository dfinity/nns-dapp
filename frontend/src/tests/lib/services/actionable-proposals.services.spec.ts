import * as governanceApi from "$lib/api/governance.api";
import * as api from "$lib/api/proposals.api";
import { loadActionableProposals } from "$lib/services/actionable-proposals.services";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { authStore } from "$lib/stores/auth.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { silentConsoleErrors } from "$tests/utils/utils.test-utils";
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

    it("should query list proposals using multiple calls", async () => {
      let count = 0;
      let lastId = 1000n;
      spyQueryProposals = vi
        .spyOn(api, "queryProposals")
        .mockImplementation(() => {
          // stop after second call
          if (count++ === 1) {
            return Promise.resolve([votedProposal]);
          }

          return Promise.resolve(
            Array.from(Array(100)).map(() => ({
              ...mockProposalInfo,
              id: BigInt(lastId--),
            }))
          );
        });

      expect(spyQueryProposals).not.toHaveBeenCalled();

      await loadActionableProposals();

      expect(spyQueryProposals).toHaveBeenCalledTimes(2);
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
      expect(spyQueryProposals).toHaveBeenCalledWith(
        expect.objectContaining({
          // should call with beforeProposal: last-loaded-proposal-id
          beforeProposal: 901n,
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

    it("should throw when page limit reached", async () => {
      // always return full page
      spyQueryProposals = vi
        .spyOn(api, "queryProposals")
        .mockImplementation(() =>
          Promise.resolve(Array.from(Array(100)).map(() => mockProposalInfo))
        );
      const spyConsoleError = silentConsoleErrors();

      expect(spyQueryProposals).not.toHaveBeenCalled();
      expect(spyConsoleError).not.toHaveBeenCalled();

      await loadActionableProposals();

      expect(spyQueryProposals).toHaveBeenCalledTimes(5);
      // expect an error message
      expect(spyConsoleError).toHaveBeenCalledTimes(1);
      expect(spyConsoleError).toHaveBeenCalledWith(
        "Max actionable pages loaded"
      );

      spyConsoleError.mockReset();
    });

    it("should update actionable nns proposals store with votable proposals only", async () => {
      console.error("lol");
      expect(get(actionableNnsProposalsStore)).toEqual({
        proposals: undefined,
      });

      await loadActionableProposals();

      expect(get(actionableNnsProposalsStore)).toEqual({
        proposals: [votableProposal],
      });
    });

    it("should not query proposals when store is already filled", async () => {
      expect(spyQueryProposals).not.toHaveBeenCalled();
      expect(spyQueryNeurons).not.toHaveBeenCalled();
      actionableNnsProposalsStore.setProposals([votableProposal]);

      await loadActionableProposals();
      // just in case
      await runResolvedPromises();

      expect(spyQueryProposals).not.toHaveBeenCalled();
      expect(spyQueryNeurons).not.toHaveBeenCalled();
    });
  });
});
