<script lang="ts">
  // TODO: Rename to TransactionList once we remove the old one.
  import type { UiTransaction } from "$lib/types/transaction";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import NoTransactions from "$lib/components/accounts/NoTransactions.svelte";
  import TransactionCard from "$lib/components/accounts/TransactionCard.svelte";
  import { InfiniteScroll, Spinner } from "@dfinity/gix-components";
  import { flip } from "svelte/animate";

  export let transactions: UiTransaction[];
  export let loading: boolean;
  export let completed = false;

  $: isEmpty = transactions.length === 0;

  $: showSkeleton = isEmpty && loading;
  $: showNoTransactions = isEmpty && !loading;
  $: disabledInifiteScroll = loading || completed;
</script>

<div data-tid="transactions-list" class="container">
  {#if showSkeleton}
    <SkeletonCard cardType="info" />
    <SkeletonCard cardType="info" />
  {:else if showNoTransactions}
    <NoTransactions />
  {:else}
    <InfiniteScroll on:nnsIntersect disabled={disabledInifiteScroll}>
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
