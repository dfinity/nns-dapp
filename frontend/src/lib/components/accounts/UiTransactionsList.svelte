<script lang="ts">
  // TODO: Rename to TransactionList once we remove the old one.
  import type { UiTransaction } from "$lib/types/transaction";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import NoTransactions from "./NoTransactions.svelte";
  import TransactionCard from "./TransactionCard.svelte";
  import { InfiniteScroll, Spinner } from "@dfinity/gix-components";
  import { flip } from "svelte/animate";

  export let transactions: UiTransaction[];
  export let loading: boolean;
  export let completed = false;
</script>

<div data-tid="transactions-list" class="container">
  {#if transactions.length === 0 && !loading}
    <NoTransactions />
  {:else if transactions.length === 0 && loading}
    <SkeletonCard cardType="info" />
    <SkeletonCard cardType="info" />
  {:else}
    <InfiniteScroll on:nnsIntersect disabled={loading || completed}>
      {#each transactions as transaction (transaction.domKey)}
        <div animate:flip={{ duration: 250 }}>
          <TransactionCard {transaction} />
        </div>
      {/each}
    </InfiniteScroll>
    {#if loading}
      <Spinner inline />
    {/if}
  {/if}
</div>

<style lang="scss">
  div {
    --card-info-spacing: 0 0 var(--padding-2x);
  }
</style>
