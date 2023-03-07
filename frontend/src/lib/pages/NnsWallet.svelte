<script lang="ts">
  import { setContext, onMount, onDestroy } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/layout/Footer.svelte";
  import {
    cancelPollAccounts,
    getAccountTransactions,
    pollAccounts,
  } from "$lib/services/accounts.services";
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
  import { findAccount } from "$lib/utils/accounts.utils";
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
  import Summary from "$lib/components/summary/Summary.svelte";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import ReceiveModal from "$lib/modals/accounts/ReceiveModal.svelte";
  import IC_LOGO from "$lib/assets/icp.svg";

  onMount(() => {
    pollAccounts();
  });

  onDestroy(() => {
    cancelPollAccounts();
  });

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
    account: findAccount({
      identifier: accountIdentifier,
      accounts: $nnsAccountsListStore,
    }),
    neurons: [],
  });

  $: (async () => await accountDidUpdate($selectedAccountStore))();

  let showModal: "send" | "receive" | undefined = undefined;

  // TODO(L2-581): Create WalletInfo component

  let disabled = false;
  $: disabled = isNullish($selectedAccountStore.account) || $busy;
</script>

<Island>
  <main class="legacy" data-tid="nns-wallet">
    <section>
      {#if $selectedAccountStore.account !== undefined}
        <Summary displayUniverse={false} />

        <WalletSummary />
        <WalletActions />

        <Separator />

        <TransactionList {transactions} />
      {:else}
        <Spinner />
      {/if}
    </section>
  </main>

  <Footer columns={2}>
    <button
      class="primary"
      on:click={() => (showModal = "send")}
      {disabled}
      data-tid="new-transaction">{$i18n.accounts.send}</button
    >

    <button
      class="secondary"
      on:click={() => (showModal = "receive")}
      {disabled}
      data-tid="receive-nns-transaction">{$i18n.ckbtc.receive}</button
    >
  </Footer>
</Island>

<WalletModals />

{#if showModal === "send"}
  <IcpTransactionModal
    on:nnsClose={() => (showModal = undefined)}
    selectedAccount={$selectedAccountStore.account}
  />
{/if}

<!-- For TS - action button is disabled anyway if account is undefined -->
{#if showModal === "receive" && nonNullish($selectedAccountStore.account)}
  <ReceiveModal
    account={$selectedAccountStore.account}
    on:nnsClose={() => (showModal = undefined)}
    qrCodeLabel={$i18n.wallet.qrcode_aria_label_icp}
    logo={IC_LOGO}
    logoArialLabel={$i18n.core.icp}
  />
{/if}
