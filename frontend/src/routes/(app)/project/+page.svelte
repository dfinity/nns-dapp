<script lang="ts">
  import SignInNNS from "$lib/pages/SignInNNS.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { onMount } from "svelte";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { gotoProxy } from "$lib/proxy/app.services.proxy";

  onMount(async () => {
    if (!IS_TESTNET) {
      await gotoProxy(AppPath.Accounts, { replaceState: true });
      return;
    }
  });

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { project: string | null | undefined };

  let rootCanisterId: string | null | undefined;
  $: ({ project: rootCanisterId } = data);
</script>

{#if signedIn}
  <RouteModule path={AppPath.Project} params={{ rootCanisterId }} />
{:else}
  <SignInNNS />
{/if}
