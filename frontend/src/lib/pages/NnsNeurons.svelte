<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { authStore } from "../stores/auth.store";
  import type { AuthStore } from "../stores/auth.store";
  import { i18n } from "../stores/i18n";
  import NeuronCard from "../components/neurons/NeuronCard.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { neuronsStore, sortedNeuronStore } from "../stores/neurons.store";
  import { routeStore } from "../stores/route.store";
  import { AppPath } from "../constants/routes.constants";
  import SkeletonCard from "../components/ui/SkeletonCard.svelte";
  import Tooltip from "../components/ui/Tooltip.svelte";
  import { isSpawning } from "../utils/neuron.utils";
  import Value from "../components/ui/Value.svelte";

  // Neurons are fetch on page load. No need to do it in the route.

  let isLoading: boolean = false;
  $: isLoading = $neuronsStore.neurons === undefined;

  let principalText: string = "";

  const unsubscribe: Unsubscriber = authStore.subscribe(
    ({ identity }: AuthStore) =>
      (principalText = identity?.getPrincipal().toText() ?? "")
  );

  onDestroy(unsubscribe);

  const goToNeuronDetails = (id: NeuronId) => () => {
    routeStore.navigate({
      path: `${AppPath.NeuronDetail}/${id}`,
    });
  };
</script>

<section data-tid="neurons-body">
  <p class="description">{$i18n.neurons.text}</p>

  <p class="description">
    {$i18n.neurons.principal_is}
    <Value>{principalText}</Value>
  </p>

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
          on:click={goToNeuronDetails(neuron.neuronId)}
          {neuron}
        />
      {/if}
    {/each}
  {/if}
</section>

<style lang="scss">
  p:last-of-type {
    margin-bottom: var(--padding-3x);
  }
</style>
