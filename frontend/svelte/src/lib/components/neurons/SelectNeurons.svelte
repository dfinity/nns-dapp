<script lang="ts">
  import type { NeuronId } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { MAX_NEURONS_MERGED } from "../../constants/neurons.constants";
  import { i18n } from "../../stores/i18n";
  import { translate } from "../../utils/i18n.utils";
  import {
    canBeMerged,
    mapNeuronIds,
    type MergeableNeuron,
  } from "../../utils/neuron.utils";
  import Tooltip from "../ui/Tooltip.svelte";
  import NeuronCard from "./NeuronCard.svelte";

  export let neuronsData: MergeableNeuron[];

  const dispatcher = createEventDispatcher();
  const confirmSelection = () => {
    dispatcher("nnsSelect", {
      neurons: mapNeuronIds({
        neuronIds: selectedNeuronIds,
        neurons: neuronsData.map(({ neuron }) => neuron),
      }),
    });
  };

  let selectedNeuronIds: NeuronId[] = [];
  const toggleNeuronId = (neuronId: NeuronId): void => {
    if (selectedNeuronIds.includes(neuronId)) {
      selectedNeuronIds = selectedNeuronIds.filter(
        (selectedId) => selectedId !== neuronId
      );
      return;
    }
    // We only allow the selection of two neurons.
    if (!isMaxSelection) {
      selectedNeuronIds = [...selectedNeuronIds, neuronId];
    }
  };
  let validSelection: boolean;
  let errorLabelKey: string | undefined;
  $: {
    const { isValid, messageKey } = canBeMerged(
      mapNeuronIds({
        neuronIds: selectedNeuronIds,
        neurons: neuronsData.map(({ neuron }) => neuron),
      })
    );
    validSelection = isValid;
    errorLabelKey = messageKey;
  }
  const isNeuronSelected = (
    selectedNeuronIds: NeuronId[],
    neuronId: NeuronId
  ): boolean => selectedNeuronIds.indexOf(neuronId) > -1;
  let isMaxSelection: boolean;
  $: isMaxSelection = selectedNeuronIds.length >= MAX_NEURONS_MERGED;
</script>

<div class="wrapper">
  <ul class="items">
    {#each neuronsData as { neuron, mergeable, messageKey }}
      {@const isSelected = isNeuronSelected(selectedNeuronIds, neuron.neuronId)}
      <!-- We have four possibilities: -->
      <!-- 1. Maximum number selected and neuron is one of the selected -->
      <!-- 2. Maximum number selected and neuron is NOT one of the selected -->
      <!-- 3. User can still select and neuron is mergeable -->
      <!-- 4. User can still select and neuron is NOT mergeable -->
      <li>
        {#if isMaxSelection && isSelected}
          <NeuronCard
            on:click={() => toggleNeuronId(neuron.neuronId)}
            role="checkbox"
            selected
            {neuron}
          />
        {:else if isMaxSelection && !isSelected}
          <Tooltip
            id={`disabled-mergeable-neuron-${neuron.neuronId}`}
            text={$i18n.neurons.only_merge_two}
          >
            <NeuronCard disabled role="checkbox" {neuron} />
          </Tooltip>
        {:else if mergeable}
          <NeuronCard
            on:click={() => toggleNeuronId(neuron.neuronId)}
            role="checkbox"
            selected={selectedNeuronIds.indexOf(neuron.neuronId) > -1}
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
      disabled={!validSelection}
      >{$i18n.neurons.merge_neurons_modal_merge_button}</button
    >
    <!-- Show the error only when there are two selected neurons -->
    {#if !validSelection && selectedNeuronIds.length === MAX_NEURONS_MERGED}
      <p>
        {translate({
          labelKey: errorLabelKey ?? "error.cannot_merge_check_article",
        })}
        <a
          href="https://medium.com/dfinity/internet-computer-nns-neurons-can-now-be-merged-8b4e44584dc2"
          target="_blank"
          rel="noopener noreferrer"
          >{$i18n.neurons.merge_neurons_article_title}</a
        >
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
    color: var(--pink);
    font-size: var(--font-size-ultra-small);

    margin-bottom: 0;

    a {
      text-decoration: underline;
      font-size: inherit;
    }
  }

  .items {
    height: 100%;
    overflow-y: scroll;

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
