<script lang="ts">
  import { isNnsProjectStore } from "$lib/derived/selected-project.derived";
  import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
  import SnsNeuronDetail from "$lib/pages/SnsNeuronDetail.svelte";
  import type { NeuronId } from "@dfinity/nns";

  export let neuronId: NeuronId | null | undefined;
</script>

{#if $isNnsProjectStore}
  <NnsNeuronDetail {neuronId} />
{:else}
  <SnsNeuronDetail />
{/if}
