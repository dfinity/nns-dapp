<script lang="ts">
  import { isNnsProjectStore } from "$lib/derived/selected-project.derived";
  import NnsWallet from "$lib/pages/NnsWallet.svelte";
  import SnsWallet from "$lib/pages/SnsWallet.svelte";
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
  {#if $isNnsProjectStore}
    <NnsWallet {accountIdentifier} />
  {:else}
    <SnsWallet {accountIdentifier} />
  {/if}
{:else}
  <h1>Wallets NOT signed in</h1>

  <SignIn />
{/if}
