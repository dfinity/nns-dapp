<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    Tag,
    IconPublicBadge,
    Tooltip,
    IconLedger,
    IconKey,
    Checkbox,
  } from "@dfinity/gix-components";
  import type { NeuronVisibilityRowData } from "$lib/types/neuron-visibility-row";

  const typeToIcon: {
    hardwareWallet: typeof IconLedger;
    hotkey: typeof IconKey;
  } = {
    hardwareWallet: IconLedger,
    hotkey: IconKey,
  };

  export let rowData: NeuronVisibilityRowData;
  export let checked: boolean = false;
  export let disabled: boolean = false;
</script>

<div
  class="neuron-row"
  class:disabled
  data-tid="neuron-visibility-row-component-{rowData.neuronId}"
>
  <Checkbox inputId={rowData.neuronId} {checked} {disabled} on:nnsChange>
    <div class="label-container">
      <div class="neuron-details">
        <div class="neuron-id-wrapper">
          <div data-tid="neuron-id">{rowData.neuronId}</div>
          {#if rowData?.isPublic}
            <span
              class="public-icon-container"
              data-tid="public-icon-container"
            >
              <Tooltip
                top
                id="neuron-visibility-row-public-icon"
                text={$i18n.neurons.public_neuron_tooltip}
              >
                <IconPublicBadge />
              </Tooltip>
            </span>
          {/if}
        </div>
        {#if rowData.tags.length > 0}
          <span class="tags" data-tid="neuron-tags">
            {#each rowData.tags as tag}
              <Tag testId="neuron-tag">{tag}</Tag>
            {/each}
          </span>
        {/if}
      </div>

      {#if rowData?.uncontrolledNeuronDetails}
        <span class="tags">
          <span class="uncontrolled-tag-icons">
            <svelte:component
              this={typeToIcon[rowData.uncontrolledNeuronDetails.type]}
            />
          </span>

          <span
            class="uncontrolled-neuron-detail"
            data-tid="uncontrolled-neuron-detail"
          >
            {rowData.uncontrolledNeuronDetails.text}
          </span>
        </span>
      {/if}
    </div>
  </Checkbox>
</div>

<style lang="scss">
  .neuron-row {
    --checkbox-label-order: 1;
    --checkbox-padding: var(--padding-1_5x) 0;
    &.disabled {
      --value-color: var(--text-description-tint);
      --elements-badges: var(--text-description-tint);
    }
  }

  .label-container {
    line-height: 1.5;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .neuron-details {
      display: flex;
      flex-wrap: wrap;
      column-gap: var(--padding);
    }

    .neuron-id-wrapper {
      display: inline-flex;
      align-items: center;
    }

    .public-icon-container {
      color: var(--elements-badges);
      line-height: 0;
      margin: 0 var(--padding) 0 var(--padding-0_5x);
    }
    .uncontrolled-neuron-detail {
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
  }
</style>
