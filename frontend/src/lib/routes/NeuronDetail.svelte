<script lang="ts">
  import { isNnsProjectStore } from "../derived/selected-project.derived";
  import NnsNeuronDetail from "../pages/NnsNeuronDetail.svelte";
  import SnsNeuronDetail from "../pages/SnsNeuronDetail.svelte";
</script>

{#if $isNnsProjectStore}
  <NnsNeuronDetail />
{:else}
  <SnsNeuronDetail />
{/if}
