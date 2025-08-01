<script lang="ts">
  import IcpExchangeRate from "$lib/components/ui/IcpExchangeRate.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import UsdValueHeadless from "$lib/components/ui/UsdValueHeadless.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { i18n } from "$lib/stores/i18n";
  import { nonNullish } from "@dfinity/utils";
  import type { Snippet } from "svelte";

  type Props = {
    usdAmount: number | undefined;
    hasUnpricedTokens: boolean;
    // optional prop icon snippet
    icon?: Snippet;
  };

  const { usdAmount, hasUnpricedTokens, icon }: Props = $props();

  const absentValue = PRICE_NOT_AVAILABLE_PLACEHOLDER;
</script>

<UsdValueHeadless {usdAmount} {hasUnpricedTokens}>
  {#snippet children({
    usdAmountFormatted,
    icpPrice,
    icpAmountFormatted,
    hasPricesAndUnpricedTokens,
    hasError,
  })}
    <div class="wrapper" data-tid="usd-value-banner-component">
      {#if nonNullish(icon)}
        <div class="table-banner-icon">
          {@render icon()}
        </div>
      {/if}
      <div class="text-content">
        <div class="totals">
          <div class="primary-amount-row">
            <span class="primary-amount" data-tid="primary-amount">
              ${usdAmountFormatted}
            </span>
            {#if hasPricesAndUnpricedTokens}
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
        <IcpExchangeRate {icpPrice} {hasError} {absentValue} />
      </div>
    </div>
  {/snippet}
</UsdValueHeadless>

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
    }
  }
</style>
