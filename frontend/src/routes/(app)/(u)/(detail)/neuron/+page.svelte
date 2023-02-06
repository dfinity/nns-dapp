<script lang="ts">
  import SignInNeurons from "$lib/pages/SignInNeurons.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { neuron: string | null | undefined };

  let neuronId: string | null | undefined;
  $: ({ neuron: neuronId } = data);
</script>

{#if signedIn}
  <RouteModule path={AppPath.Neuron} params={{ neuronId }} />
{:else}
  <SignInNeurons />
{/if}
