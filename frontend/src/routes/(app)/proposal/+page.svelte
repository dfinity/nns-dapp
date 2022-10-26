<script lang="ts">
  import SignInNNS from "$lib/pages/SignInNNS.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import type { Navigation } from "@sveltejs/kit";
  import { afterNavigate } from "$app/navigation";
  import { pathForRouteId } from "$lib/utils/page.utils";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { proposal: string | null | undefined };

  let proposalId: string | null | undefined;
  $: ({ proposal: proposalId } = data);

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
  <RouteModule
    path={AppPath.Proposal}
    params={{ proposalIdText: proposalId, referrerPath }}
  />
{:else}
  <SignInNNS />
{/if}
