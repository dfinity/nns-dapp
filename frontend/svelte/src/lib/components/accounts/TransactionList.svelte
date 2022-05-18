<script lang="ts">
  import type { Transaction } from "../../canisters/nns-dapp/nns-dapp.types";
  import type { Account } from "../../types/account";
  import { i18n } from "../../stores/i18n";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import TransactionCard from "./TransactionCard.svelte";

  export let account: Account | undefined;
  export let transactions: Transaction[] | undefined;
</script>

{#if account === undefined || transactions === undefined}
  <SkeletonCard />
{:else if transactions.length === 0}
  {$i18n.wallet.no_transactions}
{:else}
  {#each transactions as transaction (transaction.timestamp.timestamp_nanos)}
    <TransactionCard {account} {transaction} />
  {/each}
{/if}
