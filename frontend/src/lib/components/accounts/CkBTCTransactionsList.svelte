<script lang="ts">
  import type { Account } from "$lib/types/account";
  import {
    loadCkBTCAccountNextTransactions,
    loadCkBTCAccountTransactions,
  } from "$lib/services/ckbtc-transactions.services";
  import type { IcrcTransactionData } from "$lib/types/transaction";
  import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
  import {
    getSortedTransactionsFromStore,
    isIcrcTransactionsCompleted,
  } from "$lib/utils/icrc-transactions.utils";
  import IcrcTransactionsList from "$lib/components/accounts/IcrcTransactionsList.svelte";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { CanisterId } from "$lib/types/canister";
  import { i18n } from "$lib/stores/i18n";
  import { onMount } from "svelte";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import CkBTCWalletTransactionsObserver from "$lib/components/accounts/CkBTCWalletTransactionsObserver.svelte";
  import {CKBTC_TRANSACTIONS_RELOAD_DELAY} from "$lib/constants/ckbtc.constants";

  export let indexCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;
  export let account: Account;
  export let token: IcrcTokenMetadata | undefined;

  // Expose for test purpose only
  export let loading = true;

  const loadNextTransactions = async () => {
    loading = true;
    await loadCkBTCAccountNextTransactions({
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
    const delay = (time: number) =>
      new Promise((resolve) => setTimeout(resolve, time));
    await delay(CKBTC_TRANSACTIONS_RELOAD_DELAY);

    await loadCkBTCAccountTransactions({
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

  let descriptions: Record<string, string>;
  $: descriptions = $i18n.ckbtc_transaction_names as unknown as Record<
    string,
    string
  >;
</script>

<CkBTCWalletTransactionsObserver
  {indexCanisterId}
  {account}
  {completed}
  {universeId}
>
  <IcrcTransactionsList
    on:nnsIntersect={loadNextTransactions}
    {account}
    {transactions}
    {loading}
    {completed}
    {descriptions}
    {token}
  />
</CkBTCWalletTransactionsObserver>
