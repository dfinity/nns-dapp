import type { NeuronsStore } from "$lib/stores/neurons.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import {
  nnsLatestRewardEventStore,
  type NnsLatestRewardEventStoreData,
} from "$lib/stores/nns-latest-reward-event.store";
import {
  Vote,
  type NeuronId,
  type NeuronInfo,
  type RewardEvent,
} from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

/**
 * Returns a function that checks if a neuron voted in the reward event.
 */
const votedInReward =
  (rewardEvent: RewardEvent | undefined) =>
  (neuron: NeuronInfo): boolean => {
    if (isNullish(rewardEvent)) {
      return false;
    }
    const votedProposals = neuron.recentBallots
      .filter(({ vote }) => vote !== Vote.Unspecified)
      .map(({ proposalId }) => proposalId);
    return rewardEvent.settled_proposals.some(({ id }) =>
      votedProposals.includes(id)
    );
  };

/**
 * Filters the neurons store for neurons that voted in the latest reward event.
 */
export const neuronsVotedInLastRewardEventStore = derived<
  [Readable<NeuronsStore>, Readable<NnsLatestRewardEventStoreData>],
  Set<NeuronId>
>(
  [neuronsStore, nnsLatestRewardEventStore],
  ([neuronsData, nnsLatestRewardEvent]) =>
    new Set(
      neuronsData.neurons
        ?.filter(votedInReward(nnsLatestRewardEvent?.rewardEvent))
        .map(({ neuronId }) => neuronId) ?? []
    )
);
