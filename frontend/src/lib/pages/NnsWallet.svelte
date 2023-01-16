<script lang="ts">
  import { setContext } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/common/Footer.svelte";
  import { getAccountTransactions } from "$lib/services/accounts.services";
  import { accountsStore } from "$lib/stores/accounts.store";
  import { Spinner, busy } from "@dfinity/gix-components";
  import { toastsError } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { writable } from "svelte/store";
  import WalletActions from "$lib/components/accounts/WalletActions.svelte";
  import WalletSummary from "$lib/components/accounts/WalletSummary.svelte";
  import TransactionList from "$lib/components/accounts/TransactionList.svelte";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
    type WalletStore,
  } from "$lib/types/wallet.context";
  import { getAccountFromStore } from "$lib/utils/accounts.utils";
  import {
    debugSelectedAccountStore,
    debugTransactions,
  } from "$lib/derived/debug.derived";
  import IcpTransactionModal from "$lib/modals/accounts/IcpTransactionModal.svelte";
  import type {
    AccountIdentifierString,
    Transaction,
  } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { pageStore } from "$lib/derived/page.derived";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { Island } from "@dfinity/gix-components";
  import WalletModals from "$lib/modals/accounts/WalletModals.svelte";

  const goBack = (): Promise<void> => goto(AppPath.Accounts);

  let transactions: Transaction[] | undefined;

  const reloadTransactions = (
    accountIdentifier: AccountIdentifierString
  ): Promise<void> =>
    getAccountTransactions({
      accountIdentifier,
      onLoad: ({ accountIdentifier, transactions: loadedTransactions }) => {
        // avoid using outdated transactions
        if (accountIdentifier !== $selectedAccountStore.account?.identifier) {
          return;
        }

        transactions = loadedTransactions;
      },
    });

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  debugSelectedAccountStore(selectedAccountStore);
  $: debugTransactions(transactions);

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: selectedAccountStore,
  });

  export let accountIdentifier: string | undefined | null = undefined;

  const accountDidUpdate = async ({ account }: WalletStore) => {
    if (account !== undefined) {
      await reloadTransactions(account.identifier);
      return;
    }

    // handle unknown accountIdentifier from URL
    if (
      account === undefined &&
      $accountsStore.main !== undefined &&
      $pageStore.path === AppPath.Wallet
    ) {
      toastsError({
        labelKey: replacePlaceholders($i18n.error.account_not_found, {
          $account_identifier: accountIdentifier ?? "",
        }),
      });

      await goBack();
    }
  };

  // We need an object to handle case where the identifier does not exist and the wallet page is loaded directly
  // First call: identifier is set, accounts store is empty, selectedAccount is undefined
  // Second call: identifier is set, accounts store is set, selectedAccount is still undefined
  $: selectedAccountStore.set({
    account: getAccountFromStore({
      identifier: accountIdentifier,
      accounts: $nnsAccountsListStore,
    }),
    neurons: [],
  });

  $: (async () => await accountDidUpdate($selectedAccountStore))();

  let showNewTransactionModal = false;

  // TODO(L2-581): Create WalletInfo component
</script>

<Island>
  <main class="legacy" data-tid="nns-wallet">
    <section>
      {#if $selectedAccountStore.account !== undefined}
        <WalletSummary />
        <WalletActions />

        <Separator />

        <TransactionList {transactions} />
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
      data-tid="new-transaction">{$i18n.accounts.new_transaction}</button
    >
  </Footer>
</Island>

<WalletModals />

{#if showNewTransactionModal}
  <IcpTransactionModal
    on:nnsClose={() => (showNewTransactionModal = false)}
    selectedAccount={$selectedAccountStore.account}
  />
{/if}
