<script lang="ts">
  import ColumnRow from "$lib/components/ui/ColumnRow.svelte";
  import DateSeconds from "$lib/components/ui/DateSeconds.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Identifier from "$lib/components/ui/Identifier.svelte";
  import type { Token } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { transactionName } from "$lib/utils/transactions.utils";
  import { Html, IconNorthEast, KeyValuePair } from "@dfinity/gix-components";
  import type {
    Transaction,
    AccountTransactionType,
  } from "$lib/types/transaction";
  import { nonNullish } from "@dfinity/utils";
  import { TokenAmount } from "@dfinity/utils";
  import { fade } from "svelte/transition";

  export let transaction: Transaction;
  export let toSelfTransaction = false;
  export let token: Token;
  export let descriptions: Record<string, string> | undefined = undefined;

  let type: AccountTransactionType;
  let isReceive: boolean;
  let isSend: boolean;
  let from: string | undefined;
  let to: string | undefined;
  let displayAmount: bigint;
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

  let description: string | undefined;
  $: description = descriptions?.[type];

  let identifier: string | undefined;
  $: identifier = isReceive ? from : to;

  let seconds: number;
  $: seconds = date.getTime() / 1000;
</script>

<article data-tid="transaction-card" transition:fade|global>
  <div class="icon" class:send={!isReceive}>
    <IconNorthEast size="24px" />
  </div>

  <div class="transaction">
    <KeyValuePair>
      <h3 slot="key" class="value title">{headline}</h3>

      <AmountDisplay
        slot="value"
        amount={TokenAmount.fromE8s({ amount: displayAmount, token })}
        sign={isReceive || toSelfTransaction ? "+" : "-"}
        detailed
        inline
      />
    </KeyValuePair>

    <ColumnRow>
      <div slot="start" class="identifier">
        {#if nonNullish(description)}
          <p data-tid="transaction-description"><Html text={description} /></p>
        {/if}

        {#if nonNullish(identifier)}
          <Identifier size="medium" {label} {identifier} />
        {/if}
      </div>

      <div slot="end" class="date label" data-tid="transaction-date">
        <DateSeconds {seconds} />
      </div>
    </ColumnRow>
  </div>
</article>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/card";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  article {
    padding-bottom: var(--padding-2x);

    @include media.min-width(small) {
      padding-bottom: var(--padding);
    }

    display: grid;
    grid-template-columns: 48px auto;
    align-items: flex-start;
    column-gap: var(--padding-2x);
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

  @include media.dark-theme {
    .icon {
      background: rgba(var(--positive-emphasis-rgb), 0.3);
      color: var(--positive-emphasis);

      &.send {
        background: var(--card-background);
        color: var(--disable-contrast);
      }
    }
  }
</style>
