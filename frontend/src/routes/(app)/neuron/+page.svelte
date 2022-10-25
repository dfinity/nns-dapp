<script lang="ts">
  import NeuronDetail from "$lib/routes/NeuronDetail.svelte";
  import SignInNNS from "$lib/pages/SignInNNS.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { neuron: string | null | undefined };

  let neuronId: string | null | undefined;
  $: ({ neuron: neuronId } = data);
</script>

{#if signedIn}
  <NeuronDetail {neuronId} />
{:else}
  <SignInNNS />
{/if}
