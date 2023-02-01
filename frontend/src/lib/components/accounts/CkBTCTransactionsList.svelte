<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { onMount } from "svelte";
  import { loadCkBTCAccountNextTransactions } from "$lib/services/ckbtc-transactions.services";
  import type { IcrcTransactionData } from "$lib/types/transaction";
  import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
  import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import {
    getSortedTransactionsFromStore,
    isIcrcTransactionsCompleted,
  } from "$lib/utils/icrc-transactions.utils";
  import IcrcTransactionsList from "$lib/components/accounts/IcrcTransactionsList.svelte";

  export let account: Account;

  let loading = true;

  const loadTransactions = async () => {
    loading = true;
    await loadCkBTCAccountNextTransactions({
      account,
    });
    loading = false;
  };

  onMount(async () => await loadTransactions());

  let transactions: IcrcTransactionData[];
  $: transactions = getSortedTransactionsFromStore({
    store: $icrcTransactionsStore,
    canisterId: CKBTC_UNIVERSE_CANISTER_ID,
    account,
  });

  let completed: boolean;
  $: completed = isIcrcTransactionsCompleted({
    store: $icrcTransactionsStore,
    canisterId: CKBTC_UNIVERSE_CANISTER_ID,
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
