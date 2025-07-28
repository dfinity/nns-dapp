<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import TokensCardHeader from "$lib/components/portfolio/TokensCardHeader.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import PrivacyAwareAmount from "$lib/components/ui/PrivacyAwareAmount.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { isDesktopViewportStore } from "$lib/derived/viewport.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { formatNumber } from "$lib/utils/format.utils";
  import { shouldShowInfoRow } from "$lib/utils/portfolio.utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import {
    IconAccountsPage,
    IconHeldTokens,
    IconRight,
  } from "@dfinity/gix-components";
  import { TokenAmountV2 } from "@dfinity/utils";

  type Props = {
    topHeldTokens: UserTokenData[];
    usdAmount: number;
    numberOfTopStakedTokens: number;
  };
  const { topHeldTokens, usdAmount, numberOfTopStakedTokens }: Props = $props();

  const href = AppPath.Tokens;

  const icp = $derived(topHeldTokens[0]);
  const restOfTokens = $derived(topHeldTokens.slice(1));
  const numberOfTopHeldTokens = $derived(restOfTokens.length);

  // TODO
  const showInfoRow = $derived(
    shouldShowInfoRow({
      currentCardNumberOfTokens: numberOfTopHeldTokens,
      otherCardNumberOfTokens: numberOfTopStakedTokens,
    })
  );
  const showLinkRow = $derived(numberOfTopHeldTokens > 3);
</script>

{#snippet tableHeader({
  title,
  firstColumnTitle,
}: {
  title: string;
  firstColumnTitle: string;
})}
  <div class="header" role="row">
    <h5 class="title">{title}</h5>
    <div class="columnheaders">
      <span role="columnheader">{firstColumnTitle}</span>
      <span class="justify-end" role="columnheader"
        >{$i18n.portfolio.held_tokens_card_list_second_column}</span
      >
      <span class="tablet-up justify-end" role="columnheader"
        >{$i18n.portfolio.held_tokens_card_list_third_column}</span
      >
    </div>
  </div>
{/snippet}

{#snippet row({ token }: { token: UserTokenData })}
  <a href={token.rowHref} class="row" data-tid="held-token-card-row" role="row">
    <div class="info" role="cell">
      <div>
        <Logo src={token.logo} alt={token.title} size="medium" framed />
      </div>
      <span data-tid="title">{token.title}</span>
    </div>

    <div class="balance-native" data-tid="balance-in-native" role="cell">
      <PrivacyAwareAmount
        value={token.balance instanceof TokenAmountV2
          ? formatTokenV2({
              value: token.balance,
              detailed: false,
            })
          : PRICE_NOT_AVAILABLE_PLACEHOLDER}
        length={3}
      />
      <span class="symbol">
        {token.balance.token.symbol}
      </span>
    </div>
    <div
      class="balance-usd"
      data-tid="balance-in-usd"
      role="cell"
      aria-label={`${token.title} USD: ${token?.balanceInUsd ?? 0}`}
    >
      $<PrivacyAwareAmount
        value={formatNumber(token?.balanceInUsd ?? 0)}
        length={3}
      />
    </div>
  </a>
{/snippet}

{#snippet infoRow()}
  <div class="info-row" role="note" data-tid="info-row">
    <div class="content">
      <div class="icon" aria-hidden="true">
        <IconAccountsPage />
      </div>
      <div class="message">
        {$i18n.portfolio.held_tokens_card_info_row}
      </div>
    </div>
  </div>
{/snippet}

{#snippet linkRow()}
  <div class="link-row" role="note" data-tid="info-row">
    <div class="content">
      <p class="message">
        {$i18n.portfolio.held_tokens_card_link_row_text}
      </p>
      <a
        {href}
        class="link"
        aria-label={$i18n.portfolio.held_tokens_card_link_row_link}
        >{$i18n.portfolio.held_tokens_card_link_row_link}<IconRight /></a
      >
    </div>
  </div>
{/snippet}

<Card testId="held-tokens-card">
  <div
    class="wrapper"
    role="region"
    aria-label={$i18n.portfolio.held_tokens_card_title}
  >
    <TokensCardHeader
      {href}
      {usdAmount}
      title={$i18n.portfolio.held_tokens_card_title}
      linkText={$i18n.portfolio.held_tokens_card_link}
    >
      {#snippet icon()}
        <IconHeldTokens />
      {/snippet}
    </TokensCardHeader>
    <div class="body" role="table">
      {@render tableHeader({
        title: $i18n.portfolio.held_tokens_card_subtitle_icp,
        firstColumnTitle:
          $i18n.portfolio.held_tokens_card_list_first_column_icp,
      })}
      <div class="list icp" role="rowgroup">
        {@render row({ token: icp })}
      </div>

      {#if restOfTokens.length > 0}
        <div class="divider"></div>

        {@render tableHeader({
          title: $i18n.portfolio.held_tokens_card_subtitle_rest,
          firstColumnTitle:
            $i18n.portfolio.held_tokens_card_list_first_column_rest,
        })}
        <div class="list" role="rowgroup">
          {#each restOfTokens as token (token.domKey)}
            {@render row({ token })}
          {/each}

          {#if showInfoRow && $isDesktopViewportStore}
            {@render infoRow()}
          {/if}

          {#if showLinkRow}
            {@render linkRow()}
          {/if}
        </div>
      {:else if $isDesktopViewportStore}
        {@render infoRow()}
      {/if}
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .header {
    font-family: CircularXX;
    display: flex;
    flex-direction: column;
    padding: var(--padding-2x);
    padding-bottom: var(--padding);
    gap: var(--padding);

    .title {
      padding: 0;
      margin: 0;
      font-size: 16px;
      font-weight: var(--font-weight-bold);
      line-height: 20px;
      color: var(--text-description);
    }

    .columnheaders {
      display: grid;
      grid-template-columns: 1fr 1fr;

      font-size: 14px;
      line-height: 16px;

      @include media.min-width(medium) {
        grid-template-columns: 1fr 1fr 1fr;
      }
    }
  }

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
    padding: var(--padding-2x);
    border-top: 1px solid var(--elements-divider);

    text-decoration: none;
    cursor: pointer;
    &:hover {
      background-color: var(--table-row-background-hover);
    }

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

  .divider {
    width: 100%;
    border-bottom: 4px solid var(--elements-divider);
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

  .link-row {
    border-top: 1px solid var(--elements-divider);

    .content {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--padding-2x);
      padding: var(--padding-2x);

      font-family: CircularXX;
      font-size: 12px;
      font-weight: 450;
      line-height: 14px;

      .message {
        display: none;
        margin: 0;
        padding: 0;
        color: var(--text-description);

        @include media.min-width(medium) {
          display: block;
        }
      }

      .link {
        align-self: end;
        justify-self: end;

        display: flex;
        align-items: center;
        justify-content: center;

        color: var(--button-secondary-color);
        font-weight: var(--font-weight-bold);
        text-decoration: none;
        font-size: 14px;
        line-height: 18px;
      }
    }
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--card-background-tint);

    .body {
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      .list {
        display: flex;
        flex-direction: column;
        background-color: var(--card-background);
        flex-grow: 1;

        &.icp {
          flex-grow: 0;
        }
      }
    }

    /* Utilities */
    .tablet-up {
      display: none !important;
    }

    @include media.min-width(medium) {
      .tablet-up {
        display: flex !important;
      }
    }

    .justify-end {
      justify-self: end;
    }
  }
</style>
