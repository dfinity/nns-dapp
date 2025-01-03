<script lang="ts">
  import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber } from "$lib/utils/format.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";

  export let usdAmount: number | undefined;
  export let hasUnpricedTokens: boolean;

  const absentValue = "-/-";

  let hasError: boolean;
  $: hasError = $icpSwapUsdPricesStore === "error";

  let hasPrices: boolean;
  $: hasPrices = !hasError && nonNullish($icpSwapUsdPricesStore);

  let usdAmountFormatted: string;
  $: usdAmountFormatted =
    nonNullish(usdAmount) && hasPrices ? formatNumber(usdAmount) : absentValue;

  let icpPrice: number | undefined;
  $: icpPrice =
    isNullish($icpSwapUsdPricesStore) || $icpSwapUsdPricesStore === "error"
      ? undefined
      : $icpSwapUsdPricesStore[LEDGER_CANISTER_ID.toText()];

  let icpPriceFormatted: string;
  $: icpPriceFormatted = nonNullish(icpPrice)
    ? formatNumber(icpPrice)
    : absentValue;

  let icpAmount: number | undefined;
  $: icpAmount = icpPrice && usdAmount && usdAmount / icpPrice;

  let icpAmountFormatted: string;
  $: icpAmountFormatted = nonNullish(icpAmount)
    ? formatNumber(icpAmount)
    : absentValue;
</script>

<div
  class="wrapper"
  data-tid="usd-value-banner-component"
  class:has-error={hasError}
>
  <div class="table-banner-icon">
    <slot name="icon" />
  </div>
  <div class="text-content">
    <div class="totals">
      <div class="primary-amount-row">
        <span class="primary-amount" data-tid="primary-amount">
          ${usdAmountFormatted}
        </span>
        {#if hasPrices && hasUnpricedTokens}
          <TooltipIcon>
            {$i18n.accounts.unpriced_tokens_warning}
          </TooltipIcon>
        {/if}
      </div>
      <div class="secondary-amount" data-tid="secondary-amount">
        {icpAmountFormatted}
        {$i18n.core.icp}
      </div>
    </div>
    <div class="exchange-rate">
      <img
        src={IC_LOGO_ROUNDED}
        alt={$i18n.auth.ic_logo}
        class="icp-icon desktop-only"
      />
      <span class="desktop-only">
        1 {$i18n.core.icp} = $<span data-tid="icp-price"
          >{icpPriceFormatted}</span
        >
      </span>
      <TooltipIcon>
        {#if hasError}
          {$i18n.accounts.token_price_error}
        {:else}
          <div class="mobile-only">
            1 {$i18n.core.icp} = ${icpPriceFormatted}
          </div><div>
            {$i18n.accounts.token_price_source}
          </div>
        {/if}
      </TooltipIcon>
    </div>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--padding-2x);

    background-color: var(--banner-background);
    padding: var(--padding-2x);
    border-radius: var(--padding);
    border: 1.5px solid var(--card-border);

    .table-banner-icon {
      display: flex;
      width: 72px;
    }

    .text-content {
      flex-grow: 1;
      display: flex;
      flex-direction: row;
      align-items: center;

      justify-content: space-between;

      .totals {
        .primary-amount-row {
          display: flex;
          align-items: center;
          gap: var(--padding-0_5x);

          .primary-amount {
            font-size: var(--font-size-h1);
            font-weight: var(--font-weight-bold);
          }
        }
        display: flex;
        flex-direction: column;
      }

      .exchange-rate {
        display: flex;
        align-items: center;
        gap: var(--padding-0_5x);

        .icp-icon {
          width: 20px;
          height: 20px;
        }
      }
    }

    &.has-error {
      --tooltip-icon-color: var(--tag-failed-text);
    }
  }

  .desktop-only {
    display: none;
  }

  @include media.min-width(medium) {
    .desktop-only {
      display: initial;
    }
    .mobile-only {
      display: none;
    }
  }
</style>
