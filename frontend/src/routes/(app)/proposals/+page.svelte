<script lang="ts">
  import {authStore} from "$lib/stores/auth.store";
  import {isSignedIn} from "$lib/utils/auth.utils";
  import SignInNNS from "$lib/pages/SignInNNS.svelte";
  import {onMount} from "svelte";
  import {layoutBackStore, layoutTitleStore} from "$lib/stores/layout.store";
  import {i18n} from "$lib/stores/i18n";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import {AppPath} from "$lib/constants/routes.constants";
  import {pageReferrerStore} from "$lib/stores/page.store";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // TODO(GIX-1071): utils
  let referrerPath: AppPath | undefined = $pageReferrerStore;

  onMount(() => {
    layoutTitleStore.set($i18n.wallet.title);

    // Reset back action because only detail routes have such feature other views use the menu
    layoutBackStore.set(undefined);
  });
</script>

{#if signedIn}
  <RouteModule path={AppPath.Proposals} params={{ referrerPath }} />
{:else}
  <SignInNNS />
{/if}
