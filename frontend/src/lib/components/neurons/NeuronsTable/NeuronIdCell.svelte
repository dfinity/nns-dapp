<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { Tag, IconPublicBadge, Tooltip } from "@dfinity/gix-components";
  import { ENABLE_NEURON_VISIBILITY } from "$lib/stores/feature-flags.store";

  export let rowData: TableNeuron;
</script>

<div data-tid="neuron-id-cell-component" class="container">
  <Hash
    testId="neuron-id"
    text={rowData.neuronId}
    tagName="span"
    idPrefix="neuron-id-cell"
    showCopy
  />
  {#if $ENABLE_NEURON_VISIBILITY && rowData.isPublic}
    <span class="public-icon-container" data-tid="public-icon-container">
      <Tooltip
        top
        id="neuron-id-cell-public-icon"
        text={$i18n.neurons.public_neuron_tooltip}
      >
        <IconPublicBadge />
      </Tooltip>
    </span>
  {/if}
  {#if rowData.tags.length > 0}
    <span class="tags" data-tid="neuron-tags">
      {#each rowData.tags as tag}
        <Tag testId="neuron-tag">{tag}</Tag>
      {/each}
    </span>
  {/if}
</div>

<style lang="scss">
  .container {
    line-height: 1.5;
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .public-icon-container {
      color: var(--elements-badges);
      line-height: 0;
      margin-right: var(--padding);
    }
  }

  .tags {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--padding);
  }
</style>
