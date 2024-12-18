<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NnsNeuronsFooter from "$lib/components/neurons/NnsNeuronsFooter.svelte";
  import SnsNeuronsFooter from "$lib/components/sns-neurons/SnsNeuronsFooter.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import { snsCommittedProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { ENABLE_USD_VALUES_FOR_NEURONS } from "$lib/stores/feature-flags.store";
  import { nonNullish } from "@dfinity/utils";

  $: if ($ENABLE_USD_VALUES_FOR_NEURONS) {
    loadIcpSwapTickers();
  }
</script>

<TestIdWrapper testId="neurons-component">
  <main>
    <SummaryUniverse />

    {#if $isNnsUniverseStore}
      <NnsNeurons />
    {:else if nonNullish($snsCommittedProjectSelectedStore)}
      <SnsNeurons />
    {/if}
  </main>

  {#if $isNnsUniverseStore}
    <NnsNeuronsFooter />
    <!-- Staking SNS Neurons has not yet been reviewed by security -->
  {:else if nonNullish($snsCommittedProjectSelectedStore)}
    <SnsNeuronsFooter />
  {/if}
</TestIdWrapper>

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }
</style>
