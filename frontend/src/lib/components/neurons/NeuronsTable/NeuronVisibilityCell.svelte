<script lang="ts">
  import { i18n } from "$lib/stores/i18n";

  import {
    Tag,
    IconPublicBadge,
    Tooltip,
    IconLedger,
    IconKey,
  } from "@dfinity/gix-components";
  import type { VisibilityCellNeuronData } from "$lib/types/visibility-cell-neuron";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";

  export let cellData: VisibilityCellNeuronData;

  const typeToIcon: {
    hardwareWallet: typeof IconLedger;
    hotkey: typeof IconKey;
  } = {
    hardwareWallet: IconLedger,
    hotkey: IconKey,
  };
</script>

<div data-tid="neuron-visibility-cell-component" class="container">
  <div class="neuron-id-wrapper">
    <p data-tid="neuron-id" class="neuron-id">{cellData.neuronId}</p>
    {#if cellData?.isPublic}
      <span class="public-icon-container" data-tid="public-icon-container">
        <Tooltip
          top
          id="neuron-visibility-cell-public-icon"
          text={$i18n.neurons.public_neuron_tooltip}
        >
          <IconPublicBadge />
        </Tooltip>
      </span>
    {/if}
  </div>

  {#if cellData.tags.length > 0}
    <span class="tags" data-tid="neuron-tags">
      {#each cellData.tags as tag}
        <Tag testId="neuron-tag">{tag}</Tag>
      {/each}
    </span>
  {/if}
  {#if cellData?.uncontrolledNeuronDetails}
    <span class="tags" data-tid="uncontrolled-neuron-details">
      <span class="uncontrolled-tag-icons">
        <svelte:component
          this={typeToIcon[cellData.uncontrolledNeuronDetails.type]}
        />
      </span>

      <span class="uncontrolled-neuron-id">
        {shortenWithMiddleEllipsis(cellData.uncontrolledNeuronDetails.text)}
      </span>
    </span>
  {/if}
</div>

<style lang="scss">
  :global(.checkbox) {
    width: 100%;
  }

  .container {
    line-height: 1.5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .neuron-id-wrapper {
      display: inline-flex;
      align-items: center;
    }
    .public-icon-container {
      color: var(--elements-badges);
      line-height: 0;
      margin: 0 var(--padding) 0 var(--padding-0_5x);
    }
  }

  .uncontrolled-neuron-id {
    color: var(--text-color);
  }

  .tags {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--padding);
  }

  .uncontrolled-tag-icons {
    line-height: 0;
  }
</style>
