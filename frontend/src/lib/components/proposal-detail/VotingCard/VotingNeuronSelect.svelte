<script lang="ts">
  import { selectedNeuronsVotingPower } from "$lib/utils/proposals.utils";
  import { i18n } from "$lib/stores/i18n";
  import { Value } from "@dfinity/gix-components";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import ExpandableProposalNeurons from "$lib/components/proposal-detail/VotingCard/ExpandableProposalNeurons.svelte";

  export let ineligibleNeuronCount: number;
  export let votedNeuronCount: number;
  export let votedVotingPower: bigint;

  let totalNeuronsVotingPower: bigint;

  $: totalNeuronsVotingPower = selectedNeuronsVotingPower({
    neurons: $votingNeuronSelectStore.neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
  });

  let totalVotingNeurons: number;
  $: totalVotingNeurons = $votingNeuronSelectStore.neurons.length;

  let selectedVotingNeurons: number;
  $: selectedVotingNeurons = $votingNeuronSelectStore.selectedIds.length;
</script>

<div class="container" data-tid="voting-neuron-select">
  {#if totalVotingNeurons > 0}
    <ExpandableProposalNeurons testId="votable-neurons">
      <div slot="start" data-tid="voting-collapsible-toolbar-neurons">
        {replacePlaceholders($i18n.proposal_detail__vote.vote_with_neurons, {
          $votable_count: `${selectedVotingNeurons}`,
          $all_count: `${totalVotingNeurons}`,
        })}
      </div>
      <svelte:fragment slot="end">
        <span class="label">{$i18n.proposal_detail__vote.voting_power}</span>
        <Value testId="voting-collapsible-toolbar-voting-power"
          >{formatVotingPower(
            totalNeuronsVotingPower === undefined ? 0n : totalNeuronsVotingPower
          )}</Value
        >
      </svelte:fragment>
      <slot />
    </ExpandableProposalNeurons>
  {/if}

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
      <slot name="voted-neurons" />
    </ExpandableProposalNeurons>
  {/if}

  {#if ineligibleNeuronCount > 0}
    <ExpandableProposalNeurons testId="ineligible-neurons">
      <svelte:fragment slot="start">
        {replacePlaceholders($i18n.proposal_detail__ineligible.headline, {
          $count: `${ineligibleNeuronCount}`,
        })}
      </svelte:fragment>
      <slot name="ineligible-neurons" />
    </ExpandableProposalNeurons>
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }
</style>
