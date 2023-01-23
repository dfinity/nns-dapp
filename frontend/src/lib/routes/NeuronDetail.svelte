<script lang="ts">
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
  import SnsNeuronDetail from "$lib/pages/SnsNeuronDetail.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";

  export let neuronId: string | null | undefined;

  layoutTitleStore.set($i18n.neuron_detail.title);
</script>

{#if $isNnsUniverseStore}
  <NnsNeuronDetail neuronIdText={neuronId} />
{:else}
  <SnsNeuronDetail {neuronId} />
{/if}
