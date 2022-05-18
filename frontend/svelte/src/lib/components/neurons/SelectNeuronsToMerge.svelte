<script lang="ts">
  import type { NeuronId } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { MAX_NEURONS_MERGED } from "../../constants/neurons.constants";
  import { accountsStore } from "../../stores/accounts.store";
  import { i18n } from "../../stores/i18n";
  import { definedNeuronsStore } from "../../stores/neurons.store";
  import { translate } from "../../utils/i18n.utils";
  import {
    mapMergeableNeurons,
    mapNeuronIds,
    type MergeableNeuron,
  } from "../../utils/neuron.utils";
  import Tooltip from "../ui/Tooltip.svelte";
  import NeuronCard from "./NeuronCard.svelte";

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

<div class="wrapper">
  <ul class="items">
    {#each neurons as { neuron, selected, mergeable, messageKey } (neuron.neuronId)}
      <li>
        {#if mergeable}
          <NeuronCard
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
            <NeuronCard disabled role="checkbox" {neuron} />
          </Tooltip>
        {/if}
      </li>
    {/each}
  </ul>
  <div class="actions">
    <button
      on:click={confirmSelection}
      class="primary full-width"
      data-tid="merge-neurons-confirm-selection-button"
      disabled={!isMaxSelection}
      >{$i18n.neurons.merge_neurons_modal_merge_button}</button
    >
  </div>
</div>

<style lang="scss">
  .wrapper {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: var(--padding);
  }

  .items {
    height: 100%;

    padding: 0;
    list-style-type: none;
  }

  .actions {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: flex-end;
  }
</style>
