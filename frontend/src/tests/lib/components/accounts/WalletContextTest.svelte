<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    WALLET_CONTEXT_KEY,
    WalletContext,
    WalletStore,
  } from "$lib/types/wallet.context";
  import type { Account } from "$lib/types/account";
  import { writable } from "svelte/store";

  export let testComponent: typeof SvelteComponent;
  export let account: Account | undefined;

  export const walletStore = writable<WalletStore>({
    account,
    neurons: [],
  });

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: walletStore,
  });
</script>

<svelte:component this={testComponent} />

{#if $walletStore.modal !== undefined}
  <div data-tid="test-modal">{$walletStore.modal}</div>
{/if}
