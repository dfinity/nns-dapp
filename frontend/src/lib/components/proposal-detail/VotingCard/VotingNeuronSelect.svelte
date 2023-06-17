<script lang="ts">
  import { selectedNeuronsVotingPower } from "$lib/utils/proposals.utils";
  import { i18n } from "$lib/stores/i18n";
  import {
    IconExpandCircleDown,
    Collapsible,
    Value,
  } from "@dfinity/gix-components";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
  import VotingNeuronSelectContainer from "$lib/components/proposal-detail/VotingCard/VotingNeuronSelectContainer.svelte";

  let totalNeuronsVotingPower: bigint;

  $: totalNeuronsVotingPower = selectedNeuronsVotingPower({
    neurons: $votingNeuronSelectStore.neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
  });

  let toggleContent: () => void;
  let expanded: boolean;

  let totalVotingNeurons: number;
  $: totalVotingNeurons = $votingNeuronSelectStore.neurons.length;

  let selectedVotingNeurons: number;
  $: selectedVotingNeurons = $votingNeuronSelectStore.selectedIds.length;

  let displayNeuronsInfo: boolean;
  $: displayNeuronsInfo = totalVotingNeurons > 0;
</script>

<Collapsible
  expandButton={false}
  externalToggle={true}
  bind:toggleContent
  bind:expanded
  wrapHeight
>
  <div slot="header" class="total" class:expanded>
    <div class="total-neurons">
      <span class="value" data-tid="voting-collapsible-toolbar-neurons"
        >{$i18n.proposal_detail__vote
          .neurons}{#if displayNeuronsInfo}&nbsp;({selectedVotingNeurons}/{totalVotingNeurons})
        {/if}
      </span>
      <button
        class="icon"
        class:expanded
        on:click|stopPropagation={toggleContent}
      >
        <IconExpandCircleDown />
      </button>
    </div>

    {#if displayNeuronsInfo}
      <div
        class="total-voting-power"
        data-tid="voting-collapsible-toolbar-voting-power"
      >
        <span class="label">{$i18n.proposal_detail__vote.voting_power}</span>
        <Value
          >{formatVotingPower(
            totalNeuronsVotingPower === undefined ? 0n : totalNeuronsVotingPower
          )}</Value
        >
      </div>
    {/if}
  </div>

  <VotingNeuronSelectContainer>
    <slot />
  </VotingNeuronSelectContainer>
</Collapsible>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .total {
    display: flex;
    justify-content: space-between;
    gap: var(--padding);
    width: 100%;
    margin-top: var(--padding-3x);
    padding: var(--padding) var(--padding-2x);

    @include media.min-width(large) {
      padding: 0 var(--padding) 0 0;
    }
  }

  .total-neurons,
  .total-voting-power {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .icon {
    color: var(--tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    transition: transform ease-in var(--animation-time-normal);

    &.expanded {
      transform: rotate(-180deg);
    }
  }
</style>
