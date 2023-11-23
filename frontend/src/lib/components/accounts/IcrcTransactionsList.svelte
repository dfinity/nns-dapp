<script lang="ts">
  import type { Account } from "$lib/types/account";
  import type { Principal } from "@dfinity/principal";
  import { InfiniteScroll, Spinner } from "@dfinity/gix-components";
  import type { IcrcTransactionWithId } from "@dfinity/ledger-icrc";
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import IcrcTransactionCard from "./IcrcTransactionCard.svelte";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import type {
    IcrcTransactionData,
    UiTransaction,
  } from "$lib/types/transaction";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import type { mapIcrcTransactionType } from "$lib/utils/icrc-transactions.utils";
  import { flip } from "svelte/animate";

  export let transactions: UiTransaction[];
  export let loading: boolean;
  export let completed = false;
</script>

<div data-tid="transactions-list" class="container">
  {#if transactions.length === 0 && !loading}
    {$i18n.wallet.no_transactions}
  {:else if transactions.length === 0 && loading}
    <SkeletonCard cardType="info" />
    <SkeletonCard cardType="info" />
  {:else}
    <InfiniteScroll on:nnsIntersect disabled={loading || completed}>
      {#each transactions as transaction (transaction.domKey)}
        <div animate:flip={{ duration: 250 }}>
          <IcrcTransactionCard {transaction} />
        </div>
      {/each}
    </InfiniteScroll>
    {#if loading}
      <Spinner inline />
    {/if}
  {/if}
</div>
