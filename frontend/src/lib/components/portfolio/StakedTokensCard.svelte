<script lang="ts">
  import MaturityWithTooltip from "$lib/components/neurons/MaturityWithTooltip.svelte";
  import Card from "$lib/components/portfolio/Card.svelte";
  import TokensCardHeader from "$lib/components/portfolio/TokensCardHeader.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import PrivacyAwareAmount from "$lib/components/ui/PrivacyAwareAmount.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { ENABLE_APY_PORTFOLIO } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import type { TableProject } from "$lib/types/staking";
  import { formatNumber, formatPercentage } from "$lib/utils/format.utils";
  import { shouldShowInfoRow } from "$lib/utils/portfolio.utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import { IconNeuronsPage, IconStakedTokens } from "@dfinity/gix-components";
  import { nonNullish, TokenAmountV2 } from "@dfinity/utils";

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

  const numberOfTopStakedTokens = $derived(topStakedTokens.length);
  const showInfoRow = $derived(
    shouldShowInfoRow({
      currentCardNumberOfTokens: numberOfTopStakedTokens,
      otherCardNumberOfTokens: numberOfTopHeldTokens,
    })
  );
  const showApy = $derived($ENABLE_APY_PORTFOLIO && !hasApyCalculationErrored);
</script>

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
      <div class="header" role="row">
        <span role="columnheader"
          >{$i18n.portfolio.staked_tokens_card_list_first_column}</span
        >

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
          <span class="mobile-only justify-end text-right" role="columnheader"
            >{$i18n.portfolio
              .staked_tokens_card_list_second_column_mobile}</span
          >
        {/if}

        {#if showApy}
          <span
            class="tablet-up justify-end align-center gap-small"
            role="columnheader"
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
          <span class="tablet-up justify-end" role="columnheader"
            >{$i18n.portfolio.staked_tokens_card_list_second_column}</span
          >
        {/if}
        <span class="tablet-up justify-end" role="columnheader"
          >{$i18n.portfolio.staked_tokens_card_list_third_column}</span
        >
      </div>

      <div class="list" role="rowgroup">
        {#each topStakedTokens as stakedToken (stakedToken.domKey)}
          {@const apy = stakedToken.apy}
          <svelte:element
            this={$authSignedInStore ? "a" : "div"}
            href={$authSignedInStore ? stakedToken.rowHref : undefined}
            class="row"
            class:link={$authSignedInStore}
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
                {#if nonNullish(apy) && !apy?.error}
                  <span
                    >{formatPercentage(apy.cur, {
                      minFraction: 2,
                      maxFraction: 2,
                    })}</span
                  >
                  <span class="max cell-with-tooltip"
                    >({formatPercentage(apy.max, {
                      minFraction: 2,
                      maxFraction: 2,
                    })})
                    {#if apy.cur === 0 && apy.max === 0}
                      <TooltipIcon
                        iconSize={16}
                        text={$i18n.portfolio.apy_card_tooltip_no_rewards}
                      />
                    {/if}
                  </span>
                {:else if !isApyLoading}
                  <span class="cell-with-tooltip">
                    {PRICE_NOT_AVAILABLE_PLACEHOLDER}
                    <TooltipIcon
                      iconSize={16}
                      text={$i18n.portfolio.apy_card_tooltip_error}
                    />
                  </span>
                {:else}
                  <span class="cell skeleton"></span>
                {/if}
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
          </svelte:element>
        {/each}
        {#if showInfoRow}
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

    .body {
      display: flex;
      flex-direction: column;
      gap: var(--padding);
      flex-grow: 1;

      .header {
        display: grid;
        grid-template-columns: 1fr 1fr;

        font-size: 0.875rem;
        padding: 0 var(--padding-2x);
        align-items: center;

        @include media.min-width(medium) {
          height: 20px;
          grid-template-columns: 1fr 1fr 1fr;
        }

        .apy-label {
          display: flex;
          flex-direction: column;
          align-items: flex-end;

          @include media.min-width(medium) {
            display: none;
          }
        }
      }

      .list {
        display: flex;
        flex-direction: column;
        background-color: var(--card-background);
        flex-grow: 1;

        .link {
          text-decoration: none;
          cursor: pointer;
          &:hover {
            background-color: var(--table-row-background-hover);
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
          padding: var(--padding-3x) var(--padding-2x);

          border-top: 1px solid var(--elements-divider);

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
            display: flex;
            gap: var(--padding-0_5x);
            font-size: 0.875rem;
            color: var(--text-description);

            @include media.min-width(medium) {
              font-size: var(--font-size-standard);
              flex-direction: column;
              gap: 0;
              color: var(--text-primary);
            }

            .max {
              color: var(--text-description);

              @include media.min-width(medium) {
                font-size: 0.875rem;
              }
            }
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

          .cell.skeleton {
            height: 40px;
            width: 60px;
            border-radius: 4px;
          }

          .cell-with-tooltip {
            display: flex;
            align-items: center;
            gap: var(--padding-0_5x);
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
    .mobile-only {
      display: flex;
    }

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

    .align-center {
      align-items: center;
    }

    .gap-small {
      gap: var(--padding-0_5x);
    }

    .text-right {
      text-align: right;
    }
  }
</style>
