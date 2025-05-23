<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import IcpExchangeRate from "$lib/components/ui/IcpExchangeRate.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import UsdValueHeadless from "$lib/components/ui/UsdValueHeadless.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { i18n } from "$lib/stores/i18n";
  import { Spinner } from "@dfinity/gix-components";

  type Props = {
    usdAmount: number | undefined;
    hasUnpricedTokens: boolean;
    isLoading: boolean;
    isFullWidth: boolean;
  };

  const {
    usdAmount,
    hasUnpricedTokens = false,
    isLoading = false,
    isFullWidth = true,
  }: Props = $props();
</script>

<UsdValueHeadless {usdAmount} {hasUnpricedTokens}>
  {#snippet children({
    usdAmountFormatted,
    icpPrice,
    icpAmountFormatted,
    hasPricesAndUnpricedTokens,
    hasError,
  })}
    <Card testId="total-assets-card-component">
      <div
        class="wrapper"
        class:full-width={isFullWidth}
        data-tid="total-assets-card-component-wrapper"
      >
        <h3>{$i18n.portfolio.total_assets_title}</h3>
        <div class="pricing">
          <div class="totals">
            <div class="primary-amount-row">
              {#if !isLoading}
                <span class="primary-amount" data-tid="primary-amount">
                  ${usdAmountFormatted}
                </span>
                {#if hasPricesAndUnpricedTokens}
                  <TooltipIcon>
                    {$i18n.accounts.unpriced_tokens_warning}
                  </TooltipIcon>
                {/if}
              {:else}
                <div>
                  <Spinner inline size="small" />
                </div>
              {/if}
            </div>
            <div class="secondary-amount" data-tid="secondary-amount">
              {#if !isLoading}
                {icpAmountFormatted}
              {:else}
                {PRICE_NOT_AVAILABLE_PLACEHOLDER}
              {/if}
              {$i18n.core.icp}
            </div>
          </div>
          <IcpExchangeRate {hasError} {icpPrice} />
        </div>
      </div>
    </Card>
  {/snippet}
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
      height: 100%;

      @include media.min-width(large) {
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--padding);
      }

      .totals {
        display: flex;
        flex-direction: column;
        gap: var(--padding);

        .primary-amount-row {
          display: flex;
          gap: var(--padding);

          min-height: 45px;

          .primary-amount {
            font-size: 1.875rem; // 32px

            @include media.min-width(medium) {
              font-size: 2.5rem; // 40px
            }
          }
        }

        .secondary-amount {
          color: var(--text-description);
        }
      }
    }

    &.full-width {
      .pricing {
        @include media.min-width(large) {
          flex-direction: row;
          align-items: flex-end;
        }
      }
    }
  }
</style>
