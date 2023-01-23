<script lang="ts">
  import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
  import NnsNeuronsFooter from "$lib/components/neurons/NnsNeuronsFooter.svelte";
  import SnsNeuronsFooter from "$lib/components/sns-neurons/SnsNeuronsFooter.svelte";
  import {
    isNnsUniverseStore,
    selectedUniverseIdStore,
  } from "$lib/derived/selected-universe.derived";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
</script>

<main>
  <SummaryUniverse />

  {#if $isNnsUniverseStore}
    <NnsNeurons />
  {:else if $selectedUniverseIdStore !== undefined}
    <SnsNeurons />
  {/if}
</main>

{#if $isNnsUniverseStore}
  <NnsNeuronsFooter />
  <!-- Staking SNS Neurons has not yet been reviewed by security -->
{:else if $selectedUniverseIdStore !== undefined}
  <SnsNeuronsFooter />
{/if}

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }
</style>
