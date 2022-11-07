<script lang="ts">
  import SignInNNS from "$lib/pages/SignInNNS.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { canister: string | null | undefined };

  let canisterId: string | null | undefined;
  $: ({ canister: canisterId } = data);
</script>

{#if signedIn}
  <RouteModule path={AppPath.Canister} params={{ canisterId }} />
{:else}
  <SignInNNS />
{/if}
