<script lang="ts">
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
    rewardBalance: number;
    stakingPower: number;
  };

  const { rewardBalance = 3260.21, stakingPower = 0.7845 }: Props = $props();

  const href = AppPath.Staking;

  const rewardBalanceFormatted = $derived(
    $isBalancePrivacyOptionStore
      ? renderPrivacyModeBalance(5)
      : nonNullish(rewardBalance)
        ? formatCurrencyNumber(rewardBalance)
        : "N/A"
  );
  const stakingPowerFormatted = $derived(
    formatPercentage(stakingPower, {
      minFraction: 2,
      maxFraction: 2,
    })
  );
</script>

{#snippet content()}
  <div class="content">
    <div class="left">
      <span class="subtitle">{$i18n.portfolio.apy_card_reward_title}</span>
      <span class="main-value">~${rewardBalanceFormatted}</span>
      <span class="secondary-value"
        ><span>
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
          </svg>$85.03</span
        >{$i18n.portfolio.apy_card_estimation}</span
      >
    </div>

    <div class="right">
      <span class="subtitle">{$i18n.portfolio.apy_card_power_title}</span>
      <span class="main-value">~{stakingPowerFormatted}</span>
      <span class="secondary-value">~$16606</span>
    </div>
  </div>
{/snippet}

{#if $isMobileViewportStore}
  <a class="card mobile" {href}>
    {@render content()}
  </a>
{:else}
  <article class="card desktop">
    <h5 class="title">{$i18n.portfolio.apy_card_title}</h5>
    {@render content()}

    <a
      {href}
      class="link"
      aria-label={$i18n.portfolio.apy_card_link}
      data-tid="project-link"
    >
      <span>{$i18n.portfolio.apy_card_link}</span>
      <IconRight />
    </a>
  </article>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .content {
    display: flex;
    justify-content: space-between;

    .left,
    .right {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 4px;

      .subtitle {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-description);
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

        @include media.min-width(medium) {
          font-size: 16px;
          font-weight: 400;
          line-height: 20px;
        }

        display: flex;

        span {
          display: flex;
          align-items: center;

          color: #29a079;
          padding-right: 4px;
        }
      }
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
    text-decoration: none;
  }

  .card.desktop {
    height: 270px;

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
