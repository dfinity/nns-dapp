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
  import { accountsStore } from "../lib/stores/accounts.store";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import Identifier from "../lib/components/ic/Identifier.svelte";
  import ICP from "../lib/components/ic/ICP.svelte";
  import type { AccountIdentifier } from "@dfinity/nns/dist/types/types/common";
  import TransactionCard from "../lib/components/accounts/TransactionCard.svelte";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { replacePlaceholders } from "../lib/utils/i18n.utils";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
    type SelectedAccountStore,
  } from "../lib/stores/selectedAccount.store";
  import type { Account } from "../lib/types/account";
  import { writable } from "svelte/store";
  import WalletActions from "../lib/components/accounts/WalletActions.svelte";
  import { accountName as getAccountName } from "../lib/utils/transactions.utils";

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
        // avoid using outdated transactions
        if (accountIdentifier !== $selectedAccountStore.account?.identifier) {
          return;
        }
        $selectedAccountStore.transactions = transactions;
      },
    });

  const selectedAccountStore = writable<SelectedAccountStore>({
    account: undefined,
    transactions: undefined,
  });
  setContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY,
    selectedAccountStore
  );

  let routeAccountIdentifier: string | undefined;
  $: routeAccountIdentifier = routePathAccountIdentifier($routeStore.path);

  let selectedAccount: Account | undefined;
  $: $accountsStore,
    (selectedAccount = getAccountFromStore(routeAccountIdentifier));

  $: routeAccountIdentifier,
    selectedAccount,
    (() => {
      const storeAccount = $selectedAccountStore.account;

      if (storeAccount !== selectedAccount) {
        selectedAccountStore.set({
          account: selectedAccount,
          transactions: undefined,
        });

        if (selectedAccount !== undefined) {
          updateTransactions(selectedAccount.identifier);
        }
      }

      // handle unknown accountIdentifier from URL
      if (selectedAccount === undefined && $accountsStore.main !== undefined) {
        toastsStore.error({
          labelKey: replacePlaceholders($i18n.error.account_not_found, {
            account_identifier: routeAccountIdentifier ?? "",
          }),
        });
        goBack();
      }
    })();

  let accountName: string;
  $: accountName = getAccountName({
    account: selectedAccount,
    mainName: $i18n.accounts.main,
  });

  let showNewTransactionModal = false;
</script>

{#if SHOW_ACCOUNTS_ROUTE}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header">{$i18n.wallet.title}</svelte:fragment>

    <section>
      {#if $selectedAccountStore.account !== undefined}
        <div class="title">
          <h1>{accountName}</h1>
          <ICP icp={$selectedAccountStore.account.balance} />
        </div>
        <div class="address">
          <Identifier
            label={$i18n.wallet.address}
            identifier={$selectedAccountStore.account.identifier}
            showCopy
          />
        </div>
        <div class="actions">
          <WalletActions />
        </div>

        {#if $selectedAccountStore.transactions === undefined}
          <SkeletonCard />
        {:else if $selectedAccountStore.transactions.length === 0}
          {$i18n.wallet.no_transactions}
        {:else}
          {#each $selectedAccountStore.transactions as transaction}
            <TransactionCard
              account={$selectedAccountStore.account}
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
          disabled={$selectedAccountStore.account === undefined}
          >{$i18n.accounts.new_transaction}</button
        >
      </Toolbar>
    </svelte:fragment>
  </HeadlessLayout>

  {#if showNewTransactionModal}
    <NewTransactionModal
      on:nnsClose={() => (showNewTransactionModal = false)}
      selectedAccount={$selectedAccountStore.account}
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

  .address {
    margin-bottom: var(--padding-4x);
  }
  .actions {
    margin-bottom: var(--padding-3x);
    display: flex;
    justify-content: end;
  }
</style>
