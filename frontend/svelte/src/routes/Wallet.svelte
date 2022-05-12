<script lang="ts">
  import { onMount } from "svelte";
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
  import type { Transaction } from "../lib/canisters/nns-dapp/nns-dapp.types";
  import type { AccountIdentifier } from "@dfinity/nns/dist/types/types/common";
  import { accountName as getAccountName } from "../lib/utils/accounts.utils";
  import TransactionCard from "../lib/components/accounts/TransactionCard.svelte";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";

  onMount(() => {
    if (!SHOW_ACCOUNTS_ROUTE) {
      window.location.replace(`/${window.location.hash}`);
    }
  });

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.Accounts,
    });

  let showNewTransactionModal = false;

  let accountIdentifier: string | undefined;
  $: accountIdentifier = routePathAccountIdentifier($routeStore.path);

  let mainAccount: Account | undefined;
  $: mainAccount = $accountsStore?.main;

  let selectedAccount: Account | undefined;
  $: accountIdentifier,
    $accountsStore,
    (() => (selectedAccount = getAccountFromStore(accountIdentifier)))();
  // TODO: handle unknown accountIdentifier from URL

  let transactions: Transaction[] = [];
  let loading: boolean = false;
  const updateTransactions = async (accountIdentifier: AccountIdentifier) => {
    loading = true;
    getAccountTransactions({
      accountIdentifier,
      onLoad: ({
        accountIdentifier: responseAccountIdentifier,
        transactions: loadedTransactions,
      }) => {
        if (responseAccountIdentifier !== accountIdentifier) {
          return;
        }
        transactions = loadedTransactions;
      },
    });
    loading = false;
  };

  let accountName: string;
  $: if (selectedAccount) {
    accountName = getAccountName({
      account: selectedAccount,
      mainName: $i18n.accounts.main,
    });
    updateTransactions(selectedAccount.identifier);
  }
</script>

{#if SHOW_ACCOUNTS_ROUTE}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header">{$i18n.wallet.title}</svelte:fragment>

    <section>
      {#if selectedAccount}
        <div class="title">
          <h1>{accountName}</h1>
          <ICP icp={selectedAccount.balance} />
        </div>
        <Identifier identifier={selectedAccount.identifier} showCopy />

        {#if loading}
          <SkeletonCard />
        {:else if transactions.length === 0}
          No transactions!
        {:else}
          {#each transactions as transaction}
            <TransactionCard account={selectedAccount} {transaction} />
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
          disabled={selectedAccount === undefined || !mainAccount}
          >{$i18n.accounts.new_transaction}</button
        >
      </Toolbar>
    </svelte:fragment>
  </HeadlessLayout>

  {#if showNewTransactionModal}
    <NewTransactionModal
      on:nnsClose={() => (showNewTransactionModal = false)}
      {selectedAccount}
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
