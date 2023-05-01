<script lang="ts">
  import SignInAccounts from "$lib/pages/SignInAccounts.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import Accounts from "$lib/routes/Accounts.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  let innerWidth = 0;

  let list = false;
  $: list = innerWidth > BREAKPOINT_LARGE;

  $: (() => {
    layoutTitleStore.set(list ? "" : $i18n.navigation.tokens);
  })();
</script>

<svelte:window bind:innerWidth />

{#if $authSignedInStore}
  <Accounts />
{:else}
  <SignInAccounts />
{/if}
