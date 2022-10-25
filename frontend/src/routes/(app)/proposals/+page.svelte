<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import Proposals from "$lib/pages/Proposals.svelte";
  import { afterNavigate } from "$app/navigation";
  import type { Navigation } from "@sveltejs/kit";
  import type { AppPath } from "$lib/constants/routes.constants";
  import { pathForRouteId } from "$lib/utils/page.utils";
  import { onMount } from "svelte";
  import { layoutBackStore, layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // TODO(GIX-1071): utils
  let referrerPath: AppPath | undefined = undefined;
  afterNavigate(
    ({ from }: Navigation) =>
      (referrerPath =
        from?.routeId !== null && from?.routeId !== undefined
          ? pathForRouteId(from.routeId)
          : undefined)
  );

  onMount(() => {
    layoutTitleStore.set($i18n.wallet.title);

    // Reset back action because only detail routes have such feature other views use the menu
    layoutBackStore.set(undefined);
  });
</script>

{#if signedIn}
  <Proposals {referrerPath} />
{:else}
  <h1>Proposals NOT signed in</h1>

  <SignIn />
{/if}
