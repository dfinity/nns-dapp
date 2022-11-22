<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import NeuronCard from "$lib/components/neurons/NeuronCard.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { neuronsStore, sortedNeuronStore } from "$lib/stores/neurons.store";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import { isSpawning } from "$lib/utils/neuron.utils";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildNeuronUrl } from "$lib/utils/navigation.utils";

  // Neurons are fetch on page load. No need to do it in the route.

  let isLoading = false;
  $: isLoading = $neuronsStore.neurons === undefined;

  const goToNeuronDetails = async (id: NeuronId) =>
    await goto(
      buildNeuronUrl({
        universe: $pageStore.universe,
        neuronId: id,
      })
    );
</script>

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
          <NeuronCard
            disabled
            ariaLabel={$i18n.neurons.aria_label_neuron_card}
            {neuron}
          />
        </Tooltip>
      {:else}
        <NeuronCard
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
  <p class="description empty">{$i18n.neurons.text}</p>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .empty {
    @include media.min-width(medium) {
      max-width: 75%;
    }
  }
</style>