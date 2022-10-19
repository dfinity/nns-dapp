<script lang="ts">
  import { ENABLE_SNS } from "$lib/constants/environment.constants";
  import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
  import NnsNeuronsFooter from "$lib/components/neurons/NnsNeuronsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import SelectProjectDropdownHeader from "$lib/components/ic/SelectProjectDropdownHeader.svelte";
</script>

<main class="legacy">
  {#if ENABLE_SNS}
    <SelectProjectDropdownHeader />
  {/if}

  {#if $isNnsProjectStore}
    <NnsNeurons />
  {:else if $snsProjectSelectedStore !== undefined}
    <SnsNeurons />
  {/if}
</main>

{#if $isNnsProjectStore}
  <NnsNeuronsFooter />
{/if}
