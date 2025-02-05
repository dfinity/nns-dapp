<script lang="ts">
  import MaturityWithTooltip from "$lib/components/neurons/MaturityWithTooltip.svelte";
  import Card from "$lib/components/portfolio/Card.svelte";
  import TokensCardHeader from "$lib/components/portfolio/TokensCardHeader.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { TableProject } from "$lib/types/staking";
  import { formatNumber } from "$lib/utils/format.utils";
  import { shouldShowInfoRow } from "$lib/utils/portfolio.utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import { IconNeuronsPage, IconStakedTokens } from "@dfinity/gix-components";
  import { TokenAmountV2 } from "@dfinity/utils";

  export let topStakedTokens: TableProject[];
  export let usdAmount: number;
  export let numberOfTopHeldTokens: number;

  const href = AppPath.Staking;
  let usdAmountFormatted: string;
  $: usdAmountFormatted = $authSignedInStore
    ? formatNumber(usdAmount)
    : PRICE_NOT_AVAILABLE_PLACEHOLDER;

  let numberOfTopStakedTokens: number;
  $: numberOfTopStakedTokens = topStakedTokens.length;

  let showInfoRow: boolean;
  $: showInfoRow = shouldShowInfoRow({
    currentCardNumberOfTokens: numberOfTopStakedTokens,
    otherCardNumberOfTokens: numberOfTopHeldTokens,
  });
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
      {usdAmountFormatted}
      title={$i18n.portfolio.staked_tokens_card_title}
      linkText={$i18n.portfolio.staked_tokens_card_link}
    >
      <svelte:fragment slot="icon">
        <IconNeuronsPage />
      </svelte:fragment>
    </TokensCardHeader>
    <div class="body" role="table">
      <div class="header" role="row">
        <span role="columnheader"
          >{$i18n.portfolio.staked_tokens_card_list_first_column}</span
        >

        <span class="mobile-only justify-end text-right" role="columnheader"
          >{$i18n.portfolio.staked_tokens_card_list_second_column_mobile}</span
        >
        <span class="tablet-up justify-end" role="columnheader"
          >{$i18n.portfolio.staked_tokens_card_list_second_column}</span
        >
        <span class="tablet-up justify-end" role="columnheader"
          >{$i18n.portfolio.staked_tokens_card_list_third_column}</span
        >
      </div>

      <div class="list" role="rowgroup">
        {#each topStakedTokens as stakedToken (stakedToken.domKey)}
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
            <div
              class="stake-usd"
              data-tid="stake-in-usd"
              role="cell"
              aria-label={`${stakedToken.title} USD: ${stakedToken?.stakeInUsd ?? 0}`}
            >
              ${formatNumber(stakedToken?.stakeInUsd ?? 0)}
            </div>
            <div
              class="stake-native"
              data-tid="stake-in-native"
              role="cell"
              aria-label={`${stakedToken.title} D: ${stakedToken?.stakeInUsd ?? 0}`}
            >
              {stakedToken.stake instanceof TokenAmountV2
                ? formatTokenV2({
                    value: stakedToken.stake,
                    detailed: false,
                  })
                : PRICE_NOT_AVAILABLE_PLACEHOLDER}
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

          .maturity,
          .stake-usd,
          .stake-native {
            justify-self: end;
            text-align: right;
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

    .text-right {
      text-align: right;
    }
  }
</style>
