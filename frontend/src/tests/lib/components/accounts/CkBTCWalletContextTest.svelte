<script lang="ts">
  import CkBTCAccountsModals from "$lib/modals/accounts/CkBTCAccountsModals.svelte";
  import type { Account } from "$lib/types/account";
  import type { WalletStore } from "$lib/types/wallet.context";
  import type { Component } from "svelte";
  import { writable } from "svelte/store";

  export let testComponent: Component;
  export let account: Account | undefined;

  export const walletStore = writable<WalletStore>({
    account,
    neurons: [],
  });

  const reloadAccount = () => Promise.resolve();
  const reloadAccountFromStore = () => {
    // Do nothing here
  };
</script>

<svelte:component
  this={testComponent}
  store={walletStore}
  {reloadAccount}
  {reloadAccountFromStore}
/>

<CkBTCAccountsModals />
