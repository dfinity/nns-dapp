<script lang="ts">
  import type { Transaction } from "../../canisters/nns-dapp/nns-dapp.types";
  import type { Account } from "../../types/account";
  import { i18n } from "../../stores/i18n";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import TransactionCard from "./TransactionCard.svelte";
  import { getContext } from "svelte";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
  } from "../../types/selected-account.context";
  import { mapToSelfTransaction } from "../../utils/transactions.utils";

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

{#if account === undefined || extendedTransactions === undefined}
  <SkeletonCard cardType="info" />
{:else if extendedTransactions.length === 0}
  {$i18n.wallet.no_transactions}
{:else}
  {#each extendedTransactions as { toSelfTransaction, transaction } (`${transaction.timestamp.timestamp_nanos}${toSelfTransaction}`)}
    <TransactionCard {account} {transaction} {toSelfTransaction} />
  {/each}
{/if}
