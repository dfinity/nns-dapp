<script lang="ts">
  import { IconClose } from "@dfinity/gix-components";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { sortedknownNeuronsStore } from "$lib/stores/known-neurons.store";
  import { nonNullish } from "@dfinity/utils";
  import type { NeuronId } from "@dfinity/nns";

  type Props = {
    neuronId: NeuronId;
    onRemoveClick?: () => void;
  };

  const { neuronId, onRemoveClick }: Props = $props();

  const knownNeuron = $derived(
    $sortedknownNeuronsStore?.find(({ id }) => id === neuronId)
  );

  const displayText = $derived(knownNeuron?.name ?? neuronId.toString());
</script>

<div
  class="container"
  data-tid="follow-nns-neurons-by-topic-followee-component"
>
  <Hash
    text={displayText}
    tagName="span"
    showCopy
    noHeigh={false}
    splitLength={10}
  />
  {#if nonNullish(onRemoveClick)}
    <button
      data-tid="remove-button"
      class="remove-button icon-only"
      aria-label={$i18n.core.remove}
      onclick={onRemoveClick}><IconClose /></button
    >
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .container {
    @include fonts.small(true);

    display: flex;
    align-items: center;
    padding-left: var(--padding);
    border-radius: var(--border-radius-0_5x);
    background-color: var(--tag-background);
    color: var(--tag-text);

    // avoid unnecessary scrollbars of the collapsible container
    overflow: hidden;
  }

  .remove-button {
    display: flex;
    align-items: center;
    color: var(--primary);
    // Decrease the gap between copy and remove buttons.
    padding: 0 var(--padding-0_5x) 0 0;
  }
</style>
