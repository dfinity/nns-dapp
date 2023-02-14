<script lang="ts">
  import SignInAccounts from "$lib/pages/SignInAccounts.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import Wallet from "$lib/routes/Wallet.svelte";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { account: string | null | undefined };

  let accountIdentifier: string | null | undefined;
  $: ({ account: accountIdentifier } = data);
</script>

{#if signedIn}
  <Wallet {accountIdentifier} />
{:else}
  <SignInAccounts />
{/if}
