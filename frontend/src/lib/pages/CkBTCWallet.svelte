<script lang="ts">
  import { Island } from "@dfinity/gix-components";
  import Summary from "$lib/components/summary/Summary.svelte";
  import WalletSummary from "$lib/components/accounts/WalletSummary.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { writable } from "svelte/store";
  import { WALLET_CONTEXT_KEY, type WalletContext, type WalletStore } from "$lib/types/wallet.context";
  import { debugSelectedAccountStore } from "$lib/derived/debug.derived";
  import { setContext } from "svelte/internal";
  import { findAccount } from "$lib/utils/accounts.utils";
  import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";

  export let accountIdentifier: string | undefined | null = undefined;

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  debugSelectedAccountStore(selectedAccountStore);

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: selectedAccountStore,
  });

  $: selectedAccountStore.set({
    account: findAccount({
      identifier: accountIdentifier,
      accounts: $ckBTCAccountsStore.accounts,
    }),
    neurons: [],
  });
</script>

<Island>
  <main class="legacy" data-tid="sns-wallet">
    <section>
      <Summary />

      <WalletSummary />

      <Separator />
    </section>
  </main>
</Island>