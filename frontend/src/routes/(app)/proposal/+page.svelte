<script lang="ts">
  import SignInNNS from "$lib/pages/SignInNNS.svelte";
  import {isSignedIn} from "$lib/utils/auth.utils";
  import {authStore} from "$lib/stores/auth.store";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import {AppPath} from "$lib/constants/routes.constants";
  import {pageReferrerStore} from "$lib/stores/page.store";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { proposal: string | null | undefined };

  let proposalId: string | null | undefined;
  $: ({ proposal: proposalId } = data);

  // TODO(GIX-1071): utils
  let referrerPath: AppPath | undefined = $pageReferrerStore;
</script>

{#if signedIn}
  <RouteModule
    path={AppPath.Proposal}
    params={{ proposalIdText: proposalId, referrerPath }}
  />
{:else}
  <SignInNNS />
{/if}
