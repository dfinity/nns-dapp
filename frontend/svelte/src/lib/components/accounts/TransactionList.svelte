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

  const { store } = getContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY
  );

  let account: Account | undefined;
  let transactions: Transaction[] | undefined;
  $: ({ account, transactions } = $store);
</script>

{#if account === undefined || transactions === undefined}
  <SkeletonCard cardType="static" />
{:else if transactions.length === 0}
  {$i18n.wallet.no_transactions}
{:else}
  {#each transactions as transaction (transaction.timestamp.timestamp_nanos)}
    <TransactionCard {account} {transaction} />
  {/each}
{/if}
