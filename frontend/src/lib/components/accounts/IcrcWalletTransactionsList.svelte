<!-- Expose getters and setters to access properties in a testing context -->
<svelte:options accessors />

<script lang="ts">
  import IcrcWalletTransactionsObserver from "$lib/components/accounts/IcrcWalletTransactionsObserver.svelte";
  import UiTransactionsList from "$lib/components/accounts/UiTransactionsList.svelte";
  import { WALLET_TRANSACTIONS_RELOAD_DELAY } from "$lib/constants/wallet.constants";
  import {
    loadIcrcAccountNextTransactions,
    loadIcrcAccountTransactions,
  } from "$lib/services/icrc-transactions.services";
  import { i18n } from "$lib/stores/i18n";
  import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
  import type { Account } from "$lib/types/account";
  import type { CanisterId } from "$lib/types/canister";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import type {
    IcrcTransactionData,
    UiTransaction,
  } from "$lib/types/transaction";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import {
    getSortedTransactionsFromStore,
    isIcrcTransactionsCompleted,
    mapIcrcTransaction,
  } from "$lib/utils/icrc-transactions.utils";
  import { waitForMilliseconds } from "$lib/utils/utils";
  import { nonNullish } from "@dfinity/utils";
  import { onMount } from "svelte";

  export let indexCanisterId: CanisterId;
  export let ledgerCanisterId: UniverseCanisterId;
  export let account: Account;
  export let token: IcrcTokenMetadata | undefined;
  export let mapTransactions = (
    transactions: IcrcTransactionData[]
  ): UiTransaction[] =>
    transactions
      .map((transaction: IcrcTransactionData) =>
        mapIcrcTransaction({
          ...transaction,
          account,
          token,
          i18n: $i18n,
        })
      )
      .filter(nonNullish);

  // Expose for test purpose only
  export let loading = true;

  const loadNextTransactions = async () => {
    loading = true;
    await loadIcrcAccountNextTransactions({
      account,
      ledgerCanisterId,
      indexCanisterId,
    });
    loading = false;
  };

  export const reloadTransactions = async () => {
    // If we are already loading transactions we do not want to double the calls
    if (loading) {
      return;
    }

    loading = true;

    // We want to reload all transactions of the account from scratch.
    // That way the skeletons will be displayed again which provides the user a visual feedback about the fact that all transactions are realoded.
    // This is handy because the reload notably happens the "update balance" process - i.e. happens after the "busy spinner" has fade away.
    icrcTransactionsStore.resetAccount({
      canisterId: ledgerCanisterId,
      accountIdentifier: account.identifier,
    });

    // We optimistically try to fetch the new transaction the user just transferred by delaying the reload of the transactions.
    await waitForMilliseconds(WALLET_TRANSACTIONS_RELOAD_DELAY);

    await loadIcrcAccountTransactions({
      account,
      ledgerCanisterId,
      indexCanisterId,
    });

    loading = false;
  };

  onMount(loadNextTransactions);

  let transactions: IcrcTransactionData[];
  $: transactions = getSortedTransactionsFromStore({
    store: $icrcTransactionsStore,
    canisterId: ledgerCanisterId,
    account,
  });

  let completed: boolean;
  $: completed = isIcrcTransactionsCompleted({
    store: $icrcTransactionsStore,
    canisterId: ledgerCanisterId,
    account,
  });

  let mappedTransactions: UiTransaction[];
  $: mappedTransactions = mapTransactions(transactions);

  // If transactions haven't loaded yet, we want to display the skeletons,
  // even if mapTransactions returns a non-empty list.
  let uiTransactions: UiTransaction[];
  $: uiTransactions =
    transactions.length === 0 && loading ? [] : mappedTransactions;
</script>

<IcrcWalletTransactionsObserver
  {indexCanisterId}
  {account}
  {completed}
  {ledgerCanisterId}
>
  <UiTransactionsList
    on:nnsIntersect={loadNextTransactions}
    transactions={uiTransactions}
    {loading}
    {completed}
  />
</IcrcWalletTransactionsObserver>
