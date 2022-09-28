<script lang="ts">
  import { setContext } from "svelte";
  import { i18n } from "../stores/i18n";
  import { Toolbar } from "@dfinity/gix-components";
  import Footer from "../components/common/Footer.svelte";
  import { routeStore } from "../stores/route.store";
  import {
    getAccountTransactions,
    routePathAccountIdentifier,
  } from "../services/accounts.services";
  import { accountsStore } from "../stores/accounts.store";
  import { Spinner } from "@dfinity/gix-components";
  import { toastsError } from "../stores/toasts.store";
  import { replacePlaceholders } from "../utils/i18n.utils";
  import type { Account } from "../types/account";
  import { writable } from "svelte/store";
  import WalletActions from "../components/accounts/WalletActions.svelte";
  import WalletSummary from "../components/accounts/WalletSummary.svelte";
  import { busy } from "../stores/busy.store";
  import TransactionList from "../components/accounts/TransactionList.svelte";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
    type SelectedAccountStore,
  } from "../types/selected-account.context";
  import { getAccountFromStore } from "../utils/accounts.utils";
  import { debugSelectedAccountStore } from "../stores/debug.store";
  import { layoutBackStore } from "../stores/layout.store";
  import IcpTransactionModal from "../modals/accounts/IcpTransactionModal.svelte";
  import { accountsPathStore } from "../derived/paths.derived";
  import type {
    AccountIdentifierString,
    Transaction,
  } from "../canisters/nns-dapp/nns-dapp.types";

  const goBack = () =>
    routeStore.navigate({
      path: $accountsPathStore,
    });

  layoutBackStore.set(goBack);

  let transactions: Transaction[] | undefined;

  const reloadTransactions = async (
    accountIdentifier: AccountIdentifierString
  ) =>
    await getAccountTransactions({
      accountIdentifier,
      onLoad: ({ accountIdentifier, transactions: loadedTransactions }) => {
        // avoid using outdated transactions
        if (accountIdentifier !== $selectedAccountStore.account?.identifier) {
          return;
        }

        transactions = loadedTransactions;
      },
    });

  const selectedAccountStore = writable<SelectedAccountStore>({
    account: undefined,
  });

  // TODO: Add transactions to debug store https://dfinity.atlassian.net/browse/GIX-1043
  debugSelectedAccountStore(selectedAccountStore);

  setContext<SelectedAccountContext>(SELECTED_ACCOUNT_CONTEXT_KEY, {
    store: selectedAccountStore,
  });

  let routeAccountIdentifier:
    | { accountIdentifier: string | undefined }
    | undefined;
  $: routeAccountIdentifier = routePathAccountIdentifier($routeStore.path);

  let selectedAccount: Account | undefined;
  $: selectedAccount = getAccountFromStore({
    identifier: routeAccountIdentifier?.accountIdentifier,
    accountsStore: $accountsStore,
  });

  $: routeAccountIdentifier,
    selectedAccount,
    (() => {
      // Not /wallet route
      if (routeAccountIdentifier === undefined) {
        return;
      }

      const storeAccount = $selectedAccountStore.account;

      if (storeAccount !== selectedAccount) {
        // If we select another account, then the transactions are set separately to update the UI with the account and
        // display the loader - skeleton - while we load the transactions.
        //
        // On the contrary, if we reload the transactions of the same account, we keep the current list to avoid a flickering of the screen.
        // This can happen when user transfer ICP to another account - i.e. a new transaction will be added to the list at the top so we don't want the list to flicker while updating.
        const sameAccount: boolean =
          selectedAccount !== undefined &&
          storeAccount?.identifier === selectedAccount.identifier;

        selectedAccountStore.update(() => ({
          account: selectedAccount,
        }));

        transactions = sameAccount ? transactions : undefined;

        if (selectedAccount !== undefined) {
          reloadTransactions(selectedAccount.identifier);
        }
      }

      // handle unknown accountIdentifier from URL
      if (selectedAccount === undefined && $accountsStore.main !== undefined) {
        toastsError({
          labelKey: replacePlaceholders($i18n.error.account_not_found, {
            $account_identifier:
              routeAccountIdentifier?.accountIdentifier ?? "",
          }),
        });
        goBack();
      }
    })();

  let showNewTransactionModal = false;

  // TODO(L2-581): Create WalletInfo component
</script>

<main class="legacy" data-tid="nns-wallet">
  <section>
    {#if $selectedAccountStore.account !== undefined}
      <WalletSummary />
      <div class="actions">
        <WalletActions />
      </div>
      <TransactionList {transactions} />
    {:else}
      <Spinner />
    {/if}
  </section>
</main>

<Footer>
  <Toolbar>
    <button
      class="primary"
      on:click={() => (showNewTransactionModal = true)}
      disabled={$selectedAccountStore.account === undefined || $busy}
      data-tid="new-transaction">{$i18n.accounts.new_transaction}</button
    >
  </Toolbar>
</Footer>

{#if showNewTransactionModal}
  <IcpTransactionModal
    on:nnsClose={() => (showNewTransactionModal = false)}
    selectedAccount={$selectedAccountStore.account}
  />
{/if}

<style lang="scss">
  .actions {
    margin-bottom: var(--padding-3x);
    display: flex;
    justify-content: end;
  }
</style>
