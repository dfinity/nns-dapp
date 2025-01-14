<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Card from "$lib/components/portfolio/Card.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { formatNumber } from "$lib/utils/format.utils";
  import { IconAccountsPage, IconRight } from "@dfinity/gix-components";

  export let topTokens: UserTokenData[];
  export let usdAmount: number;

  const href = AppPath.Tokens;

  let usdAmountFormatted: string;
  $: usdAmountFormatted = $authSignedInStore
    ? formatNumber(usdAmount)
    : PRICE_NOT_AVAILABLE_PLACEHOLDER;

  // TODO: This will also depend on the number of projects
  let showInfoRow: boolean;
  $: showInfoRow = topTokens.length > 0 && topTokens.length < 3;
</script>

<Card testId="tokens-card">
  <div
    class="wrapper"
    role="region"
    aria-label={$i18n.portfolio.tokens_card_title}
  >
    <div class="header">
      <div class="header-wrapper">
        <div class="icon" aria-hidden="true">
          <IconAccountsPage />
        </div>
        <div class="text-content">
          <h5 class="title">{$i18n.portfolio.tokens_card_title}</h5>
          <p
            class="amount"
            data-tid="amount"
            aria-label={`${$i18n.portfolio.tokens_card_title}: ${usdAmount}`}
          >
            ${usdAmountFormatted}
          </p>
        </div>
      </div>
      <a
        {href}
        class="button secondary"
        aria-label={$i18n.portfolio.tokens_card_link}
      >
        <span class="mobile-only">
          <IconRight />
        </span>
        <span class="tablet-up">
          {$i18n.portfolio.tokens_card_link}
        </span>
      </a>
    </div>
    <div class="body" role="table">
      <div class="tokens-header" role="row">
        <span role="columnheader"
          >{$i18n.portfolio.tokens_card_list_first_column}</span
        >

        <span class="mobile-only justify-end" role="columnheader"
          >{$i18n.portfolio.tokens_card_list_second_column_mobile}</span
        >
        <span class="tablet-up justify-end" role="columnheader"
          >{$i18n.portfolio.tokens_card_list_second_column}</span
        >
        <span class="tablet-up justify-end" role="columnheader"
          >{$i18n.portfolio.tokens_card_list_third_column}</span
        >
      </div>

      <div class="tokens-list" role="rowgroup">
        {#each topTokens as token (token.domKey)}
          <div class="token-row" data-tid="token-card-row" role="row">
            <div class="token-info" role="cell">
              <img
                src={token.logo}
                alt={token.title}
                class="token-icon"
                aria-hidden="true"
              />
              <span class="token-name" data-tid="token-title"
                >{token.title}</span
              >
            </div>

            <div class="token-balance" data-tid="balance" role="cell">
              <AmountDisplay singleLine amount={token.balance} />
            </div>
            <div
              class="token-usd-amount"
              data-tid="token-balance"
              role="cell"
              aria-label={`${token.title} USD: ${token?.balanceInUsd ?? 0}`}
            >
              ${formatNumber(token?.balanceInUsd ?? 0)}
            </div>
          </div>
        {/each}
        {#if showInfoRow}
          <div class="info-row desktop-only" role="note" data-tid="info-row">
            <div class="icon" aria-hidden="true">
              <IconAccountsPage />
            </div>
            <div class="message">
              {$i18n.portfolio.tokens_card_info_row}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--card-background-tint);

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--padding-3x) var(--padding-2x);

      .header-wrapper {
        display: flex;
        align-items: flex-start;
        gap: var(--padding-2x);

        .icon {
          width: 50px;
          height: 50px;
        }

        .text-content {
          display: flex;
          flex-direction: column;
          gap: var(--padding-0_5x);

          .title {
            font-size: 0.875rem;
            font-weight: bold;
            color: var(--text-description);
            margin: 0;
            padding: 0;
          }
          .amount {
            font-size: 1.5rem;
          }
        }
      }
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: var(--padding);
      flex-grow: 1;

      .tokens-header {
        display: grid;
        grid-template-columns: 1fr 1fr;
        justify-content: space-between;

        font-size: 0.875rem;
        color: var(--text-description);
        padding: 0 var(--padding-2x);

        @include media.min-width(medium) {
          grid-template-columns: 1fr 1fr 1fr;
        }
      }

      .tokens-list {
        display: flex;
        flex-direction: column;
        background-color: var(--card-background);
        flex-grow: 1;

        .token-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-areas:
            "info balance"
            "info usd";
          @include media.min-width(medium) {
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-areas: "info balance usd";
          }

          align-items: center;
          padding: var(--padding-3x) var(--padding-2x);

          border-bottom: 1px solid var(--neutral-100);
          &:last-child {
            border-bottom: none;
          }

          .token-info {
            grid-area: info;
            display: flex;
            align-items: center;
            gap: var(--padding);

            .token-icon {
              width: 24px;
              height: 24px;
            }
          }

          .token-balance,
          .token-usd-amount {
            justify-self: end;
            text-align: right;
          }

          .token-balance {
            grid-area: balance;
          }

          .token-usd-amount {
            grid-area: usd;
            font-variant-numeric: tabular-nums;
          }
        }
      }

      .info-row {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--padding-2x);
        flex-grow: 1;

        max-width: 90%;
        margin: 0 auto;

        .icon {
          min-width: 50px;
          height: 50px;
        }

        .message {
          font-size: 0.875rem;
          color: var(--text-description);
          max-width: 400px;
        }
      }
    }

    /* Utilities */
    .tablet-up,
    .desktop-only {
      display: none !important;
    }

    @include media.min-width(medium) {
      .mobile-only {
        display: none;
      }
      .tablet-up {
        display: flex !important;
      }
    }

    @include media.min-width(large) {
      .desktop-only {
        display: flex !important;
      }
    }

    .justify-end {
      justify-self: end;
    }
  }
</style>
