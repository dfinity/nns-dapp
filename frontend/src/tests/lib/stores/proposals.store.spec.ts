import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
} from "$lib/stores/proposals.store";
import { generateMockProposals } from "$tests/mocks/proposal.mock";
import { ProposalStatus, Topic } from "@dfinity/nns";
import { get } from "svelte/store";

describe("proposals-store", () => {
  beforeEach(() => {
    proposalsStore.resetForTesting();
    proposalsFiltersStore.reset();
  });

  describe("proposals", () => {
    it("should set proposals", () => {
      const mutationStore = proposalsStore.getSingleMutationProposalsStore();
      mutationStore.setProposals({
        proposals: generateMockProposals(10),
        certified: true,
      });

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(generateMockProposals(10));
    });

    it("should apply set proposals in correct order", () => {
      const allProposals = generateMockProposals(10);
      const initialProposals = allProposals.slice(0, 5);

      const mutation1 = proposalsStore.getSingleMutationProposalsStore();
      mutation1.setProposals({
        proposals: initialProposals,
        certified: false,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: initialProposals,
        certified: false,
      });

      // Simulate a second request before the update call of the first request
      // returns.
      const mutation2 = proposalsStore.getSingleMutationProposalsStore();
      mutation2.setProposals({
        proposals: allProposals,
        certified: false,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: allProposals,
        certified: false,
      });

      // When the update call of the original request returns, it should not
      // override the result from the later request.
      mutation1.setProposals({
        proposals: initialProposals,
        certified: true,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: allProposals,
        certified: false,
      });

      // And finally the update call of the second request returns.
      mutation2.setProposals({
        proposals: allProposals,
        certified: true,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: allProposals,
        certified: true,
      });
    });

    it("should push proposals", () => {
      const allProposals = generateMockProposals(10);
      proposalsStore.setProposalsForTesting({
        proposals: allProposals.slice(0, 5),
        certified: true,
      });

      const mutationStore = proposalsStore.getSingleMutationProposalsStore();
      mutationStore.pushProposals({
        proposals: allProposals.slice(5),
        certified: true,
      });

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(allProposals);
    });

    it("should apply push proposals in correct order", () => {
      const allProposals = generateMockProposals(10);
      const initialProposals = allProposals.slice(0, 5);
      const newProposals = allProposals.slice(5);

      const setMutation = proposalsStore.getSingleMutationProposalsStore();
      setMutation.setProposals({
        proposals: initialProposals,
        certified: false,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: initialProposals,
        certified: false,
      });

      // Simulate a second request before the update call of the first request
      // returns.
      const pushMutation = proposalsStore.getSingleMutationProposalsStore();
      pushMutation.pushProposals({
        proposals: newProposals,
        certified: false,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: allProposals,
        certified: false,
      });

      // When the update call of the original request returns, it should not
      // override the result from the later request.
      setMutation.setProposals({
        proposals: initialProposals,
        certified: true,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: allProposals,
        certified: false,
      });

      // And finally the update call of the second request returns.
      pushMutation.pushProposals({
        proposals: newProposals,
        certified: true,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: allProposals,
        certified: true,
      });
    });

    it("should push proposals with certified-version replacement", () => {
      const queryProposals = generateMockProposals(10, {
        proposalTimestampSeconds: 0n,
      });
      const updateProposals = generateMockProposals(10, {
        proposalTimestampSeconds: 1n,
      });
      proposalsStore.setProposalsForTesting({
        proposals: queryProposals,
        certified: true,
      });
      const mutationStore = proposalsStore.getSingleMutationProposalsStore();
      mutationStore.pushProposals({
        proposals: updateProposals,
        certified: true,
      });

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(updateProposals);
    });

    it("should reset proposals", () => {
      proposalsStore.setProposalsForTesting({
        proposals: generateMockProposals(2),
        certified: true,
      });
      const mutationStore = proposalsStore.getSingleMutationProposalsStore();
      mutationStore.setProposals({ proposals: [], certified: true });

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual([]);
    });

    it("should remove proposals", () => {
      const allProposals = generateMockProposals(10);
      proposalsStore.setProposalsForTesting({
        proposals: allProposals,
        certified: true,
      });
      const mutationStore = proposalsStore.getSingleMutationProposalsStore();
      mutationStore.removeProposals({
        proposalsToRemove: allProposals.slice(0, 5),
        certified: true,
      });

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(allProposals.slice(5));
    });

    it("should apply remove proposals in correct order", () => {
      const allProposals = generateMockProposals(10);
      const removedProposals = allProposals.slice(0, 5);
      const remainingProposals = allProposals.slice(5);

      const setMutation = proposalsStore.getSingleMutationProposalsStore();
      setMutation.setProposals({
        proposals: allProposals,
        certified: false,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: allProposals,
        certified: false,
      });

      // Simulate a second request before the update call of the first request
      // returns.
      const removeMutation = proposalsStore.getSingleMutationProposalsStore();
      removeMutation.removeProposals({
        proposalsToRemove: removedProposals,
        certified: false,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: remainingProposals,
        certified: false,
      });

      // When the update call of the original request returns, it should not
      // override the result from the later request.
      setMutation.setProposals({
        proposals: allProposals,
        certified: true,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: remainingProposals,
        // certified: true because the remaining proposals are certified even
        // though removing the others wasn't.
        certified: true,
      });

      // And finally the update call of the second request returns.
      removeMutation.removeProposals({
        proposalsToRemove: removedProposals,
        certified: true,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: remainingProposals,
        certified: true,
      });
    });

    it("should replace proposals", () => {
      const allProposals = generateMockProposals(10);
      const replacedProposals = generateMockProposals(10, {
        proposalTimestampSeconds: 666n,
      });
      proposalsStore.setProposalsForTesting({
        proposals: allProposals,
        certified: true,
      });
      const mutationStore = proposalsStore.getSingleMutationProposalsStore();
      mutationStore.replaceProposals({
        proposals: replacedProposals,
        certified: true,
      });

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(replacedProposals);
    });

    it("should apply replace proposals in correct order", () => {
      const oldProposals = generateMockProposals(10);
      const newProposals = generateMockProposals(5, {
        proposalTimestampSeconds: 666n,
      });
      const expectedProposals = [...newProposals, ...oldProposals.slice(5)];

      const setMutation = proposalsStore.getSingleMutationProposalsStore();
      setMutation.setProposals({
        proposals: oldProposals,
        certified: false,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: oldProposals,
        certified: false,
      });

      // Simulate a second request before the update call of the first request
      // returns.
      const replaceMutation = proposalsStore.getSingleMutationProposalsStore();
      replaceMutation.replaceProposals({
        proposals: newProposals,
        certified: false,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: expectedProposals,
        certified: false,
      });

      // When the update call of the original request returns, it should not
      // override the result from the later request.
      setMutation.setProposals({
        proposals: oldProposals,
        certified: true,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: expectedProposals,
        certified: false,
      });

      // And finally the update call of the second request returns.
      replaceMutation.replaceProposals({
        proposals: newProposals,
        certified: true,
      });
      expect(get(proposalsStore)).toEqual({
        proposals: expectedProposals,
        certified: true,
      });
    });
  });

  describe("filter", () => {
    beforeEach(() => {
      proposalsFiltersStore.filterTopics(DEFAULT_PROPOSALS_FILTERS.topics);
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

    it("should update topic status", () => {
      const filter = [ProposalStatus.Open, ProposalStatus.Rejected];
      proposalsFiltersStore.filterStatus(filter);

      const filters = get(proposalsFiltersStore);
      expect(filters).toEqual({
        ...DEFAULT_PROPOSALS_FILTERS,
        status: filter,
      });
    });
  });

  describe("proposalPayloadStore", () => {
    it("should store a payload", () => {
      proposalPayloadsStore.setPayload({
        proposalId: 0n,
        payload: null,
      });

      expect(get(proposalPayloadsStore).get(0n)).toBeNull();
    });

    it("should throw on initial map set", () => {
      const call = () => get(proposalPayloadsStore).set(0n, null);

      expect(call).toThrow();
    });

    it("should throw on map set after update", () => {
      proposalPayloadsStore.setPayload({
        proposalId: 0n,
        payload: null,
      });

      const call = () => get(proposalPayloadsStore).set(0n, null);

      expect(call).toThrow();
    });
  });
});
