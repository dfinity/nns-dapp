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

  let displayVotingNeurons: boolean;
  $: displayVotingNeurons = totalVotingNeurons > 0;
</script>

<div class="list-container">
  <div class="list">
    <ExpandableProposalNeurons testId="votable-neurons">
      <svelte:fragment slot="start">
        {replacePlaceholders($i18n.proposal_detail__vote.vote_with_neurons, {
          $votable_count: selectedVotingNeurons,
          $all_count: totalVotingNeurons,
        })}
      </svelte:fragment>
      <svelte:fragment slot="end">
        {#if displayVotingNeurons}
          <span class="label">{$i18n.proposal_detail__vote.voting_power}</span>
          <Value
            >{formatVotingPower(
              totalNeuronsVotingPower === undefined
                ? 0n
                : totalNeuronsVotingPower
            )}</Value
          >
        {/if}
      </svelte:fragment>
      <slot />
    </ExpandableProposalNeurons>
  </div>

  <div class="list">
    <ExpandableProposalNeurons testId="votable-neurons">
      <svelte:fragment slot="start">
        {replacePlaceholders($i18n.proposal_detail.neurons_voted, {
          $count: votedNeuronCount,
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
  </div>

  <div class="list">
    <ExpandableProposalNeurons testId="votable-neurons">
      <svelte:fragment slot="start">
        {replacePlaceholders($i18n.proposal_detail__ineligible.headline, {
          $count: ineligibleNeuronCount,
        })}
      </svelte:fragment>
      <slot name="ineligible-neurons" />
    </ExpandableProposalNeurons>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .list-container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);

    & > div {
      padding-bottom: var(--padding-2x);
      border-bottom: 1px solid var(--tertiary);
    }
  }
</style>
