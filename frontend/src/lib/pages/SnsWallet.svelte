<script lang="ts">
  import { Spinner, busy } from "@dfinity/gix-components";
  import { onMount } from "svelte";
  import { onDestroy, setContext } from "svelte/internal";
  import { writable, type Unsubscriber } from "svelte/store";
  import WalletSummary from "$lib/components/accounts/WalletSummary.svelte";
  import { ENABLE_SNS } from "$lib/constants/environment.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import { debugSelectedAccountStore } from "$lib/stores/debug.store";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
    type WalletStore,
  } from "$lib/types/wallet.context";
  import Footer from "$lib/components/common/Footer.svelte";
  import { i18n } from "$lib/stores/i18n";
  import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";
  import { goto } from "$app/navigation";
  import SnsTransactionsList from "$lib/components/accounts/SnsTransactionsList.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { Island } from "@dfinity/gix-components";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(async () => {
    if (!ENABLE_SNS) {
      await goto(AppPath.Accounts, { replaceState: true });
      return;
    }
  });

  let showNewTransactionModal = false;

  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (selectedProjectCanisterId !== undefined) {
        // Reload accounts always.
        // Do not set to loading because we might use the account in the store.
        await syncSnsAccounts(selectedProjectCanisterId);
      }
    }
  );

  onDestroy(unsubscribe);

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  // TODO: Add transactions to debug store https://dfinity.atlassian.net/browse/GIX-1043
  debugSelectedAccountStore(selectedAccountStore);

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: selectedAccountStore,
  });

  export let accountIdentifier: string | undefined | null = undefined;

  $: {
    if (accountIdentifier !== undefined) {
      const selectedAccount = $snsProjectAccountsStore?.find(
        ({ identifier }) => identifier === accountIdentifier
      );

      selectedAccountStore.set({
        account: selectedAccount,
        neurons: [],
      });
    }
  }
</script>

<Island>
  <main class="legacy" data-tid="sns-wallet">
    <section>
      {#if $selectedAccountStore.account !== undefined && $snsOnlyProjectStore !== undefined}
        <WalletSummary />

        <Separator />

        <SnsTransactionsList
          rootCanisterId={$snsOnlyProjectStore}
          account={$selectedAccountStore.account}
        />
      {:else}
        <Spinner />
      {/if}
    </section>
  </main>

  <Footer columns={1}>
    <button
      class="primary"
      on:click={() => (showNewTransactionModal = true)}
      disabled={$selectedAccountStore.account === undefined || $busy}
      data-tid="open-new-sns-transaction"
      >{$i18n.accounts.new_transaction}</button
    >
  </Footer>
</Island>

{#if showNewTransactionModal}
  <SnsTransactionModal
    on:nnsClose={() => (showNewTransactionModal = false)}
    selectedAccount={$selectedAccountStore.account}
    loadTransactions
  />
{/if}
