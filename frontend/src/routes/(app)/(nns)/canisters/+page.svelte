<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignInCanisters from "$lib/pages/SignInCanisters.svelte";
  import { onMount } from "svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import type { AppPath } from "$lib/constants/routes.constants";
  import { afterNavigate } from "$app/navigation";
  import type { Navigation } from "@sveltejs/kit";
  import { referrerPathForNav } from "$lib/utils/page.utils";
  import Canisters from "$lib/pages/Canisters.svelte";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  let referrerPath: AppPath | undefined = undefined;
  afterNavigate((nav: Navigation) => (referrerPath = referrerPathForNav(nav)));

  onMount(() => layoutTitleStore.set($i18n.navigation.canisters));
</script>

{#if signedIn}
  <Canisters {referrerPath} />
{:else}
  <SignInCanisters />
{/if}
