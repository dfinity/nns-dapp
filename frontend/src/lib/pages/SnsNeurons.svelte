<script lang="ts">
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { Value } from "@dfinity/gix-components";
  import { authStore } from "$lib/stores/auth.store";
  import {
    sortedSnsCFNeuronsStore,
    sortedSnsUserNeuronsStore,
  } from "$lib/derived/sorted-sns-neurons.derived";
  import { i18n } from "$lib/stores/i18n";
  import { loadSnsNeurons } from "$lib/services/sns-neurons.services";
  import SnsNeuronCard from "$lib/components/sns-neurons/SnsNeuronCard.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import type { Unsubscriber } from "svelte/store";
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildNeuronUrl } from "$lib/utils/navigation.utils";

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

  let principalText = "";
  $: principalText = $authStore.identity?.getPrincipal().toText() ?? "";

  const goToNeuronDetails = async (neuron: SnsNeuron) => {
    const neuronId = getSnsNeuronIdAsHexString(neuron);
    await goto(
      buildNeuronUrl({
        universe: $pageStore.universe,
        neuronId,
      })
    );
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
    {#each $sortedSnsUserNeuronsStore as neuron (getSnsNeuronIdAsHexString(neuron))}
      <SnsNeuronCard
        role="link"
        {neuron}
        ariaLabel={$i18n.neurons.aria_label_neuron_card}
        on:click={async () => await goToNeuronDetails(neuron)}
      />
    {/each}
    {#if $sortedSnsCFNeuronsStore.length > 0}
      <h2
        data-tid="community-fund-title"
        class={$sortedSnsUserNeuronsStore.length > 0 ? "top-margin" : ""}
      >
        {$i18n.neurons.community_fund_title}
      </h2>
      {#each $sortedSnsCFNeuronsStore as neuron (getSnsNeuronIdAsHexString(neuron))}
        <SnsNeuronCard
          role="link"
          {neuron}
          ariaLabel={$i18n.neurons.aria_label_neuron_card}
          on:click={async () => await goToNeuronDetails(neuron)}
        />
      {/each}
    {/if}
  {/if}
</section>

<style lang="scss">
  p:last-of-type {
    margin-bottom: var(--padding-3x);
  }

  .top-margin {
    margin-top: var(--padding-4x);
  }
</style>
