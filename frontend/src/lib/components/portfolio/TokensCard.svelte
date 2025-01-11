<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Card from "$lib/components/portfolio/Card.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import type { UserToken } from "$lib/types/tokens-page";
  import { formatNumber } from "$lib/utils/format.utils";
  import { mergeComparators } from "$lib/utils/sort.utils";
  import {
    compareTokensIcpFirst,
    compareTokensWithBalance,
  } from "$lib/utils/tokens-table.utils";
  import { isUserTokenData } from "$lib/utils/user-token.utils";
  import { IconAccountsPage, IconRight } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  export let userTokens: UserToken[];
  export let usdAmount: number;

  const href = AppPath.Tokens;

  let usdAmountFormatted: string;
  $: usdAmountFormatted =
    nonNullish(usdAmount) && $authSignedInStore
      ? formatNumber(usdAmount)
      : PRICE_NOT_AVAILABLE_PLACEHOLDER;

  const TOP_TOKENS_TO_SHOW = 4;
  $: topTokens = userTokens
    .filter(isUserTokenData)
    .sort(mergeComparators([compareTokensIcpFirst, compareTokensWithBalance]))
    .slice(0, TOP_TOKENS_TO_SHOW)
    .map((token) => ({
      title: token.title,
      logo: token.logo,
      balance: token.balance,
      balanceInUsd: token.balanceInUsd ?? 0,
    }));
</script>

<Card>
  <div class="wrapper">
    <div class="header">
      <div class="header-wrapper">
        <div class="icon">
          <IconAccountsPage />
        </div>
        <div class="text-content">
          <h5>Total Token Balance</h5>
          <span class="amount" data-tid="amount">
            ${usdAmountFormatted}
          </span>
        </div>
      </div>
      <a class="button secondary mobile-only" {href}>
        <IconRight />
      </a>
      <a class="button secondary desktop-only" {href}>View tokens</a>
    </div>
    <div class="body">
      <div class="tokens-header">
        <span>Top Tokens Held</span>
        <span class="mobile-only justify-end">Balance</span>
        <span class="desktop-only justify-end">Value Native</span>
        <span class="desktop-only justify-end">Value $</span>
      </div>

      <div class="tokens-list">
        {#each topTokens as token}
          <div class="token-row">
            <div class="token-info">
              <img src={token.logo} alt={token.title} class="token-icon" />
              <span class="token-name">{token.title}</span>
            </div>

            <div class="mobile-only token-balance justify-end text-right">
              <div class="token-usd">
                ${formatNumber(token.balanceInUsd)}
              </div>
              <AmountDisplay singleLine amount={token.balance} />
            </div>

            <div class="desktop-only justify-end text-right">
              <AmountDisplay singleLine amount={token.balance} />
            </div>
            <div class="token-usd desktop-only justify-end">
              ${formatNumber(token.balanceInUsd)}
            </div>
          </div>
        {/each}
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

          h5 {
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
        gap: var(--padding-1_5x);
        background-color: var(--card-background);
        flex-grow: 1;

        .token-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          justify-content: space-between;
          align-items: center;
          padding: var(--padding-2x);
          flex-grow: 1;

          border-bottom: 1px solid var(--neutral-100);
          &:last-child {
            border-bottom: none;
          }

          @include media.min-width(medium) {
            grid-template-columns: 1fr 1fr 1fr;
          }

          .token-info {
            display: flex;
            align-items: center;
            gap: var(--padding);

            .token-icon {
              width: 24px;
              height: 24px;
              border-radius: 50%;
            }

            .token-name {
              font-weight: 500;
            }

            .token-value,
            .token-usd {
              /* font-variant-numeric: tabular-nums; */
            }

            .token-value {
            }

            .token-usd {
            }
          }
        }
      }
    }

    /* Utilities */
    .desktop-only {
      display: none;
    }

    @include media.min-width(medium) {
      .desktop-only {
        display: flex;
      }
      .mobile-only {
        display: none;
      }
    }
    .text-right {
      text-align: right;
    }
    .justify-end {
      justify-self: end;
    }
  }
</style>
