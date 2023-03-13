<script lang="ts">
  import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NnsNeuronsFooter from "$lib/components/neurons/NnsNeuronsFooter.svelte";
  import SnsNeuronsFooter from "$lib/components/sns-neurons/SnsNeuronsFooter.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import { nonNullish } from "@dfinity/utils";
  import { snsCommittedProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
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
