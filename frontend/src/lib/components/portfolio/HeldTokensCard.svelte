<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { formatNumber } from "$lib/utils/format.utils";
  import { shouldShowInfoRow } from "$lib/utils/portfolio.utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import { IconAccountsPage, IconRight } from "@dfinity/gix-components";
  import { TokenAmountV2 } from "@dfinity/utils";

  export let topHeldTokens: UserTokenData[];
  export let usdAmount: number;
  export let numberOfTopStakedTokens: number;

  const href = AppPath.Tokens;

  let usdAmountFormatted: string;
  $: usdAmountFormatted = $authSignedInStore
    ? formatNumber(usdAmount)
    : PRICE_NOT_AVAILABLE_PLACEHOLDER;

  let numberOfTopHeldTokens: number;
  $: numberOfTopHeldTokens = topHeldTokens.length;

  let showInfoRow: boolean;
  $: showInfoRow = shouldShowInfoRow({
    currentCardNumberOfTokens: numberOfTopHeldTokens,
    otherCardNumberOfTokens: numberOfTopStakedTokens,
  });
</script>

<Card testId="held-tokens-card">
  <div
    class="wrapper"
    role="region"
    aria-label={$i18n.portfolio.held_tokens_card_title}
  >
    <div class="header">
      <div class="header-wrapper">
        <div class="icon" aria-hidden="true">
          <IconAccountsPage />
        </div>
        <div class="text-content">
          <h5 class="title">{$i18n.portfolio.held_tokens_card_title}</h5>
          <p
            class="amount"
            data-tid="amount"
            aria-label={`${$i18n.portfolio.held_tokens_card_title}: ${usdAmount}`}
          >
            ${usdAmountFormatted}
          </p>
        </div>
      </div>
      <a
        {href}
        class="button secondary"
        aria-label={$i18n.portfolio.held_tokens_card_link}
      >
        <span class="mobile-only">
          <IconRight />
        </span>
        <span class="tablet-up">
          {$i18n.portfolio.held_tokens_card_link}
        </span>
      </a>
    </div>
    <div class="body" role="table">
      <div class="header" role="row">
        <span role="columnheader"
          >{$i18n.portfolio.held_tokens_card_list_first_column}</span
        >

        <span class="mobile-only justify-end" role="columnheader"
          >{$i18n.portfolio.held_tokens_card_list_second_column_mobile}</span
        >
        <span class="tablet-up justify-end" role="columnheader"
          >{$i18n.portfolio.held_tokens_card_list_second_column}</span
        >
        <span class="tablet-up justify-end" role="columnheader"
          >{$i18n.portfolio.held_tokens_card_list_third_column}</span
        >
      </div>

      <div class="list" role="rowgroup">
        {#each topHeldTokens as heldToken (heldToken.domKey)}
          <div class="row" data-tid="held-token-card-row" role="row">
            <div class="info" role="cell">
              <div>
                <Logo
                  src={heldToken.logo}
                  alt={heldToken.title}
                  size="medium"
                  framed
                />
              </div>
              <span data-tid="title">{heldToken.title}</span>
            </div>

            <div
              class="balance-native"
              data-tid="balance-in-native"
              role="cell"
            >
              {heldToken.balance instanceof TokenAmountV2
                ? formatTokenV2({
                    value: heldToken.balance,
                    detailed: true,
                  })
                : PRICE_NOT_AVAILABLE_PLACEHOLDER}
              <span class="symbol">
                {heldToken.balance.token.symbol}
              </span>
            </div>
            <div
              class="balance-usd"
              data-tid="balance-in-usd"
              role="cell"
              aria-label={`${heldToken.title} USD: ${heldToken?.balanceInUsd ?? 0}`}
            >
              ${formatNumber(heldToken?.balanceInUsd ?? 0)}
            </div>
          </div>
        {/each}
        {#if showInfoRow}
          <div class="info-row desktop-only" role="note" data-tid="info-row">
            <div class="content">
              <div class="icon" aria-hidden="true">
                <IconAccountsPage />
              </div>
              <div class="message">
                {$i18n.portfolio.held_tokens_card_info_row}
              </div>
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

      .header {
        display: grid;
        grid-template-columns: 1fr 1fr;

        font-size: 0.875rem;
        color: var(--text-description);
        padding: 0 var(--padding-2x);

        @include media.min-width(medium) {
          grid-template-columns: 1fr 1fr 1fr;
        }
      }

      .list {
        display: flex;
        flex-direction: column;
        background-color: var(--card-background);
        flex-grow: 1;

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-areas:
            "info usd"
            "info balance";
          @include media.min-width(medium) {
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-areas: "info balance usd";
          }

          align-items: center;
          padding: var(--padding-3x) var(--padding-2x);

          border-top: 1px solid var(--elements-divider);

          .info {
            grid-area: info;
            display: flex;
            align-items: center;
            gap: var(--padding);
          }

          .balance-native,
          .balance-usd {
            justify-self: end;
            text-align: right;
          }

          .balance-native {
            grid-area: balance;

            font-size: 0.875rem;
            color: var(--text-description);

            @include media.min-width(medium) {
              font-size: var(--font-size-standard);
              color: var(--text-color);
            }

            .symbol {
              color: var(--text-description);
            }
          }

          .balance-usd {
            grid-area: usd;
          }
        }
      }

      .info-row {
        flex-grow: 1;
        border-top: 1px solid var(--elements-divider);

        .content {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--padding-2x);
          padding: var(--padding-2x) 0;

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
