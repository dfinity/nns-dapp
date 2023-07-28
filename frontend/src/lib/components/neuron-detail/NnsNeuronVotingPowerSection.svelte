<script lang="ts">
  import { IconInfo, Section } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import {
    ageMultiplier,
    dissolveDelayMultiplier,
    formatVotingPower,
    formattedStakedMaturity,
    neuronStake,
  } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import NnsStakeItemAction from "./NnsStakeItemAction.svelte";
  import NnsNeuronStateItemAction from "./NnsNeuronStateItemAction.svelte";
  import NnsNeuronDissolveDelayActionItem from "./NnsNeuronDissolveDelayActionItem.svelte";
  import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
  import { afterUpdate } from "svelte";
  import { formatToken } from "$lib/utils/token.utils";

  export let neuron: NeuronInfo;

  // let toggleContent: () => void;
  let showExpanded = false;
  let toggleContent: () => void = () => {
    showExpanded = !showExpanded;
  };

  // The API might return a non-zero voting power even if the neuron can't vote.
  let canVote: boolean;
  $: canVote =
    neuron.dissolveDelaySeconds > BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE);

  let contentHeight: number | undefined;
  let initialTextContainer: HTMLSpanElement | undefined;
  let extendedTextContainer: HTMLSpanElement | undefined;

  const initialTextheight = (): number =>
    initialTextContainer?.getBoundingClientRect().height ??
    initialTextContainer?.offsetHeight ??
    0;
  const extendedTextheight = (): number =>
    extendedTextContainer?.getBoundingClientRect().height ??
    extendedTextContainer?.offsetHeight ??
    0;
  const updateMaxHeight = () => {
    contentHeight =
      initialTextheight() + (showExpanded ? extendedTextheight() : 0);
  };
  const maxHeightStyle = (height: number | undefined): string =>
    `max-height: ${height}px;`;
  // recalculate max-height after DOM update
  afterUpdate(updateMaxHeight);
</script>

<Section testId="nns-neuron-voting-power-section-component">
  <h3 slot="title" on:click={toggleContent} on:keypress={toggleContent}>
    <span>{$i18n.neurons.voting_power}</span>
    <button class="icon" on:click|stopPropagation={toggleContent}
      ><IconInfo /></button
    >
  </h3>
  <p slot="end" class="title-value" data-tid="voting-power">
    {#if canVote}
      {formatVotingPower(neuron.votingPower)}
    {:else}
      {$i18n.neuron_detail.voting_power_zero}
    {/if}
  </p>
  <p
    slot="description"
    class="description-text"
    class:expanded={showExpanded}
    style={maxHeightStyle(contentHeight)}
  >
    <span bind:this={initialTextContainer}>
      {$i18n.neuron_detail.voting_power_section_description}
    </span>
    <span
      class="expanded-text"
      class:expanded={showExpanded}
      bind:this={extendedTextContainer}
    >
      {#if canVote}
        {replacePlaceholders(
          $i18n.neuron_detail.voting_power_section_description_expanded,
          {
            $stake: formatToken({
              value: neuronStake(neuron),
            }),
            $maturityStaked: formattedStakedMaturity(neuron),
            $ageBonus: ageMultiplier(neuron.ageSeconds).toFixed(2),
            $dissolveBonus: dissolveDelayMultiplier(
              neuron.dissolveDelaySeconds
            ).toFixed(2),
            $votingPower: formatVotingPower(neuron.votingPower),
          }
        )}
      {:else}
        {$i18n.neuron_detail.voting_power_section_description_expanded_zero_nns}
      {/if}
    </span>
  </p>
  <ul class="content">
    <NnsStakeItemAction {neuron} />
    <NnsNeuronStateItemAction {neuron} />
    <NnsNeuronDissolveDelayActionItem {neuron} />
  </ul>
</Section>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";

  h3,
  p {
    margin: 0;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: var(--padding);

    @include interaction.tappable;
  }

  .description-text {
    // max-height: 20px;
    transition: all var(--animation-time-normal);

    // &.expanded {
    //   max-height: 100px;
    // }

    .expanded-text {
      transition: all var(--animation-time-normal);
      visibility: hidden;
      opacity: 0;
      overflow: hidden;

      &.expanded {
        transition: all var(--animation-time-normal);
        visibility: initial;
        opacity: 1;
      }
    }
  }

  .title-value {
    font-size: var(--font-size-h3);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);

    padding: 0;
  }
</style>
