<script lang="ts">
  import ColumnRow from "$lib/components/ui/ColumnRow.svelte";
  import DateSeconds from "$lib/components/ui/DateSeconds.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Identifier from "$lib/components/ui/Identifier.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    Html,
    IconUp,
    IconDown,
    KeyValuePair,
  } from "@dfinity/gix-components";
  import type { UiTransaction } from "$lib/types/transaction";
  import { nonNullish, type TokenAmount } from "@dfinity/utils";
  import { fade } from "svelte/transition";

  export let transaction: UiTransaction;

  let headline: string;
  let tokenAmount: TokenAmount;
  let isIncoming: boolean;
  let otherParty: string | undefined;
  let fallbackDescription: string | undefined;
  let timestamp: Date;
  $: ({
    headline,
    tokenAmount,
    isIncoming,
    otherParty,
    fallbackDescription,
    timestamp,
  } = transaction);

  let label: string;
  $: label = isIncoming
    ? $i18n.wallet.direction_from
    : $i18n.wallet.direction_to;

  let seconds: number;
  $: seconds = timestamp.getTime() / 1000;
</script>

<article data-tid="transaction-card" transition:fade|global>
  <div class="icon" class:send={!isIncoming}>
    {#if isIncoming}
      <IconDown size="24px" />
    {:else}
      <IconUp size="24px" />
    {/if}
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

    background: var(--positive-emphasis-light);
    color: var(--positive-emphasis);

    border-radius: var(--border-radius);

    width: var(--padding-6x);
    aspect-ratio: 1 / 1;

    margin: var(--padding-0_5x) 0;

    &.send {
      background: var(--background);
      color: var(--disable-contrast);
    }
  }

  @include media.dark-theme {
    .icon {
      background: rgba(var(--positive-emphasis-rgb), 0.3);
      color: var(--positive-emphasis);

      &.send {
        background: var(--background);
        color: var(--disable-contrast);
      }
    }
  }
</style>
