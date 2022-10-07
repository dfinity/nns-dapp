<script lang="ts">
  import { isNnsProjectStore } from "$lib/derived/selected-project.derived";
  import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
  import SnsNeuronDetail from "$lib/pages/SnsNeuronDetail.svelte";
</script>

{#if $isNnsProjectStore}
  <NnsNeuronDetail />
{:else}
  <SnsNeuronDetail />
{/if}
