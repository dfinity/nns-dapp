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
  import { accountName as getAccountName } from "../lib/utils/accounts.utils";
  import TransactionCard from "../lib/components/accounts/TransactionCard.svelte";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import { writable } from "svelte/store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { replacePlaceholders } from "../lib/utils/i18n.utils";
  import HardwareWalletShowAction from "../lib/components/accounts/HardwareWalletShowAction.svelte";
  import {
    ACCOUNT_CONTEXT_KEY,
    type AccountContext,
    type AccountStore,
  } from "../lib/stores/account.store";

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
        if (accountIdentifier !== $accountStore.accountIdentifier) {
          // skip using outdated transactions if url was changed
          return;
        }
        $accountStore.transactions = transactions;
      },
    });

  const accountStore = writable<AccountStore>({
    accountIdentifier: undefined,
    account: undefined,
    transactions: undefined,
  });
  setContext<AccountContext>(ACCOUNT_CONTEXT_KEY, accountStore);

  let routeAccountIdentifier: string | undefined;
  $: routeAccountIdentifier = routePathAccountIdentifier($routeStore.path);

  // manage accountStore state
  $: routeAccountIdentifier,
    $accountsStore,
    (() => {
      const identifierChanged =
        routeAccountIdentifier !== $accountStore.accountIdentifier;

      if (identifierChanged) {
        $accountStore.account = undefined;
        $accountStore.transactions = undefined;
      }
      const noStoreAccount = $accountStore.account === undefined;

      $accountStore.account = getAccountFromStore(routeAccountIdentifier);
      $accountStore.accountIdentifier = routeAccountIdentifier;

      // skip same transaction loading
      if (
        (identifierChanged || noStoreAccount) &&
        $accountStore.account !== undefined
      ) {
        updateTransactions($accountStore.account.identifier);
      }

      // handle unknown accountIdentifier from URL
      if (
        $accountStore.account === undefined &&
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
  $: if ($accountStore.account) {
    accountName = getAccountName({
      account: $accountStore.account,
      mainName: $i18n.accounts.main,
    });
  }

  let showNewTransactionModal = false;
</script>

{#if SHOW_ACCOUNTS_ROUTE}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header">{$i18n.wallet.title}</svelte:fragment>

    <section>
      {#if $accountStore.account !== undefined}
        <div class="title">
          <h1>{accountName}</h1>
          <ICP icp={$accountStore.account.balance} />
        </div>
        <Identifier
          label={$i18n.wallet.address}
          identifier={$accountStore.account.identifier}
          showCopy
        />

        <HardwareWalletShowAction />

        {#if $accountStore.transactions === undefined}
          <SkeletonCard />
        {:else if $accountStore.transactions.length === 0}
          {$i18n.wallet.no_transactions}
        {:else}
          {#each $accountStore.transactions as transaction}
            <TransactionCard account={$accountStore.account} {transaction} />
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
          disabled={$accountStore.account === undefined}
          >{$i18n.accounts.new_transaction}</button
        >
      </Toolbar>
    </svelte:fragment>
  </HeadlessLayout>

  {#if showNewTransactionModal}
    <NewTransactionModal
      on:nnsClose={() => (showNewTransactionModal = false)}
      selectedAccount={$accountStore.account}
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
    display: flex;
  }
</style>
