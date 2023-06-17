<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    WALLET_CONTEXT_KEY,
    CkBTCWalletContext,
    WalletStore,
  } from "$lib/types/wallet.context";
  import type { Account } from "$lib/types/account";
  import { writable } from "svelte/store";
  import CkBTCAccountsModals from "$lib/modals/accounts/CkBTCAccountsModals.svelte";

  export let testComponent: typeof SvelteComponent;
  export let account: Account | undefined;

  export const walletStore = writable<WalletStore>({
    account,
    neurons: [],
  });

  setContext<CkBTCWalletContext>(WALLET_CONTEXT_KEY, {
    store: walletStore,
    reloadAccount: () => Promise.resolve(),
    reloadAccountFromStore: () => {
      // Do nothing here
    },
  });
</script>

<svelte:component this={testComponent} />

<CkBTCAccountsModals />
