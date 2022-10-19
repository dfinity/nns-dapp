<script lang="ts">
  import NeuronDetail from "$lib/routes/NeuronDetail.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import type { NeuronId } from "@dfinity/nns";

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
  <h1>Neuron NOT signed in</h1>

  <SignIn />
{/if}
