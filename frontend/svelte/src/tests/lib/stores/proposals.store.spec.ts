import type { ProposalInfo } from "@dfinity/nns";
import { ProposalRewardStatus, ProposalStatus, Topic } from "@dfinity/nns";
import { get } from "svelte/store";
import { DEFAULT_PROPOSALS_FILTERS } from "../../../lib/constants/proposals.constants";
import {
  proposalIdStore,
  proposalInfoStore,
  proposalsFiltersStore,
  proposalsStore,
  votingNeuronSelectStore,
} from "../../../lib/stores/proposals.store";
import { mockNeuron } from "../../mocks/neurons.mock";

describe("proposals-store", () => {
  describe("proposals", () => {
    const mockProposals: ProposalInfo[] = [
      {
        id: "test1",
      },
      { id: "test2" },
    ] as unknown as ProposalInfo[];

    it("should set proposals", () => {
      proposalsStore.setProposals(mockProposals);

      const proposals = get(proposalsStore);
      expect(proposals).toEqual(mockProposals);
    });

    it("should push proposals", () => {
      proposalsStore.setProposals(mockProposals);

      proposalsStore.pushProposals({
        proposals: mockProposals,
        certified: true,
      });

      const proposals = get(proposalsStore);
      expect(proposals).toEqual([...mockProposals, ...mockProposals]);
    });

    it("should push proposals with certified-version replacement", () => {
      proposalsStore.setProposals(
        mockProposals.map((proposal) => ({
          ...proposal,
          proposalTimestampSeconds: BigInt(0),
        }))
      );

      const newProposals = mockProposals.map((proposal) => ({
        ...proposal,
        proposalTimestampSeconds: BigInt(1),
      }));

      proposalsStore.pushProposals({
        proposals: newProposals,
        certified: true,
      });

      const proposals = get(proposalsStore);
      expect(proposals[0].proposalTimestampSeconds).toEqual(BigInt(1));
      expect(proposals[1].proposalTimestampSeconds).toEqual(BigInt(1));
      expect(proposals.length).toEqual(mockProposals.length);
    });

    it("should reset proposals", () => {
      proposalsStore.setProposals(mockProposals);
      proposalsStore.setProposals([]);

      const proposals = get(proposalsStore);
      expect(proposals).toEqual([]);
    });
  });

  describe("filter", () => {
    beforeEach(() => {
      proposalsFiltersStore.filterTopics(DEFAULT_PROPOSALS_FILTERS.topics);
      proposalsFiltersStore.filterRewards(DEFAULT_PROPOSALS_FILTERS.rewards);
      proposalsFiltersStore.filterStatus(DEFAULT_PROPOSALS_FILTERS.status);
    });

    it("should be initialized with default filters", () => {
      const filters = get(proposalsFiltersStore);
      expect(filters).toEqual(DEFAULT_PROPOSALS_FILTERS);
    });

    it("should reset filters", () => {
      const filter = [Topic.NetworkEconomics, Topic.SubnetManagement];
      proposalsFiltersStore.filterTopics(filter);

      proposalsFiltersStore.reset();

      const filters = get(proposalsFiltersStore);
      expect(filters).toEqual(DEFAULT_PROPOSALS_FILTERS);
    });

    it("should update topic filters", () => {
      const filter = [Topic.NetworkEconomics, Topic.SubnetManagement];
      proposalsFiltersStore.filterTopics(filter);

      const filters = get(proposalsFiltersStore);
      expect(filters).toEqual({
        ...DEFAULT_PROPOSALS_FILTERS,
        topics: filter,
      });
    });

    it("should update topic rewards", () => {
      const filter = [
        ProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
        ProposalRewardStatus.PROPOSAL_REWARD_STATUS_READY_TO_SETTLE,
      ];
      proposalsFiltersStore.filterRewards(filter);

      const filters = get(proposalsFiltersStore);
      expect(filters).toEqual({
        ...DEFAULT_PROPOSALS_FILTERS,
        rewards: filter,
      });
    });

    it("should update topic status", () => {
      const filter = [
        ProposalStatus.PROPOSAL_STATUS_OPEN,
        ProposalStatus.PROPOSAL_STATUS_REJECTED,
      ];
      proposalsFiltersStore.filterStatus(filter);

      const filters = get(proposalsFiltersStore);
      expect(filters).toEqual({
        ...DEFAULT_PROPOSALS_FILTERS,
        status: filter,
      });
    });

    it("should toggle excluded vote proposals back and forth", () => {
      proposalsFiltersStore.toggleExcludeVotedProposals();

      let filters = get(proposalsFiltersStore);
      expect(filters).toEqual({
        ...DEFAULT_PROPOSALS_FILTERS,
        excludeVotedProposals: true,
      });

      proposalsFiltersStore.toggleExcludeVotedProposals();

      filters = get(proposalsFiltersStore);
      expect(filters).toEqual({
        ...DEFAULT_PROPOSALS_FILTERS,
        excludeVotedProposals: false,
      });
    });
  });

  describe("proposalIdStore", () => {
    it("should store", () => {
      proposalIdStore.set(BigInt(0));
      expect(get(proposalIdStore)).toEqual(BigInt(0));
    });

    it("should reset", () => {
      proposalIdStore.set(BigInt(0));
      proposalIdStore.reset();
      expect(get(proposalIdStore)).toEqual(undefined);
    });
  });

  describe("proposalInfoStore", () => {
    const mockProposalInfo = { id: BigInt(0) } as unknown as ProposalInfo;

    it("should store proposalInfo", () => {
      proposalIdStore.set(BigInt(0));
      proposalInfoStore.set(mockProposalInfo);
      expect(get(proposalInfoStore)).toEqual(mockProposalInfo);
    });

    it("should reset after proposalIdStore change", () => {
      proposalIdStore.set(BigInt(0));
      proposalInfoStore.set(mockProposalInfo);
      proposalIdStore.set(BigInt(1));
      expect(get(proposalInfoStore)).toEqual(undefined);
    });

    it("should not reset after proposalIdStore change with the same id", () => {
      proposalIdStore.set(BigInt(0));
      proposalInfoStore.set(mockProposalInfo);
      proposalIdStore.set(BigInt(0));
      expect(get(proposalInfoStore)).toEqual(mockProposalInfo);
    });
  });

  describe("votingNeuronSelectStore", () => {
    const neuronIds = [0, 1, 2].map(BigInt);
    const neurons = neuronIds.map((neuronId) => ({ ...mockNeuron, neuronId }));

    it("should set neurons", () => {
      votingNeuronSelectStore.set(neurons);
      expect(get(votingNeuronSelectStore).neurons).toEqual(neurons);
    });

    it("should select all on set", () => {
      votingNeuronSelectStore.set(neurons);
      expect(get(votingNeuronSelectStore).selectedIds).toEqual(neuronIds);
    });

    it("should preserve user selection", () => {
      votingNeuronSelectStore.set(neurons);
      votingNeuronSelectStore.toggleSelection(neuronIds[1]);
      votingNeuronSelectStore.updateNeurons([
        ...neurons,
        { ...mockNeuron, neuronId: BigInt(3) },
      ]);
      expect(get(votingNeuronSelectStore).selectedIds).toEqual(
        [0, 2, 3].map(BigInt)
      );
    });

    it("should toggle by neuronId", () => {
      votingNeuronSelectStore.set(neurons);

      votingNeuronSelectStore.toggleSelection(neuronIds[1]);
      votingNeuronSelectStore.toggleSelection(neuronIds[1]);
      votingNeuronSelectStore.toggleSelection(neuronIds[2]);
      expect(get(votingNeuronSelectStore).selectedIds).toEqual([
        neuronIds[0],
        neuronIds[1],
      ]);
    });
  });
});
