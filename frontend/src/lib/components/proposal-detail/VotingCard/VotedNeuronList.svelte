<script lang="ts">
  import VotingPowerDisplay from "$lib/components/ic/VotingPowerDisplay.svelte";
  import MyVotes from "$lib/components/proposal-detail/MyVotes.svelte";
  import ExpandableProposalNeurons from "$lib/components/proposal-detail/VotingCard/ExpandableProposalNeurons.svelte";
  import VoteResultIcon from "$lib/components/proposal-detail/VotingCard/VoteResultIcon.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    neuronsVotingPower,
    type CompactNeuronInfo,
  } from "$lib/utils/neuron.utils";
  import { Vote } from "@dfinity/nns";

  export let neuronsVotedForProposal: CompactNeuronInfo[];

  let votedVotingPower: bigint;
  $: votedVotingPower = neuronsVotingPower(neuronsVotedForProposal);

  let votedNeuronCount: number;
  $: votedNeuronCount = neuronsVotedForProposal.length;

  // Equals `Vote.Unspecified` when not all neurons voted the same way
  let allVotedVote: Vote;
  $: allVotedVote = neuronsVotedForProposal.some(
    ({ vote }) => neuronsVotedForProposal[0]?.vote !== vote
  )
    ? Vote.Unspecified
    : (neuronsVotedForProposal[0]?.vote ?? Vote.Unspecified);
</script>

{#if votedNeuronCount > 0}
  <ExpandableProposalNeurons testId="voted-neurons">
    <svelte:fragment slot="start">
      <span
        data-tid="voted-neurons-headline"
        class="headline"
        class:yes={allVotedVote === Vote.Yes}
        class:no={allVotedVote === Vote.No}
      >
        {replacePlaceholders(
          votedNeuronCount > 1
            ? $i18n.proposal_detail.neurons_voted_plural
            : $i18n.proposal_detail.neurons_voted,
          {
            $count: `${votedNeuronCount}`,
          }
        )}
        <VoteResultIcon vote={allVotedVote} />
      </span>
    </svelte:fragment>
    <svelte:fragment slot="end">
      <span class="label">{$i18n.proposal_detail__vote.voting_power_label}</span
      >
      <VotingPowerDisplay
        valueTestId="voted-voting-power"
        votingPowerE8s={votedVotingPower}
      />
    </svelte:fragment>
    <MyVotes {neuronsVotedForProposal} />
  </ExpandableProposalNeurons>
{/if}

<style lang="scss">
  .headline {
    display: flex;
    align-items: center;
    gap: var(--padding);

    &.yes {
      color: var(--positive-emphasis);
    }
    &.no {
      color: var(--negative-emphasis);
    }
  }
</style>
