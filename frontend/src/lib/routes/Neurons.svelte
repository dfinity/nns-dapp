<script lang="ts">
  import {
    ENABLE_SNS,
    ENABLE_SNS_2,
  } from "$lib/constants/environment.constants";
  import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
  import NnsNeuronsFooter from "$lib/components/neurons/NnsNeuronsFooter.svelte";
  import SnsNeuronsFooter from "$lib/components/neurons/SnsNeuronsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectIdSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import SelectProjectDropdownHeader from "$lib/components/ic/SelectProjectDropdownHeader.svelte";
</script>

<main class="legacy">
  {#if ENABLE_SNS}
    <SelectProjectDropdownHeader legacy />
  {/if}

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
