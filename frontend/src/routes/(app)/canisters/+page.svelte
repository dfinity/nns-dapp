<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import Canisters from "$lib/pages/Canisters.svelte";
  import type { AppPath } from "$lib/constants/routes.constants";
  import { afterNavigate } from "$app/navigation";
  import type { Navigation } from "@sveltejs/kit";
  import { pathForRouteId } from "$lib/utils/page.utils";

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
</script>

{#if signedIn}
  <Canisters {referrerPath} />
{:else}
  <h1>Canisters NOT signed in</h1>

  <SignIn />
{/if}
