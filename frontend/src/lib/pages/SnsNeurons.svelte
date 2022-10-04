<script lang="ts">
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import Value from "$lib/components/ui/Value.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { sortedSnsNeuronStore } from "$lib/derived/sorted-sns-neurons.derived";
  import { i18n } from "$lib/stores/i18n";
  import { loadSnsNeurons } from "$lib/services/sns-neurons.services";
  import SnsNeuronCard from "$lib/components/sns-neurons/SnsNeuronCard.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import type { Unsubscriber } from "svelte/store";
  import { onDestroy } from "svelte";
  import { routeStore } from "$lib/stores/route.store";
  import { neuronPathStore } from "$lib/derived/paths.derived";

  let loading = true;

  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (selectedProjectCanisterId !== undefined) {
        loading = true;
        await loadSnsNeurons(selectedProjectCanisterId);
        loading = false;
      }
    }
  );

  onDestroy(unsubscribe);

  let principalText: string = "";
  $: principalText = $authStore.identity?.getPrincipal().toText() ?? "";

  const goToNeuronDetails = (neuron: SnsNeuron) => () => {
    const neuronId = getSnsNeuronIdAsHexString(neuron);
    routeStore.navigate({
      path: `${$neuronPathStore}/${neuronId}`,
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
