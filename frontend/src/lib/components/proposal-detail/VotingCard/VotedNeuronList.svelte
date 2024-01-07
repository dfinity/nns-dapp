<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Value } from "@dfinity/gix-components";
  import {
    type CompactNeuronInfo,
    formatVotingPower,
    neuronsVotingPower,
  } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import ExpandableProposalNeurons from "$lib/components/proposal-detail/VotingCard/ExpandableProposalNeurons.svelte";
  import MyVotes from "$lib/components/proposal-detail/MyVotes.svelte";
  import { Vote } from "@dfinity/nns";
  import VoteResultIcon from "$lib/components/proposal-detail/VotingCard/VoteResultIcon.svelte";

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
    : neuronsVotedForProposal?.[0].vote ?? Vote.Unspecified;

  $: console.log("allVotedVote", allVotedVote, neuronsVotedForProposal);
</script>

{#if votedNeuronCount > 0}
  <ExpandableProposalNeurons testId="voted-neurons">
    <svelte:fragment slot="start">
      <span
        class="headline"
        class:yes={allVotedVote === Vote.Yes}
        class:no={allVotedVote === Vote.No}
      >
        {replacePlaceholders($i18n.proposal_detail.neurons_voted, {
          $count: `${votedNeuronCount}`,
        })}
        {#if allVotedVote !== Vote.Unspecified}
          <VoteResultIcon vote={allVotedVote} />
        {/if}
      </span>
    </svelte:fragment>
    <svelte:fragment slot="end">
      <span class="label">{$i18n.proposal_detail__vote.voting_power}</span>
      <Value testId="voted-voting-power"
        >{formatVotingPower(votedVotingPower)}</Value
      >
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
