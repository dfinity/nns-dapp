<script lang="ts">
  import SignInNeurons from "$lib/pages/SignInNeurons.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { Island } from "@dfinity/gix-components";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { neuron: string | null | undefined };

  let neuronId: string | null | undefined;
  $: ({ neuron: neuronId } = data);
</script>

{#if signedIn}
  <Island>
    <RouteModule path={AppPath.Neuron} params={{ neuronId }} />
  </Island>
{:else}
  <SignInNeurons />
{/if}
