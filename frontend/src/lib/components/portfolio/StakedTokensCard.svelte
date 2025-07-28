<script lang="ts">
  import ApyDisplay from "$lib/components/ic/ApyDisplay.svelte";
  import MaturityWithTooltip from "$lib/components/neurons/MaturityWithTooltip.svelte";
  import Card from "$lib/components/portfolio/Card.svelte";
  import TokensCardHeader from "$lib/components/portfolio/TokensCardHeader.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import PrivacyAwareAmount from "$lib/components/ui/PrivacyAwareAmount.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import {
    isDesktopViewportStore,
    isMobileViewportStore,
  } from "$lib/derived/viewport.derived";
  import { ENABLE_APY_PORTFOLIO } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import type { TableProject } from "$lib/types/staking";
  import { formatNumber } from "$lib/utils/format.utils";
  import { shouldShowInfoRow } from "$lib/utils/portfolio.utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import {
    IconNeuronsPage,
    IconRight,
    IconStakedTokens,
  } from "@dfinity/gix-components";
  import { TokenAmountV2 } from "@dfinity/utils";

  type Props = {
    topStakedTokens: TableProject[];
    usdAmount: number;
    numberOfTopHeldTokens: number;
    hasApyCalculationErrored: boolean;
    isApyLoading?: boolean;
  };

  const {
    topStakedTokens,
    usdAmount,
    numberOfTopHeldTokens,
    hasApyCalculationErrored,
    isApyLoading,
  }: Props = $props();

  const href = AppPath.Staking;

  const icp = $derived(topStakedTokens[0]);
  const restOfStakedTokens = $derived(topStakedTokens.slice(1));
  const numberOfTopStakedTokens = $derived(restOfStakedTokens.length);

  // TODO
  const showInfoRow = $derived(
    shouldShowInfoRow({
      currentCardNumberOfTokens: numberOfTopStakedTokens,
      otherCardNumberOfTokens: numberOfTopHeldTokens,
    })
  );
  // TODO: Do we still want to have the maturity as a fallback for the APY?
  const showApy = $derived($ENABLE_APY_PORTFOLIO && !hasApyCalculationErrored);
  const showLinkRow = $derived(numberOfTopStakedTokens > 3);
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

      {#if $isMobileViewportStore}
        {#if showApy}
          <span class="apy-label" role="columnheader"
            ><span>
              {$i18n.portfolio
                .staked_tokens_card_list_second_column_mobile_apy_first}
            </span><span class="description"
              >{$i18n.portfolio
                .staked_tokens_card_list_second_column_mobile_apy_second}
            </span>
          </span>
        {:else}
          <span class="justify-end text-right" role="columnheader"
            >{$i18n.portfolio
              .staked_tokens_card_list_second_column_mobile}</span
          >
        {/if}
      {:else if showApy}
        <span class="apy-label" role="columnheader"
          ><span>
            {$i18n.portfolio.staked_tokens_card_list_second_column_apy_first}
          </span><span class="description">
            {$i18n.portfolio.staked_tokens_card_list_second_column_apy_second}
          </span>
          <TooltipIcon
            tooltipId="apy"
            text={$i18n.portfolio.staked_tokens_card_apy_tooltip}
            iconSize={16}
          />
        </span>
      {:else}
        <span class="justify-end" role="columnheader"
          >{$i18n.portfolio.staked_tokens_card_list_second_column}</span
        >
      {/if}

      <span class="tablet-up justify-end" role="columnheader"
        >{$i18n.portfolio.staked_tokens_card_list_third_column}</span
      >
    </div>
  </div>
{/snippet}

{#snippet row({ stakedToken }: { stakedToken: TableProject })}
  {@const apy = stakedToken.apy}
  <a
    href={stakedToken.rowHref}
    class="row"
    data-tid="staked-tokens-card-row"
    role="row"
  >
    <div class="info" role="cell">
      <div>
        <Logo
          src={stakedToken.logo}
          alt={stakedToken.title}
          size="medium"
          framed
        />
      </div>
      <span data-tid="title">{stakedToken.title}</span>
    </div>

    {#if showApy}
      <div class="apy" data-tid="apy" role="cell">
        <ApyDisplay {apy} isLoading={isApyLoading} forPortfolio />
      </div>
    {:else}
      <div class="maturity" data-tid="maturity" role="cell">
        {#if $authSignedInStore}
          <MaturityWithTooltip
            availableMaturity={stakedToken?.availableMaturity ?? 0n}
            stakedMaturity={stakedToken?.stakedMaturity ?? 0n}
          />
        {:else}
          {PRICE_NOT_AVAILABLE_PLACEHOLDER}
        {/if}
      </div>
    {/if}
    <div
      class="stake-usd"
      data-tid="stake-in-usd"
      role="cell"
      aria-label={`${stakedToken.title} USD: ${stakedToken?.stakeInUsd ?? 0}`}
    >
      $<PrivacyAwareAmount
        value={formatNumber(stakedToken?.stakeInUsd ?? 0)}
        length={3}
      />
    </div>
    <div
      class="stake-native"
      data-tid="stake-in-native"
      role="cell"
      aria-label={`${stakedToken.title} D: ${stakedToken?.stakeInUsd ?? 0}`}
    >
      <PrivacyAwareAmount
        value={stakedToken.stake instanceof TokenAmountV2
          ? formatTokenV2({
              value: stakedToken.stake,
              detailed: false,
            })
          : PRICE_NOT_AVAILABLE_PLACEHOLDER}
        length={3}
      />
      {stakedToken.stake.token.symbol}
    </div>
  </a>
{/snippet}

{#snippet infoRow()}
  <div class="info-row desktop-only" role="note" data-tid="info-row">
    <div class="content">
      <div class="icon" aria-hidden="true">
        <IconStakedTokens />
      </div>
      <div class="message">
        {$i18n.portfolio.staked_tokens_card_info_row}
      </div>
    </div>
  </div>
{/snippet}

{#snippet linkRow()}
  <div class="link-row" role="note" data-tid="link-row">
    <div class="content">
      <p class="message">
        {$i18n.portfolio.staked_tokens_card_link_row_text}
      </p>
      <a
        {href}
        class="link"
        aria-label={$i18n.portfolio.staked_tokens_card_link_row_link}
        >{$i18n.portfolio.staked_tokens_card_link_row_link}<IconRight /></a
      >
    </div>
  </div>
{/snippet}

<Card testId="staked-tokens-card">
  <div
    class="wrapper"
    role="region"
    aria-label={$i18n.portfolio.staked_tokens_card_title}
  >
    <TokensCardHeader
      {href}
      {usdAmount}
      title={$i18n.portfolio.staked_tokens_card_title}
      linkText={$i18n.portfolio.staked_tokens_card_link}
    >
      {#snippet icon()}
        <IconNeuronsPage />
      {/snippet}
    </TokensCardHeader>

    <div class="body" role="table">
      {@render tableHeader({
        title: $i18n.portfolio.staked_tokens_card_subtitle_icp,
        firstColumnTitle:
          $i18n.portfolio.staked_tokens_card_list_first_column_icp,
      })}
      <div class="list icp" role="rowgroup">
        {@render row({ stakedToken: icp })}
      </div>

      {#if restOfStakedTokens.length > 0}
        <div class="divider"></div>

        {@render tableHeader({
          title: $i18n.portfolio.staked_tokens_card_subtitle_rest,
          firstColumnTitle:
            $i18n.portfolio.staked_tokens_card_list_first_column_rest,
        })}
        <div class="list" role="rowgroup">
          {#each restOfStakedTokens as stakedToken (stakedToken.domKey)}
            {@render row({ stakedToken })}
          {/each}

          {#if showInfoRow && $isDesktopViewportStore}
            {@render infoRow()}
          {/if}

          {#if showLinkRow}
            {@render linkRow()}
          {/if}
        </div>
      {:else if $isDesktopViewportStore}
        <div class="list" role="rowgroup">
          {@render infoRow()}
        </div>
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

      .apy-label {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        @include media.min-width(medium) {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          justify-self: end;
          gap: var(--padding-0_5x);
        }
      }
    }
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "info usd"
      "info maturity";

    @include media.min-width(medium) {
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-areas:
        "info maturity usd"
        "info maturity native";
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

    .apy,
    .maturity,
    .stake-usd,
    .stake-native {
      justify-self: end;
      text-align: right;
    }

    .apy {
      grid-area: maturity;
    }

    .maturity {
      grid-area: maturity;
      font-size: 0.875rem;
      color: var(--text-description);

      @include media.min-width(medium) {
        font-size: var(--font-size-standard);
        color: var(--text-primary);
      }
    }

    .stake-usd {
      grid-area: usd;
      font-size: var(--font-size-standard);
    }

    .stake-native {
      display: none;
      grid-area: native;
      font-size: 0.875rem;
      color: var(--text-description);

      @include media.min-width(medium) {
        display: block;
      }
    }
  }

  .divider {
    width: 100%;
    border-bottom: 4px solid var(--elements-divider);
  }

  .info-row,
  .link-row {
    border-top: 1px solid var(--elements-divider);

    .content {
      display: flex;
      align-items: center;
      gap: var(--padding-2x);
      padding: var(--padding-2x);

      font-family: CircularXX;
      font-size: 12px;
      line-height: 14px;

      .message {
        margin: 0;
        padding: 0;
        color: var(--text-description);
      }
    }
  }

  .info-row {
    flex-grow: 1;

    .content {
      justify-content: center;
      max-width: 90%;
      margin: 0 auto;

      .icon {
        min-width: 50px;
        height: 50px;
      }

      .message {
        font-size: 14px;
        max-width: 400px;
      }
    }
  }

  .link-row {
    .content {
      justify-content: flex-end;
      font-weight: var(--font-weight-bold);

      .message {
        display: none;

        @include media.min-width(medium) {
          display: block;
        }
      }

      .link {
        display: flex;
        align-items: center;

        color: var(--button-secondary-color);
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
    .tablet-up,
    .desktop-only {
      display: none !important;
    }

    @include media.min-width(medium) {
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

    .text-right {
      text-align: right;
    }
  }
</style>
