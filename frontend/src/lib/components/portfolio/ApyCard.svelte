<script lang="ts">
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { isBalancePrivacyOptionStore } from "$lib/derived/balance-privacy-active.derived";
  import { isMobileViewportStore } from "$lib/derived/viewport.derived";
  import { i18n } from "$lib/stores/i18n";
  import {
    formatCurrencyNumber,
    formatPercentage,
    renderPrivacyModeBalance,
  } from "$lib/utils/format.utils";
  import { IconRight } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    rewardBalanceUSD: number;
    rewardEstimateWeekUSD: number;
    stakingPower: number;
    stakingPowerUSD: number;
    totalAmountUSD: number;
  };
  const {
    rewardBalanceUSD,
    rewardEstimateWeekUSD,
    stakingPower,
    stakingPowerUSD,
    totalAmountUSD,
  }: Props = $props();

  const href = AppPath.Staking;
  const dataTid = "apy-card-component";

  const rewardBalanceUSDFormatted = $derived(
    $isBalancePrivacyOptionStore
      ? renderPrivacyModeBalance(5)
      : nonNullish(rewardBalanceUSD)
        ? formatCurrencyNumber(rewardBalanceUSD)
        : $i18n.core.not_applicable
  );

  const rewardEstimateWeekUSDFormatted = $derived(
    $isBalancePrivacyOptionStore
      ? renderPrivacyModeBalance(3)
      : nonNullish(rewardEstimateWeekUSD)
        ? formatCurrencyNumber(rewardEstimateWeekUSD)
        : $i18n.core.not_applicable
  );
  const stakingPowerPercentage = $derived(
    formatPercentage(stakingPower, {
      minFraction: 2,
      maxFraction: 2,
    })
  );
  const stakingPowerUSDFormatted = $derived(
    $isBalancePrivacyOptionStore
      ? renderPrivacyModeBalance(3)
      : nonNullish(stakingPowerUSD)
        ? formatCurrencyNumber(stakingPowerUSD)
        : $i18n.core.not_applicable
  );
  const totalValueUsdFormatted = $derived(
    $isBalancePrivacyOptionStore
      ? renderPrivacyModeBalance(3)
      : nonNullish(totalAmountUSD)
        ? formatCurrencyNumber(totalAmountUSD)
        : $i18n.core.not_applicable
  );

  const linkText = $derived(
    stakingPowerUSD > 0
      ? $i18n.portfolio.apy_card_link_view
      : $i18n.portfolio.apy_card_link_start
  );
</script>

{#snippet content()}
  <div class="content">
    <div class="content">
      <span class="subtitle"
        >{$i18n.portfolio.apy_card_reward_title}
        <TooltipIcon iconSize={16} text={$i18n.portfolio.apy_card_tooltip} />
      </span>
      <span class="main-value" data-tid="reward"
        >~${rewardBalanceUSDFormatted}</span
      >
      <span class="secondary-value"
        ><span class="projection" data-tid="projection">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="9"
            height="8"
            viewBox="0 0 9 8"
            fill="none"
          >
            <path
              d="M4.5 0.5L8.39711 7.25H0.602886L4.5 0.5Z"
              fill="currentColor"
            />
          </svg>~${rewardEstimateWeekUSDFormatted}</span
        >{$i18n.portfolio.apy_card_estimation}</span
      >
    </div>

    <div class="content">
      <span class="subtitle">{$i18n.portfolio.apy_card_power_title}</span>
      <span class="main-value" data-tid="staking-power"
        >{stakingPowerPercentage}</span
      >
      <span class="secondary-value" data-tid="total-staking-power"
        >${stakingPowerUSDFormatted}
        <span>(of ${totalValueUsdFormatted})</span></span
      >
    </div>
  </div>
{/snippet}

{#if $isMobileViewportStore}
  <article class="card mobile" data-tid={dataTid}>
    <a {href} class="link" aria-label={linkText} data-tid="project-link">
      {@render content()}
    </a>
  </article>
{:else}
  <article class="card desktop" data-tid={dataTid}>
    <h5 class="title">{$i18n.portfolio.apy_card_title}</h5>
    {@render content()}

    <a {href} class="link" aria-label={linkText} data-tid="project-link">
      <span>{linkText}</span>
      <IconRight />
    </a>
  </article>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .content {
    display: flex;
    justify-content: space-between;

    .content {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 4px;

      .subtitle {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-description);
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .main-value {
        font-size: 24px;
        font-weight: 450;
        line-height: 32px;

        @include media.min-width(medium) {
          font-size: 27px;
        }
      }

      .secondary-value {
        font-size: 12px;
        font-weight: 450;
        line-height: 16px;

        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 2px;

        @include media.min-width(medium) {
          font-size: 16px;
          font-weight: 400;
          line-height: 20px;
        }
      }
    }

    .projection {
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      color: #29a079;
      padding-right: 4px;
    }
  }

  .card {
    height: 100%;
    box-sizing: border-box;
    background-color: var(--background);

    box-shadow: var(--box-shadow);

    transition:
      color var(--animation-time-normal),
      box-shadow var(--animation-time-normal);
    border-radius: 12px;
    overflow: hidden;
  }

  .card.mobile {
    padding: 20px 16px;

    .link {
      text-decoration: none;
    }
  }

  .card.desktop {
    display: grid;
    grid-template-rows: auto auto 1fr;
    padding: 24px;
    grid-gap: 16px;

    .title {
      font-size: 18px;
      font-style: normal;
      font-weight: 450;
      line-height: 24px;
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
    }
  }
</style>
