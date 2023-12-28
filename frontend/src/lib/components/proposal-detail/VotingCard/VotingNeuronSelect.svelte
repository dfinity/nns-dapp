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
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  export let ineligibleNeuronCount: number;
  export let votedNeuronCount: number;
  export let votedVotingPower: bigint;

  let totalNeuronsVotingPower: bigint;

  $: totalNeuronsVotingPower = selectedNeuronsVotingPower({
    neurons: $votingNeuronSelectStore.neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
  });

  let toggleVotableContent: () => void;
  let expandedVotableNeurons: boolean;

  let toggleVotedContent: () => void;
  let expandedVotedNeurons: boolean;

  let toggleIneligibleContent: () => void;
  let expandedIneligibleNeurons: boolean;

  let totalVotingNeurons: number;
  $: totalVotingNeurons = $votingNeuronSelectStore.neurons.length;

  let selectedVotingNeurons: number;
  $: selectedVotingNeurons = $votingNeuronSelectStore.selectedIds.length;

  let displayVotingNeurons: boolean;
  $: displayVotingNeurons = totalVotingNeurons > 0;
</script>

<div class="list-container">
  <div class="list">
    <Collapsible
      testId="votable-neurons"
      expandButton={false}
      externalToggle={true}
      bind:toggleContent={toggleVotableContent}
      bind:expanded={expandedVotableNeurons}
      wrapHeight
    >
      <div slot="header" class="total" class:expanded={expandedVotableNeurons}>
        <div class="total-neurons">
          <span class="value" data-tid="voting-collapsible-toolbar-neurons">
            {replacePlaceholders(
              $i18n.proposal_detail__vote.vote_with_neurons,
              {
                $votable_count: selectedVotingNeurons,
                $all_count: totalVotingNeurons,
              }
            )}
          </span>
          <button
            class="icon"
            class:expanded={expandedVotableNeurons}
            on:click|stopPropagation={toggleVotableContent}
          >
            <IconExpandCircleDown />
          </button>
        </div>

        {#if displayVotingNeurons}
          <div
            class="total-voting-power"
            data-tid="voting-collapsible-toolbar-voting-power"
          >
            <span class="label">{$i18n.proposal_detail__vote.voting_power}</span
            >
            <Value
              >{formatVotingPower(
                totalNeuronsVotingPower === undefined
                  ? 0n
                  : totalNeuronsVotingPower
              )}</Value
            >
          </div>
        {/if}
      </div>

      <slot />
    </Collapsible>
  </div>

  <div class="list">
    <Collapsible
      testId="voted-neurons"
      expandButton={false}
      externalToggle={true}
      bind:toggleContent={toggleVotedContent}
      bind:expanded={expandedVotedNeurons}
      wrapHeight
    >
      <div slot="header" class="total" class:expanded={expandedVotedNeurons}>
        <div class="total-neurons">
          <span class="value" data-tid="voting-collapsible-toolbar-neurons">
            {replacePlaceholders($i18n.proposal_detail.neurons_voted, {
              $count: votedNeuronCount,
            })}
          </span>
          <button
            class="icon"
            class:expanded={expandedVotedNeurons}
            on:click|stopPropagation={toggleVotedContent}
          >
            <IconExpandCircleDown />
          </button>
        </div>

        <div class="total-voting-power">
          <span class="label">{$i18n.proposal_detail__vote.voting_power}</span>
          <Value testId="voted-voting-power"
            >{formatVotingPower(votedVotingPower)}</Value
          >
        </div>
      </div>

      <slot name="voted-neurons" />
    </Collapsible>
  </div>

  <div class="list">
    <Collapsible
      testId="ineligible-neurons"
      expandButton={false}
      externalToggle={true}
      bind:toggleContent={toggleIneligibleContent}
      bind:expanded={expandedIneligibleNeurons}
      wrapHeight
    >
      <div
        slot="header"
        class="total"
        class:expanded={expandedIneligibleNeurons}
      >
        <div class="total-neurons">
          <span class="value" data-tid="voting-collapsible-toolbar-neurons">
            {replacePlaceholders($i18n.proposal_detail__ineligible.headline, {
              $count: ineligibleNeuronCount,
            })}
          </span>
          <button
            class="icon"
            class:expanded={expandedIneligibleNeurons}
            on:click|stopPropagation={toggleIneligibleContent}
          >
            <IconExpandCircleDown />
          </button>
        </div>
      </div>

      <slot name="ineligible-neurons" />
    </Collapsible>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .list-container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }

  .list {
    padding-bottom: var(--padding-2x);
    border-bottom: 1px solid var(--tertiary);
  }

  .total {
    display: flex;
    justify-content: space-between;
    gap: var(--padding);
    width: 100%;
    //margin-bottom: var(--padding-3x);
    //padding: var(--padding) var(--padding-2x);

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
