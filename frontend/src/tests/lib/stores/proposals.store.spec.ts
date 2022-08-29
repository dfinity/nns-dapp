import { ProposalRewardStatus, ProposalStatus, Topic } from "@dfinity/nns";
import { get } from "svelte/store";
import { DEFAULT_PROPOSALS_FILTERS } from "../../../lib/constants/proposals.constants";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
  votingNeuronSelectStore,
} from "../../../lib/stores/proposals.store";
import { mockNeuron } from "../../mocks/neurons.mock";
import { generateMockProposals } from "../../mocks/proposal.mock";

describe("proposals-store", () => {
  describe("proposals", () => {
    it("should set proposals", () => {
      proposalsStore.setProposals({
        proposals: generateMockProposals(10),
        certified: true,
      });

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(generateMockProposals(10));
    });

    it("should push proposals", () => {
      const allProposals = generateMockProposals(10);
      proposalsStore.setProposals({
        proposals: allProposals.slice(0, 5),
        certified: true,
      });

      proposalsStore.pushProposals({
        proposals: allProposals.slice(5),
        certified: true,
      });

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(allProposals);
    });

    it("should push proposals with certified-version replacement", () => {
      const queryProposals = generateMockProposals(10, {
        proposalTimestampSeconds: BigInt(0),
      });
      const updateProposals = generateMockProposals(10, {
        proposalTimestampSeconds: BigInt(1),
      });
      proposalsStore.setProposals({
        proposals: queryProposals,
        certified: true,
      });
      proposalsStore.pushProposals({
        proposals: updateProposals,
        certified: true,
      });

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(updateProposals);
    });

    it("should reset proposals", () => {
      proposalsStore.setProposals({
        proposals: generateMockProposals(2),
        certified: true,
      });
      proposalsStore.setProposals({ proposals: [], certified: true });

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual([]);
    });

    it("should remove proposals", () => {
      const allProposals = generateMockProposals(10);
      proposalsStore.setProposals({ proposals: allProposals, certified: true });
      proposalsStore.removeProposals(allProposals.slice(0, 5));

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(allProposals.slice(5));
    });

    it("should replace proposals", () => {
      const allProposals = generateMockProposals(10);
      const replacedProposals = generateMockProposals(10, {
        proposalTimestampSeconds: BigInt(666),
      });
      proposalsStore.setProposals({ proposals: allProposals, certified: true });
      proposalsStore.replaceProposals(replacedProposals);

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(replacedProposals);
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
      // reset because of beforeEach
      filters.lastAppliedFilter = undefined;
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
        lastAppliedFilter: "topics",
        topics: filter,
      });
    });

    it("should update topic rewards", () => {
      const filter = [
        ProposalRewardStatus.AcceptVotes,
        ProposalRewardStatus.ReadyToSettle,
      ];
      proposalsFiltersStore.filterRewards(filter);

      const filters = get(proposalsFiltersStore);
      expect(filters).toEqual({
        ...DEFAULT_PROPOSALS_FILTERS,
        lastAppliedFilter: "rewards",
        rewards: filter,
      });
    });

    it("should update topic status", () => {
      const filter = [
        ProposalStatus.Open,
        ProposalStatus.Rejected,
      ];
      proposalsFiltersStore.filterStatus(filter);

      const filters = get(proposalsFiltersStore);
      expect(filters).toEqual({
        ...DEFAULT_PROPOSALS_FILTERS,
        lastAppliedFilter: "status",
        status: filter,
      });
    });

    it("should toggle excluded vote proposals back and forth", () => {
      proposalsFiltersStore.toggleExcludeVotedProposals();

      let filters = get(proposalsFiltersStore);
      expect(filters).toEqual({
        ...DEFAULT_PROPOSALS_FILTERS,
        lastAppliedFilter: "excludeVotedProposals",
        excludeVotedProposals: true,
      });

      proposalsFiltersStore.toggleExcludeVotedProposals();

      filters = get(proposalsFiltersStore);
      expect(filters).toEqual({
        ...DEFAULT_PROPOSALS_FILTERS,
        lastAppliedFilter: "excludeVotedProposals",
        excludeVotedProposals: false,
      });
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

  describe("proposalPayloadStore", () => {
    it("should store a payload", () => {
      proposalPayloadsStore.setPayload({
        proposalId: BigInt(0),
        payload: null,
      });

      expect(get(proposalPayloadsStore).get(BigInt(0))).toBeNull();
    });

    it("should throw on initial map set", () => {
      const call = () => get(proposalPayloadsStore).set(BigInt(0), null);

      expect(call).toThrow();
    });

    it("should throw on map set after update", () => {
      proposalPayloadsStore.setPayload({
        proposalId: BigInt(0),
        payload: null,
      });

      const call = () => get(proposalPayloadsStore).set(BigInt(0), null);

      expect(call).toThrow();
    });
  });
});
