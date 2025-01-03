<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import IcpExchangeRate from "$lib/components/portfolio/IcpExchangeRate.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber } from "$lib/utils/format.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";

  export let usdAmount: number | undefined;
  export let hasUnpricedTokens: boolean = false;

  let hasError: boolean;
  $: hasError = $icpSwapUsdPricesStore === "error";

  let hasPrices: boolean;
  $: hasPrices = !hasError && nonNullish($icpSwapUsdPricesStore);

  let usdAmountFormatted: string;
  $: usdAmountFormatted =
    nonNullish(usdAmount) && hasPrices
      ? formatNumber(usdAmount)
      : PRICE_NOT_AVAILABLE_PLACEHOLDER;

  let icpPrice: number | undefined;
  $: icpPrice =
    isNullish($icpSwapUsdPricesStore) || $icpSwapUsdPricesStore === "error"
      ? undefined
      : $icpSwapUsdPricesStore[LEDGER_CANISTER_ID.toText()];

  let icpAmount: number | undefined;
  $: icpAmount = icpPrice && usdAmount && usdAmount / icpPrice;

  let icpAmountFormatted: string;
  $: icpAmountFormatted = nonNullish(icpAmount)
    ? formatNumber(icpAmount)
    : PRICE_NOT_AVAILABLE_PLACEHOLDER;
</script>

<Card testId="total-assets-card">
  <div class="wrapper">
    <h3>{$i18n.portfolio.total_assets_title}</h3>

    <div class="pricing">
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
      <IcpExchangeRate {hasError} />
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    box-sizing: border-box;

    height: 100%;
    padding: var(--padding-2x);
    background-color: var(--card-background-tint);

    @include media.min-width(medium) {
      gap: var(--padding-2x);
      padding: var(--padding-3x);
    }

    h3 {
      margin: 0;
    }

    .pricing {
      display: flex;
      justify-content: space-between;
      align-content: center;

      .totals {
        display: flex;
        flex-direction: column;

        .primary-amount {
          font-size: 1.875rem; // 32px

          @include media.min-width(medium) {
            font-size: 2.5rem; // 40px
          }
        }
        .secondary-amount {
          color: var(--text-description);
        }
      }
    }
  }
</style>
