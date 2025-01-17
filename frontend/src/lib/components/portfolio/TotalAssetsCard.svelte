<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import IcpExchangeRate from "$lib/components/ui/IcpExchangeRate.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import UsdValueHeadless from "$lib/components/ui/UsdValueHeadless.svelte";
  import { i18n } from "$lib/stores/i18n";

  export let usdAmount: number | undefined;
  export let hasUnpricedTokens: boolean = false;
</script>

<UsdValueHeadless
  {usdAmount}
  {hasUnpricedTokens}
  let:icpPrice
  let:usdAmountFormatted
  let:icpAmountFormatted
  let:hasError
  let:hasPricesAndUnpricedTokens
>
  <Card testId="total-assets-card-component">
    <div class="wrapper">
      <h3>{$i18n.portfolio.total_assets_title}</h3>
      <div class="pricing">
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
        <IcpExchangeRate {hasError} {icpPrice} />
      </div>
    </div>
  </Card>
</UsdValueHeadless>

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
      gap: var(--padding-1_5x);
      padding: var(--padding-3x);
    }

    h3 {
      margin: 0;
      padding: 0;
    }

    .pricing {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      .totals {
        display: flex;
        flex-direction: column;
        gap: var(--padding);

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
