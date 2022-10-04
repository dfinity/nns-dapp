<script lang="ts">
  import type { Transaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import type { Account } from "$lib/types/account";
  import { i18n } from "$lib/stores/i18n";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import TransactionCard from "./TransactionCard.svelte";
  import { getContext } from "svelte";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
  } from "$lib/types/selected-account.context";
  import { mapToSelfTransaction } from "$lib/utils/transactions.utils";

  export let transactions: Transaction[] | undefined;

  const { store } = getContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY
  );

  let account: Account | undefined;
  $: ({ account } = $store);

  let extendedTransactions: {
    transaction: Transaction;
    toSelfTransaction: boolean;
  }[];
  $: extendedTransactions = mapToSelfTransaction(transactions ?? []);
</script>

{#if account === undefined || transactions === undefined}
  <SkeletonCard cardType="info" />
{:else if transactions.length === 0}
  {$i18n.wallet.no_transactions}
{:else}
  {#each extendedTransactions as { toSelfTransaction, transaction } (`${transaction.timestamp.timestamp_nanos}${toSelfTransaction}`)}
    <TransactionCard {account} {transaction} {toSelfTransaction} />
  {/each}
{/if}
