<script lang="ts">
  import type { NeuronId } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { MAX_NEURONS_MERGED } from "../../constants/neurons.constants";
  import FooterModal from "../../modals/FooterModal.svelte";
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
  <FooterModal>
    <button on:click={() => dispatcher("nnsClose")} class="secondary small"
      >{$i18n.core.cancel}</button
    >
    <button
      on:click={confirmSelection}
      class="primary small"
      data-tid="merge-neurons-confirm-selection-button"
      disabled={!isMaxSelection}
      >{$i18n.neurons.merge_neurons_modal_merge_button}</button
    >
  </FooterModal>
</div>

<style lang="scss">
  .wrapper {
    position: relative;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
  }

  .items {
    max-height: calc(100% - var(--padding-8x));
    width: calc(100% - 2px);
    overflow-y: scroll;

    padding: 0;
    list-style-type: none;

    display: flex;
    flex-direction: column;
    align-items: center;

    // Needed to have the outline of the NeuronCard visible when selected
    li {
      width: calc(100% - 4px);
    }
  }
</style>
