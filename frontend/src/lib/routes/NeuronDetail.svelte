<script lang="ts">
  import { isNnsProjectStore } from "$lib/derived/selected-project.derived";
  import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
  import SnsNeuronDetail from "$lib/pages/SnsNeuronDetail.svelte";

  export let neuronId: string | null | undefined;
</script>

{#if $isNnsProjectStore}
  <NnsNeuronDetail neuronIdText={neuronId} />
{:else}
  <SnsNeuronDetail {neuronId} />
{/if}
