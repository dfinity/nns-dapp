<script lang="ts">
  import Wallet from "$lib/routes/Wallet.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";

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
  <h1>Wallets NOT signed in</h1>

  <SignIn />
{/if}
