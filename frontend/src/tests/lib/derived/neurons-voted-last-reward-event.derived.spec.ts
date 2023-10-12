import { neuronsVotedInLastRewardEventStore } from "$lib/derived/neurons-voted-last-reward-event.derived";
import { neuronsStore } from "$lib/stores/neurons.store";
import { nnsLatestRewardEventStore } from "$lib/stores/nns-latest-reward-event.store";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockRewardEvent } from "$tests/mocks/nns-reward-event.mock";
import { Vote, type NeuronInfo, type RewardEvent } from "@dfinity/nns";
import { get } from "svelte/store";

describe("neuronsVotedInLastRewardEventStore", () => {
  const settledProposal1 = { id: BigInt(123) };
  const settledProposal2 = { id: BigInt(456) };
  const settledProposals = [settledProposal1, settledProposal2];
  const rewardEvent: RewardEvent = {
    ...mockRewardEvent,
    settled_proposals: settledProposals,
  };
  const neuronNoVotes: NeuronInfo = {
    ...mockNeuron,
    recentBallots: settledProposals.map(({ id }) => ({
      proposalId: id,
      vote: Vote.Unspecified,
    })),
  };

  beforeEach(() => {
    nnsLatestRewardEventStore.reset();
    neuronsStore.reset();
  });

  it("returns empty array if there is no reward event", () => {
    nnsLatestRewardEventStore.reset();
    neuronsStore.setNeurons({
      certified: true,
      neurons: [mockNeuron],
    });

    const neuronsLastDistributed = get(neuronsVotedInLastRewardEventStore);
    expect(neuronsLastDistributed.size).toBe(0);
  });

  it("returns empty array if neurons have not voted in the reward proposals", () => {
    const neuron1: NeuronInfo = {
      ...neuronNoVotes,
      neuronId: BigInt(1),
    };
    const neuron2: NeuronInfo = {
      ...neuronNoVotes,
      neuronId: BigInt(2),
    };
    nnsLatestRewardEventStore.setLatestRewardEvent({
      certified: true,
      rewardEvent,
    });
    neuronsStore.setNeurons({
      certified: true,
      neurons: [neuron1, neuron2],
    });

    const neuronsLastDistributed = get(neuronsVotedInLastRewardEventStore);
    expect(neuronsLastDistributed.size).toBe(0);
  });

  it("returns neuron ids of the neurons that voted in at least one settled proposals", () => {
    const neuronNotVoted: NeuronInfo = {
      ...neuronNoVotes,
      neuronId: BigInt(1),
    };
    const neuronVotedAll: NeuronInfo = {
      ...mockNeuron,
      neuronId: BigInt(2),
      recentBallots: settledProposals.map(({ id }) => ({
        proposalId: id,
        vote: Vote.Yes,
      })),
    };
    const neuronVotedOne: NeuronInfo = {
      ...mockNeuron,
      neuronId: BigInt(3),
      recentBallots: [
        {
          proposalId: settledProposal1.id,
          vote: Vote.Unspecified,
        },
        {
          proposalId: settledProposal2.id,
          vote: Vote.Yes,
        },
      ],
    };
    nnsLatestRewardEventStore.setLatestRewardEvent({
      certified: true,
      rewardEvent,
    });
    neuronsStore.setNeurons({
      certified: true,
      neurons: [neuronNotVoted, neuronVotedAll, neuronVotedOne],
    });

    const neuronsLastDistributed = get(neuronsVotedInLastRewardEventStore);
    expect(neuronsLastDistributed.has(neuronVotedAll.neuronId)).toBe(true);
    expect(neuronsLastDistributed.has(neuronVotedOne.neuronId)).toBe(true);
  });

  it("does not return neurons that voted in proposals but are not settled in the latest reward event", () => {
    const neuronVotedSettled: NeuronInfo = {
      ...mockNeuron,
      neuronId: BigInt(2),
      recentBallots: [
        {
          proposalId: settledProposal1.id,
          vote: Vote.Unspecified,
        },
        {
          proposalId: settledProposal2.id,
          vote: Vote.Yes,
        },
      ],
    };
    const neuronVotedNotSettled: NeuronInfo = {
      ...mockNeuron,
      neuronId: BigInt(3),
      recentBallots: [
        {
          proposalId: BigInt(133333),
          vote: Vote.Yes,
        },
        {
          proposalId: settledProposal2.id,
          vote: Vote.Unspecified,
        },
      ],
    };
    nnsLatestRewardEventStore.setLatestRewardEvent({
      certified: true,
      rewardEvent,
    });
    neuronsStore.setNeurons({
      certified: true,
      neurons: [neuronVotedNotSettled, neuronVotedSettled],
    });

    const neuronsLastDistributed = get(neuronsVotedInLastRewardEventStore);
    expect(neuronsLastDistributed.has(neuronVotedNotSettled.neuronId)).toBe(
      false
    );
    expect(neuronsLastDistributed.has(neuronVotedSettled.neuronId)).toBe(true);
  });
});
