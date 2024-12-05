<script lang="ts">
  import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber } from "$lib/utils/format.utils";
  import { nonNullish } from "@dfinity/utils";

  export let usdAmount: number | undefined;

  const absentValue = "-/-";

  let usdAmountFormatted: string;
  $: usdAmountFormatted = nonNullish(usdAmount)
    ? formatNumber(usdAmount)
    : absentValue;

  let icpPrice: number | undefined;
  $: icpPrice = $icpSwapUsdPricesStore?.[LEDGER_CANISTER_ID.toText()];

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

<div class="wrapper" data-tid="usd-value-banner-component">
  <div class="table-banner-icon">
    <slot name="icon" />
  </div>
  <div class="text-content">
    <div class="totals">
      <h1 class="primary-amount" data-tid="primary-amount">
        ${usdAmountFormatted}
      </h1>
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
        <div class="mobile-only">
          1 {$i18n.core.icp} = ${icpPriceFormatted}
        </div>
        {$i18n.accounts.token_price_source}
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

    background-color: var(--card-background-tint);
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
        .primary-amount {
          margin: 0;
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
