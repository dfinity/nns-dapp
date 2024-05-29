<script lang="ts">
  import { ENABLE_NEURONS_TABLE } from "$lib/stores/feature-flags.store";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { i18n } from "$lib/stores/i18n";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NnsNeuronCard from "$lib/components/neurons/NnsNeuronCard.svelte";
  import NeuronsTable from "$lib/components/neurons/NeuronsTable/NeuronsTable.svelte";
  import {
    neuronsStore,
    sortedNeuronStore,
    definedNeuronsStore,
  } from "$lib/stores/neurons.store";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { Tooltip } from "@dfinity/gix-components";
  import { isSpawning } from "$lib/utils/neuron.utils";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildNeuronUrl } from "$lib/utils/navigation.utils";
  import EmptyMessage from "$lib/components/ui/EmptyMessage.svelte";
  import { onMount } from "svelte";
  import { listNeurons } from "$lib/services/neurons.services";
  import { tableNeuronsFromNeuronInfos } from "$lib/utils/neuron.utils";

  let isLoading = false;
  $: isLoading = $neuronsStore.neurons === undefined;

  onMount(() => {
    listNeurons();
  });

  let tableNeurons: TableNeuron[] = [];
  $: tableNeurons = $ENABLE_NEURONS_TABLE
    ? tableNeuronsFromNeuronInfos($definedNeuronsStore)
    : [];
</script>

<TestIdWrapper testId="nns-neurons-component">
  {#if $ENABLE_NEURONS_TABLE}
    <NeuronsTable neurons={tableNeurons} />
  {:else}
    <div class="card-grid" data-tid="neurons-body">
      {#if isLoading}
        <SkeletonCard />
        <SkeletonCard />
      {:else}
        {#each $sortedNeuronStore as neuron}
          {#if isSpawning(neuron)}
            <Tooltip
              id="spawning-neuron-card"
              text={$i18n.neuron_detail.spawning_neuron_info}
            >
              <NnsNeuronCard
                disabled
                ariaLabel={$i18n.neurons.aria_label_neuron_card}
                {neuron}
              />
            </Tooltip>
          {:else}
            <NnsNeuronCard
              ariaLabel={$i18n.neurons.aria_label_neuron_card}
              href={buildNeuronUrl({
                universe: $pageStore.universe,
                neuronId: neuron.neuronId,
              })}
              {neuron}
            />
          {/if}
        {/each}
      {/if}
    </div>
  {/if}

  {#if !isLoading && $sortedNeuronStore.length === 0}
    <EmptyMessage>{$i18n.neurons.text}</EmptyMessage>
  {/if}
</TestIdWrapper>
