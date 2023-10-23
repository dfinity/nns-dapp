<script lang="ts">
  import { SvelteComponent } from "svelte";
  import { WalletStore } from "$lib/types/wallet.context";
  import type { Account } from "$lib/types/account";
  import { writable } from "svelte/store";
  import CkBTCAccountsModals from "$lib/modals/accounts/CkBTCAccountsModals.svelte";

  export let testComponent: typeof SvelteComponent;
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
