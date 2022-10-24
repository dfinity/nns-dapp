<script lang="ts">
  import CanisterDetail from "$lib/pages/CanisterDetail.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import type { Navigation } from "@sveltejs/kit";
  import { afterNavigate } from "$app/navigation";
  import type { AppPath } from "$lib/constants/routes.constants";
  import { pathForRouteId } from "$lib/utils/page.utils";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { canister: string | null | undefined };

  let canisterId: string | null | undefined;
  $: ({ canister: canisterId } = data);

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
  <CanisterDetail {canisterId} {referrerPath} />
{:else}
  <h1>Proposal NOT signed in</h1>

  <SignIn />
{/if}
