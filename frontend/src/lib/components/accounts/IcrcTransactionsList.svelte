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
  import { toUiTransaction } from "$lib/utils//transactions.utils";
  import { flip } from "svelte/animate";

  export let account: Account;
  export let transactions: IcrcTransactionData[];
  export let loading: boolean;
  export let governanceCanisterId: Principal | undefined = undefined;
  export let completed = false;
  export let descriptions: Record<string, string> | undefined = undefined;
  export let token: IcrcTokenMetadata | undefined;
  export let mapTransaction: mapIcrcTransactionType;

  let uiTransactions: UiTransaction[] = [];
  $: uiTransactions = transactions
    .map(
      ({
        transaction,
        toSelfTransaction,
      }: {
        transaction: IcrcTransactionWithId;
        toSelfTransaction: boolean;
      }) =>
        mapTransaction({
          transaction,
          account,
          toSelfTransaction,
          governanceCanisterId,
          token,
          transactionNames: $i18n.transaction_names,
          fallbackDescriptions: descriptions,
        })
    )
    .filter(nonNullish);
</script>

<div data-tid="transactions-list" class="container">
  {#if transactions.length === 0 && !loading}
    {$i18n.wallet.no_transactions}
  {:else if transactions.length === 0 && loading}
    <SkeletonCard cardType="info" />
    <SkeletonCard cardType="info" />
  {:else}
    <InfiniteScroll on:nnsIntersect disabled={loading || completed}>
      {#each uiTransactions as transaction (transaction.domKey)}
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
