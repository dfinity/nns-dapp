<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
  import SnsNeuronDetail from "$lib/pages/SnsNeuronDetail.svelte";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { ENABLE_USD_VALUES_FOR_NEURONS } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { nonNullish } from "@dfinity/utils";

  export let neuronId: string | null | undefined;

  $: if ($ENABLE_USD_VALUES_FOR_NEURONS) {
    loadIcpSwapTickers();
  }

  layoutTitleStore.set({
    title: $i18n.neuron_detail.title,
  });
</script>

<TestIdWrapper testId="neuron-detail-component">
  {#if $isNnsUniverseStore}
    <NnsNeuronDetail neuronIdText={neuronId} />
  {:else if nonNullish($snsProjectSelectedStore)}
    <SnsNeuronDetail {neuronId} />
  {/if}
</TestIdWrapper>
