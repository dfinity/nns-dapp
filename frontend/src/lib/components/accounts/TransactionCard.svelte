<script lang="ts">
  import ColumnRow from "$lib/components/ui/ColumnRow.svelte";
  import DateSeconds from "$lib/components/ui/DateSeconds.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Identifier from "$lib/components/ui/Identifier.svelte";
  import type { Token, TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import {
    AccountTransactionType,
    type Transaction,
    transactionName,
  } from "$lib/utils/transactions.utils";
  import { KeyValuePair, IconNorthEast } from "@dfinity/gix-components";

  export let transaction: Transaction;
  export let toSelfTransaction = false;
  export let token: Token;

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
    tokenSymbol: token.symbol,
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

<article data-tid="transaction-card">
  <div class="icon" class:send={!isReceive}>
    <IconNorthEast size="24px" />
  </div>

  <div class="transaction">
    <KeyValuePair>
      <h3 slot="key" class="value title">{headline}</h3>

      <AmountDisplay
        slot="value"
        amount={displayAmount}
        sign={isReceive || toSelfTransaction ? "+" : "-"}
        detailed
        inline
      />
    </KeyValuePair>

    <ColumnRow>
      <div slot="start" class="identifier">
        {#if identifier !== undefined}
          <Identifier size="medium" {label} {identifier} />
        {/if}
      </div>

      <div slot="end" class="date label" data-tid="transaction-date"><DateSeconds {seconds} /></div>
    </ColumnRow>
  </div>
</article>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/card";
  @use "@dfinity/gix-components/styles/mixins/media";

  article {
    padding-bottom: var(--padding-2x);

    @include media.min-width(small) {
      padding-bottom: var(--padding);
    }

    display: grid;
    grid-template-columns: repeat(2, auto);
    align-items: flex-start;
    column-gap: var(--padding-2x);

    &:first-of-type {
      margin-top: var(--padding-6x);
    }
  }

  .title {
    @include card.title;
    word-break: break-word;
    --text-white-space: wrap;
  }

  .identifier {
    @include media.min-width(small) {
      max-width: 60%;
    }
  }

  .date {
    min-width: fit-content;
    text-align: right;

    @include media.min-width(small) {
      margin-top: var(--padding);
    }

    :global(p) {
      color: inherit;
    }
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;

    transform: rotate(90deg);

    background: var(--positive-emphasis-light);
    color: var(--positive-emphasis);

    border-radius: var(--border-radius);

    width: var(--padding-6x);
    aspect-ratio: 1 / 1;

    margin: var(--padding-0_5x) 0;

    &.send {
      transform: rotate(270deg);
      background: var(--background);
      color: var(--disable-contrast);
    }
  }
</style>
