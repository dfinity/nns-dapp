<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import { routeStore } from "../lib/stores/route.store";
  import {
    AppPath,
    SHOW_ACCOUNTS_ROUTE,
  } from "../lib/constants/routes.constants";
  import NewTransactionModal from "../lib/modals/accounts/NewTransactionModal.svelte";
  import {
    getAccountFromStore,
    getAccountTransactions,
    routePathAccountIdentifier,
  } from "../lib/services/accounts.services";
  import type { Account } from "../lib/types/account";
  import { accountsStore } from "../lib/stores/accounts.store";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import Identifier from "../lib/components/ic/Identifier.svelte";
  import ICP from "../lib/components/ic/ICP.svelte";
  import type { AccountIdentifier } from "@dfinity/nns/dist/types/types/common";
  import { accountName as getAccountName } from "../lib/utils/accounts.utils";
  import TransactionCard from "../lib/components/accounts/TransactionCard.svelte";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import { writable } from "svelte/store";
  import {
    TRANSACTIONS_CONTEXT_KEY,
    type TransactionsContext,
    type TransactionsStore,
  } from "../lib/stores/transactions.store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { replacePlaceholders } from "../lib/utils/i18n.utils";

  onMount(() => {
    if (!SHOW_ACCOUNTS_ROUTE) {
      window.location.replace(`/${window.location.hash}`);
    }
  });

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.Accounts,
    });

  const updateTransactions = async (accountIdentifier: AccountIdentifier) =>
    await getAccountTransactions({
      accountIdentifier,
      onLoad: ({ accountIdentifier, transactions }) => {
        if (accountIdentifier !== $transactionsStore.accountIdentifier) {
          // skip using outdated transactions if url was changed
          return;
        }
        $transactionsStore.transactions = transactions;
      },
    });

  const transactionsStore = writable<TransactionsStore>({
    accountIdentifier: undefined,
    account: undefined,
    transactions: undefined,
  });
  setContext<TransactionsContext>(TRANSACTIONS_CONTEXT_KEY, transactionsStore);

  let routeAccountIdentifier: string | undefined;
  $: routeAccountIdentifier = routePathAccountIdentifier($routeStore.path);

  // manage transactionsStore state
  $: routeAccountIdentifier,
    $accountsStore,
    (() => {
      const identifierChanged =
        routeAccountIdentifier !== $transactionsStore.accountIdentifier;

      if (identifierChanged) {
        $transactionsStore.account = undefined;
        $transactionsStore.transactions = undefined;
      }
      const noStoreAccount = $transactionsStore.account === undefined;

      $transactionsStore.account = getAccountFromStore(routeAccountIdentifier);
      $transactionsStore.accountIdentifier = routeAccountIdentifier;

      // skip same transaction loading
      if (
        (identifierChanged || noStoreAccount) &&
        $transactionsStore.account !== undefined
      ) {
        updateTransactions($transactionsStore.account.identifier);
      }

      // handle unknown accountIdentifier from URL
      if (
        $transactionsStore.account === undefined &&
        $accountsStore.main !== undefined
      ) {
        toastsStore.error({
          labelKey: replacePlaceholders($i18n.error.account_not_found, {
            account_identifier: routeAccountIdentifier ?? "",
          }),
        });
        goBack();
      }
    })();

  let accountName: string;
  $: if ($transactionsStore.account) {
    accountName = getAccountName({
      account: $transactionsStore.account,
      mainName: $i18n.accounts.main,
    });
  }

  let showNewTransactionModal = false;
</script>

{#if SHOW_ACCOUNTS_ROUTE}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header">{$i18n.wallet.title}</svelte:fragment>

    <section>
      {#if $transactionsStore.account !== undefined}
        <div class="title">
          <h1>{accountName}</h1>
          <ICP icp={$transactionsStore.account.balance} />
        </div>
        <Identifier
          identifier={$transactionsStore.account.identifier}
          showCopy
        />

        {#if $transactionsStore.transactions === undefined}
          <SkeletonCard />
        {:else if $transactionsStore.transactions.length === 0}
          {$i18n.transactions.no_transactions}
        {:else}
          {#each $transactionsStore.transactions as transaction}
            <TransactionCard
              account={$transactionsStore.account}
              {transaction}
            />
          {/each}
        {/if}
      {:else}
        <Spinner />
      {/if}
    </section>

    <svelte:fragment slot="footer">
      <Toolbar>
        <button
          class="primary"
          on:click={() => (showNewTransactionModal = true)}
          disabled={$transactionsStore.account === undefined}
          >{$i18n.accounts.new_transaction}</button
        >
      </Toolbar>
    </svelte:fragment>
  </HeadlessLayout>

  {#if showNewTransactionModal}
    <NewTransactionModal
      on:nnsClose={() => (showNewTransactionModal = false)}
      selectedAccount={$transactionsStore.account}
    />
  {/if}
{/if}

<style lang="scss">
  @use "../lib/themes/mixins/media.scss";

  .title {
    display: block;
    width: 100%;

    margin-bottom: var(--padding-2x);

    --icp-font-size: var(--font-size-h1);

    // Minimum height of ICP value + ICP label (ICP component)
    min-height: calc(
      var(--line-height-standard) * (var(--icp-font-size) + 1rem)
    );

    @include media.min-width(medium) {
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
