<script lang="ts">
  import SkeletonCard from "../components/ui/SkeletonCard.svelte";
  import Value from "../components/ui/Value.svelte";
  import { authStore } from "../stores/auth.store";
  import { sortedSnsNeuronStore } from "../stores/sns-neurons.store";
  import { i18n } from "../stores/i18n";
  import { loadSnsNeurons } from "../services/sns-neurons.services";
  import SnsNeuronCard from "../components/sns-neurons/SnsNeuronCard.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import { snsProjectSelectedStore } from "../stores/projects.store";
  import { getSnsNeuronIdAsHexString } from "../utils/sns-neuron.utils";
  import type { Unsubscriber } from "svelte/store";
  import { onDestroy } from "svelte";
  import { routeStore } from "../stores/route.store";
  import { AppPath } from "../constants/routes.constants";

  let loading = true;

  const unsubscribe: Unsubscriber = snsProjectSelectedStore.subscribe(
    async (selectedProjectCanisterId) => {
      loading = true;
      await loadSnsNeurons(selectedProjectCanisterId);
      loading = false;
    }
  );

  onDestroy(unsubscribe);

  let principalText: string = "";
  $: principalText = $authStore.identity?.getPrincipal().toText() ?? "";

  const goToNeuronDetails = (neuron: SnsNeuron) => () => {
    const neuronId = getSnsNeuronIdAsHexString(neuron);
    // TODO: Create a path creator helper
    routeStore.navigate({
      path: `${AppPath.ProjectDetail}/${$snsProjectSelectedStore}/neuron/${neuronId}`,
    });
  };
</script>

<section data-tid="sns-neurons-body">
  <p class="description">
    {$i18n.neurons.principal_is}
    <Value>{principalText}</Value>
  </p>

  {#if loading}
    <SkeletonCard />
    <SkeletonCard />
  {:else}
    {#each $sortedSnsNeuronStore as neuron (getSnsNeuronIdAsHexString(neuron))}
      <SnsNeuronCard
        role="link"
        {neuron}
        ariaLabel={$i18n.neurons.aria_label_neuron_card}
        on:click={goToNeuronDetails(neuron)}
      />
    {/each}
  {/if}
</section>

<style lang="scss">
  p:last-of-type {
    margin-bottom: var(--padding-3x);
  }
</style>
