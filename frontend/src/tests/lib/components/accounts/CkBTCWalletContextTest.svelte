<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    WALLET_CONTEXT_KEY,
    CkBTCWalletContext,
    WalletStore,
  } from "$lib/types/wallet.context";
  import type { Account } from "$lib/types/account";
  import { writable } from "svelte/store";
  import CkBTCWalletModals from "$lib/modals/accounts/CkBTCWalletModals.svelte";

  export let testComponent: typeof SvelteComponent;
  export let account: Account | undefined;

  export const walletStore = writable<WalletStore>({
    account,
    neurons: [],
  });

  setContext<CkBTCWalletContext>(WALLET_CONTEXT_KEY, {
    store: walletStore,
    reloadAccount: () => Promise.resolve(),
  });
</script>

<svelte:component this={testComponent} />

<CkBTCWalletModals />
