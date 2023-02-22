<script lang="ts">
  import type { NeuronId } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { MAX_NEURONS_MERGED } from "$lib/constants/neurons.constants";
  import { accountsStore } from "$lib/stores/accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import { definedNeuronsStore } from "$lib/stores/neurons.store";
  import { translate } from "$lib/utils/i18n.utils";
  import {
    mapMergeableNeurons,
    mapNeuronIds,
    type MergeableNeuron,
  } from "$lib/utils/neuron.utils";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import NnsNeuronCard from "./NnsNeuronCard.svelte";

  let selectedNeuronIds: NeuronId[] = [];

  let neurons: MergeableNeuron[];
  $: neurons = mapMergeableNeurons({
    neurons: $definedNeuronsStore,
    accounts: $accountsStore,
    selectedNeurons: mapNeuronIds({
      neuronIds: selectedNeuronIds,
      neurons: $definedNeuronsStore,
    }),
  });

  const dispatcher = createEventDispatcher();
  const confirmSelection = () => {
    dispatcher("nnsSelect", {
      neurons: mapNeuronIds({
        neuronIds: selectedNeuronIds,
        neurons: neurons.map(({ neuron }) => neuron),
      }),
    });
  };

  const toggleNeuronId = (neuronId: NeuronId): void => {
    if (selectedNeuronIds.includes(neuronId)) {
      selectedNeuronIds = selectedNeuronIds.filter(
        (selectedId) => selectedId !== neuronId
      );
      return;
    }
    // We only allow the selection of MAX_NEURONS_MERGED neurons.
    if (!isMaxSelection) {
      selectedNeuronIds = [...selectedNeuronIds, neuronId];
    }
  };
  let isMaxSelection: boolean;
  $: isMaxSelection = selectedNeuronIds.length >= MAX_NEURONS_MERGED;
</script>

<div class="wrapper legacy">
  <ul class="items">
    {#each neurons as { neuron, selected, mergeable, messageKey } (neuron.neuronId)}
      <li>
        {#if mergeable}
          <NnsNeuronCard
            on:click={() => toggleNeuronId(neuron.neuronId)}
            role="checkbox"
            {selected}
            {neuron}
          />
        {:else}
          <Tooltip
            id={`disabled-mergeable-neuron-${neuron.neuronId}`}
            text={translate({ labelKey: messageKey ?? "error.not_mergeable" })}
          >
            <NnsNeuronCard disabled role="checkbox" {neuron} />
          </Tooltip>
        {/if}
      </li>
    {/each}
  </ul>

  <div class="toolbar">
    <button on:click={() => dispatcher("nnsClose")} class="secondary"
      >{$i18n.core.cancel}</button
    >
    <button
      on:click={confirmSelection}
      class="primary"
      data-tid="merge-neurons-confirm-selection-button"
      disabled={!isMaxSelection}
      >{$i18n.neurons.merge_neurons_modal_merge_button}</button
    >
  </div>
</div>

<style lang="scss">
  .items {
    padding: 0;
    list-style-type: none;

    display: flex;
    flex-direction: column;

    // Needed to have the outline of the NeuronCard visible when selected
    li {
      width: calc(100% - 4px);
    }
  }
</style>
