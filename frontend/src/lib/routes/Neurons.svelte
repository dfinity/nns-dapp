<script lang="ts">
  import { ENABLE_SNS, IS_TESTNET } from "$lib/constants/environment.constants";
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
    <SelectProjectDropdownHeader />
  {/if}

  {#if $isNnsProjectStore}
    <NnsNeurons />
  {:else if $snsProjectIdSelectedStore !== undefined}
    <SnsNeurons />
  {/if}
</main>

{#if $isNnsProjectStore}
  <NnsNeuronsFooter />
{:else if $snsProjectIdSelectedStore !== undefined && IS_TESTNET}
  <SnsNeuronsFooter />
{/if}
