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

  const { store } = getContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY
  );

  let account: Account | undefined;
  let storeTransactions: Transaction[] | undefined;
  $: ({ account, transactions: storeTransactions } = $store);

  let transactions: {
    transaction: Transaction;
    toSelfTransaction: boolean;
  }[];
  $: transactions = mapToSelfTransaction(storeTransactions ?? []);
</script>

{#if account === undefined || storeTransactions === undefined}
  <SkeletonCard cardType="info" />
{:else if storeTransactions.length === 0}
  {$i18n.wallet.no_transactions}
{:else}
  {#each transactions as { toSelfTransaction, transaction } (`${transaction.timestamp.timestamp_nanos}${toSelfTransaction}`)}
    <TransactionCard {account} {transaction} {toSelfTransaction} />
  {/each}
{/if}
