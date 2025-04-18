<script lang="ts">
  import TransactionIcon from "$lib/components/accounts/TransactionIcon.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import ColumnRow from "$lib/components/ui/ColumnRow.svelte";
  import DateSeconds from "$lib/components/ui/DateSeconds.svelte";
  import Identifier from "$lib/components/ui/Identifier.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type {
    TransactionIconType,
    UiTransaction,
  } from "$lib/types/transaction";
  import { KeyValuePair } from "@dfinity/gix-components";
  import {
    nonNullish,
    type TokenAmount,
    type TokenAmountV2,
  } from "@dfinity/utils";
  import { fade } from "svelte/transition";

  export let transaction: UiTransaction;

  let headline: string;
  let tokenAmount: TokenAmount | TokenAmountV2;
  let isIncoming: boolean;
  let isPending: boolean;
  let isFailed: boolean | undefined;
  let isReimbursement: boolean | undefined;
  let otherParty: string | undefined;
  let timestamp: Date | undefined;
  $: ({
    headline,
    tokenAmount,
    isIncoming,
    isPending,
    isFailed,
    isReimbursement,
    otherParty,
    timestamp,
  } = transaction);

  let iconType: TransactionIconType;
  $: iconType = isReimbursement
    ? "reimbursed"
    : isFailed
      ? "failed"
      : isIncoming
        ? "received"
        : "sent";

  let label: string;
  $: label = isIncoming
    ? $i18n.wallet.direction_from
    : $i18n.wallet.direction_to;

  let seconds: number | undefined;
  $: seconds = timestamp && timestamp.getTime() / 1000;
</script>

<article data-tid="transaction-card" transition:fade|global>
  <div class="icon">
    <TransactionIcon type={iconType} {isPending} />
  </div>

  <div class="transaction">
    <KeyValuePair>
      <h3 slot="key" class="value title" data-tid="headline">{headline}</h3>

      <AmountDisplay
        slot="value"
        amount={tokenAmount}
        sign={isIncoming ? "+" : "-"}
        detailed
        inline
      />
    </KeyValuePair>

    <ColumnRow>
      <div slot="start" class="identifier">
        {#if nonNullish(otherParty)}
          <Identifier size="medium" {label} identifier={otherParty} />
        {/if}
      </div>

      <div slot="end" class="date label" data-tid="transaction-date">
        {#if nonNullish(seconds)}
          <DateSeconds {seconds} />
        {:else if isPending}
          <p class="value pending">
            {$i18n.wallet.pending_transaction_timestamp}
          </p>
        {/if}
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

    .pending {
      // Because DateSeconds also has margin-top: 0.
      margin-top: 0;
    }

    @include media.min-width(small) {
      margin-top: var(--padding);
    }

    :global(p) {
      color: inherit;
    }
  }

  .icon {
    margin: var(--padding-0_5x) 0;
  }
</style>
