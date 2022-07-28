<script lang="ts">
  import { onMount } from "svelte";
  import SkeletonCard from "../components/ui/SkeletonCard.svelte";
  import Value from "../components/ui/Value.svelte";
  import { authStore } from "../stores/auth.store";
  import { sortedSnsNeuronStore } from "../stores/snsNeurons.store";
  import { i18n } from "../stores/i18n";
  import { loadSnsNeurons } from "../services/sns-neurons.services";
  import SnsNeuronCard from "../components/sns-neurons/SnsNeuronCard.svelte";
  import type { SnsNeuron } from "@dfinity/sns";

  let loading = true;
  onMount(() => {
    loadSnsNeurons();
    setTimeout(() => {
      loading = false;
    }, 1000);
  });

  let principalText: string = "";
  $: principalText = $authStore.identity?.getPrincipal().toText() ?? "";

  const goToNeuronDetails = (neuron: SnsNeuron) => () => {
    // TODO: Go to neuron details
    console.log("Going to details:", neuron.id);
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
    {#each $sortedSnsNeuronStore as neuron}
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
