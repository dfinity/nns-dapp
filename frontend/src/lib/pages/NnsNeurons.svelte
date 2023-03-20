<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NnsNeuronCard from "$lib/components/neurons/NnsNeuronCard.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { neuronsStore, sortedNeuronStore } from "$lib/stores/neurons.store";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import { isSpawning } from "$lib/utils/neuron.utils";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildNeuronUrl } from "$lib/utils/navigation.utils";
  import EmptyMessage from "$lib/components/ui/EmptyMessage.svelte";
  import { onMount } from "svelte";
  import { listNeurons } from "$lib/services/neurons.services";

  let isLoading = false;
  $: isLoading = $neuronsStore.neurons === undefined;

  onMount(() => {
    listNeurons();
  });

  const goToNeuronDetails = async (id: NeuronId) =>
    await goto(
      buildNeuronUrl({
        universe: $pageStore.universe,
        neuronId: id,
      })
    );
</script>

<TestIdWrapper testId="nns-neurons-component">
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
            role="link"
            ariaLabel={$i18n.neurons.aria_label_neuron_card}
            on:click={async () => await goToNeuronDetails(neuron.neuronId)}
            {neuron}
          />
        {/if}
      {/each}
    {/if}
  </div>

  {#if !isLoading && $sortedNeuronStore.length === 0}
    <EmptyMessage>{$i18n.neurons.text}</EmptyMessage>
  {/if}
</TestIdWrapper>
