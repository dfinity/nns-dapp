<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
  import SnsNeuronDetail from "$lib/pages/SnsNeuronDetail.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { nonNullish } from "@dfinity/utils";

  export let neuronId: string | null | undefined;

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
