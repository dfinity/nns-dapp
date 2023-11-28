<!-- Expose getters and setters to access properties in a testing context -->
<svelte:options accessors />

<script lang="ts">
  import type { Account } from "$lib/types/account";
  import type { UiTransaction } from "$lib/types/transaction";
  import {
    loadWalletNextTransactions,
    loadWalletTransactions,
  } from "$lib/services/wallet-transactions.services";
  import type { IcrcTransactionData } from "$lib/types/transaction";
  import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    getSortedTransactionsFromStore,
    isIcrcTransactionsCompleted,
    mapIcrcTransaction,
    type MapIcrcTransactionType,
  } from "$lib/utils/icrc-transactions.utils";
  import IcrcTransactionsList from "$lib/components/accounts/IcrcTransactionsList.svelte";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { CanisterId } from "$lib/types/canister";
  import { onMount } from "svelte";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import IcrcWalletTransactionsObserver from "$lib/components/accounts/IcrcWalletTransactionsObserver.svelte";
  import { WALLET_TRANSACTIONS_RELOAD_DELAY } from "$lib/constants/wallet.constants";
  import { waitForMilliseconds } from "$lib/utils/utils";
  import { nonNullish } from "@dfinity/utils";

  export let indexCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;
  export let account: Account;
  export let token: IcrcTokenMetadata | undefined;
  export let mapTransaction: MapIcrcTransactionType = mapIcrcTransaction;

  // Expose for test purpose only
  export let loading = true;

  const loadNextTransactions = async () => {
    loading = true;
    await loadWalletNextTransactions({
      account,
      canisterId: universeId,
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
      universeId,
      accountIdentifier: account.identifier,
    });

    // We optimistically try to fetch the new transaction the user just transferred by delaying the reload of the transactions.
    await waitForMilliseconds(WALLET_TRANSACTIONS_RELOAD_DELAY);

    await loadWalletTransactions({
      account,
      canisterId: universeId,
      indexCanisterId,
    });

    loading = false;
  };

  onMount(loadNextTransactions);

  let transactions: IcrcTransactionData[];
  $: transactions = getSortedTransactionsFromStore({
    store: $icrcTransactionsStore,
    canisterId: universeId,
    account,
  });

  let completed: boolean;
  $: completed = isIcrcTransactionsCompleted({
    store: $icrcTransactionsStore,
    canisterId: universeId,
    account,
  });

  let uiTransactions: UiTransaction[];
  $: uiTransactions = transactions
    .map((transaction: IcrcTransactionData) =>
      mapTransaction({
        ...transaction,
        account,
        token,
        i18n: $i18n,
      })
    )
    .filter(nonNullish);
</script>

<IcrcWalletTransactionsObserver
  {indexCanisterId}
  {account}
  {completed}
  {universeId}
>
  <IcrcTransactionsList
    on:nnsIntersect={loadNextTransactions}
    transactions={uiTransactions}
    {loading}
    {completed}
  />
</IcrcWalletTransactionsObserver>
