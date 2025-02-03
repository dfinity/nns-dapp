<script lang="ts">
  import WalletModals from "$lib/modals/accounts/WalletModals.svelte";
  import type { Account } from "$lib/types/account";
  import {
    WALLET_CONTEXT_KEY,
    WalletContext,
    WalletStore,
  } from "$lib/types/wallet.context";
  import { SvelteComponent, setContext } from "svelte";
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

<WalletModals />
