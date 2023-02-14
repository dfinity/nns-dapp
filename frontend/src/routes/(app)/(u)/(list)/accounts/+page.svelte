<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignInAccounts from "$lib/pages/SignInAccounts.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import Accounts from "$lib/routes/Accounts.svelte";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  let innerWidth = 0;

  let list = false;
  $: list = innerWidth > BREAKPOINT_LARGE;

  $: (() => {
    layoutTitleStore.set(list ? "" : $i18n.navigation.tokens);
  })();
</script>

<svelte:window bind:innerWidth />

{#if signedIn}
  <Accounts />
{:else}
  <SignInAccounts />
{/if}
