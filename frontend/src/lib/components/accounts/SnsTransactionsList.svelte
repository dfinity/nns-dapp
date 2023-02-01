<script lang="ts">
  import { loadAccountNextTransactions } from "$lib/services/sns-transactions.services";
  import { snsTransactionsStore } from "$lib/stores/sns-transactions.store";
  import type { Account } from "$lib/types/account";
  import type { Principal } from "@dfinity/principal";
  import { onMount } from "svelte";
  import {
    getSortedTransactionsFromStore,
    isTransactionsCompleted,
    type SnsTransactionData,
  } from "$lib/utils/sns-transactions.utils";
  import { InfiniteScroll, Spinner } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import IcrcTransactionCard from "./IcrcTransactionCard.svelte";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";

  export let account: Account;
  export let rootCanisterId: Principal;

  let loading = true;

  onMount(async () => {
    loading = true;
    await loadAccountNextTransactions({
      account,
      rootCanisterId,
    });
    loading = false;
  });

  // `loadMore` depends on props account and rootCanisterId
  let loadMore: () => Promise<void>;
  $: loadMore = async () => {
    loading = true;
    await loadAccountNextTransactions({
      account,
      rootCanisterId,
    });
    loading = false;
  };

  let transactions: SnsTransactionData[];
  $: transactions = getSortedTransactionsFromStore({
    store: $snsTransactionsStore,
    rootCanisterId,
    account,
  });

  let completed: boolean;
  $: completed = isTransactionsCompleted({
    store: $snsTransactionsStore,
    rootCanisterId,
    account,
  });

  let governanceCanisterId: Principal | undefined;
  $: governanceCanisterId = $snsProjectsStore?.find(
    ({ rootCanisterId: currentId }) =>
      currentId.toText() === rootCanisterId.toText()
  )?.summary.governanceCanisterId;
</script>

<div data-tid="sns-transactions-list">
  {#if transactions.length === 0 && !loading}
    {$i18n.wallet.no_transactions}
  {:else if transactions.length === 0 && loading}
    <SkeletonCard cardType="info" />
    <SkeletonCard cardType="info" />
  {:else}
    <InfiniteScroll on:nnsIntersect={loadMore} disabled={loading || completed}>
      {#each transactions as { transaction, toSelfTransaction } (`${transaction.id}-${toSelfTransaction ? "0" : "1"}`)}
        <IcrcTransactionCard
          transactionWithId={transaction}
          {toSelfTransaction}
          {account}
          {governanceCanisterId}
        />
      {/each}
    </InfiniteScroll>
    {#if loading}
      <Spinner inline />
    {/if}
  {/if}
</div>
