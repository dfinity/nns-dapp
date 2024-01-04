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

  export let neuronsVotedForProposal: CompactNeuronInfo[];

  let votedVotingPower: bigint;
  $: votedVotingPower = neuronsVotingPower(neuronsVotedForProposal);

  let votedNeuronCount: number;
  $: votedNeuronCount = neuronsVotedForProposal.length;
</script>

{#if votedNeuronCount > 0}
  <ExpandableProposalNeurons testId="voted-neurons">
    <svelte:fragment slot="start">
      {replacePlaceholders($i18n.proposal_detail.neurons_voted, {
        $count: `${votedNeuronCount}`,
      })}
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
