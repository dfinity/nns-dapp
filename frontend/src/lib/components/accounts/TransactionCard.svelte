<script lang="ts">
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import DateSeconds from "$lib/components/ui/DateSeconds.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Identifier from "$lib/components/ui/Identifier.svelte";
  import type { TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import {
    AccountTransactionType,
    type Transaction,
    transactionName,
  } from "$lib/utils/transactions.utils";

  export let transaction: Transaction;
  export let toSelfTransaction = false;

  let type: AccountTransactionType;
  let isReceive: boolean;
  let isSend: boolean;
  let from: string | undefined;
  let to: string | undefined;
  let displayAmount: TokenAmount;
  let date: Date;
  $: ({ type, isReceive, isSend, from, to, displayAmount, date } = transaction);

  let headline: string;
  $: headline = transactionName({
    type,
    isReceive: isReceive || toSelfTransaction,
    labels: $i18n.transaction_names,
  });

  let label: string | undefined;
  $: label =
    isReceive || toSelfTransaction
      ? $i18n.wallet.direction_from
      : isSend
      ? $i18n.wallet.direction_to
      : undefined;
  let identifier: string | undefined;
  $: identifier = isReceive ? from : to;
  let seconds: number;
  $: seconds = date.getTime() / 1000;
</script>

<CardInfo testId="transaction-card">
  <div slot="start" class="title">
    <h3>{headline}</h3>
  </div>

  <AmountDisplay
    slot="end"
    amount={displayAmount}
    sign={isReceive || toSelfTransaction ? "+" : "-"}
    detailed
  />

  <DateSeconds {seconds} />

  {#if identifier !== undefined}
    <Identifier size="medium" {label} {identifier} />
  {/if}
</CardInfo>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/card";

  .title {
    @include card.stacked-title;
    @include card.title;
  }
</style>
