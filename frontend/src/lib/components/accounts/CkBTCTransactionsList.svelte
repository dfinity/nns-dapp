<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { onMount } from "svelte";
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

  onMount(async () => await loadTransactions());

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
</script>

<IcrcTransactionsList
  on:nnsIntersect={loadTransactions}
  {account}
  {transactions}
  {loading}
  {completed}
/>
