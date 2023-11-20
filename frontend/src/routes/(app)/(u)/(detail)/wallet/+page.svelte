<script lang="ts">
  import SignInAccounts from "$lib/pages/SignInAccounts.svelte";
  import Wallet from "$lib/routes/Wallet.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  // Preloaded by +page.ts
  export let data: { account: string | null | undefined };

  let accountIdentifier: string | null | undefined;
  $: ({ account: accountIdentifier } = data);
</script>

{#if $authSignedInStore}
  <Wallet {accountIdentifier} />
{:else}
  <!-- TODO: New derived store accounts visitors https://dfinity.atlassian.net/browse/GIX-2058 -->
  <SignInAccounts />
{/if}
