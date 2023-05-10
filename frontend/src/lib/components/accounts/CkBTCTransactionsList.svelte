<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { loadCkBTCAccountNextTransactions } from "$lib/services/ckbtc-transactions.services";
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

  export let indexCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;
  export let account: Account;

  let loading = true;

  const loadTransactions = async () => {
    loading = true;
    await loadCkBTCAccountNextTransactions({
      account,
      canisterId: universeId,
      indexCanisterId,
    });
    loading = false;
  };

  $: account, (async () => loadTransactions())();

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

<IcrcTransactionsList
  on:nnsIntersect={loadTransactions}
  {account}
  {transactions}
  {loading}
  {completed}
  {descriptions}
/>
