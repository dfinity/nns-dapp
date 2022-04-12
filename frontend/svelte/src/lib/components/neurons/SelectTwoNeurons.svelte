<script lang="ts">
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";
  import { canBeMerged, mapNeuronIds } from "../../utils/neuron.utils";
  import NeuronCard from "./NeuronCard.svelte";

  export let neurons: NeuronInfo[];

  const dispatcher = createEventDispatcher();
  const confirmSelection = () => {
    dispatcher("nnsSelect", {
      neurons: mapNeuronIds({ neuronIds: selectedNeuronIds, neurons }),
    });
  };

  let selectedNeuronIds: NeuronId[] = [];
  const MAX_NEURONS_MERGED = 2;
  // We only allow the selection of two neurons.
  const toggleNeuronId = (neuronId: NeuronId): void => {
    if (selectedNeuronIds.includes(neuronId)) {
      selectedNeuronIds = selectedNeuronIds.filter(
        (selectedId) => selectedId !== neuronId
      );
      return;
    }
    if (selectedNeuronIds.length < MAX_NEURONS_MERGED) {
      selectedNeuronIds = [...selectedNeuronIds, neuronId];
    }
  };
  let validSelection: boolean;
  $: validSelection = canBeMerged(
    mapNeuronIds({
      neuronIds: selectedNeuronIds,
      neurons,
    })
  );
</script>

<div class="wrapper">
  <ul class="items">
    {#each neurons as neuron}
      <li>
        <NeuronCard
          on:click={() => toggleNeuronId(neuron.neuronId)}
          role="checkbox"
          selected={selectedNeuronIds.indexOf(neuron.neuronId) > -1}
          {neuron}
        />
      </li>
    {/each}
  </ul>
  <div class="actions">
    <button
      on:click={confirmSelection}
      class="primary full-width"
      data-tid="merge-neurons-confirm-selection-button"
      disabled={!validSelection}
      >{$i18n.neurons.merge_neurons_modal_merge_button}</button
    >
    <!-- Show the error only when there are two selected neurons -->
    {#if !validSelection && selectedNeuronIds.length === MAX_NEURONS_MERGED}
      <p>
        Those two neurons cannot be merged. Check the article for more
        information.
      </p>
    {/if}
  </div>
</div>

<style lang="scss">
  .wrapper {
    position: relative;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: var(--padding);
  }

  p {
    color: red;
  }

  .items {
    height: 100%;
    overflow-y: scroll;

    padding: 0;
    list-style-type: none;
  }

  .actions {
    display: flex;
    align-items: flex-end;
  }
</style>
