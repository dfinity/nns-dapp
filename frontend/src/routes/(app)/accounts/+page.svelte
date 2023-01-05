<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignInAccounts from "$lib/pages/SignInAccounts.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { BREAKPOINT_LARGE } from "@dfinity/gix-components";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  let list = false;

  let innerWidth = 0;
  $: list = innerWidth > BREAKPOINT_LARGE;

  $: (() => {
    layoutTitleStore.set(list ? "" : $i18n.navigation.tokens);
  })();
</script>

<svelte:window bind:innerWidth />

{#if signedIn}
  <RouteModule path={AppPath.Accounts} />
{:else}
  <SignInAccounts />
{/if}
