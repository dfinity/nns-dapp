<script lang="ts">
  import SignInNeurons from "$lib/pages/SignInNeurons.svelte";
  import NeuronDetail from "$lib/routes/NeuronDetail.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  // Preloaded by +page.ts
  export let data: { neuron: string | null | undefined };

  let neuronId: string | null | undefined;
  $: ({ neuron: neuronId } = data);
</script>

{#if $authSignedInStore}
  <NeuronDetail {neuronId} />
{:else}
  <SignInNeurons />
{/if}
