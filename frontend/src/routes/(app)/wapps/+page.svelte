<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { onMount } from "svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { afterNavigate } from "$app/navigation";
  import type { Navigation } from "@sveltejs/kit";
  import { referrerPathForNav } from "$lib/utils/page.utils";
  import SignInWApps from "$lib/pages/SignInWApps.svelte";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  let referrerPath: AppPath | undefined = undefined;
  afterNavigate((nav: Navigation) => (referrerPath = referrerPathForNav(nav)));

  onMount(() => layoutTitleStore.set($i18n.navigation.wapps));
</script>

{#if signedIn}
  <RouteModule path={AppPath.WApps} params={{ referrerPath }} />
{:else}
  <SignInWApps />
{/if}
