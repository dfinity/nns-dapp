<script lang="ts">
  import CkBTCAccountsModals from "$lib/modals/accounts/CkBTCAccountsModals.svelte";
  import type { Account } from "$lib/types/account";
  import { WalletStore } from "$lib/types/wallet.context";
  import type { SvelteComponent } from "svelte";
  import { writable } from "svelte/store";

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
