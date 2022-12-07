<script lang="ts">
  import { ENABLE_SNS_2 } from "$lib/constants/environment.constants";
  import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
  import NnsNeuronsFooter from "$lib/components/neurons/NnsNeuronsFooter.svelte";
  import SnsNeuronsFooter from "$lib/components/sns-neurons/SnsNeuronsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectIdSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import NeuronsTitle from "$lib/components/neurons/NeuronsTitle.svelte";
</script>

<main>
  <NeuronsTitle />

  {#if $isNnsProjectStore}
    <NnsNeurons />
  {:else if $snsProjectIdSelectedStore !== undefined}
    <SnsNeurons />
  {/if}
</main>

{#if $isNnsProjectStore}
  <NnsNeuronsFooter />
  <!-- Staking SNS Neurons has not yet been reviewed by security -->
{:else if $snsProjectIdSelectedStore !== undefined && ENABLE_SNS_2}
  <SnsNeuronsFooter />
{/if}

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }
</style>
